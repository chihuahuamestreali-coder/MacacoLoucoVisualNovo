import { useMemo, useState } from 'react';
import { useLocation } from 'wouter';
import {
  ArrowLeft,
  Eraser,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Search,
  LayoutGrid,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  getMenuHistory,
  countMenuHistory,
  countMenuActivity,
  clearMenuHistory,
  clearAllManagedHistory,
  getVisitedBrowserUrls,
  type MenuHistoryEntry,
} from '@/lib/historyCleaner';
import { requestBrowserHistoryClear } from '@/lib/browserHistoryBridge';

type MenuGroup = {
  id: string;
  label: string;
  entries: MenuHistoryEntry[];
};

function buildGroups(menuHistory: MenuHistoryEntry[]): MenuGroup[] {
  const staticGroups: MenuGroup[] = [
    {
      id: 'compras',
      label: 'Compras e marketplaces',
      entries: menuHistory.filter((m) => ['/aliexpress', '/mercado-livre', '/amazon', '/shopee', '/shein', '/temu'].includes(m.path)),
    },
    {
      id: 'social',
      label: 'Redes sociais e comunidades',
      entries: menuHistory.filter((m) => ['/instagram', '/facebook', '/tiktok', '/youtube', '/discord-site'].includes(m.path)),
    },
    {
      id: 'ia',
      label: 'IA para imagem, código e design',
      entries: menuHistory.filter((m) => ['/tensor', '/seaart', '/copilot-designer', '/leonardo', '/monkeycode', '/base44', '/lovable', '/emergente', '/github-manager'].includes(m.path)),
    },
    {
      id: 'assistentes',
      label: 'Assistentes e agentes de IA',
      entries: menuHistory.filter((m) => ['/manus', '/claude', '/chatgpt', '/copilot', '/coringa'].includes(m.path)),
    },
    {
      id: 'email',
      label: 'Email e recuperação',
      entries: menuHistory.filter((m) => ['/gmail', '/emails', '/email-plus', '/apple-contas'].includes(m.path)),
    },
    {
      id: 'cloud',
      label: 'Cloud phone e emuladores',
      entries: menuHistory.filter((m) => ['/ugphone', '/geelark', '/redfinger', '/vmoscloud', '/ldplayer', '/cider'].includes(m.path)),
    },
    {
      id: 'hubs',
      label: 'Hubs especiais',
      entries: menuHistory.filter((m) => ['/scooby-doo', '/dark', '/van-gogh'].includes(m.path)),
    },
  ].filter((g) => g.entries.length > 0);

  const groupedPaths = new Set(staticGroups.flatMap((group) => group.entries.map((entry) => entry.path)));
  return [
    ...staticGroups,
    {
      id: 'outros',
      label: 'Outros menus',
      entries: menuHistory.filter((entry) => !groupedPaths.has(entry.path)),
    },
  ].filter((group) => group.entries.length > 0);
}

function countTotal(entry: MenuHistoryEntry): number {
  try {
    return countMenuHistory(entry);
  } catch {
    return 0;
  }
}

