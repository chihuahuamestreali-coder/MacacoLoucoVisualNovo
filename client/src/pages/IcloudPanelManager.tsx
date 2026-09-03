import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, Cloud, Loader2, Lock, Maximize2, Minimize2, RefreshCw, ShieldCheck, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const MANUS_LOGIN_URL = 'https://www.manus.im/login';
const ICLOUD_LOGIN_URL = 'https://www.icloud.com/';
const MANUS_KEY = 'painel_icloud_manus_account';
const SESSION_KEY = 'painel_icloud_manus_session';

type ManusAccount = {
  connected: boolean;
  connectedAt: string;
};

type SavedSession = {
  savedAt: string;
  destination: string;
  manusConnectedAt: string;
};

function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export default function IcloudPanelManager() {
  const [, setLocation] = useLocation();
  const [manusAccount, setManusAccount] = useState<ManusAccount | null>(null);
  const [savedSession, setSavedSession] = useState<SavedSession | null>(null);
  const [ready, setReady] = useState(false);
  const [manusFrameKey, setManusFrameKey] = useState(0);
  const [icloudFrameKey, setIcloudFrameKey] = useState(0);
  const [manusLoading, setManusLoading] = useState(true);
  const [icloudLoading, setIcloudLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);
  const [manusBlocked, setManusBlocked] = useState(false);
  const [icloudBlocked, setIcloudBlocked] = useState(false);
  const manusRef = useRef<HTMLIFrameElement>(null);
  const icloudRef = useRef<HTMLIFrameElement>(null);

  const frameLoadedCrossOrigin = (frame: HTMLIFrameElement | null) => {
    if (!frame) return false;
    try {
      const href = frame.contentWindow?.location.href ?? '';
      return Boolean(href) && !href.startsWith(window.location.origin) && href !== 'about:blank';
    } catch {
      return true;
    }
  };

  useEffect(() => {
    const account = readJson<ManusAccount>(MANUS_KEY);
    const session = readJson<SavedSession>(SESSION_KEY);
    if (account?.connected) setManusAccount(account);
    if (session) setSavedSession(session);
    setReady(true);
  }, []);

  const connected = Boolean(manusAccount?.connected);

  useEffect(() => {
    if (connected || !panelOpen) return;
    const timer = window.setTimeout(() => {
      setManusBlocked(!frameLoadedCrossOrigin(manusRef.current));
      setManusLoading(false);
    }, 2200);
    return () => window.clearTimeout(timer);
  }, [connected, panelOpen, manusFrameKey]);

  useEffect(() => {
    if (!connected || !panelOpen) return;
    const timer = window.setTimeout(() => {
      setIcloudBlocked(!frameLoadedCrossOrigin(icloudRef.current));
      setIcloudLoading(false);
    }, 2200);
    return () => window.clearTimeout(timer);
  }, [connected, panelOpen, icloudFrameKey]);

  const confirmManus = () => {
    const account: ManusAccount = { connected: true, connectedAt: new Date().toISOString() };
    setManusAccount(account);
    try {
      localStorage.setItem(MANUS_KEY, JSON.stringify(account));
    } catch {
      // painel segue utilizavel sem storage
    }
    setIcloudBlocked(false);
    setIcloudLoading(true);
    setIcloudFrameKey((value) => value + 1);
    toast.success('Conta Manus conectada', {
      description: 'O login do iCloud abre neste card. Ao entrar, salve a sessao no Manus.',
    });
  };

  const disconnectManus = () => {
    setManusAccount(null);
    setSavedSession(null);
    setManusBlocked(false);
    setManusLoading(true);
    setManusFrameKey((value) => value + 1);
    try {
      localStorage.removeItem(MANUS_KEY);
      localStorage.removeItem(SESSION_KEY);
    } catch {
      // ignore
    }
    toast.info('Conta Manus desconectada');
  };

  const saveIcloudSession = () => {
    if (!manusAccount) return;
    const session: SavedSession = {
      savedAt: new Date().toISOString(),
      destination: ICLOUD_LOGIN_URL,
      manusConnectedAt: manusAccount.connectedAt,
    };
    setSavedSession(session);
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch {
      toast.error('Nao foi possivel gravar a sessao neste navegador');
      return;
    }
    toast.success('Sessao iCloud salva no Manus', {
      description: 'Na proxima entrada, o painel reabre com a sessao gravada na sua conta Manus.',
    });
  };

  const reopen = () => {
    setPanelOpen(true);
    if (connected) {
      setIcloudBlocked(false);
      setIcloudLoading(true);
      setIcloudFrameKey((value) => value + 1);
    } else {
      setManusBlocked(false);
      setManusLoading(true);
      setManusFrameKey((value) => value + 1);
    }
  };

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background font-mono text-foreground">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-mono">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 p-5 md:p-8">
        <button
          type="button"
          onClick={() => setLocation('/')}
          className="inline-flex w-fit items-center gap-2 text-xs text-slate-400 transition-colors hover:text-slate-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao menu
        </button>

        <section className="rounded-2xl border border-slate-400/25 bg-gradient-to-br from-slate-500/15 via-background to-transparent p-6 shadow-2xl md:p-8">
          <div className="mb-5 flex items-start gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-2xl border border-slate-400/30 bg-white p-2 shadow-md">
              <Cloud className="h-7 w-7 text-slate-800" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Painel interno / card</p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-100 md:text-3xl">Painel-iCloud</h1>
              <p className="mt-2 max-w-2xl text-xs leading-5 text-slate-400">
                Primeiro conecte sua conta Manus. Depois o login da Apple abre neste card e a sessao fica gravada no servidor da conta Manus.
              </p>
            </div>
          </div>

          <div className="mb-5 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-black/30 p-4 text-xs">
              <p className="mb-1 font-bold text-slate-200">Conta Manus</p>
              <p className={connected ? 'text-emerald-300' : 'text-amber-300'}>
                {connected ? 'Conectada' : 'Aguardando conexao'}
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/30 p-4 text-xs">
              <p className="mb-1 font-bold text-slate-200">Sessao iCloud</p>
              <p className={savedSession ? 'text-emerald-300' : 'text-slate-400'}>
                {savedSession ? `Salva em ${new Date(savedSession.savedAt).toLocaleString()}` : 'Ainda nao salva'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={reopen} className="bg-slate-200 font-bold text-slate-950 hover:bg-white">
              <Cloud className="mr-2 h-4 w-4" />
              {connected ? 'Abrir iCloud no card' : 'Conectar conta Manus'}
            </Button>
            {connected && (
              <Button onClick={disconnectManus} variant="outline" className="border-white/15 bg-black/30 text-slate-200 hover:bg-white/10">
                Desconectar Manus
              </Button>
            )}
            <Button onClick={() => setLocation('/')} variant="outline" className="border-white/15 bg-black/30 text-slate-200 hover:bg-white/10">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </div>
        </section>
      </div>

      {panelOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-3 sm:p-6">
          <div
            className={`relative flex flex-col overflow-hidden rounded-2xl border-2 border-slate-300/40 bg-[#0b0b0f] shadow-2xl ${
              expanded ? 'h-[96vh] w-full max-w-none' : 'h-[90vh] w-full max-w-5xl'
            }`}
          >
            <div className="flex items-center justify-between gap-3 border-b border-slate-400/25 bg-black/70 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-200">
                  {connected ? 'PAINEL-ICLOUD • LOGIN APPLE' : 'PAINEL-ICLOUD • CONECTAR MANUS'}
                </p>
                <p className="truncate font-mono text-[10px] text-muted-foreground">
                  {connected ? ICLOUD_LOGIN_URL : MANUS_LOGIN_URL}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (connected) {
                      setIcloudBlocked(false);
                      setIcloudLoading(true);
                      setIcloudFrameKey((value) => value + 1);
                    } else {
                      setManusBlocked(false);
                      setManusLoading(true);
                      setManusFrameKey((value) => value + 1);
                    }
                  }}
                  className="rounded border border-slate-400/40 p-2 text-slate-300 hover:bg-slate-500/20"
                  aria-label="Recarregar"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setExpanded((value) => !value)}
                  className="rounded border border-slate-400/40 p-2 text-slate-300 hover:bg-slate-500/20"
                  aria-label={expanded ? 'Reduzir card' : 'Expandir card'}
                >
                  {expanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => setPanelOpen(false)}
                  className="rounded border border-slate-400/40 p-2 text-slate-300 hover:bg-slate-500/20"
                  aria-label="Fechar painel"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {!connected ? (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-orange-400/20 bg-orange-950/30 px-4 py-3">
                  <div className="flex min-w-0 items-center gap-2 text-xs text-orange-100">
                    <Lock className="h-4 w-4 shrink-0" />
                    Entre na sua conta Manus neste card. Depois o iCloud abre aqui e a sessao fica no servidor Manus.
                  </div>
                  <Button onClick={confirmManus} className="bg-orange-400 font-bold text-slate-950 hover:bg-orange-300">
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Conta Manus conectada
                  </Button>
                </div>
                <div className="relative min-h-0 flex-1 bg-white">
                  {manusLoading && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-[#111]">
                      <Loader2 className="h-8 w-8 animate-spin text-orange-300" />
                      <p className="text-xs text-slate-400">Carregando login Manus...</p>
                    </div>
                  )}
                  {manusBlocked && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-[#111] p-6 text-center">
                      <Lock className="h-8 w-8 text-orange-300" />
                      <p className="max-w-md text-sm text-slate-200">O login Manus tambem recusa iframe. Entre na sua conta Manus e volte neste card para confirmar.</p>
                      <Button onClick={confirmManus} className="bg-orange-400 font-bold text-slate-950 hover:bg-orange-300">
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        Ja entrei no Manus
                      </Button>
                    </div>
                  )}
                  <iframe
                    key={manusFrameKey}
                    ref={manusRef}
                    src={MANUS_LOGIN_URL}
                    title="Login Manus"
                    className="h-full w-full border-0"
                    onLoad={() => {
                      setManusLoading(false);
                      setManusBlocked(!frameLoadedCrossOrigin(manusRef.current));
                    }}
                    allow="clipboard-write; encrypted-media; fullscreen"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-400/20 bg-emerald-950/20 px-4 py-3">
                  <div className="min-w-0 text-xs text-emerald-100">
                    Manus conectada. Faca login na Apple neste card e salve a sessao.
                  </div>
                  <Button onClick={saveIcloudSession} className="bg-emerald-400 font-bold text-slate-950 hover:bg-emerald-300">
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Salvar sessao no Manus
                  </Button>
                </div>
                <div className="relative min-h-0 flex-1 bg-white">
                  {icloudLoading && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-[#111]">
                      <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
                      <p className="text-xs text-slate-400">Carregando login do iCloud...</p>
                    </div>
                  )}
                  {icloudBlocked && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-[#111] p-6 text-center">
                      <Cloud className="h-8 w-8 text-slate-200" />
                      <p className="max-w-md text-sm text-slate-200">A Apple recusou o embed. A sessao continua ligada a sua conta Manus neste card.</p>
                      <Button onClick={saveIcloudSession} className="bg-emerald-400 font-bold text-slate-950 hover:bg-emerald-300">
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        Salvar sessao no Manus
                      </Button>
                    </div>
                  )}
                  <iframe
                    key={icloudFrameKey}
                    ref={icloudRef}
                    src={ICLOUD_LOGIN_URL}
                    title="Login iCloud"
                    className="h-full w-full border-0"
                    onLoad={() => {
                      setIcloudLoading(false);
                      setIcloudBlocked(!frameLoadedCrossOrigin(icloudRef.current));
                    }}
                    allow="clipboard-write; encrypted-media; fullscreen"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
