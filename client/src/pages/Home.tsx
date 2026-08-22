import { useState } from 'react';
import { useLocation } from 'wouter';
import {
  Apple,
  ArrowRight,
  Bot,
  Box,
  Brush,
  ChevronRight,
  Cloud,
  Code2,
  Cpu,
  ExternalLink,
  Eraser,
  Facebook,
  Flame,
  Gamepad2,
  Github,
  Globe2,
  ImageIcon,
  Instagram,
  LayoutGrid,
  Mail,
  MessageCircle,
  Monitor,
  Palette,
  Package,
  Rocket,
  Search,
  ShieldAlert,
  ShieldCheck,
  Shirt,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Smartphone,
  UsersRound,
  Video,
  type LucideIcon,
} from 'lucide-react';
import DarkSpecialBanner from '@/components/DarkSpecialBanner';
import VanGoghBanner from '@/components/VanGoghBanner';
import ScoobyDooBanner from '@/components/ScoobyDooBanner';

type Generator = {
  title: string;
  desc: string;
  path: string;
  icon: LucideIcon;
  badge: string;
  logo?: string;
  externalUrl?: string;
};

type Category = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  tone: string;
  items: Generator[];
};

export const generators: Generator[] = [
  {
    title: 'AliExpress Master',
    desc: 'Bypass anti-bot + Injeção 16+ ferramentas anti-detecção',
    path: '/aliexpress',
    icon: ShoppingCart,
    logo: 'aliexpress-official.png',
    badge: 'BLINDAGEM 16+',
  },
  {
    title: 'Mercado Livre Master',
    desc: 'Blindagem ML Device ID & Tracking + Injeção 16+ ferramentas anti-detecção',
    path: '/mercado-livre',
    icon: ShoppingCart,
    logo: 'mercadolivre.png',
    badge: 'ML ANTI-FRAUDE',
  },
  {
    title: 'Amazon Master',
    desc: 'Tokens de device Amazon blindados + Injeção 16+ anti-detecção',
    path: '/amazon',
    icon: Package,
    logo: 'amazon-blue.svg',
    badge: 'ANTI-FRAUD PRO',
  },
  {
    title: 'Shopee Master',
    desc: 'Bypass SACS anti-cheating + Device ID & SPSID blindados 16+',
    path: '/shopee',
    icon: ShoppingBag,
    logo: 'shopee-official.png',
    badge: 'SACS BYPASS',
  },
  {
    title: 'SHEIN Master',
    desc: 'Nova identidade MAC/IMEI + cookies de sessão, blindagem anti-bot 16+ e app nativo',
    path: '/shein',
    icon: Shirt,
    logo: 'shein.png',
    badge: 'ANTI-BOT 16+',
  },
  {
    title: 'Temu Master',
    desc: 'Bypass anti-bot + Injeção 16+ ferramentas & App Nativo Temu',
    path: '/temu',
    icon: ShoppingCart,
    logo: 'temu.png',
    badge: 'BLINDAGEM 16+',
  },
  {
    title: 'Instagram Manager',
    desc: 'Gerador de dispositivo mobile & injeção direta de conta',
    path: '/instagram',
    icon: Instagram,
    logo: 'instagram-color-official.png',
    badge: 'MOBILE SPDF',
  },
  {
    title: 'Facebook Manager',
    desc: 'Spoofing de fingerprint, hardware e criação de perfis FB',
    path: '/facebook',
    icon: Facebook,
    logo: 'facebook-official.svg',
    badge: 'ADS BYPASS',
  },
  {
    title: 'TikTok Manager',
    desc: 'Criação e isolamento de hardware para automação TikTok',
    path: '/tiktok',
    icon: Video,
    logo: 'tiktok-reference.jpg',
    badge: 'TIKTOK PRO',
  },
  {
    title: 'Discord - Site',
    desc: 'Registro direto (discord.com/register) com injeção 16+, shield anti-bot e superprops sintéticas',
    path: '/discord-site',
    icon: MessageCircle,
    logo: 'discord-icon-blue.svg',
    badge: 'REGISTER 16+',
  },
  {
    title: 'Tensor.art Master',
    desc: 'Galeria de arte com IA: nova identidade MAC/IMEI + device ID, sessão, UID e canal, blindagem 16+ e app nativo',
    path: '/tensor',
    icon: ImageIcon,
    logo: 'tensor.png',
    badge: 'AI ART PRO',
  },
  {
    title: 'SeaArt AI Master',
    desc: 'Geração de imagens com IA (PT-BR): nova identidade MAC/IMEI + device ID, sessão, UID e canal, blindagem 16+ e app nativo',
    path: '/seaart',
    icon: Sparkles,
    logo: 'seaart.png',
    badge: 'AI IMAGE PT-BR',
  },
  {
    title: 'Copilot Designer · Imagens',
    desc: 'Microsoft Designer para criação de imagens (PT-BR): identidade de dispositivo, sessão, UID e market',
    path: '/copilot-designer',
    icon: Palette,
    logo: 'copilot.png',
    badge: 'DESIGNER / IMAGEM',
  },
  {
    title: 'Leonardo.ai Master',
    desc: 'Geração de imagens com IA (PT-BR): nova identidade MAC/IMEI + device ID, sessão, UID e plano, blindagem 16+ e app nativo',
    path: '/leonardo',
    icon: Brush,
    logo: 'leonardo.png',
    badge: 'AI IMAGE PT-BR',
  },
  {
    title: 'MonkeyCode Master',
    desc: 'Nova identidade MAC/IMEI + device ID e tokens anti-bot da plataforma de coding AI, blindagem 16+ e app nativo',
    path: '/monkeycode',
    icon: Code2,
    logo: 'monkeycode-official.png',
    badge: 'CODING AI PRO',
  },
  {
    title: 'Base-44 Master',
    desc: 'Nova identidade MAC/IMEI + device ID, sessão e fingerprint do registro oficial, blindagem 16+ e app nativo',
    path: '/base44',
    icon: LayoutGrid,
    logo: 'base44.png',
    badge: 'REGISTER 16+',
  },
  {
    title: 'Lovable Master',
    desc: 'Nova identidade MAC/IMEI + device ID, sessão e anon ID do login de criação, blindagem 16+ e app nativo',
    path: '/lovable',
    icon: Rocket,
    logo: 'lovable.png',
    badge: 'APP BUILDER PRO',
  },
  {
    title: 'Emergente Master',
    desc: 'Nova identidade MAC/IMEI + device ID, sessão e UTM da URL oficial de criação, blindagem 16+ e app nativo',
    path: '/emergente',
    icon: Flame,
    logo: 'emergent-official.png',
    badge: 'SIGNUP BLINDADO',
  },
  {
    title: 'GitHub Manager',
    desc: 'Cadastro direto (github.com/signup) com injeção 16+, shield anti-abuse e fingerprint blindado',
    path: '/github-manager',
    icon: Github,
    logo: 'github.svg',
    badge: 'SIGNUP BLINDADO',
  },
  {
    title: 'Manus AI Master',
    desc: 'Injeção de perfil e sessão agente Manus autônoma',
    path: '/manus',
    icon: Bot,
    logo: 'manus-official.svg',
    badge: 'AGENT CORE',
  },
  {
    title: 'Claude AI Master',
    desc: 'Spoofing avançado para sessões e prompts Claude',
    path: '/claude',
    icon: Sparkles,
    logo: 'claude-reference.png',
    badge: 'CLAUDE API',
  },
  {
    title: 'ChatGPT Master',
    desc: 'Nova identidade MAC/IMEI + device ID, sessão e modelo GPT do portal oficial, blindagem 16+ e app nativo',
    path: '/chatgpt',
    icon: Bot,
    logo: 'chatgpt-official.png',
    badge: 'GPT PT-BR',
  },
  {
    title: 'Copilot Chat Master',
    desc: 'Microsoft Copilot Chat: assistente conversacional em copilot.microsoft.com; imagens ficam como opção dentro do próprio Copilot',
    path: '/copilot',
    icon: Bot,
    logo: 'copilot-chat.webp',
    badge: 'COPILOT / CHAT',
  },
  {
    title: 'AppleContas Master',
    desc: 'Conta do ecossistema Apple: nova identidade MAC/IMEI + device ID, sessão, DSID e storefront, blindagem 16+ e app nativo',
    path: '/apple-contas',
    icon: Apple,
    logo: 'apple.svg',
    badge: 'APPLE ID PRO',
  },
  {
    title: 'Coringa Master',
    desc: 'Suite universal anti-detecção para QUALQUER site: digite a URL, identidade MAC/IMEI, blindagem 16+, WebView e persona',
    path: '/coringa',
    icon: Sparkles,
    logo: 'coringa-official.jpg',
    badge: 'UNIVERSAL',
  },
  {
    title: 'YouTube Master',
    desc: 'Streaming de vídeo SEM anúncios: identidade MAC/IMEI, sessão e visitor data + bloqueio de anúncios embutido (estilo Brave/ublock)',
    path: '/youtube',
    icon: Video,
    logo: 'youtube.svg',
    badge: 'NO ADS',
  },
  {
    title: 'Ursa',
    desc: 'Abertura de link externo e serviços associados',
    path: '/ursa',
    icon: Bot,
    logo: 'ursa.png',
    badge: 'EXTERNAL SITE',
    externalUrl: 'https://tuamaeaquelaursa.com/',
  },
  {
    title: 'Cobalt',
    desc: 'Repositório yt-dlp no GitHub (baixador de vídeos)',
    path: '/cobalt',
    icon: Github,
    logo: 'cobalt.png',
    badge: 'EXTERNAL SITE',
    externalUrl: 'https://github.com/yt-dlp/yt-dlp',
  },
  {
    title: 'Gmail Generator',
    desc: 'Gerador automatizado de contas e dados pessoais fake',
    path: '/gmail',
    icon: Mail,
    logo: 'gmail-official.png',
    badge: 'GMAIL API',
  },
  {
    title: 'Email Forwarder',
    desc: 'Gerenciador de caixas de entrada e emails temporários',
    path: '/emails',
    icon: Mail,
    badge: 'INBOX PRO',
  },
  {
    title: 'EmailPlus',
    desc: 'Kit completo de email: gerador multi-provedor + persona + User-Agent, blindagem 16+, comportamento humano, app nativo e injeção in-site',
    path: '/email-plus',
    icon: Mail,
    logo: 'emailplus-plus.png',
    badge: 'KIT 16+ PRO',
  },
  {
    title: 'UGPhone Master',
    desc: 'Nova identidade MAC/IMEI + sessão e cookies do portal cloud phone, blindagem 16+ e app nativo',
    path: '/ugphone',
    icon: Cloud,
    logo: 'ugphone.png',
    badge: 'CLOUD PHONE PRO',
  },
  {
    title: 'GeeLark Master',
    desc: 'Cloud phone anti-detectável: nova identidade MAC/IMEI + device ID, sessão e código de convite, blindagem 16+ e app nativo',
    path: '/geelark',
    icon: Cloud,
    logo: 'geelark.png',
    badge: 'CLOUD PHONE PT-BR',
  },
  {
    title: 'Redfinger Master',
    desc: 'Emulador Android na nuvem: nova identidade MAC/IMEI + device ID, sessão e modelo de emulador, blindagem 16+ e app nativo',
    path: '/redfinger',
    icon: Monitor,
    logo: 'redfinger.png',
    badge: 'CLOUD EMULATOR',
  },
  {
    title: 'VmosCloud Master',
    desc: 'Cloud phone: nova identidade MAC/IMEI + device ID, sessão e canal googlead_hant, blindagem 16+ e app nativo',
    path: '/vmoscloud',
    icon: Smartphone,
    logo: 'vmoscloud.png',
    badge: 'CLOUD PHONE PRO',
  },
  {
    title: 'LDPlayer Master',
    desc: 'Emulador Android para PC: nova identidade MAC/IMEI + device ID, sessão e versão do emulador, blindagem 16+ e app nativo',
    path: '/ldplayer',
    icon: Gamepad2,
    logo: 'ldplayer.png',
    badge: 'PC EMULATOR',
  },
  {
    title: 'HUB-GLOBAL',
    desc: 'Menu mestre global com 16 módulos locais de bots, webhooks, moderação e automação',
    path: '/hub-global',
    icon: Globe2,
    badge: 'HUB GLOBAL',
  },
  {
    title: 'DARK MASTER HUB',
    desc: 'Menu mestre de privacidade: túneis onion, spoofing de headers e portais blindados',
    path: '/discord-manager',
    icon: ShieldCheck,
    logo: 'deephat.png',
    badge: 'HUB PRIVACIDADE',
  },
  {
    title: 'Apagar Histórico',
    desc: 'Apague o histórico e os dados locais de um menu específico, como se ele nunca tivesse existido',
    path: '/apagar-historico',
    icon: Eraser,
    badge: 'LIMPEZA',
  },
];

