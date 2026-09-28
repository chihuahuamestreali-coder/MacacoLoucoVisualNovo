import type { IncomingMessage, ServerResponse } from "node:http";
import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import type { Plugin, ViteDevServer } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "..");
const DOWNLOADS_DIR = path.join(PROJECT_ROOT, "downloads");
const MAX_JOBS = 3;
const INFO_TIMEOUT_MS = 90_000;
const DOWNLOAD_TIMEOUT_MS = 30 * 60_000;
const MAX_LOG_LINES = 4000;

type JobStatus = "queued" | "running" | "done" | "error";

type Job = {
  id: string;
  url: string;
  command: string;
  status: JobStatus;
  logs: string[];
  error?: string;
  files: { name: string; size: number }[];
  title?: string;
  createdAt: number;
  finishedAt?: number;
  process?: ChildProcessWithoutNullStreams;
};

const jobs = new Map<string, Job>();

function ensureDownloadsDir() {
  if (!fs.existsSync(DOWNLOADS_DIR)) {
    fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });
  }
}

function sendJson(res: ServerResponse, status: number, data: unknown) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(data));
}

function pathnameOf(req: IncomingMessage): URL {
  return new URL(req.url || "/", "http://localhost");
}

function normalizePath(pathname: string): string {
  return pathname.replace(/^\/MacacoLoucoVisualNovo/, "") || "/";
}

function isYtdlpPath(pathname: string): boolean {
  const clean = normalizePath(pathname);
  return clean === "/api/ytdlp" || clean.startsWith("/api/ytdlp/");
}

function isSafeMediaUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function whichBin(name: string): string | null {
  const dirs = (process.env.PATH || "").split(path.delimiter);
  for (const dir of dirs) {
    const full = path.join(dir, name);
    if (fs.existsSync(full)) return full;
  }
  return null;
}

function runCommand(bin: string, args: string[], timeoutMs: number): Promise<{ code: number; stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn(bin, args, { windowsHide: true });
    let stdout = "";
    let stderr = "";
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error("timeout"));
    }, timeoutMs);
    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
      if (stdout.length > 8_000_000) stdout = stdout.slice(-4_000_000);
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
      if (stderr.length > 2_000_000) stderr = stderr.slice(-1_000_000);
    });
    child.on("error", (err) => {
      clearTimeout(timer);
      reject(err);
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({ code: code ?? 1, stdout, stderr });
    });
  });
}

function appendLog(job: Job, line: string) {
  const parts = line.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  for (const part of parts) {
    if (!part) continue;
    if (job.logs.length && job.logs[job.logs.length - 1].startsWith("[download]") && part.startsWith("[download]")) {
      job.logs[job.logs.length - 1] = part;
    } else {
      job.logs.push(part);
    }
  }
  if (job.logs.length > MAX_LOG_LINES) {
    job.logs = job.logs.slice(-MAX_LOG_LINES);
  }
}

function listJobFiles(jobId: string): { name: string; size: number }[] {
  const dir = path.join(DOWNLOADS_DIR, jobId);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((name) => fs.statSync(path.join(dir, name)).isFile())
    .map((name) => ({ name, size: fs.statSync(path.join(dir, name)).size }));
}

function activeJobCount(): number {
  let n = 0;
  for (const job of jobs.values()) {
    if (job.status === "running" || job.status === "queued") n += 1;
  }
  return n;
}

function publicJob(job: Job) {
  return {
    id: job.id,
    url: job.url,
    command: job.command,
    status: job.status,
    logs: job.logs,
    error: job.error,
    files: job.files,
    title: job.title,
    createdAt: job.createdAt,
    finishedAt: job.finishedAt,
  };
}

type DownloadBody = {
  url?: string;
  quality?: string;
  audio?: boolean;
  playlist?: boolean;
  subtitles?: boolean;
};

function buildArgs(body: DownloadBody, jobId: string): { args: string[]; command: string } {
  const url = (body.url || "").trim();
  const quality = body.quality || "best";
  const outDir = path.join(DOWNLOADS_DIR, jobId);
  fs.mkdirSync(outDir, { recursive: true });
  const args = [
    "--no-warnings",
    "--newline",
    "--restrict-filenames",
    "--no-mtime",
    "--ignore-errors",
    "-o",
    path.join(outDir, "%(title).180B [%(id)s].%(ext)s"),
  ];
  if (!body.playlist) args.push("--no-playlist");
  if (body.subtitles) args.push("--write-subs", "--sub-lang", "pt,pt-BR,en.*", "--convert-subs", "srt");
  if (body.audio) {
    args.push("-x", "--audio-format", quality === "m4a" ? "m4a" : "mp3", "--audio-quality", "0");
  } else if (quality === "1080") {
    args.push("-f", "bv*[height<=1080]+ba/b[height<=1080]/b");
  } else if (quality === "720") {
    args.push("-f", "bv*[height<=720]+ba/b[height<=720]/b");
  } else if (quality === "480") {
    args.push("-f", "bv*[height<=480]+ba/b[height<=480]/b");
  } else {
    args.push("-f", "bv*+ba/b");
  }
  args.push(url);
  const command = `yt-dlp ${args
    .map((part) => (part.startsWith("-") || !/\s/.test(part) ? part : `"${part}"`))
    .join(" ")}`;
  return { args, command };
}

