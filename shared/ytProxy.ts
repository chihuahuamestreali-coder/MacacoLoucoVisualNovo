export type YtStream = {
  itag: number;
  quality: string;
  mimeType: string;
  hasAudio: boolean;
  hasVideo: boolean;
  bitrate?: number;
  contentLength?: number;
  url?: string;
};

export type YtDownloadInfo = {
  videoId: string;
  title: string;
  streams: YtStream[];
  instance: string;
};

const PIPED_INSTANCES = [
  "https://api.piped.private.coffee",
  "https://pipedapi.kavin.rocks",
  "https://pipedapi.adminforge.de",
  "https://pipedapi.ducks.party",
];

const INVIDIOUS_INSTANCES = [
  "https://invidious.nerdvpn.de",
  "https://invidious.tiekoetter.com",
  "https://inv.nadeko.net",
];

const YT_API_KEY = "AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8";
const WEB_CLIENT = { clientName: "WEB", clientVersion: "2.20241213.06.00" };
const ANDROID_CLIENT = { clientName: "ANDROID", clientVersion: "19.09.37", androidSdkVersion: 30 };
const EMBED_CLIENT = { clientName: "WEB_EMBEDDED_PLAYER", clientVersion: "1.20241213.00.00" };
const TV_CLIENT = { clientName: "TVHTML5", clientVersion: "7.20241212.00.00" };

async function fetchWithTimeout(url: string, init?: RequestInit, ms = 12000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function num(v: unknown, fallback?: number): number | undefined {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function parseMime(type: string): { mimeType: string; hasAudio: boolean; hasVideo: boolean } {
  const mimeType = (type || "").split(";")[0] || "video/mp4";
  const isVideo = mimeType.startsWith("video");
  const isAudio = mimeType.startsWith("audio");
  return {
    mimeType,
    hasAudio: isAudio || /codecs="?[^",]*a[^",]*"?/i.test(type),
    hasVideo: isVideo,
  };
}

function normalizeStream(s: any, isAudioOnly: boolean, source: string): YtStream | null {
  if (!s || !s.itag) return null;
  const type = s.mimeType || s.type || "";
  const parsed = parseMime(type);
  return {
    itag: Number(s.itag),
    quality: isAudioOnly ? "AUDIO" : String(s.quality || s.qualityLabel || "auto"),
    mimeType: isAudioOnly ? "audio/mp4" : parsed.mimeType,
    hasAudio: isAudioOnly || parsed.hasAudio,
    hasVideo: !isAudioOnly && parsed.hasVideo,
    bitrate: num(s.bitrate),
    contentLength: num(s.contentLength ?? s.clen),
    url: String(s.url || ""),
  };
}

async function fetchInnerTube(
  videoId: string,
  client: { clientName: string; clientVersion: string; androidSdkVersion?: number },
  key = YT_API_KEY,
): Promise<YtDownloadInfo> {
  const ctx: any = {
    context: {
      client: {
        ...client,
        hl: "pt",
        gl: "BR",
      },
    },
    videoId,
  };
  const res = await fetchWithTimeout(
    `https://www.youtube.com/youtubei/v1/player?key=${key}&prettyPrint=false`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        Referer: "https://www.youtube.com/",
      },
      body: JSON.stringify(ctx),
    },
  );
  if (!res.ok) throw new Error(`innerTube ${res.status}`);
  const json: any = await res.json();
  const status = json?.playabilityStatus?.status;
  if (!status || status !== "OK") {
    const reason = json?.playabilityStatus?.reason || status || "bloqueado";
    throw new Error(`YouTube ${reason}`);
  }
  const sd = json.streamingData || {};
  const streams: YtStream[] = [];
  (sd.formats || []).forEach((s: any) => {
    const n = normalizeStream(s, false, "innerTube");
    if (n) streams.push(n);
  });
  (sd.adaptiveFormats || []).forEach((s: any) => {
    const isAudioOnly = (s.mimeType || "").startsWith("audio");
    const n = normalizeStream(s, isAudioOnly, "innerTube");
    if (n) streams.push(n);
  });
  if (streams.length === 0) throw new Error("YouTube sem streams");
  return {
    videoId,
    title: String(json?.videoDetails?.title || videoId),
    streams,
    instance: "youtube.com (innerTube)",
  };
}

async function fetchPipedStreams(base: string, videoId: string): Promise<YtDownloadInfo> {
  const res = await fetchWithTimeout(`${base}/streams/${videoId}`);
  if (!res.ok) throw new Error(`Piped ${res.status}`);
  const json: any = await res.json();
  const streams: YtStream[] = [];
  (json.videoStreams || []).forEach((s: any) => {
    const n = normalizeStream(s, false, "piped");
    if (n) streams.push(n);
  });
  (json.audioStreams || []).forEach((s: any) => {
    const n = normalizeStream(s, true, "piped");
    if (n) streams.push(n);
  });
  if (streams.length === 0) throw new Error("Piped sem streams");
  return { videoId, title: String(json.title || videoId), streams, instance: base };
}

async function fetchInvidiousStreams(base: string, videoId: string): Promise<YtDownloadInfo> {
  const res = await fetchWithTimeout(`${base}/api/v1/videos/${videoId}`);
  if (!res.ok) throw new Error(`Invidious ${res.status}`);
  const json: any = await res.json();
  const streams: YtStream[] = [];
  (json.adaptiveFormats || []).forEach((s: any) => {
    const isAudioOnly = (s.type || "").startsWith("audio");
    const n = normalizeStream(s, isAudioOnly, "invidious");
    if (n) streams.push(n);
  });
  (json.formatStreams || []).forEach((s: any) => {
    const n = normalizeStream(s, false, "invidious");
    if (n) streams.push(n);
  });
  if (streams.length === 0) throw new Error("Invidious sem streams");
  return { videoId, title: String(json.title || videoId), streams, instance: base };
}

export async function resolveStreamsServerSide(videoId: string): Promise<YtDownloadInfo> {
  const errors: string[] = [];
  const innerTubeClients = [WEB_CLIENT, ANDROID_CLIENT, EMBED_CLIENT, TV_CLIENT];
  for (const client of innerTubeClients) {
    try {
      return await fetchInnerTube(videoId, client);
    } catch (e) {
      errors.push(`innerTube:${e instanceof Error ? e.message : String(e)}`);
    }
  }
  for (const base of PIPED_INSTANCES) {
    try {
      return await fetchPipedStreams(base, videoId);
    } catch (e) {
      errors.push(`piped:${base}:${e instanceof Error ? e.message : String(e)}`);
    }
  }
  for (const base of INVIDIOUS_INSTANCES) {
    try {
      return await fetchInvidiousStreams(base, videoId);
    } catch (e) {
      errors.push(`invidious:${base}:${e instanceof Error ? e.message : String(e)}`);
    }
  }
  throw new Error(errors.join(" | "));
}
