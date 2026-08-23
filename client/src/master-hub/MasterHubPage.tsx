import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useLocation } from "wouter";
import {
  ArrowUpRight,
  Check,
  ChevronRight,
  Copy,
  Download,
  Hash,
  House,
  Menu,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { Toaster, toast } from "sonner";
import { categories, categoryOf, modules, safeProfile, stripCategory, tools, type ModuleDef } from "./tools";
import { generators } from "@/pages/Home";
import "./styles.css";

const copyText = async (text: string, success = "Copiado") => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(success);
  } catch {
    toast.error("Não foi possível copiar");
  }
};

function ToolBody({ code }: { code: string }) {
  const tool = tools[code];
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries((tool?.fields ?? []).map((field) => [field.key, field.value])),
  );
  const [seed, setSeed] = useState(0);
  const [copied, setCopied] = useState(false);
  const script = useMemo(() => (tool ? tool.build(values) : ""), [tool, values, seed]);

  if (!tool) return null;

  return (
    <div className="tool-body">
      {tool.fields.map((field) =>
        field.type === "area" ? (
          <div key={field.key} className="tool-body" style={{ gap: 6 }}>
            <label htmlFor={`f-${field.key}`}>{field.label}</label>
            <textarea
              id={`f-${field.key}`}
              className="tool-area"
              value={values[field.key] ?? ""}
              placeholder={field.placeholder}
              onChange={(ev) => setValues({ ...values, [field.key]: ev.target.value })}
            />
          </div>
        ) : (
          <div key={field.key} className="tool-body" style={{ gap: 6 }}>
            <label htmlFor={`f-${field.key}`}>{field.label}</label>
            <input
              id={`f-${field.key}`}
              className="tool-input"
              value={values[field.key] ?? ""}
              placeholder={field.placeholder}
              onChange={(ev) => setValues({ ...values, [field.key]: ev.target.value })}
            />
          </div>
        ),
      )}
      <div className="script-head">
        <span>
          {tool.file} · {tool.lang}
        </span>
        {tool.run && <span className="tool-ok">{tool.run}</span>}
      </div>
      <pre className="tool-out">{script}</pre>
      <div className="tool-row">
        <button
          className="primary-button"
          onClick={() => {
            copyText(script, "Script copiado");
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1400);
          }}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "COPIADO" : "COPIAR SCRIPT"}
        </button>
        <button
          className="ghost-button"
          onClick={() => {
            const blob = new Blob([script], { type: "text/plain;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = tool.file;
            link.click();
            URL.revokeObjectURL(url);
            toast.success(`${tool.file} baixado`);
          }}
        >
          <Download size={14} /> BAIXAR {tool.file.toUpperCase()}
        </button>
        {tool.randomize && (
          <button className="ghost-button" onClick={() => setSeed((s) => s + 1)}>
            <RefreshCw size={14} /> GERAR NOVAMENTE
          </button>
        )}
      </div>
    </div>
  );
}