function HistoryMenuCard({ entry, onDeleted }: { entry: MenuHistoryEntry; onDeleted: () => void }) {
  const [busy, setBusy] = useState(false);
  const localCount = countTotal(entry);
  const activityCount = countMenuActivity(entry);
  const hasActivity = activityCount > 0;

  const handleClear = async () => {
    if (busy || !hasActivity) return;
    const confirmed = window.confirm(
      `Limpar os dados reconhecidos de "${entry.title}"?\n\nIsso remove os dados locais deste menu e, se uma extensão autorizada responder, solicita a remoção das URLs visitadas no histórico do navegador.`
    );
    if (!confirmed) return;
    setBusy(true);
    try {
      const visitedUrls = getVisitedBrowserUrls(entry);
      clearMenuHistory(entry);
      const browserResult = await requestBrowserHistoryClear(visitedUrls);
      const browserMessage =
        browserResult.status === 'cleared'
          ? ` ${browserResult.removed} URL(s) também removida(s) do histórico do navegador.`
          : ' O histórico global do navegador exige uma extensão autorizada; os dados internos foram removidos.';
      toast.success(`Histórico de "${entry.title}" apagado!`, {
        description: `Dados locais removidos.${browserMessage}`,
      });
      onDeleted();
    } catch (error) {
      console.error('Erro ao apagar histórico:', error);
      toast.error('Erro ao apagar histórico', {
        description: 'Alguns dados podem não ter sido removidos.',
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-slate-950/70 p-4 transition-colors hover:border-rose-500/30">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold tracking-wide text-slate-100">{entry.title}</h3>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-500">{entry.desc}</p>
        </div>
        <span
          className={`shrink-0 rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-wider ${
            hasActivity
              ? 'border-rose-500/40 bg-rose-500/10 text-rose-300'
              : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
          }`}
        >
          {entry.visitCount ? `${entry.visitCount} visita(s)` : localCount > 0 ? `${localCount} item(ns)` : 'limpo'}
        </span>
      </div>
      <Button
        variant={hasActivity ? 'destructive' : 'outline'}
        size="sm"
        className="w-full"
        onClick={handleClear}
        disabled={busy || !hasActivity}
      >
        {hasActivity ? <Trash2 className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
        {busy ? 'Apagando...' : hasActivity ? 'Apagar histórico' : 'Sem dados'}
      </Button>
    </div>
  );
}

export default function HistoryCleaner() {
  const [, setLocation] = useLocation();
  const [refresh, setRefresh] = useState(0);
  const [query, setQuery] = useState('');
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const menuHistory = useMemo(() => getMenuHistory(), [refresh]);
  const groups = useMemo(() => buildGroups(menuHistory), [menuHistory]);

  const visibleGroups = useMemo(() => {
    if (!normalizedQuery) return groups;
    return groups
      .map((group) => ({
        ...group,
        entries: group.entries.filter((entry) =>
          `${entry.title} ${entry.desc}`.toLocaleLowerCase().includes(normalizedQuery)
        ),
      }))
      .filter((group) => group.entries.length > 0);
  }, [groups, normalizedQuery]);

  const handleDeleted = () => setRefresh((r) => r + 1);

  const totalItems = useMemo(
    () => menuHistory.reduce((sum, entry) => sum + countMenuActivity(entry), 0),
    [menuHistory],
  );

  const handleClearAll = async () => {
    if (totalItems === 0) return;
    const confirmed = window.confirm(
      'Limpar os dados reconhecidos de TODOS os menus?\n\nIsso remove os dados internos do aplicativo. Se uma extensão autorizada responder, as URLs registradas também serão removidas do histórico do navegador.'
    );
    if (!confirmed) return;
    try {
      const visitedUrls = getVisitedBrowserUrls();
      clearAllManagedHistory();
      const browserResult = await requestBrowserHistoryClear(visitedUrls);
      const browserMessage =
        browserResult.status === 'cleared'
          ? `${browserResult.removed} URL(s) removida(s) do histórico do navegador.`
          : 'O histórico global do navegador exige uma extensão autorizada; os dados internos foram removidos.';
      toast.success('Histórico reconhecido limpo', { description: browserMessage });
      handleDeleted();
    } catch (error) {
      console.error('Erro ao apagar tudo:', error);
      toast.error('Erro ao apagar histórico global');
    }
  };

  return (
    <div
      className="fm-history-shell min-h-screen bg-background text-foreground font-mono"
      style={{
        backgroundImage:
          "linear-gradient(rgba(7,12,31,0.96), rgba(7,12,31,0.99)), url('/manus-storage/field-manual-hero_13e2d1fa.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="mx-auto flex max-w-[1200px] flex-col gap-6 p-5 md:p-8">
        <header className="flex flex-col gap-5 border-b border-border/50 pb-6 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-rose-300">
              <Eraser className="h-4 w-4" />
              Limpeza local / por menu
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight md:text-4xl">APAGAR HISTÓRICO</h1>
            <p className="mt-2 max-w-3xl text-xs leading-relaxed text-muted-foreground md:text-sm">
              Os menus são reconhecidos automaticamente quando você os abre. A página remove os dados internos que controla; a exclusão das URLs do histórico global do Chrome/Edge só é possível quando uma extensão autorizada responde.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Button onClick={() => setLocation('/')} variant="outline" className="border-border/60">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Menu Principal
            </Button>
            <Button
              onClick={handleClearAll}
              variant="destructive"
              disabled={totalItems === 0}
              className="border-rose-500/40"
            >
              <ShieldAlert className="mr-2 h-4 w-4" />
              Apagar tudo
            </Button>
          </div>
        </header>

        <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-slate-950/70 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-border/60 bg-slate-950/70 px-3 py-2.5 focus-within:border-primary/60 focus-within:ring-1 focus-within:ring-primary/30">
            <Search className="h-4 w-4 shrink-0 text-primary" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Pesquisar menu para apagar..."
              aria-label="Pesquisar menu para apagar"
              className="min-w-0 flex-1 bg-transparent text-xs text-slate-100 outline-none placeholder:text-slate-600"
            />
          </div>
          <div className="flex shrink-0 items-center gap-2 text-[10px] font-black uppercase tracking-wider text-slate-500">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>{totalItems > 0 ? `${totalItems} registros reconhecidos` : 'tudo limpo'}</span>
          </div>
        </div>

        {visibleGroups.length === 0 ? (
          <div className="rounded-2xl border border-border/50 bg-slate-950/60 px-6 py-12 text-center text-sm text-slate-500">
            Nenhum menu encontrado para “{query}”.
          </div>
        ) : (
          <div className="space-y-10">
            {visibleGroups.map((group) => (
              <section key={group.id}>
                <div className="mb-4 flex items-center gap-2 border-b border-border/40 pb-3">
                  <LayoutGrid className="h-4 w-4 text-primary" />
                  <h2 className="text-base font-bold tracking-wide text-slate-100">{group.label}</h2>
                  <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-slate-600">
                    {group.entries.length} menus
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {group.entries.map((entry) => (
                    <HistoryMenuCard key={entry.path} entry={entry} onDeleted={handleDeleted} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        <footer className="mt-8 border-t border-border/30 pt-6 text-center text-xs text-muted-foreground">
          <p>Limpeza dos dados reconhecidos pelo aplicativo • URLs externas exigem extensão autorizada do navegador</p>
        </footer>
      </div>
    </div>
  );
}