async function readBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  const existing = (req as IncomingMessage & { body?: unknown }).body;
  if (existing && typeof existing === "object") return existing as Record<string, unknown>;
  return await new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk.toString();
      if (raw.length > 1_000_000) {
        reject(new Error("body too large"));
      }
    });
    req.on("end", () => {
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error("invalid json"));
      }
    });
    req.on("error", reject);
  });
}

async function handleStatus(res: ServerResponse) {
  const ytdlp = whichBin("yt-dlp");
  const ffmpeg = whichBin("ffmpeg");
  let ytdlpVersion = null;
  let ffmpegVersion = null;
  if (ytdlp) {
    try {
      const result = await runCommand(ytdlp, ["--version"], 10_000);
      ytdlpVersion = result.stdout.trim().split("\n")[0] || null;
    } catch {
      ytdlpVersion = null;
    }
  }
  if (ffmpeg) {
    try {
      const result = await runCommand(ffmpeg, ["-version"], 10_000);
      ffmpegVersion = result.stdout.trim().split("\n")[0] || null;
    } catch {
      ffmpegVersion = null;
    }
  }
  sendJson(res, 200, {
    ok: Boolean(ytdlp),
    ytdlp: ytdlpVersion,
    ffmpeg: ffmpegVersion,
    bin: ytdlp,
  });
}

async function handleInfo(req: IncomingMessage, res: ServerResponse) {
  const ytdlp = whichBin("yt-dlp");
  if (!ytdlp) {
    sendJson(res, 500, { error: "yt-dlp nao encontrado no PATH" });
    return;
  }
  let body: Record<string, unknown>;
  try {
    body = await readBody(req);
  } catch (err) {
    sendJson(res, 400, { error: String(err) });
    return;
  }
  const url = String(body.url || "").trim();
  if (!isSafeMediaUrl(url)) {
    sendJson(res, 400, { error: "URL invalida. Use http:// ou https://" });
    return;
  }
  try {
    const result = await runCommand(ytdlp, ["-J", "--no-playlist", "--no-warnings", "--skip-download", url], INFO_TIMEOUT_MS);
    if (result.code !== 0) {
      sendJson(res, 400, { error: result.stderr.trim() || "falha ao ler o video" });
      return;
    }
    const info = JSON.parse(result.stdout);
    const formats = Array.isArray(info.formats)
      ? info.formats
          .filter((fmt: { vcodec?: string; acodec?: string; height?: number; ext?: string; format_id?: string }) => fmt && fmt.format_id)
          .slice(-24)
          .map((fmt: { format_id: string; ext?: string; height?: number; vcodec?: string; acodec?: string; format_note?: string; resolution?: string }) => ({
            id: fmt.format_id,
            ext: fmt.ext,
            height: fmt.height,
            note: fmt.format_note || fmt.resolution || "",
            video: fmt.vcodec && fmt.vcodec !== "none",
            audio: fmt.acodec && fmt.acodec !== "none",
          }))
      : [];
    sendJson(res, 200, {
      id: info.id,
      title: info.title,
      uploader: info.uploader || info.channel,
      duration: info.duration,
      thumbnail: info.thumbnail,
      webpage_url: info.webpage_url || url,
      extractor: info.extractor,
      formats,
    });
  } catch (err) {
    sendJson(res, 400, { error: err instanceof Error ? err.message : "falha ao ler o video" });
  }
}

