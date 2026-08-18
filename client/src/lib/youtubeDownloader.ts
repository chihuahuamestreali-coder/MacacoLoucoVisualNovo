/**
 * YouTube Downloader - Baixador de vídeos via API pública (Piped/Invidious)
 * 100% client-side: funciona no GitHub Pages e no preview.
 * Usa instâncias públicas com fallback automático; o download é feito via
 * blob do stream direto (proxy com CORS liberado), com nome de arquivo correto.
 */

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
  'https://api.piped.private.coffee',
  'https://pipedapi.kavin.rocks',
  'https://pipedapi.adminforge.de',
  'https://pipedapi.ducks.party',
  'https://pipedapi.leptons.xyz',
];

const INVIDIOUS_INSTANCES = [
  'https://invidious.nerdvpn.de',
  'https://invidious.tiekoetter.com',
  'https://inv.nadeko.net',
  'https://yt.chocolatemoo53.com',
];

export function extractYoutubeVideoId(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const re of patterns) {
    const m = trimmed.match(re);
    if (m) return m[1];
  }
  return null;
}

function parseMime(type: string): { mimeType: string; hasAudio: boolean; hasVideo: boolean } {
  const mimeType = (type || '').split(';')[0] || 'video/mp4';
  const isVideo = mimeType.startsWith('video');
  const isAudio = mimeType.startsWith('audio');
  return {
    mimeType,
    hasAudio: isAudio || /codecs="?[^",]*a[^",]*"?/i.test(type),
    hasVideo: isVideo,
  };
}

function num(v: unknown, fallback?: number): number | undefined {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

async function fetchWithTimeout(url: string, ms = 10000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function fetchPipedStreams(base: string, videoId: string): Promise<YtDownloadInfo> {
  const res = await fetchWithTimeout(`${base}/streams/${videoId}`);
  if (!res.ok) throw new Error(`Piped ${res.status}`);
  const json = await res.json();
  const streams: YtStream[] = [];

  const push = (s: any, isAudioOnly: boolean) => {
    if (!s || !s.itag) return;
    const parsed = parseMime(s.mimeType || s.type || '');
    streams.push({
      itag: Number(s.itag),
      quality: isAudioOnly ? 'AUDIO' : String(s.quality || s.qualityLabel || 'auto'),
      mimeType: isAudioOnly ? 'audio/mp4' : parsed.mimeType,
      hasAudio: isAudioOnly || parsed.hasAudio,
      hasVideo: !isAudioOnly && parsed.hasVideo,
      bitrate: num(s.bitrate),
      contentLength: num(s.contentLength),
      url: String(s.url || ''),
    });
  };

  (json.videoStreams || []).forEach((s: any) => push(s, false));
  (json.audioStreams || []).forEach((s: any) => push(s, true));

  if (streams.length === 0) throw new Error('Piped sem streams');
  return { videoId, title: String(json.title || videoId), streams, instance: base };
}

async function fetchInvidiousStreams(base: string, videoId: string): Promise<YtDownloadInfo> {
  const res = await fetchWithTimeout(`${base}/api/v1/videos/${videoId}`);
  if (!res.ok) throw new Error(`Invidious ${res.status}`);
  const json = await res.json();
  const streams: YtStream[] = [];

  const push = (s: any) => {
    if (!s || !s.itag) return;
    const parsed = parseMime(s.type || '');
    const isAudioOnly = parsed.mimeType.startsWith('audio');
    streams.push({
      itag: Number(s.itag),
      quality: isAudioOnly ? 'AUDIO' : String(s.qualityLabel || s.quality || 'auto'),
      mimeType: isAudioOnly ? 'audio/mp4' : parsed.mimeType,
      hasAudio: isAudioOnly || parsed.hasAudio,
      hasVideo: !isAudioOnly && parsed.hasVideo,
      bitrate: num(s.bitrate),
      contentLength: num(s.clen),
      url: String(s.url || ''),
    });
  };

  (json.adaptiveFormats || []).forEach(push);
  (json.formatStreams || []).forEach(push);

  if (streams.length === 0) throw new Error('Invidious sem streams');
  return { videoId, title: String(json.title || videoId), streams, instance: base };
}

export function buildDownloadUrl(info: YtDownloadInfo, itag: number): string {
  const stream = info.streams.find((s) => s.itag === itag);
  return stream?.url || `${info.instance}/latest_version?id=${info.videoId}&itag=${itag}&local=true`;
}

export async function downloadStreamBlob(
  url: string,
  filename: string,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  try {
    const res = await fetchWithTimeout(url, 120000);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(objectUrl), 4000);
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: e instanceof Error ? e.message : 'erro de rede' };
  }
}

export function sortStreamsBestFirst(streams: YtStream[]): YtStream[] {
  const parseQuality = (q: string): number => {
    const m = String(q).match(/(\d+)\s*(k|p|kbps|mbps)/i);
    if (!m) return 0;
    const val = Number(m[1]);
    if (m[2].toLowerCase() === 'p') return val * 1000;
    if (m[2].toLowerCase() === 'k') return val;
    return val * 1000;
  };
  return [...streams].sort((a, b) => parseQuality(b.quality) - parseQuality(a.quality));
}

export async function resolveVideoInfo(videoId: string): Promise<YtDownloadInfo> {
  let lastErr: unknown = null;
  for (const base of PIPED_INSTANCES) {
    try {
      return await fetchPipedStreams(base, videoId);
    } catch (e) {
      lastErr = e;
    }
  }
  for (const base of INVIDIOUS_INSTANCES) {
    try {
      return await fetchInvidiousStreams(base, videoId);
    } catch (e) {
      lastErr = e;
    }
  }
  throw new Error(lastErr instanceof Error ? lastErr.message : 'Nenhuma instância disponível');
}

export function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return '';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  let size = bytes;
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i++;
  }
  return `${size.toFixed(1)} ${units[i]}`;
}
