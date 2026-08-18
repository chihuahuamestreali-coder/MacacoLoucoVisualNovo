import { useState } from 'react';
import {
  Link2,
  Download,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clapperboard,
  Music,
  MonitorPlay,
  Layers,
} from 'lucide-react';
import {
  extractYoutubeVideoId,
  resolveVideoInfo,
  buildDownloadUrl,
  downloadStreamBlob,
  sortStreamsBestFirst,
  formatFileSize,
  type YtDownloadInfo,
  type YtStream,
} from '@/lib/youtubeDownloader';

const QUALITY_ORDER = ['2160p', '1440p', '1080p', '720p', '480p', '360p', '240p'];

function qualityRank(q: string): number {
  const idx = QUALITY_ORDER.indexOf(q);
  return idx === -1 ? 999 : idx;
}

export default function YoutubeDownloader() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<YtDownloadInfo | null>(null);
  const [error, setError] = useState('');
  const [selectedFormat, setSelectedFormat] = useState<'max' | 'manual'>('max');
  const [customItag, setCustomItag] = useState<number | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleFetch = async () => {
    const videoId = extractYoutubeVideoId(url);
    if (!videoId) {
      setError('Link do YouTube inválido. Cole um link de vídeo, short ou embed.');
      setInfo(null);
      return;
    }
    setLoading(true);
    setError('');
    setInfo(null);
    setDownloaded(false);
    try {
      const result = await resolveVideoInfo(videoId);
      setInfo(result);
    } catch (e) {
      setError(`Não consegui carregar o vídeo: ${e instanceof Error ? e.message : 'erro de rede'}`);
    } finally {
      setLoading(false);
    }
  };

  const bestStream = (): YtStream | null => {
    if (!info || info.streams.length === 0) return null;
    const sorted = sortStreamsBestFirst(info.streams);
    return sorted[0] ?? null;
  };

  const handleDownload = async (stream: YtStream) => {
    if (!info) return;
    setDownloading(true);
    setDownloaded(false);
    const url = buildDownloadUrl(info, stream.itag);
    const ext = stream.mimeType.includes('audio') ? 'm4a' : 'mp4';
    const filename = `${info.title}_${stream.quality}.${ext}`;
    const result = await downloadStreamBlob(url, filename);
    setDownloading(false);
    if (result.ok) {
      setDownloaded(true);
    } else {
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setDownloaded(true);
    }
  };

  const videoStreams = info ? sortStreamsBestFirst(info.streams).filter((s) => s.hasVideo) : [];
  const audioStreams = info ? info.streams.filter((s) => !s.hasVideo) : [];

  const groupedVideos = videoStreams.reduce<Record<string, YtStream[]>>((acc, s) => {
    const key = s.quality;
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {});
  const videoQualities = Object.keys(groupedVideos).sort((a, b) => qualityRank(a) - qualityRank(b));

  return (
    <div className="rounded-lg border border-red-500/30 bg-gradient-to-r from-red-900/20 to-rose-900/20 p-5 mt-8">
      <div className="flex items-center gap-2 mb-3">
        <Download size={18} className="text-red-400" />
        <h3 className="text-lg font-bold text-red-400 font-mono">▌BAIXAR VÍDEOS▌</h3>
        <span className="ml-auto text-[10px] uppercase tracking-wider text-red-300/60">sem anúncios · escolha o formato</span>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Link2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-red-400/70" />
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleFetch()}
            placeholder="Cole o link do vídeo do YouTube aqui..."
            className="w-full rounded border border-red-500/40 bg-background/70 py-3 pl-9 pr-3 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-red-400"
          />
        </div>
        <button
          onClick={handleFetch}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded border border-red-400 bg-red-500/20 px-5 py-3 text-sm font-bold text-red-300 transition-all hover:bg-red-500/40 disabled:opacity-50"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Clapperboard size={16} />}
          {loading ? 'BUSCANDO...' : 'BUSCAR VÍDEO'}
        </button>
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded border border-red-500/50 bg-red-500/10 p-3 text-sm font-mono text-red-300">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          {error}
        </div>
      )}

      {info && (
        <div className="rounded border border-red-500/30 bg-background/60 p-4">
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="flex-1">
              <p className="font-bold text-foreground font-mono text-sm">{info.title}</p>
              <p className="text-[10px] text-muted-foreground mt-1">
                Instância: {info.instance.replace('https://', '')} · {info.streams.length} formatos disponíveis
              </p>
            </div>
            <span className="rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-red-300">
              OK
            </span>
          </div>

          <div className="mb-4 flex gap-2">
            <button
              onClick={() => setSelectedFormat('max')}
              className={`rounded-full border px-4 py-1.5 text-xs font-bold transition-all ${
                selectedFormat === 'max'
                  ? 'border-red-400 bg-red-500/30 text-red-200'
                  : 'border-border text-muted-foreground hover:border-red-400/60'
              }`}
            >
              MELHOR QUALIDADE
            </button>
            <button
              onClick={() => setSelectedFormat('manual')}
              className={`rounded-full border px-4 py-1.5 text-xs font-bold transition-all ${
                selectedFormat === 'manual'
                  ? 'border-red-400 bg-red-500/30 text-red-200'
                  : 'border-border text-muted-foreground hover:border-red-400/60'
              }`}
            >
              ESCOLHER FORMATO
            </button>
          </div>

          {selectedFormat === 'max' ? (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-mono mb-2">Baixar na melhor resolução disponível:</p>
              {(() => {
                const best = bestStream();
                if (!best) return null;
                const isAudio = !best.hasVideo;
                return (
                  <div className="flex items-center justify-between rounded border border-red-500/30 bg-red-500/5 p-3">
                    <div className="flex items-center gap-3">
                      {isAudio ? <Music size={18} className="text-red-400" /> : <MonitorPlay size={18} className="text-red-400" />}
                      <div>
                        <p className="text-sm font-bold text-foreground">{isAudio ? 'Áudio (melhor bitrate)' : best.quality}</p>
                        <p className="text-[10px] text-muted-foreground">{best.mimeType}{best.contentLength ? ` · ${formatFileSize(best.contentLength)}` : ''}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownload(best)}
                      disabled={downloading}
                      className="flex items-center gap-2 rounded border border-red-400 bg-red-500/20 px-4 py-2 text-xs font-bold text-red-300 transition-all hover:bg-red-500/40 disabled:opacity-50"
                    >
                      {downloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                      BAIXAR
                    </button>
                  </div>
                );
              })()}
            </div>
          ) : (
            <div className="space-y-4">
              {videoQualities.length > 0 && (
                <div>
                  <p className="mb-2 flex items-center gap-2 text-xs font-bold text-muted-foreground font-mono">
                    <Layers size={13} className="text-red-400" /> VÍDEO
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {videoQualities.map((q) => {
                      const stream = groupedVideos[q][0];
                      if (!stream) return null;
                      const isSelected = selectedFormat === 'manual' && customItag === stream.itag;
                      return (
                        <button
                          key={`${stream.itag}-${q}`}
                          onClick={() => {
                            setSelectedFormat('manual');
                            setCustomItag(stream.itag);
                            handleDownload(stream);
                          }}
                          className={`flex flex-col items-start gap-0.5 rounded border p-2.5 text-left transition-all ${
                            isSelected
                              ? 'border-red-400 bg-red-500/30 text-red-200'
                              : 'border-red-500/30 bg-background/50 text-foreground hover:border-red-400'
                          }`}
                        >
                          <span className="text-xs font-bold">{q}</span>
                          <span className="text-[9px] text-muted-foreground break-all">
                            {stream.mimeType.replace('video/', '').split(';')[0]}
                            {stream.hasAudio ? ' + áudio' : ''}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              {audioStreams.length > 0 && (
                <div>
                  <p className="mb-2 flex items-center gap-2 text-xs font-bold text-muted-foreground font-mono">
                    <Music size={13} className="text-red-400" /> ÁUDIO
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {audioStreams.map((s, i) => {
                      const isSelected = selectedFormat === 'manual' && customItag === s.itag;
                      return (
                        <button
                          key={`${s.itag}-${i}`}
                          onClick={() => {
                            setSelectedFormat('manual');
                            setCustomItag(s.itag);
                            handleDownload(s);
                          }}
                          className={`flex flex-col items-start gap-0.5 rounded border p-2.5 text-left transition-all ${
                            isSelected
                              ? 'border-red-400 bg-red-500/30 text-red-200'
                              : 'border-red-500/30 bg-background/50 text-foreground hover:border-red-400'
                          }`}
                        >
                          <span className="text-xs font-bold">MP4/M4A</span>
                          <span className="text-[9px] text-muted-foreground">
                            {s.bitrate ? `${Math.round(s.bitrate / 1000)} kbps` : 'áudio'}
                            {s.contentLength ? ` · ${formatFileSize(s.contentLength)}` : ''}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {downloaded && (
            <div className="mt-3 flex items-center gap-2 rounded border border-green-500/40 bg-green-500/10 p-2.5 text-xs font-mono text-green-300">
              <CheckCircle2 size={14} />
              Download concluído! Se abriu em nova aba, use Ctrl+S para salvar.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