async function handleDownload(req: IncomingMessage, res: ServerResponse) {
  const ytdlp = whichBin("yt-dlp");
  if (!ytdlp) {
    sendJson(res, 500, { error: "yt-dlp nao encontrado no PATH" });
    return;
  }
  if (activeJobCount() >= MAX_JOBS) {
    sendJson(res, 429, { error: "ja existe download em andamento. espere terminar." });
    return;
  }
  let body: DownloadBody;
  try {
    body = (await readBody(req)) as DownloadBody;
  } catch (err) {
    sendJson(res, 400, { error: String(err) });
    return;
  }
  const url = String(body.url || "").trim();
  if (!isSafeMediaUrl(url)) {
    sendJson(res, 400, { error: "URL invalida. Use http:// ou https://" });
    return;
  }
  ensureDownloadsDir();
  const id = randomUUID();
  const built = buildArgs(body, id);
  const job: Job = {
    id,
    url,
    command: `yt-dlp "${url}"`,
    status: "running",
    logs: [`$ ${built.command}`],
    files: [],
    createdAt: Date.now(),
  };
  job.command = built.command;
  jobs.set(id, job);
  const child = spawn(ytdlp, built.args, { windowsHide: true });
  job.process = child;
  const timer = setTimeout(() => {
    child.kill("SIGKILL");
    appendLog(job, "timeout: download abortado");
  }, DOWNLOAD_TIMEOUT_MS);
  child.stdout.on("data", (chunk) => appendLog(job, chunk.toString()));
  child.stderr.on("data", (chunk) => appendLog(job, chunk.toString()));
  child.on("error", (err) => {
    clearTimeout(timer);
    job.status = "error";
    job.error = err.message;
    job.finishedAt = Date.now();
    appendLog(job, `erro: ${err.message}`);
  });
  child.on("close", (code) => {
    clearTimeout(timer);
    job.files = listJobFiles(id);
    job.finishedAt = Date.now();
    if (code === 0 && job.files.length > 0) {
      job.status = "done";
      appendLog(job, `concluido: ${job.files.length} arquivo(s)`);
    } else if (code === 0) {
      job.status = "error";
      job.error = "yt-dlp terminou sem gerar arquivo";
      appendLog(job, job.error);
    } else {
      job.status = "error";
      job.error = `yt-dlp saiu com codigo ${code}`;
      appendLog(job, job.error);
    }
  });
  sendJson(res, 200, publicJob(job));
}

function handleJob(res: ServerResponse, id: string) {
  const job = jobs.get(id);
  if (!job) {
    sendJson(res, 404, { error: "job nao encontrado" });
    return;
  }
  job.files = listJobFiles(id);
  sendJson(res, 200, publicJob(job));
}

function handleJobs(res: ServerResponse) {
  sendJson(
    res,
    200,
    [...jobs.values()]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 20)
      .map(publicJob),
  );
}

function handleFile(reqUrl: URL, res: ServerResponse) {
  const jobId = reqUrl.searchParams.get("job") || "";
  const name = reqUrl.searchParams.get("name") || "";
  if (!/^[0-9a-f-]{36}$/i.test(jobId) || !name || name.includes("..") || name.includes("/") || name.includes("\\")) {
    sendJson(res, 400, { error: "arquivo invalido" });
    return;
  }
  const filePath = path.join(DOWNLOADS_DIR, jobId, name);
  if (!filePath.startsWith(path.join(DOWNLOADS_DIR, jobId)) || !fs.existsSync(filePath)) {
    sendJson(res, 404, { error: "arquivo nao encontrado" });
    return;
  }
  const stat = fs.statSync(filePath);
  res.writeHead(200, {
    "Content-Type": "application/octet-stream",
    "Content-Length": stat.size,
    "Content-Disposition": `attachment; filename="${encodeURIComponent(name)}"`,
    "Cache-Control": "no-store",
  });
  fs.createReadStream(filePath).pipe(res);
}

export async function handleYtdlpApi(req: IncomingMessage, res: ServerResponse): Promise<boolean> {
  const parsed = pathnameOf(req);
  const pathname = normalizePath(parsed.pathname);
  if (!isYtdlpPath(pathname)) return false;
  const method = (req.method || "GET").toUpperCase();
  try {
    if (pathname === "/api/ytdlp/status" && method === "GET") {
      await handleStatus(res);
      return true;
    }
    if (pathname === "/api/ytdlp/info" && method === "POST") {
      await handleInfo(req, res);
      return true;
    }
    if (pathname === "/api/ytdlp/download" && method === "POST") {
      await handleDownload(req, res);
      return true;
    }
    if (pathname === "/api/ytdlp/jobs" && method === "GET") {
      handleJobs(res);
      return true;
    }
    const jobMatch = pathname.match(/^\/api\/ytdlp\/jobs\/([0-9a-f-]{36})$/i);
    if (jobMatch && method === "GET") {
      handleJob(res, jobMatch[1]);
      return true;
    }
    if (pathname === "/api/ytdlp/file" && method === "GET") {
      handleFile(parsed, res);
      return true;
    }
    sendJson(res, 404, { error: "rota yt-dlp inexistente" });
    return true;
  } catch (err) {
    sendJson(res, 500, { error: err instanceof Error ? err.message : "erro interno" });
    return true;
  }
}

export function vitePluginYtdlp(): Plugin {
  return {
    name: "ytdlp-api",
    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (req, res, next) => {
        const handled = await handleYtdlpApi(req, res);
        if (!handled) next();
      });
    },
  };
}