const categories: Category[] = [
  {
    id: 'marketplaces',
    title: 'Compras e marketplaces',
    description: 'e-commerce global · LATAM · fast fashion',
    icon: ShoppingCart,
    tone: 'from-amber-400/15 via-amber-400/5 to-transparent border-amber-400/30 text-amber-200',
    items: generators.filter((item) => ['/aliexpress', '/mercado-livre', '/amazon', '/shopee', '/shein', '/temu'].includes(item.path)),
  },
  {
    id: 'social',
    title: 'Redes sociais e comunidades',
    description: 'social · vídeo social · comunidade',
    icon: UsersRound,
    tone: 'from-blue-400/15 via-blue-400/5 to-transparent border-blue-400/30 text-blue-200',
    items: generators.filter((item) => ['/instagram', '/facebook', '/tiktok', '/youtube', '/discord-site'].includes(item.path)),
  },
  {
    id: 'image',
    title: 'IA para imagem e design',
    description: 'arte generativa · design · criação visual',
    icon: ImageIcon,
    tone: 'from-fuchsia-500/15 via-fuchsia-500/5 to-transparent border-fuchsia-500/30 text-fuchsia-200',
    items: generators.filter((item) => ['/tensor', '/seaart', '/copilot-designer', '/leonardo'].includes(item.path)),
  },
  {
    id: 'coding',
    title: 'IA para código e criação de apps',
    description: 'coding AI · app builders · repositórios',
    icon: Code2,
    tone: 'from-cyan-400/15 via-cyan-400/5 to-transparent border-cyan-400/30 text-cyan-200',
    items: generators.filter((item) => ['/monkeycode', '/base44', '/lovable', '/emergente', '/github-manager'].includes(item.path)),
  },
  {
    id: 'assistants',
    title: 'Assistentes, agentes e IA especializada',
    description: 'assistentes · agentes · serviços externos',
    icon: Bot,
    tone: 'from-violet-500/15 via-violet-500/5 to-transparent border-violet-500/30 text-violet-200',
    items: generators.filter((item) => ['/manus', '/claude', '/chatgpt', '/copilot'].includes(item.path)),
  },
  {
    id: 'email',
    title: 'Email, aliases e recuperação',
    description: 'email · encaminhamento · caixas de entrada',
    icon: Mail,
    tone: 'from-emerald-400/15 via-emerald-400/5 to-transparent border-emerald-400/30 text-emerald-200',
    items: generators.filter((item) => ['/gmail', '/emails', '/email-plus', '/ursa', '/cobalt', '/apple-contas', '/coringa'].includes(item.path)),
  },
  {
    id: 'cloud',
    title: 'Cloud phone e emuladores',
    description: 'cloud phone · Android cloud · PC emulator',
    icon: Cloud,
    tone: 'from-orange-400/15 via-orange-400/5 to-transparent border-orange-400/30 text-orange-200',
    items: generators.filter((item) => ['/ugphone', '/geelark', '/redfinger', '/vmoscloud', '/ldplayer'].includes(item.path)),
  },
  {
    id: 'privacy',
    title: 'Privacidade e segurança',
    description: 'hub Dark · segurança · controle de acesso',
    icon: ShieldCheck,
    tone: 'from-indigo-400/15 via-indigo-400/5 to-transparent border-indigo-400/30 text-indigo-200',
    items: generators.filter((item) => ['/hub-global', '/discord-manager', '/apagar-historico'].includes(item.path)),
  },
];

