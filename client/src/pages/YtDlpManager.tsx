import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  Loader2,
  Music,
  Play,
  SquareTerminal,
  Video,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

type EngineStatus = {
  ok: boolean;
  ytdlp: string | null;
  ffmpeg: string | null;
  bin: string | null;
};

type VideoInfo = {
  id?: string;
  title?: string;
  uploader?: string;
  duration?: number;
  thumbnail?: string;
  webpage_url?: string;
  extractor?: string;
};

type JobFile = { name: string; size: number };

type Job = {
  id: string;
  url: string;
  command: string;
  status: 'queued' | 'running' | 'done' | 'error';
  logs: string[];
  error?: string;
  files: JobFile[];
  title?: string;
};

type Quality = 'best' | '1080' | '720' | '480' | 'mp3';

const API = '/api/ytdlp';

function formatDuration(seconds?: number) {
  if (!seconds || seconds <= 0) return '--:--';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function displayCommand(url: string, quality: Quality, playlist: boolean, subtitles: boolean) {
  const parts = ['yt-dlp'];
  if (!playlist) parts.push('--no-playlist');
  if (quality === 'mp3') parts.push('-x', '--audio-format', 'mp3');
  else if (quality === '1080') parts.push('-f', '"bv*[height<=1080]+ba/b"');
  else if (quality === '720') parts.push('-f', '"bv*[height<=720]+ba/b"');
  else if (quality === '480') parts.push('-f', '"bv*[height<=480]+ba/b"');
  else parts.push('-f', 'bv*+ba/b');
  if (subtitles) parts.push('--write-subs');
  parts.push(`"${url || 'https://www.youtube.com/watch?v=...'}"`);
  return parts.join(' ');
}

export default function YtDlpManager() {
  const [, setLocation] = useLocation();
  const [engine, setEngine] = useState<EngineStatus | null>(null);
  const [url, setUrl] = useState('');
  const [quality, setQuality] = useState<Quality>('best');
  const [playlist, setPlaylist] = useState(false);
  const [subtitles, setSubtitles] = useState(false);
  const [info, setInfo] = useState<VideoInfo | null>(null);
  const [infoError, setInfoError] = useState('');
  const [infoLoading, setInfoLoading] = useState(false);
  const [job, setJob] = useState<Job | null>(null);
  const [busy, setBusy] = useState(false);
  const logRef = useRef<HTMLPreElement>(null);

  const commandPreview = useMemo(
    () => displayCommand(url.trim(), quality, playlist, subtitles),
    [url, quality, playlist, subtitles],
  );

  useEffect(() => {
    fetch(`${API}/status`)
      .then((res) => res.json())
      .then(setEngine)
      .catch(() => setEngine({ ok: false, ytdlp: null, ffmpeg: null, bin: null }));
  }, []);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [job?.logs]);

  useEffect(() => {
    if (!job || (job.status !== 'running' && job.status !== 'queued')) return;
    const timer = window.setInterval(async () => {
      try {
        const res = await fetch(`${API}/jobs/${job.id}`);
        if (!res.ok) return;
        const next = (await res.json()) as Job;
        setJob(next);
      } catch {
        /* ignore poll errors */
      }
    }, 900);
    return () => window.clearInterval(timer);
  }, [job?.id, job?.status]);

  const probe = useCallback(async () => {
    const target = url.trim();
    if (!target) return;
    setInfoLoading(true);
    setInfoError('');
    setInfo(null);
    try {
      const res = await fetch(`${API}/info`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: target }),
      });
      const data = await res.json();
      if (!res.ok) {
        setInfoError(data.error || 'nao foi possivel ler o video');
        return;
      }
      setInfo(data);
    } catch (err) {
      setInfoError(err instanceof Error ? err.message : 'falha de rede');
    } finally {
      setInfoLoading(false);
    }
  }, [url]);

  const startDownload = useCallback(async () => {
    const target = url.trim();
    if (!target || busy) return;
    setBusy(true);
    setInfoError('');
    try {
      const res = await fetch(`${API}/download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: target,
          quality,
          audio: quality === 'mp3',
          playlist,
          subtitles,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setInfoError(data.error || 'falha ao iniciar download');
        return;
      }
      setJob(data);
      localStorage.setItem('ytdlp_last_url', target);
      localStorage.setItem('ytdlp_last_job', data.id);
    } catch (err) {
      setInfoError(err instanceof Error ? err.message : 'falha de rede');
    } finally {
      setBusy(false);
    }
  }, [url, quality, playlist, subtitles, busy]);

  const running = job?.status === 'running' || job?.status === 'queued';

  return (
    <div className="min-h-screen bg-background text-foreground font-mono p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8 border-b border-red-500/30 pb-4">
          <div>
            <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase tracking-wider mb-1">
              <SquareTerminal className="w-4 h-4" />
              <span>Terminal local • yt-dlp</span>
            </div>
            <h1 className="text-3xl font-extrabold text-red-400">yt-dlp</h1>
            <p className="text-sm text-muted-foreground">
              Cole o link. Roda como no PC: yt-dlp no terminal, ffmpeg no mux, arquivo para baixar.
            </p>
          </div>
          <Button onClick={() => setLocation('/')} variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/10">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Menu Principal
          </Button>
        </div>

        <div className="grid gap-3 md:grid-cols-3 mb-6">
          <div className="rounded-xl border border-red-500/20 bg-card/40 p-4">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">engine</p>
            <p className="mt-1 text-sm font-bold text-red-300">{engine?.ok ? `yt-dlp ${engine.ytdlp}` : 'yt-dlp offline'}</p>
          </div>
          <div className="rounded-xl border border-red-500/20 bg-card/40 p-4">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">ffmpeg</p>
            <p className="mt-1 text-sm font-bold text-red-300">{engine?.ffmpeg ? 'instalado' : 'ausente'}</p>
          </div>
          <div className="rounded-xl border border-red-500/20 bg-card/40 p-4">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">estado</p>
            <p className="mt-1 text-sm font-bold text-red-300">{running ? 'baixando' : job?.status === 'done' ? 'pronto' : 'idle'}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-red-500/30 bg-black/40 p-5 mb-6">
          <label className="text-[10px] uppercase tracking-widest text-red-300">URL</label>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') startDownload();
            }}
            placeholder='https://www.youtube.com/watch?v=...'
            className="mt-2 w-full rounded-lg border border-red-500/30 bg-black/60 px-4 py-3 text-sm text-foreground outline-none focus:border-red-400"
          />
          <p className="mt-3 rounded-lg border border-border/40 bg-black/70 px-3 py-2 text-[11px] text-emerald-300 overflow-x-auto">
            $ {commandPreview}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {([
              ['best', 'melhor'],
              ['1080', '1080p'],
              ['720', '720p'],
              ['480', '480p'],
              ['mp3', 'audio mp3'],
            ] as const).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setQuality(value)}
                className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-wider ${quality === value ? 'border-red-400 bg-red-500/20 text-red-200' : 'border-border/50 text-muted-foreground hover:border-red-400/40'}`}
              >
                {label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPlaylist((v) => !v)}
              className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-wider ${playlist ? 'border-red-400 bg-red-500/20 text-red-200' : 'border-border/50 text-muted-foreground hover:border-red-400/40'}`}
            >
              playlist
            </button>
            <button
              type="button"
              onClick={() => setSubtitles((v) => !v)}
              className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-wider ${subtitles ? 'border-red-400 bg-red-500/20 text-red-200' : 'border-border/50 text-muted-foreground hover:border-red-400/40'}`}
            >
              legendas
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button
              onClick={probe}
              disabled={!url.trim() || infoLoading || running}
              variant="outline"
              className="border-red-500/50 text-red-300 hover:bg-red-500/10"
            >
              {infoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              Ler video
            </Button>
            <Button
              onClick={startDownload}
              disabled={!url.trim() || busy || running || !engine?.ok}
              className="bg-red-600 text-white hover:bg-red-500"
            >
              {running ? <Loader2 className="w-4 h-4 animate-spin" /> : quality === 'mp3' ? <Music className="w-4 h-4" /> : <Download className="w-4 h-4" />}
              {running ? 'Baixando...' : 'Executar yt-dlp'}
            </Button>
          </div>
          {infoError ? <p className="mt-3 text-xs text-red-300">{infoError}</p> : null}
        </div>

        {info ? (
          <div className="mb-6 flex gap-4 rounded-2xl border border-red-500/20 bg-card/40 p-4">
            {info.thumbnail ? (
              <img src={info.thumbnail} alt="" className="h-24 w-40 rounded-lg object-cover border border-red-500/20" />
            ) : (
              <div className="h-24 w-40 rounded-lg border border-red-500/20 bg-black/40 flex items-center justify-center text-red-400">
                <Video className="w-6 h-6" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-bold text-red-200 truncate">{info.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{info.uploader || info.extractor} · {formatDuration(info.duration)}</p>
              <p className="text-[11px] text-muted-foreground mt-2 truncate">{info.webpage_url}</p>
            </div>
          </div>
        ) : null}

        <div className="rounded-2xl border border-red-500/30 bg-black overflow-hidden">
          <div className="flex items-center justify-between border-b border-red-500/20 px-4 py-2 text-[11px] uppercase tracking-widest text-red-300">
            <span>terminal</span>
            <span>{job?.status || 'aguardando comando'}</span>
          </div>
          <pre ref={logRef} className="h-[360px] overflow-auto p-4 text-[12px] leading-5 text-emerald-300 whitespace-pre-wrap">
            {(job?.logs || ['$ yt-dlp "https://www.youtube.com/watch?v=..."', '', 'Pronto. Cole o link e execute.']).join('\n')}
          </pre>
        </div>

        {job?.files?.length ? (
          <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-card/40 p-5">
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-3">
              <CheckCircle2 className="w-4 h-4" />
              arquivos prontos
            </div>
            <div className="space-y-2">
              {job.files.map((file) => (
                <a
                  key={file.name}
                  href={`${API}/file?job=${job.id}&name=${encodeURIComponent(file.name)}`}
                  className="flex items-center justify-between rounded-lg border border-emerald-500/20 bg-black/40 px-4 py-3 text-sm text-emerald-200 hover:bg-emerald-500/10"
                >
                  <span className="truncate">{file.name}</span>
                  <span className="ml-3 shrink-0 text-[11px] text-muted-foreground">{formatBytes(file.size)}</span>
                </a>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
