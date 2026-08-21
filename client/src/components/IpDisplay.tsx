import { useCallback, useEffect, useState } from 'react';
import { ArrowUp, Globe, Loader2, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

/**
 * IpDisplay - Mostra o IP público da máquina em um dock fixo inferior.
 * Consulta serviços públicos de IP com fallback encadeado e atualiza
 * automaticamente a cada 60s. Clique no display copia o IP.
 */

const IP_SERVICES = [
  'https://api.ipify.org?format=json',
  'https://ipv4.icanhazip.com',
  'https://ifconfig.me/ip',
];

async function fetchPublicIp(): Promise<string> {
  for (const url of IP_SERVICES) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);
      if (!res.ok) continue;
      const text = (await res.text()).trim();
      const ip = text.startsWith('{') ? (JSON.parse(text).ip || '') : text;
      if (/^\d{1,3}(\.\d{1,3}){3}$/.test(ip)) return ip;
    } catch {
      // tenta o próximo serviço
    }
  }
  return '';
}

export default function IpDisplay() {
  const [ip, setIp] = useState('');
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');
  const [copied, setCopied] = useState(false);

  const refresh = useCallback(async () => {
    setStatus('loading');
    const result = await fetchPublicIp();
    if (result) {
      setIp(result);
      setStatus('ok');
    } else {
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 60000);
    return () => clearInterval(interval);
  }, [refresh]);

  const handleCopy = async () => {
    if (!ip) return;
    try {
      await navigator.clipboard.writeText(ip);
      setCopied(true);
      toast.success('IP copiado!', { description: ip });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Falha ao copiar IP');
    }
  };

  return (
    <div
      className="fixed z-[60] flex max-w-[calc(100vw-1.5rem)] items-center justify-end gap-1.5 rounded-2xl border border-cyan-400/20 bg-background/75 p-1 shadow-[0_0_18px_rgba(0,217,255,0.16)] backdrop-blur-md select-none"
      style={{
        bottom: 'max(1rem, env(safe-area-inset-bottom))',
        right: 'max(1rem, env(safe-area-inset-right))',
      }}
    >
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-cyan-400/40 bg-background/90 text-cyan-300 shadow-[0_0_12px_rgba(0,217,255,0.25)] backdrop-blur-md transition-colors hover:border-cyan-300 hover:bg-cyan-400/15 hover:text-cyan-100"
        title="Voltar ao topo"
        aria-label="Voltar ao topo"
      >
        <ArrowUp className="h-3.5 w-3.5" />
      </button>
      <div
        className="flex min-w-0 max-w-[calc(100vw-4.5rem)] items-center gap-1.5 rounded-full border border-cyan-400/40 bg-background/90 px-3 py-1.5 text-[10px] font-mono text-cyan-300 shadow-[0_0_12px_rgba(0,217,255,0.25)] backdrop-blur-md"
      >
        <Globe className="w-3 h-3 animate-pulse" />
        <span className="uppercase tracking-widest text-cyan-500/80">IP</span>
        <button
          onClick={handleCopy}
          disabled={status !== 'ok'}
          className="flex min-w-0 items-center gap-1 whitespace-nowrap font-bold text-cyan-200 hover:text-cyan-100 disabled:cursor-not-allowed disabled:opacity-60"
          title="Copiar IP"
        >
          {status === 'loading' && <Loader2 className="w-3 h-3 animate-spin" />}
          {status === 'error' && <span className="text-red-400">OFFLINE</span>}
          {status === 'ok' && ip}
          {status === 'ok' && (copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 opacity-60" />)}
        </button>
      </div>
    </div>
  );
}