const miniMenus = [{ title: 'ImgBB', externalUrl: 'https://pt-br.imgbb.com/', icon: ImageIcon }];

const favoritePaths = ['/apagar-historico', '/coringa', '/emails', '/email-plus', '/ursa', '/monkeycode', '/manus', '/aliexpress', '/facebook'];
const favoriteLabels: Record<string, string> = {
  '/apagar-historico': 'Apagar Histórico',
  '/coringa': 'Coringa',
  '/emails': 'Email',
  '/email-plus': 'EmailPlus',
  '/ursa': 'Ursa',
  '/monkeycode': 'Monkey',
  '/manus': 'Manus',
  '/aliexpress': 'AliExpress',
  '/facebook': 'Facebook',
};
const favoriteGenerators = favoritePaths
  .map((path) => generators.find((item) => item.path === path))
  .filter((item): item is Generator => Boolean(item));

function getLogoUrl(fileName?: string) {
  return fileName ? `${import.meta.env.BASE_URL}brand-icons/${fileName}` : undefined;
}

export default function Home() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [favoritesExpanded, setFavoritesExpanded] = useState(false);
  const normalizedQuery = searchQuery.trim().toLocaleLowerCase();
  const visibleCategories = categories
    .map((category) => ({
      ...category,
      items: category.items.filter((item) =>
        `${item.title} ${item.desc} ${item.badge}`.toLocaleLowerCase().includes(normalizedQuery),
      ),
    }))
    .filter((category) => category.items.length > 0);

  const openGenerator = (item: Generator) => {
    if (item.externalUrl) {
      window.open(item.externalUrl, '_blank');
      return;
    }
    setLocation(item.path);
  };

  return (
    <div
      className="fm-home-shell min-h-screen bg-background text-foreground font-mono"
      style={{
        backgroundImage: "linear-gradient(rgba(7,12,31,0.96), rgba(7,12,31,0.99)), url('/manus-storage/field-manual-hero_13e2d1fa.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="fm-home-layout mx-auto flex max-w-[1720px] flex-col gap-0 lg:flex-row">
        <aside className="fm-home-sidebar border-b border-border/60 bg-background/85 p-5 backdrop-blur-xl lg:sticky lg:top-0 lg:h-screen lg:w-[270px] lg:shrink-0 lg:border-b-0 lg:border-r lg:p-6">
          <div className="flex items-center gap-3 border-b border-border/60 pb-5">
            <img
              src="/manus-storage/device-master-mark_0b9ede57.png"
              alt="Símbolo Device Master"
              className="h-10 w-10 rounded-xl border border-teal-300/35 bg-slate-950/80 p-2"
            />
            <div>
              <p className="text-sm font-black tracking-[0.18em] text-foreground">MACACOLOUCO</p>
              <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500">painel organizado</p>
            </div>
          </div>

          <section className={`fm-sidebar-favorites fm-mobile-favorites ${favoritesExpanded ? 'is-expanded' : 'is-archived'}`} aria-labelledby="sidebar-favorites-heading">
            <button
              type="button"
              className="fm-favorites-toggle fm-sidebar-favorites__toggle"
              onClick={() => setFavoritesExpanded((expanded) => !expanded)}
              aria-expanded={favoritesExpanded}
              aria-controls="sidebar-favorites-content"
            >
              <span className="fm-sidebar-section-label" id="sidebar-favorites-heading"><Sparkles className="h-3.5 w-3.5" /> Favoritos</span>
              <ChevronRight className={`fm-favorites-toggle__chevron ${favoritesExpanded ? 'is-expanded' : ''}`} />
            </button>
            <div id="sidebar-favorites-content" className="fm-sidebar-favorite-list">
              {favoriteGenerators.map((item) => {
                const Icon = item.icon;
                const logoUrl = getLogoUrl(item.logo);
                return (
                  <a key={`sidebar-${item.path}`} href={`#favorite-${item.path.slice(1)}`} className="fm-sidebar-favorite-link">
                    <span className="fm-sidebar-favorite-icon">
                      {logoUrl ? <img src={logoUrl} alt="" /> : <Icon className="h-3.5 w-3.5" />}
                    </span>
                    <span>{favoriteLabels[item.path] ?? item.title}</span>
                  </a>
                );
              })}
            </div>
          </section>

          <div className="mt-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-teal-300">
            <LayoutGrid className="h-3.5 w-3.5" />
            Categorias
          </div>
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-border/60 bg-slate-950/70 px-3 py-2.5 focus-within:border-primary/60 focus-within:ring-1 focus-within:ring-primary/30">
            <Search className="h-4 w-4 shrink-0 text-primary" />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Pesquisar menu..."
              aria-label="Pesquisar menu"
              className="min-w-0 flex-1 bg-transparent text-xs text-slate-100 outline-none placeholder:text-slate-600"
            />
          </div>
          <nav className="mt-3 grid gap-1.5" aria-label="Categorias do catálogo">
            {visibleCategories.map((category) => {
              const Icon = category.icon;
              return (
                <a
                  key={category.id}
                  href={`#${category.id}`}
                  className="group flex items-center gap-2 rounded-lg border border-transparent px-3 py-2.5 text-xs text-slate-400 transition-colors hover:border-primary/20 hover:bg-primary/10 hover:text-slate-100"
                >
                  <Icon className="h-3.5 w-3.5 text-slate-500 transition-colors group-hover:text-primary" />
                  <span className="truncate">{category.title}</span>
                  <span className="ml-auto text-[10px] text-slate-600 group-hover:text-primary/80">{category.items.length}</span>
                </a>
              );
            })}
          </nav>

          <div className="mt-7 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-pink-300">
            <Sparkles className="h-3.5 w-3.5" />
            Hubs especiais
          </div>
          <nav className="mt-3 grid gap-1.5" aria-label="Hubs especiais">
            <a href="#dark-hub" className="rounded-lg px-3 py-2.5 text-xs text-slate-400 transition-colors hover:bg-pink-500/10 hover:text-pink-200">DARK SUITE</a>
            <a href="#van-gogh-hub" className="rounded-lg px-3 py-2.5 text-xs text-slate-400 transition-colors hover:bg-pink-500/10 hover:text-pink-200">VAN GOGH</a>
            <a href="#scooby-hub" className="rounded-lg px-3 py-2.5 text-xs text-slate-400 transition-colors hover:bg-pink-500/10 hover:text-pink-200">SCOOBY-DOO</a>
          </nav>
        </aside>

        <main className="fm-home-main min-w-0 flex-1 p-5 md:p-8 lg:p-10">
          <section className={`fm-favorites-panel fm-desktop-favorites ${favoritesExpanded ? 'is-expanded' : 'is-archived'}`} aria-labelledby="favorites-heading">
            <button
              type="button"
              className="fm-favorites-toggle fm-favorites-panel__header"
              onClick={() => setFavoritesExpanded((expanded) => !expanded)}
              aria-expanded={favoritesExpanded}
              aria-controls="favorites-panel-content"
            >
              <span>
                <span className="fm-kicker"><Sparkles className="h-3.5 w-3.5" /> Favoritos</span>
                <span id="favorites-heading" className="fm-favorites-panel__title">Acesso rápido aos seus módulos principais</span>
              </span>
              <span className="fm-favorites-panel__header-actions">
                <span className="fm-favorites-panel__count">{favoriteGenerators.length} atalhos</span>
                <ChevronRight className={`fm-favorites-toggle__chevron ${favoritesExpanded ? 'is-expanded' : ''}`} />
              </span>
            </button>
            <div id="favorites-panel-content" className="fm-favorites-grid">
              {favoriteGenerators.map((item) => {
                const Icon = item.icon;
                const logoUrl = getLogoUrl(item.logo);
                return (
                  <div
                    key={`favorite-card-${item.path}`}
                    id={`favorite-${item.path.slice(1)}`}
                    onClick={() => openGenerator(item)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') openGenerator(item);
                    }}
                    className="fm-favorite-card"
                  >
                    <span className="fm-favorite-card__logo">
                      {logoUrl ? <img src={logoUrl} alt={`${item.title} logo`} /> : <Icon className="h-5 w-5" />}
                    </span>
                    <span className="fm-favorite-card__content">
                      <span className="fm-favorite-card__label">{favoriteLabels[item.path] ?? item.title}</span>
                      <span className="fm-favorite-card__title">{item.title}</span>
                    </span>
                    <ArrowRight className="fm-favorite-card__arrow" />
                  </div>
                );
              })}
            </div>
          </section>

          <header className="fm-home-hero border-b border-border/50 pb-8 text-center">
            <div className="mb-5 flex items-center justify-center gap-3">
              <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-teal-300">FIELD MANUAL / 36 MÓDULOS + 3 HUBS</p>
                <p className="mt-1 text-xs text-slate-500">Leia o escopo antes de operar</p>
              </div>
            </div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1.5 text-xs text-primary shadow-sm">
              <Cpu className="h-4 w-4 animate-pulse" />
              <span>ALI-DEV-MAN PRO v2.0 • CENTRAL DE GERENCIAMENTO DE DISPOSITIVOS</span>
            </div>
            <h1 className="mb-3 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-3xl font-extrabold tracking-tight text-transparent md:text-5xl">
              PAINEL DE GERADORES &amp; BYPASS
            </h1>
            <p className="mx-auto max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
              Encontre a plataforma pela finalidade. Cada card mantém a missão original, a rota existente e o fluxo atual; a nova camada apenas organiza a visualização por categoria.
            </p>
          </header>

          <div className="fm-catalog-header my-6 border-b border-border/30 pb-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm font-bold text-slate-100"><LayoutGrid className="h-4 w-4 text-primary" /> Catálogo principal</div>
                <p className="mt-1 text-[11px] text-slate-500">35 módulos reorganizados visualmente · nenhuma rota alterada</p>
              </div>
              <span className="text-[10px] uppercase tracking-wider text-slate-600">{visibleCategories.reduce((total, category) => total + category.items.length, 0)} resultados</span>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-pink-300">Mini menu</span>
              {miniMenus.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.title}
                    onClick={() => window.open(item.externalUrl, '_blank')}
                    className="group flex items-center gap-1.5 rounded-full border border-blue-500/40 bg-blue-500/10 px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-blue-300 transition-all hover:bg-blue-500/30 hover:text-blue-200 hover:shadow-[0_0_10px_rgba(59,130,246,0.4)]"
                    title={`Abrir ${item.title} em nova guia`}
                  >
                    <Icon className="h-3 w-3" />
                    {item.title}
                    <ExternalLink className="h-3 w-3 opacity-50" />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-12">
            {visibleCategories.map((category) => {
              const CategoryIcon = category.icon;
              return (
                <section key={category.id} id={category.id} className="scroll-mt-6">
                  <div className="mb-4 flex flex-col gap-2 border-b border-border/40 pb-3 sm:flex-row sm:items-end sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`rounded-xl border bg-gradient-to-br p-2.5 ${category.tone}`}>
                        <CategoryIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold tracking-tight text-slate-100 md:text-xl">{category.title}</h2>
                        <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-slate-500">{category.description}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">{category.items.length} módulos</span>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                    {category.items.map((item) => {
                      const Icon = item.icon;
                      const logoUrl = getLogoUrl(item.logo);
                      return (
                        <div
                          key={item.path}
                          onClick={() => openGenerator(item)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') openGenerator(item);
                          }}
                          className={`group relative flex min-h-[210px] cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border bg-gradient-to-br p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${category.tone}`}
                        >
                          <div>
                            <div className="mb-5 flex items-center justify-between gap-3">
                              <div className="grid h-12 w-12 place-items-center overflow-hidden rounded-xl border border-white/10 bg-white p-2 shadow-md transition-transform group-hover:scale-105">
                                {logoUrl ? (
                                  <img src={logoUrl} alt={`${item.title} logo`} className="h-full w-full object-contain" />
                                ) : (
                                  <Icon className="h-6 w-6 text-slate-900" />
                                )}
                              </div>
                              <span className="rounded-full border border-border/60 bg-background/80 px-2.5 py-1 text-[9px] font-bold tracking-wider text-muted-foreground">{item.badge}</span>
                            </div>
                            <h3 className="mb-2 text-base font-bold tracking-wide text-slate-100 transition-colors group-hover:text-primary">{item.title}</h3>
                            <p className="text-xs leading-relaxed text-muted-foreground">{item.desc}</p>
                          </div>
                          <div className="mt-6 flex items-center justify-between border-t border-border/30 pt-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            <span className="transition-colors group-hover:text-slate-100">{item.externalUrl ? 'Abrir site oficial' : 'Abrir módulo'}</span>
                            <span className="grid h-7 w-7 place-items-center rounded-full border border-primary/30 bg-primary/10 text-primary transition-all group-hover:translate-x-1 group-hover:bg-primary group-hover:text-primary-foreground">
                              {item.externalUrl ? <ExternalLink className="h-3.5 w-3.5" /> : <ArrowRight className="h-3.5 w-3.5" />}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
            {visibleCategories.length === 0 && (
              <div className="rounded-2xl border border-border/50 bg-slate-950/60 px-6 py-12 text-center text-sm text-slate-500">
                Nenhum menu encontrado para “{searchQuery}”.
              </div>
            )}
          </div>

          <div className="mt-14 space-y-5">
            <div id="dark-hub" className="scroll-mt-6"><DarkSpecialBanner onClick={() => setLocation('/dark')} /></div>
            <div id="van-gogh-hub" className="scroll-mt-6"><VanGoghBanner onClick={() => setLocation('/van-gogh')} /></div>
            <div id="scooby-hub" className="scroll-mt-6"><ScoobyDooBanner onClick={() => setLocation('/scooby-doo')} /></div>
          </div>

          <footer className="mt-16 border-t border-border/30 pt-6 text-center text-xs text-muted-foreground">
            <p>AliDevMan Pro Security Suite • Gerenciamento Multi-Plataforma com Anti-Detecção Avançada • 2026</p>
          </footer>

          <nav className="fm-mobile-nav" aria-label="Acesso rápido às categorias">
            {categories.slice(0, 5).map((category) => {
              const Icon = category.icon;
              return (
                <a key={`mobile-${category.id}`} href={`#${category.id}`} className="fm-mobile-nav__item">
                  <Icon className="h-4 w-4" />
                  <span>{category.title.split(' ')[0]}</span>
                </a>
              );
            })}
          </nav>
        </main>
      </div>
    </div>
  );
}