function App() {
  const [, setLocation] = useLocation();
  useEffect(() => {
    document.title = "ASGARD.HUB — MacacoLouco";
  }, []);

  const [active, setActive] = useState("bot");
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [tool, setTool] = useState<ModuleDef | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const filtered = useMemo(
    () =>
      modules.filter(
        (mod) =>
          categoryOf[mod.category] === active &&
          `${mod.title} ${mod.description} ${mod.category}`.toLowerCase().includes(search.toLowerCase()),
      ),
    [active, search],
  );

  const allCount = modules.length;

  const projectTools = generators.filter((item) =>
    !["/master-hub", "/hub-global", "/discord-manager", "/apagar-historico"].includes(item.path),
  );

  const specialHubs = [
    { title: "DARK SUITE", desc: "Túneis onion, spoofing de headers e portais blindados", path: "/dark", icon: ShieldCheck },
    { title: "VAN GOGH HUB", desc: "Hub especial estilo Van Gogh", path: "/van-gogh", icon: Sparkles },
    { title: "SCOOBY-DOO HUB", desc: "Hub especial estilo Scooby-Doo", path: "/scooby-doo", icon: ArrowUpRight },
  ];

  const copyShort = (text: string, message: string) => {
    copyText(text, message);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  const openTool = (item: (typeof projectTools)[number]) => {
    if (item.externalUrl) {
      window.open(item.externalUrl, "_blank");
    } else {
      setLocation(item.path);
    }
  };

  return (
    <div className="mh-shell">
      <aside className={`mh-sidebar ${menuOpen ? "is-open" : ""}`}>
        <div className="mh-brand-lockup">
          <div className="mh-brand-mark">
            <img src="/MacacoLoucoVisualNovo/global-hub-assets/macaco-terminal-mark.png" alt="" width={30} height={30} />
          </div>
          <div>
            <strong>MACACOLOUCO</strong>
            <span>ASGARD.HUB</span>
          </div>
          <button
            className="mh-icon-button mh-mobile-close"
            onClick={() => setMenuOpen(false)}
            aria-label="Fechar menu"
          >
            <X size={17} />
          </button>
        </div>
        <div className="mh-sidebar-rule" />
        <a className="mh-home-link" href="/MacacoLoucoVisualNovo/" onClick={() => setMenuOpen(false)}>
          <House size={15} />
          <span>Voltar ao painel inicial</span>
        </a>
        <div className="mh-side-label">
          <span className="mh-status-dot" /> MENU MESTRE
        </div>
        <nav className="mh-side-nav" aria-label="Categorias">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const count = modules.filter((mod) => categoryOf[mod.category] === cat.id).length;
            return (
              <button
                key={cat.id}
                className={active === cat.id ? "active" : ""}
                onClick={() => {
                  setActive(cat.id);
                  setMenuOpen(false);
                }}
              >
                <Icon size={15} />
                <span>{cat.label}</span>
                <b>{String(count).padStart(2, "0")}</b>
              </button>
            );
          })}
        </nav>
        <div className="mh-sidebar-bottom">
          <div className="mh-side-label">
            <Sparkles size={13} /> ESCOPO
          </div>
          <p>Acervo completo: 16 scripts do HUB-GLOBAL + scripts do Manus, com busca e geração local.</p>
          <div className="mh-version-tag">
            DMH / 3.0.0 <span>LOCAL</span>
          </div>
        </div>
      </aside>

      <main className="mh-main">
        <header className="mh-topbar">
          <button className="mh-icon-button mh-mobile-menu" onClick={() => setMenuOpen(true)} aria-label="Abrir menu">
            <Menu size={18} />
          </button>
          <div className="mh-crumbs">
            <span>IP</span>
            <ChevronRight size={13} />
            <strong>MACACOLOUCO</strong>
            <ChevronRight size={13} />
            <span>ASGARD.HUB</span>
          </div>
          <button className="mh-copy-id" onClick={() => copyShort("LOCAL-REFERENCE", "Identificador local copiado")}>
            <Hash size={14} /> COPIAR ID
          </button>
        </header>

        <section className="mh-hero-block">
          <div className="mh-hero-copy">
            <div className="mh-eyebrow">
              <span>ASGARD.HUB</span>
              <i />
              <span>HUB-GLOBAL + MANUS</span>
            </div>
            <h1>
              TODOS OS SCRIPTS.
              <br />
              <em>UM SÓ LUGAR.</em>
            </h1>
            <p>
              Os 16 geradores do HUB-GLOBAL (bots, webhooks, moderação e automação) mais os scripts do menu Manus
              (dispositivo, injeção, anti-detecção, comportamento, app nativo e persona) — {allCount} modelos ao total.
            </p>
            <div className="mh-hero-actions">
              <button className="mh-primary-button" onClick={() => setProfileOpen(true)}>
                <Sparkles size={15} /> GERAR PERFIL SEGURO
              </button>
              <span className="mh-safe-note">
                <ShieldCheck size={14} /> gerado localmente / seu token nunca sai daqui
              </span>
            </div>
          </div>
          <div className="mh-hero-telemetry">
            <img src="/MacacoLoucoVisualNovo/global-hub-assets/telemetry-panel.jpg" alt="" width={1024} height={640} />
            <div className="mh-telemetry-overlay">
              <span>MASTER STATUS</span>
              <strong>READY / LOCAL</strong>
              <small>{allCount} MODULES · {categories.length} GROUPS</small>
            </div>
          </div>
        </section>

        <section className="mh-notice-card">
          <div className="mh-notice-icon">
            <ShieldCheck size={18} />
          </div>
          <div>
            <div className="mh-section-kicker">DEVICE MASTER / FULL COLLECTION</div>
            <h2>Cada card é um gerador: configure os campos e leve o código.</h2>
            <p>
              Os scripts são montados no seu navegador em discord.js v14, Node, bash ou console de injeção. Preencha
              IDs e textos, copie ou baixe o arquivo e rode no seu ambiente com o seu próprio token.
            </p>
          </div>
          <button
            className="mh-outline-button"
            onClick={() =>
              copyShort(
                `MacacoLouco ASGARD.HUB — ${allCount} scripts documentais locais e autorizados.`,
                "Resumo copiado",
              )
            }
          >
            {copied ? <Check size={15} /> : <Copy size={15} />} {copied ? "COPIADO" : "COPIAR RESUMO"}
          </button>
        </section>

        <div className="mh-content-head">
          <div>
            <div className="mh-section-kicker">GERADOR DE SCRIPTS / {allCount} MODELOS</div>
            <h2>Scripts prontos, configuráveis e copiáveis</h2>
          </div>
          <div className="mh-search-wrap">
            <Search size={16} />
            <input
              value={search}
              onChange={(ev) => setSearch(ev.target.value)}
              placeholder="Pesquisar módulo..."
              aria-label="Pesquisar módulo"
            />
          </div>
        </div>

        <div className="mh-tabs" role="tablist">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                role="tab"
                aria-selected={active === cat.id}
                className={active === cat.id ? "selected" : ""}
                onClick={() => setActive(cat.id)}
              >
                <Icon size={15} />
                <span>
                  <strong>{cat.label}</strong>
                  <small>{cat.detail}</small>
                </span>
              </button>
            );
          })}
        </div>

        <section className="mh-module-grid" aria-live="polite">
          {filtered.map((mod, index) => {
            const Icon = mod.icon;
            return (
              <button
                key={mod.code}
                className={`mh-module-card ${mod.tone}`}
                style={{ "--delay": `${index * 35}ms` } as CSSProperties}
                onClick={() => setTool(mod)}
              >
                <div className="mh-card-top">
                  <span className="mh-module-code">MOD.{mod.code}</span>
                  <span className="mh-module-status">{mod.status}</span>
                </div>
                <div className="mh-module-icon">
                  <Icon size={19} />
                </div>
                <div className="mh-module-category">{stripCategory(mod.category)}</div>
                <h3>{mod.title}</h3>
                <p>{mod.description}</p>
                <span className="mh-card-action">
                  GERAR SCRIPT <ArrowUpRight size={14} />
                </span>
              </button>
            );
          })}
          {!filtered.length && (
            <div className="mh-empty-state">
              <Search size={23} />
              <strong>Nenhum módulo encontrado</strong>
              <span>Ajuste o termo ou troque de categoria.</span>
            </div>
          )}
        </section>

        <section className="mh-hub-links">
          <div className="mh-section-kicker">
            <Sparkles size={13} /> PACOTÃO COMPLETO / TODAS AS FERRAMENTAS DO PROJETO ({projectTools.length} MÓDULOS)
          </div>
          <div className="mh-hub-link-grid mh-hub-link-grid--tools">
            {projectTools.map((item) => {
              const Icon = item.icon;
              return (
                <button key={item.path} className="mh-hub-link" onClick={() => openTool(item)}>
                  <Icon size={20} />
                  <span>
                    <strong>{item.title}</strong>
                    <span>{item.desc}</span>
                  </span>
                  <ArrowUpRight size={15} />
                </button>
              );
            })}
          </div>
          <div className="mh-section-kicker mh-section-kicker--hubs">
            HUBS ESPECIAIS
          </div>
          <div className="mh-hub-link-grid">
            {specialHubs.map((hub) => {
              const Icon = hub.icon;
              return (
                <button key={hub.path} className="mh-hub-link" onClick={() => setLocation(hub.path)}>
                  <Icon size={20} />
                  <span>
                    <strong>{hub.title}</strong>
                    <span>{hub.desc}</span>
                  </span>
                  <ArrowUpRight size={15} />
                </button>
              );
            })}
          </div>
        </section>

        <footer className="mh-footer">
          <span>
            <span className="mh-status-dot" /> GERADOR LOCAL / SCRIPTS HUB-GLOBAL + MANUS
          </span>
          <span>MACACOLOUCO · DMH 3.0.0</span>
        </footer>
      </main>

      {tool && (
        <div className="mh-modal-backdrop" onClick={() => setTool(null)}>
          <section className="mh-tool-modal" role="dialog" aria-modal="true" onClick={(ev) => ev.stopPropagation()}>
            <button className="mh-modal-close mh-icon-button" onClick={() => setTool(null)} aria-label="Fechar">
              <X size={17} />
            </button>
            <div className="mh-modal-code">
              MOD.{tool.code} / {stripCategory(tool.category)}
            </div>
            <div className="mh-modal-icon">
              <tool.icon size={22} />
            </div>
            <h2>{tool.title}</h2>
            <p className="mh-modal-lead">{tool.description}</p>
            <div className="mh-modal-divider" />
            <div className="mh-modal-meta">
              <span>ESTADO</span>
              <strong>{tool.status}</strong>
            </div>
            <ToolBody code={tool.code} />
            <p className="mh-modal-safe">
              <ShieldCheck size={16} /> Script montado no seu navegador. Guarde o token em variável de ambiente e rode
              só em servidores que você administra.
            </p>
          </section>
        </div>
      )}

      {profileOpen && (
        <div className="mh-modal-backdrop" onClick={() => setProfileOpen(false)}>
          <section className="mh-profile-modal" role="dialog" aria-modal="true" onClick={(ev) => ev.stopPropagation()}>
            <button className="mh-modal-close mh-icon-button" onClick={() => setProfileOpen(false)} aria-label="Fechar">
              <X size={17} />
            </button>
            <div className="mh-modal-code">SAFE PROFILE / DRY RUN</div>
            <h2>Perfil documental gerado</h2>
            <p className="mh-modal-lead">
              Resumo do acervo do ASGARD.HUB: {allCount} scripts montados no navegador, reunindo o HUB-GLOBAL (16) e os
              scripts do menu Manus.
            </p>
            <pre>{JSON.stringify(safeProfile, null, 2)}</pre>
            <div className="mh-blocked-callout">
              <ShieldCheck size={16} />
              <span>
                <strong>Boas práticas.</strong> Guarde o token em variável de ambiente e use os scripts apenas em
                servidores que você administra.
              </span>
            </div>
            <button
              className="mh-primary-button"
              onClick={() => copyText(JSON.stringify(safeProfile, null, 2), "Perfil JSON copiado")}
            >
              <Copy size={15} /> COPIAR JSON SEGURO
            </button>
          </section>
        </div>
      )}

      <Toaster theme="dark" position="bottom-right" />
    </div>
  );
}

export default App;
