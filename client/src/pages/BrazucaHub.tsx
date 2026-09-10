import { useMemo, useState, type FormEvent } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Building2,
  ExternalLink,
  Flag,
  Filter,
  Globe2,
  Loader2,
  Search,
  Sparkles,
  UserRound,
} from 'lucide-react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import ModuleGuide from '@/components/ModuleGuide';
import { MODULE_GUIDES } from '@/lib/moduleGuides';
import { BR_DOMAIN_CATEGORIES, OSINT_BRAZUCA_META, OSINT_CATEGORIES, OSINT_SOURCES } from '@/lib/osintBrazucaCatalog';
import { filterHits, runBrazucaSearch, type BrazucaDossier, type QueryKind } from '@/lib/osintBrazucaSearch';

const KIND_LABEL: Record<QueryKind, string> = {
  nome: 'Nome completo',
  cpf: 'CPF',
  cnpj: 'CNPJ',
  telefone: 'Telefone',
  email: 'E-mail',
  usuario: 'Usuário / handle',
  misto: 'Consulta mista',
};

const logoUrl = `${import.meta.env.BASE_URL}osint-brazuca/assets/logo.png`;

export default function BrazucaHub() {
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [dossier, setDossier] = useState<BrazucaDossier | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('todas');
  const [toolFilters, setToolFilters] = useState<string[]>(['todas']);
  const [error, setError] = useState('');

  const sources = useMemo(() => {
    if (activeCategory === 'todas') return OSINT_SOURCES;
    return OSINT_SOURCES.filter((item) => item.category === activeCategory);
  }, [activeCategory]);

  const visibleHits = useMemo(() => (dossier ? filterHits(dossier.hits, toolFilters) : []), [dossier, toolFilters]);

  const handleSearch = async (event?: FormEvent) => {
    event?.preventDefault();
    const value = query.trim();
    if (!value) return;
    setLoading(true);
    setError('');
    try {
      const result = await runBrazucaSearch(value);
      setDossier(result);
    } catch {
      setError('Não foi possível montar o dossiê agora. Tente de novo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#04140b] p-6 font-mono text-white md:p-12">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col gap-5 border-b border-emerald-300/20 pb-6 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-4">
            <img src={logoUrl} alt="OSINT Brazuca" className="h-14 w-14 rounded-xl border border-yellow-300/30 bg-black/40 object-contain p-1" />
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-200">
                <Flag className="h-4 w-4 text-yellow-300" />
                <span>OSINT Brasil / {OSINT_SOURCES.length} fontes públicas</span>
              </div>
              <h1 className="text-3xl font-black uppercase tracking-[0.18em] text-white md:text-4xl">BRAZUCA</h1>
              <p className="mt-2 max-w-3xl text-xs leading-5 text-slate-400">
                Busca estilo Google sobre fontes OSINT do Brasil. Digite um nome e o painel monta o dossiê com Wikipedia, CNPJ (quando houver), dorks e atalhos para cada portal do acervo UnkL4b/OSINT-Brazuca.
              </p>
            </div>
          </div>
          <Button onClick={() => setLocation('/')} variant="outline" className="border-emerald-300/30 bg-black/30 text-emerald-100 hover:bg-emerald-300/10">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Menu Principal
          </Button>
        </header>

        <ModuleGuide guide={MODULE_GUIDES.brazuca} accentClass="text-emerald-200" />

        <section className="mt-6 rounded-2xl border border-yellow-300/20 bg-gradient-to-br from-emerald-950/40 via-black/70 to-yellow-950/20 p-6 shadow-2xl md:p-8">
          <form onSubmit={handleSearch} className="mx-auto max-w-3xl">
            <div className="mb-3 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-yellow-200">
              <Search className="h-3.5 w-3.5" /> Pesquisa de informações
            </div>
            <div className="flex flex-col gap-3 rounded-full border border-emerald-300/30 bg-black/60 px-5 py-3 shadow-[0_0_40px_rgba(16,185,129,0.12)] md:flex-row md:items-center">
              <Search className="hidden h-5 w-5 shrink-0 text-emerald-300 md:block" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Nome: Fulano de Tal"
                aria-label="Pesquisar nome, CPF, CNPJ ou telefone"
                className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
              />
              <Button type="submit" disabled={loading || !query.trim()} className="rounded-full bg-emerald-500 text-black hover:bg-emerald-400">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                Pesquisar
              </Button>
            </div>
            <p className="mt-3 text-center text-[10px] uppercase tracking-[0.16em] text-slate-500">
              Fontes públicas · sem login · material local de {OSINT_BRAZUCA_META.origin}
            </p>
          </form>
          <div className="mx-auto mt-5 max-w-3xl">
            <p className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-200">
              <Filter className="h-3.5 w-3.5" /> Filtrar pelas ferramentas OSINT-Brazuca
            </p>
            <div className="flex flex-wrap gap-2">
              {['todas', ...OSINT_CATEGORIES].map((category) => {
                const active = toolFilters.includes(category) || (category === 'todas' && toolFilters.includes('todas'));
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => {
                      if (category === 'todas') {
                        setToolFilters(['todas']);
                        return;
                      }
                      setToolFilters((current) => {
                        const next = current.filter((item) => item !== 'todas');
                        return next.includes(category) ? (next.filter((item) => item !== category).length ? next.filter((item) => item !== category) : ['todas']) : [...next, category];
                      });
                    }}
                    className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.14em] ${active ? 'border-yellow-300/50 bg-yellow-300/10 text-yellow-100' : 'border-white/10 text-slate-400'}`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {error && <p className="mt-4 rounded-xl border border-red-400/30 bg-red-950/40 px-4 py-3 text-xs text-red-200">{error}</p>}

        {dossier && (
          <section className="mt-8 space-y-6">
            <div className="rounded-2xl border border-emerald-300/20 bg-black/50 p-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-yellow-200">Dossiê montado</p>
                  <h2 className="mt-1 text-2xl font-black text-white">{dossier.query}</h2>
                  <p className="mt-1 text-xs text-slate-400">
                    Tipo detectado: {KIND_LABEL[dossier.kind]} · {visibleHits.length} atalhos filtrados · {new Date(dossier.searchedAt).toLocaleString('pt-BR')}
                  </p>
                </div>
                <span className="rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-100">
                  {dossier.wiki.length} wiki · {dossier.company ? 'CNPJ ok' : 'sem CNPJ'}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {dossier.variations.map((item) => (
                  <span key={item} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] text-slate-300">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-yellow-300/20 bg-black/50 p-6">
              <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-yellow-200">
                  <UserRound className="h-4 w-4" /> Lista de nomes relacionados
                </h3>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">{dossier.people.length} registros públicos</span>
              </div>
              <p className="mb-4 text-xs leading-5 text-slate-400">
                Homônimos encontrados em Wikipedia/Wikidata. CPF só aparece se a fonte pública publicar; as ferramentas OSINT-Brazuca não expõem cadastro civil em massa.
              </p>
              {dossier.people.length === 0 ? (
                <p className="rounded-xl border border-white/10 bg-black/30 px-4 py-6 text-center text-xs text-slate-500">
                  Nenhum homônimo público indexado para “{dossier.query}”. Use os filtros e as fontes abaixo para continuar.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-[10px] uppercase tracking-[0.16em] text-slate-500">
                        <th className="py-2 pr-3">Nome</th>
                        <th className="py-2 pr-3">Nascimento</th>
                        <th className="py-2 pr-3">CPF</th>
                        <th className="py-2 pr-3">Origem</th>
                        <th className="py-2">Fontes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dossier.people.map((person) => (
                        <tr key={person.id} className="border-b border-white/5 align-top">
                          <td className="py-3 pr-3">
                            <a href={person.url} target="_blank" rel="noreferrer" className="font-bold text-white hover:text-emerald-200">
                              {person.name}
                            </a>
                            <p className="mt-1 text-[11px] leading-4 text-slate-400">{person.description}</p>
                            {(person.place || person.occupation) && (
                              <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-slate-500">
                                {[person.occupation, person.place].filter(Boolean).join(' · ')}
                              </p>
                            )}
                          </td>
                          <td className="py-3 pr-3 text-emerald-100">{person.birthDate}</td>
                          <td className="py-3 pr-3 text-slate-400">{person.cpf}</td>
                          <td className="py-3 pr-3 text-slate-400">{person.source}</td>
                          <td className="py-3">
                            <div className="flex flex-wrap gap-1">
                              {person.extraUrls.slice(0, 4).map((link) => (
                                <a
                                  key={link.url}
                                  href={link.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="rounded-full border border-emerald-300/20 px-2 py-0.5 text-[9px] uppercase tracking-wider text-emerald-200 hover:border-yellow-300/40"
                                >
                                  {link.label}
                                </a>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {dossier.wiki.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-black/40 p-6">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-emerald-200">
                  <BookOpen className="h-4 w-4" /> Wikipedia / conhecimento público
                </h3>
                <div className="grid gap-3 md:grid-cols-2">
                  {dossier.wiki.map((item) => (
                    <a
                      key={item.pageid}
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl border border-white/10 bg-black/30 p-4 transition hover:border-emerald-300/40"
                    >
                      <p className="font-bold text-white">{item.title}</p>
                      <p className="mt-2 text-xs leading-5 text-slate-400">{item.snippet}</p>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {dossier.company && (
              <div className="rounded-2xl border border-yellow-300/20 bg-yellow-950/20 p-6">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-yellow-200">
                  <Building2 className="h-4 w-4" /> Cadastro empresarial (BrasilAPI)
                </h3>
                <div className="grid gap-3 md:grid-cols-2 text-sm">
                  <p><span className="text-slate-500">Razão social:</span> {dossier.company.razaoSocial}</p>
                  <p><span className="text-slate-500">CNPJ:</span> {dossier.company.cnpj}</p>
                  <p><span className="text-slate-500">Fantasia:</span> {dossier.company.nomeFantasia || '—'}</p>
                  <p><span className="text-slate-500">Situação:</span> {dossier.company.situacao || '—'}</p>
                  <p><span className="text-slate-500">Município/UF:</span> {[dossier.company.municipio, dossier.company.uf].filter(Boolean).join('/') || '—'}</p>
                  <p><span className="text-slate-500">CNAE:</span> {dossier.company.cnae || '—'}</p>
                  <p><span className="text-slate-500">Abertura:</span> {dossier.company.abertura || '—'}</p>
                  <p><span className="text-slate-500">Telefone:</span> {dossier.company.telefone || '—'}</p>
                </div>
                {dossier.company.socios && dossier.company.socios.length > 0 && (
                  <p className="mt-3 text-xs text-slate-300">Sócios: {dossier.company.socios.join(', ')}</p>
                )}
              </div>
            )}

            <div className="rounded-2xl border border-white/10 bg-black/40 p-6">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-emerald-200">
                <Sparkles className="h-4 w-4" /> Dorks prontos
              </h3>
              <div className="grid gap-2 md:grid-cols-2">
                {dossier.dorks.map((item) => (
                  <a
                    key={item.label}
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-left text-xs hover:border-yellow-300/40"
                  >
                    <span>
                      <span className="block font-bold text-white">{item.label}</span>
                      <span className="mt-1 block text-[10px] text-slate-500">{item.query}</span>
                    </span>
                    <ExternalLink className="h-4 w-4 shrink-0 text-yellow-200" />
                  </a>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/40 p-6">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-emerald-200">
                <UserRound className="h-4 w-4" /> Resultados por fonte OSINT
              </h3>
              <div className="grid gap-3 md:grid-cols-2">
                {visibleHits.map((hit) => (
                  <a
                    key={hit.id}
                    href={hit.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex min-h-[120px] flex-col justify-between rounded-xl border border-white/10 bg-black/30 p-4 hover:border-emerald-300/40"
                  >
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">{hit.category}</p>
                      <p className="mt-1 font-bold text-white group-hover:text-emerald-100">{hit.title}</p>
                      <p className="mt-2 text-xs leading-5 text-slate-400">{hit.snippet}</p>
                    </div>
                    <span className="mt-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-200">
                      Abrir fonte <ExternalLink className="h-3.5 w-3.5" />
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="mt-10 rounded-2xl border border-emerald-300/20 bg-black/40 p-6 md:p-8">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-bold text-emerald-100">
                <Globe2 className="h-5 w-5 text-yellow-300" /> Acervo OSINT-Brazuca
              </h2>
              <p className="mt-2 max-w-3xl text-xs leading-5 text-slate-400">
                Material completo do repositório UnkL4b/OSINT-Brazuca (MIT), copiado localmente em public/osint-brazuca.
              </p>
            </div>
            <a
              href={`${import.meta.env.BASE_URL}osint-brazuca/README.md`}
              target="_blank"
              rel="noreferrer"
              className="text-[10px] font-bold uppercase tracking-[0.16em] text-yellow-200"
            >
              Abrir README
            </a>
          </div>

          <div className="mb-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveCategory('todas')}
              className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.14em] ${activeCategory === 'todas' ? 'border-yellow-300/50 bg-yellow-300/10 text-yellow-100' : 'border-white/10 text-slate-400'}`}
            >
              Todas
            </button>
            {OSINT_CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.14em] ${activeCategory === category ? 'border-yellow-300/50 bg-yellow-300/10 text-yellow-100' : 'border-white/10 text-slate-400'}`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {sources.map((source) => (
              <a
                key={source.id}
                href={source.url}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-white/10 bg-black/30 p-4 text-left hover:border-emerald-300/40"
              >
                <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">{source.category}</p>
                <p className="mt-1 font-bold text-white">{source.title}</p>
                <p className="mt-2 text-xs leading-5 text-slate-400">{source.description}</p>
              </a>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-white/10 bg-black/30 p-6">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-[0.16em] text-slate-300">Categorias de domínios .br</h3>
          <div className="grid gap-2 md:grid-cols-3 lg:grid-cols-4">
            {BR_DOMAIN_CATEGORIES.map((item) => (
              <div key={item.tld} className="rounded-lg border border-white/10 px-3 py-2 text-xs">
                <span className="font-bold text-emerald-200">{item.tld}</span>
                <span className="ml-2 text-slate-400">{item.description}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
