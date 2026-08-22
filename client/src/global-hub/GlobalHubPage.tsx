import { useMemo, useState, type CSSProperties } from "react";
import {
  ArrowUpRight,
  Check,
  ChevronRight,
  Copy,
  Download,
  Hash,
  House,
  Menu,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { Toaster, toast } from "sonner";
import { categories, categoryOf, modules, safeProfile } from "./data";
import { tools, type ModuleDef } from "./tools";
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
  const [copied, setCopied] = useState(false);
  const script = useMemo(() => (tool ? tool.build(values) : ""), [tool, values]);

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
      </div>
    </div>
  );
}

function App() {
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

  const copyShort = (text: string, message: string) => {
    copyText(text, message);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="hub-shell">
      <aside className={`hub-sidebar ${menuOpen ? "is-open" : ""}`}>
        <div className="brand-lockup">
          <div className="brand-mark">
            <img src="/MacacoLoucoVisualNovo/global-hub-assets/macaco-terminal-mark.png" alt="" width={30} height={30} />
          </div>
          <div>
            <strong>MACACOLOUCO</strong>
            <span>DISCORD MANAGER</span>
          </div>
          <button
            className="icon-button mobile-close"
            onClick={() => setMenuOpen(false)}
            aria-label="Fechar menu"
          >
            <X size={17} />
          </button>
        </div>
        <div className="sidebar-rule" />
        <a className="home-link" href="/MacacoLoucoVisualNovo/" onClick={() => setMenuOpen(false)}>
          <House size={15} />
          <span>Voltar ao painel inicial</span>
        </a>
        <div className="side-label">
          <span className="status-dot" /> MENU MESTRE
        </div>
        <nav className="side-nav" aria-label="Categorias">
          {categories.map((cat) => {
            const Icon = cat.icon;
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
                <b>04</b>
              </button>
            );
          })}
        </nav>
        <div className="sidebar-bottom">
          <div className="side-label">
            <Sparkles size={13} /> ESCOPO
          </div>
          <p>Central de referência para fluxos autorizados. Nenhum script remoto é executado.</p>
          <div className="version-tag">
            DMH / 2.1.0 <span>LOCAL</span>
          </div>
        </div>
      </aside>

      <main className="hub-main">
        <header className="topbar">
          <button className="icon-button mobile-menu" onClick={() => setMenuOpen(true)} aria-label="Abrir menu">
            <Menu size={18} />
          </button>
          <div className="crumbs">
            <span>IP</span>
            <ChevronRight size={13} />
            <strong>MACACOLOUCO</strong>
            <ChevronRight size={13} />
            <span>DISCORD MANAGER</span>
          </div>
          <button className="copy-ip" onClick={() => copyShort("LOCAL-REFERENCE", "Identificador local copiado")}>
            <Hash size={14} /> COPIAR ID
          </button>
        </header>

        <section className="hero-block">
          <div className="hero-copy">
            <div className="eyebrow">
              <span>DISCORD MANAGER</span>
              <i />
              <span>MENU MESTRE</span>
            </div>
            <h1>
              ORGANIZE O FLUXO.
              <br />
              <em>REVISE O ESCOPO.</em>
            </h1>
            <p>
              Gere, configure e baixe 16 scripts prontos de bot, webhook, moderação e automação para o seu servidor.
            </p>
            <div className="hero-actions">
              <button className="primary-button" onClick={() => setProfileOpen(true)}>
                <Sparkles size={15} /> GERAR PERFIL SEGURO
              </button>
              <span className="safe-note">
                <ShieldCheck size={14} /> gerado localmente / seu token nunca sai daqui
              </span>
            </div>
          </div>
          <div className="hero-telemetry">
            <img src="/MacacoLoucoVisualNovo/global-hub-assets/telemetry-panel.jpg" alt="" width={1024} height={640} />
            <div className="telemetry-overlay">
              <span>HUB STATUS</span>
              <strong>READY / LOCAL</strong>
              <small>16 MODULES · 04 GROUPS</small>
            </div>
          </div>
        </section>

        <section className="notice-card">
          <div className="notice-icon">
            <ShieldCheck size={18} />
          </div>
          <div>
            <div className="section-kicker">DEVICE MASTER / INSPECTION NOTE</div>
            <h2>Cada card é um gerador: configure os campos e leve o código.</h2>
            <p>
              Os scripts são montados no seu navegador em discord.js v14, Node ou bash. Preencha IDs e textos, copie ou
              baixe o arquivo e rode no seu ambiente com o seu próprio token.
            </p>
          </div>
          <button
            className="outline-button"
            onClick={() =>
              copyShort(
                "MacacoLouco Discord Manager Hub — 16 módulos documentais locais e autorizados.",
                "Resumo copiado",
              )
            }
          >
            {copied ? <Check size={15} /> : <Copy size={15} />} {copied ? "COPIADO" : "COPIAR RESUMO"}
          </button>
        </section>

        <div className="content-head">
          <div>
            <div className="section-kicker">GERADOR DE SCRIPTS / 16 MODELOS</div>
            <h2>Scripts prontos, configuráveis e copiáveis</h2>
          </div>
          <div className="search-wrap">
            <Search size={16} />
            <input
              value={search}
              onChange={(ev) => setSearch(ev.target.value)}
              placeholder="Pesquisar módulo..."
              aria-label="Pesquisar módulo"
            />
          </div>
        </div>

        <div className="tabs" role="tablist">
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

        <section className="module-grid" aria-live="polite">
          {filtered.map((mod, index) => {
            const Icon = mod.icon;
            return (
              <button
                key={mod.code}
                className={`module-card ${mod.tone}`}
                style={{ "--delay": `${index * 35}ms` } as CSSProperties}
                onClick={() => setTool(mod)}
              >
                <div className="card-top">
                  <span className="module-code">MOD.{mod.code}</span>
                  <span className="module-status">{mod.status}</span>
                </div>
                <div className="module-icon">
                  <Icon size={19} />
                </div>
                <div className="module-category">{mod.category}</div>
                <h3>{mod.title}</h3>
                <p>{mod.description}</p>
                <span className="card-action">
                  GERAR SCRIPT <ArrowUpRight size={14} />
                </span>
              </button>
            );
          })}
          {!filtered.length && (
            <div className="empty-state">
              <Search size={23} />
              <strong>Nenhum módulo encontrado</strong>
              <span>Ajuste o termo ou troque de categoria.</span>
            </div>
          )}
        </section>

        <footer className="hub-footer">
          <span>
            <span className="status-dot" /> GERADOR LOCAL / SCRIPTS DISCORD.JS
          </span>
          <span>MACACOLOUCO · DMH 2.1.0</span>
        </footer>
      </main>

      {tool && (
        <div className="modal-backdrop" onClick={() => setTool(null)}>
          <section className="tool-modal" role="dialog" aria-modal="true" onClick={(ev) => ev.stopPropagation()}>
            <button className="modal-close icon-button" onClick={() => setTool(null)} aria-label="Fechar">
              <X size={17} />
            </button>
            <div className="modal-code">
              MOD.{tool.code} / {tool.category}
            </div>
            <div className="modal-icon">
              <tool.icon size={22} />
            </div>
            <h2>{tool.title}</h2>
            <p className="modal-lead">{tool.description}</p>
            <div className="modal-divider" />
            <div className="modal-meta">
              <span>ESTADO</span>
              <strong>{tool.status}</strong>
            </div>
            <ToolBody code={tool.code} />
            <p className="modal-safe">
              <ShieldCheck size={16} /> Script montado no seu navegador. Guarde o token em variável de ambiente e rode
              só em servidores que você administra.
            </p>
          </section>
        </div>
      )}

      {profileOpen && (
        <div className="modal-backdrop" onClick={() => setProfileOpen(false)}>
          <section className="profile-modal" role="dialog" aria-modal="true" onClick={(ev) => ev.stopPropagation()}>
            <button className="modal-close icon-button" onClick={() => setProfileOpen(false)} aria-label="Fechar">
              <X size={17} />
            </button>
            <div className="modal-code">SAFE PROFILE / DRY RUN</div>
            <h2>Perfil documental gerado</h2>
            <p className="modal-lead">
              Resumo da configuração do gerador: 16 modelos de script divididos em quatro grupos, todos montados no
              navegador.
            </p>
            <pre>{JSON.stringify(safeProfile, null, 2)}</pre>
            <div className="blocked-callout">
              <ShieldCheck size={16} />
              <span>
                <strong>Boas práticas.</strong> Guarde o token em variável de ambiente e use os scripts apenas em
                servidores que você administra.
              </span>
            </div>
            <button
              className="primary-button"
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
