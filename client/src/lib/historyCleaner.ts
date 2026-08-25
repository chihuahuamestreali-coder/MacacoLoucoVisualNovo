/**
 * Registro e limpeza dos dados que o aplicativo consegue controlar.
 *
 * Uma página web não pode ler ou apagar o histórico global do Chrome/Edge.
 * Este módulo cuida do histórico interno, dos dados locais próprios e mantém
 * um registro de visitas para uma extensão autorizada poder fazer essa parte.
 */

import { generators } from '@/pages/Home';

export interface MenuHistoryEntry {
  path: string;
  title: string;
  desc: string;
  keys?: string[];
  prefixes?: string[];
  cookies?: string[];
  noteKeywords?: string[];
  externalUrl?: string;
  visitCount?: number;
  lastVisitedAt?: string;
  visitedUrls?: string[];
}

export interface MenuVisit {
  path: string;
  title: string;
  externalUrl?: string;
  count: number;
  lastVisitedAt: string;
  urls: string[];
}

const MENU_VISITS_STORAGE_KEY = 'macacolouco_menu_visits';

const MANUAL_MENU_HISTORY: MenuHistoryEntry[] = [
  {
    path: '/aliexpress',
    title: 'AliExpress Master',
    desc: 'Perfil de dispositivo, persona e histórico de contas AliExpress',
    keys: [],
    noteKeywords: ['AliExpress'],
  },
  {
    path: '/mercado-livre',
    title: 'Mercado Livre Master',
    desc: 'Device ID, tracking ID e perfil ML',
    keys: ['ml_device_profile', '_ml_device_id', '_ml_tracking_id'],
    noteKeywords: ['Mercado Livre'],
  },
  {
    path: '/amazon',
    title: 'Amazon Master',
    desc: 'Device token, UBID e perfil Amazon',
    keys: ['amazon_device_profile', '_amazon_device_token', '_amazon_ubid'],
    noteKeywords: ['Amazon'],
  },
  {
    path: '/shopee',
    title: 'Shopee Master',
    desc: 'SPSID, Device ID e perfil Shopee',
    keys: ['shopee_device_profile', '_sp_device_id', '_sp_spsid'],
    noteKeywords: ['Shopee'],
  },
  {
    path: '/shein',
    title: 'SHEIN Master',
    desc: 'Sessão, cookies, moeda e perfil SHEIN',
    keys: ['shein_device_profile', '_shein_device_id', '_shein_sid', '_shein_country', '_shein_currency'],
    prefixes: ['shein_'],
    cookies: ['device_id', 'sid', 'countryCode', 'currency'],
    noteKeywords: ['SHEIN'],
  },
  {
    path: '/temu',
    title: 'Temu Master',
    desc: 'Perfil Temu, cupom e flag de novo usuário',
    keys: ['temu_device_profile', 'temu_new_user', 'temu_coupon_pack'],
    noteKeywords: ['Temu'],
  },
  {
    path: '/instagram',
    title: 'Instagram Manager',
    desc: 'Perfil de dispositivo Instagram e fingerprint',
    keys: ['instagramDeviceProfile'],
    noteKeywords: ['Instagram'],
  },
  {
    path: '/facebook',
    title: 'Facebook Manager',
    desc: 'Perfil de dispositivo Facebook e fingerprint',
    keys: ['facebookDeviceProfile'],
    noteKeywords: ['Facebook'],
  },
  {
    path: '/tiktok',
    title: 'TikTok Manager',
    desc: 'Hardware isolado, histórico e perfil TikTok',
    keys: [
      'tiktok_device_profile',
      'tiktokDeviceHistory',
      'tiktok_android_id',
      'tiktok_fingerprint',
      'tiktok_imei',
      'tiktok_mac',
      'tiktok_manufacturer',
      'tiktok_model',
      'tiktok_os_name',
      'tiktok_os_version',
      'tiktok_ram',
      'tiktok_resolution',
      'tiktok_user_agent',
    ],
    noteKeywords: ['TikTok'],
  },
  {
    path: '/discord-site',
    title: 'Discord - Site',
    desc: 'Super props, fingerprint e perfil Discord',
    keys: ['discord_device_profile', '_discord_device_id', '_discord_fingerprint', '_discord_super_props'],
    noteKeywords: ['Discord'],
  },
  {
    path: '/github-manager',
    title: 'GitHub Manager',
    desc: 'Sessões GH, unicorn session e perfil GitHub',
    keys: ['github_device_profile', '_gh_user_session', '_gh_unicorn_session', '_gh_og_device_id', '_gh_device_id'],
    noteKeywords: ['GitHub'],
  },
  {
    path: '/manus',
    title: 'Manus AI Master',
    desc: 'Histórico de contas, configurações de sucesso e perfil Manus',
    keys: ['manus_successful_configs'],
    noteKeywords: ['injeção in-site'],
  },
  {
    path: '/claude',
    title: 'Claude AI Master',
    desc: 'Perfil Claude e histórico de dispositivos',
    keys: ['claudeDeviceProfile', 'claudeDeviceHistory'],
  },
  {
    path: '/chatgpt',
    title: 'ChatGPT Master',
    desc: 'UID, sessão e perfil GPT',
    keys: ['gpt_device_profile', 'gpt_device_id', 'gpt_session_id', 'gpt_anon_id', 'gpt_uid', 'gpt_persona'],
    cookies: ['GPT_DEVICE_ID', 'GPT_SESSION', 'GPT_ANON_ID', 'GPT_UID', 'GPT_LOCALE', 'GPT_MODEL'],
  },
  {
    path: '/copilot',
    title: 'Copilot Chat Master',
    desc: 'UID, sessão e perfil do Copilot Chat',
    keys: ['cpt_device_profile', 'cpt_device_id', 'cpt_session_id', 'cpt_anon_id', 'cpt_uid', 'cpt_persona'],
    cookies: ['CPT_DEVICE_ID', 'CPT_SESSION', 'CPT_ANON_ID', 'CPT_UID', 'CPT_LOCALE', 'CPT_MODEL'],
  },
  {
    path: '/apple-contas',
    title: 'AppleContas Master',
    desc: 'DSID, storefront e perfil Apple',
    keys: ['acl_device_profile', 'acl_device_id', 'acl_session_id', 'acl_anon_id', 'acl_dsid', 'acl_persona'],
    cookies: ['ACL_DEVICE_ID', 'ACL_SESSION', 'ACL_ANON_ID', 'ACL_DSID', 'ACL_STOREFRONT', 'ACL_COUNTRY', 'ACL_LOCALE'],
  },
  {
    path: '/coringa',
    title: 'Coringa Master',
    desc: 'Perfil, fingerprint e persona Coringa universal',
    keys: ['CoringaDeviceProfile', 'CoringaFingerprint', 'CoringaPersona'],
    noteKeywords: ['Coringa'],
  },
  {
    path: '/youtube',
    title: 'YouTube Master',
    desc: 'Visitor data, sessão e perfil YouTube',
    keys: ['yt_device_profile', 'yt_device_id', 'yt_session_id', 'yt_visitor_data', 'yt_client_version', 'yt_persona'],
    cookies: ['VISITOR_INFO1_LIVE', 'PREF', 'YSC', 'GPSVisitedState', 'YT_DEVICE_ID', 'YT_SESSION'],
  },
  {
    path: '/gmail',
    title: 'Gmail Generator',
    desc: 'Perfil Gmail e histórico de dispositivos',
    keys: ['gmailDeviceProfile', 'gmailDeviceHistory'],
    noteKeywords: ['Gmail'],
  },
  {
    path: '/emails',
    title: 'Email Forwarder',
    desc: 'Contas de email temporário',
    keys: ['email_accounts'],
  },
  {
    path: '/email-plus',
    title: 'EmailPlus',
    desc: 'Contas do kit EmailPlus',
    keys: ['emailplus_accounts'],
  },
  {
    path: '/ugphone',
    title: 'UGPhone Master',
    desc: 'Sessão, cookies e perfil UGPhone',
    keys: ['ugphone_device_profile', '_ugphone_device_id', '_ugphone_session_token', '_ugphone_region', '_ugphone_plan'],
    prefixes: ['ugphone_'],
    cookies: ['device_id', 'session_token', 'region', 'plan', 'locale'],
    noteKeywords: ['UGPhone'],
  },
  {
    path: '/geelark',
    title: 'GeeLark Master',
    desc: 'Código de convite, sessão e perfil GeeLark',
    keys: ['gle_device_profile', 'gle_device_id', 'gle_session_id', 'gle_anon_id', 'gle_invite_code', 'gle_persona'],
    cookies: ['GLE_DEVICE_ID', 'GLE_SESSION', 'GLE_ANON_ID', 'GLE_INVITE_CODE', 'GLE_LOCALE'],
  },
  {
    path: '/redfinger',
    title: 'Redfinger Master',
    desc: 'Modelo de emulador, sessão e perfil Redfinger',
    keys: ['rf_device_profile', 'rf_device_id', 'rf_session_id', 'rf_anon_id', 'rf_emulator_model', 'rf_persona'],
    cookies: ['RF_DEVICE_ID', 'RF_SESSION', 'RF_ANON_ID', 'RF_EMULATOR_MODEL', 'RF_LOCALE'],
  },
  {
    path: '/vmoscloud',
    title: 'VmosCloud Master',
    desc: 'Canal, sessão e perfil VmosCloud',
    keys: ['vmc_device_profile', 'vmc_device_id', 'vmc_session_id', 'vmc_anon_id', 'vmc_channel', 'vmc_persona'],
    cookies: ['VMC_DEVICE_ID', 'VMC_SESSION', 'VMC_ANON_ID', 'VMC_CHANNEL', 'VMC_PLAN', 'VMC_LOCALE'],
  },
  {
    path: '/ldplayer',
    title: 'LDPlayer Master',
    desc: 'Versão de emulador, sessão e perfil LDPlayer',
    keys: ['ldp_device_profile', 'ldp_device_id', 'ldp_session_id', 'ldp_anon_id', 'ldp_emulator_ver', 'ldp_persona'],
    cookies: ['LDP_DEVICE_ID', 'LDP_SESSION', 'LDP_ANON_ID', 'LDP_EMULATOR_VER', 'LDP_LOCALE'],
  },
  {
    path: '/tensor',
    title: 'Tensor.art Master',
    desc: 'UID, canal e perfil Tensor',
    keys: ['tns_device_profile', 'tns_device_id', 'tns_session_id', 'tns_anon_id', 'tns_uid', 'tns_persona'],
    cookies: ['TNS_DEVICE_ID', 'TNS_SESSION', 'TNS_ANON_ID', 'TNS_UID', 'TNS_CHANNEL', 'TNS_LOCALE'],
  },
  {
    path: '/seaart',
    title: 'SeaArt AI Master',
    desc: 'UID, canal e perfil SeaArt',
    keys: ['sa_device_profile', 'sa_device_id', 'sa_session_id', 'sa_anon_id', 'sa_uid', 'sa_persona'],
    cookies: ['SA_DEVICE_ID', 'SA_SESSION', 'SA_ANON_ID', 'SA_UID', 'SA_CHANNEL', 'SA_LOCALE'],
  },
  {
    path: '/copilot-designer',
    title: 'Copilot Designer Master',
    desc: 'UID, market e perfil Copilot Designer',
    keys: ['cdp_device_profile', 'cdp_device_id', 'cdp_session_id', 'cdp_anon_id', 'cdp_uid', 'cdp_persona'],
    cookies: ['CDP_DEVICE_ID', 'CDP_SESSION', 'CDP_ANON_ID', 'CDP_UID', 'CDP_LOCALE', 'CDP_MARKET'],
  },
  {
    path: '/leonardo',
    title: 'Leonardo.ai Master',
    desc: 'UID, plano e perfil Leonardo',
    keys: ['leo_device_profile', 'leo_device_id', 'leo_session_id', 'leo_anon_id', 'leo_uid', 'leo_persona'],
    cookies: ['LEO_DEVICE_ID', 'LEO_SESSION', 'LEO_ANON_ID', 'LEO_UID', 'LEO_LOCALE', 'LEO_PLAN'],
  },
  {
    path: '/monkeycode',
    title: 'MonkeyCode Master',
    desc: 'Anti-bot token, visitor e perfil MonkeyCode',
    keys: ['mc_device_profile', 'mc_device_id', 'mc_session_id', 'mc_anon_id', 'mc_visitor_id', 'mc_anti_bot_token', 'mc_persona'],
    cookies: ['MC_DEVICE_ID', 'MC_SESSION', 'MC_VISITOR_ID', 'MC_ANTI_BOT_TOKEN', 'MC_LANG'],
  },
  {
    path: '/base44',
    title: 'Base-44 Master',
    desc: 'Fingerprint ID, registro e perfil Base-44',
    keys: ['b44_device_profile', 'b44_device_id', 'b44_session_id', 'b44_fingerprint_id', 'b44_registration_id', 'b44_persona'],
    cookies: ['B44_DEVICE_ID', 'B44_SESSION', 'B44_FINGERPRINT_ID', 'B44_LANG', 'B44_REFERRER'],
  },
  {
    path: '/lovable',
    title: 'Lovable Master',
    desc: 'Workspace, onboarding e perfil Lovable',
    keys: ['lb_device_profile', 'lb_device_id', 'lb_session_id', 'lb_anon_id', 'lb_workspace_id', 'lb_onboarding_token', 'lb_persona'],
    cookies: ['LB_DEVICE_ID', 'LB_SESSION', 'LB_ANON_ID', 'LB_WORKSPACE_ID', 'LB_LOCALE'],
  },
  {
    path: '/emergente',
    title: 'Emergente Master',
    desc: 'UTM, sessão e perfil Emergente',
    keys: ['emg_device_profile', 'emg_device_id', 'emg_session_id', 'emg_anon_id', 'emg_persona'],
    cookies: ['EMG_DEVICE_ID', 'EMG_SESSION', 'EMG_ANON_ID', 'EMG_CAMPAIGN_ID', 'EMG_UTM_SOURCE', 'EMG_LOCALE'],
  },
  {
    path: '/cider',
    title: 'Cider',
    desc: 'Sessão, cookies e perfil Cider',
    keys: ['cider_device_profile', '_cider_device_id', '_cider_guest_id', '_cider_sid'],
    prefixes: ['cider_'],
    cookies: ['device_id', 'guest_id', 'sid', 'countryCode', 'currency'],
    noteKeywords: ['Cider'],
  },
  {
    path: '/scooby-doo',
    title: 'Hub Scooby-Doo',
    desc: 'Perfis iFood e Zé Delivery',
    prefixes: ['ifood_', 'zedelivery_'],
    noteKeywords: ['Hub Scooby-Doo'],
  },
  {
    path: '/dark',
    title: 'DARK MASTER HUB',
    desc: 'Perfis e personas dos serviços Dark (SkynetChat, DeepHat, Venice, etc.)',
    prefixes: ['skynetchat_', 'deephat_', 'venice_', 'simplelogin_', 'nastia_', 'uncensored_', 'atomicmail_'],
    noteKeywords: ['Dark Hub'],
  },
  {
    path: '/van-gogh',
    title: 'Van Gogh',
    desc: 'Perfis locais dos submenus criativos',
    prefixes: ['device_master_local_profile_'],
  },
];

const manualPaths = new Set(MANUAL_MENU_HISTORY.map((entry) => entry.path));
const discoveredMenuHistory: MenuHistoryEntry[] = generators
  .filter((menu) => menu.path !== '/apagar-historico' && !manualPaths.has(menu.path))
  .map((menu) => ({
    path: menu.path,
    title: menu.title,
    desc: `${menu.desc} · cadastro automático`,
    keys: [],
    noteKeywords: [],
    externalUrl: menu.externalUrl,
  }));

const MENU_CATALOG: MenuHistoryEntry[] = [...MANUAL_MENU_HISTORY, ...discoveredMenuHistory];

function readMenuVisitsRecord(): Record<string, MenuVisit> {
  try {
    const raw = localStorage.getItem(MENU_VISITS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, MenuVisit>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function getMenuVisits(): MenuVisit[] {
  return Object.values(readMenuVisitsRecord()).sort(
    (a, b) => new Date(b.lastVisitedAt).getTime() - new Date(a.lastVisitedAt).getTime(),
  );
}

/** Registra uma visita e o URL exato que a extensão poderá limpar. */
export function recordMenuVisit(path: string, title: string, url?: string, externalUrl?: string): void {
  if (typeof localStorage === 'undefined' || !path || path === '/apagar-historico') return;

  const visits = readMenuVisitsRecord();
  const current = visits[path];
  const nextUrl = url || externalUrl;
  visits[path] = {
    path,
    title,
    externalUrl,
    count: (current?.count ?? 0) + 1,
    lastVisitedAt: new Date().toISOString(),
    urls: Array.from(new Set([...(current?.urls ?? []), ...(nextUrl ? [nextUrl] : [])])),
  };
  localStorage.setItem(MENU_VISITS_STORAGE_KEY, JSON.stringify(visits));
}

/**
 * Catálogo efetivo usado pela tela Apagar Histórico.
 * Menus novos entram pelo catálogo principal; rotas visitadas fora dele também
 * aparecem automaticamente como "menu descoberto".
 */
export function getMenuHistory(): MenuHistoryEntry[] {
  const visits = readMenuVisitsRecord();
  const knownPaths = new Set(MENU_CATALOG.map((entry) => entry.path));
  const discoveredVisits = Object.values(visits)
    .filter((visit) => !knownPaths.has(visit.path))
    .map((visit) => ({
      path: visit.path,
      title: visit.title || visit.path,
      desc: 'Menu descoberto pelo registro automático de visitas',
      externalUrl: visit.externalUrl,
      keys: [],
      noteKeywords: [],
    }));

  return [...MENU_CATALOG, ...discoveredVisits].map((entry) => {
    const visit = visits[entry.path];
    return {
      ...entry,
      visitCount: visit?.count ?? 0,
      lastVisitedAt: visit?.lastVisitedAt,
      visitedUrls: visit?.urls ?? [],
    };
  });
}

export const MENU_HISTORY: MenuHistoryEntry[] = MENU_CATALOG;

/**
 * Conta quantos itens de localStorage um menu possui atualmente.

 */
export function countMenuLocalStorage(entry: MenuHistoryEntry): number {
  let count = 0;
  for (const key of entry.keys ?? []) {
    if (localStorage.getItem(key) !== null) count += 1;
  }
  for (const prefix of entry.prefixes ?? []) {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) count += 1;
    }
  }
  return count;
}

/**
 * Conta registros de histórico de contas que pertencem a este menu.
 */
export function countMenuAccountHistory(entry: MenuHistoryEntry): number {
  if (!entry.noteKeywords?.length) return 0;
  const keywords = entry.noteKeywords;
  try {
    const raw = localStorage.getItem('manus_account_history');
    if (!raw) return 0;
    const records: any[] = JSON.parse(raw);
    return records.filter((r) => keywords.some((k) => r.notes?.includes(k))).length;
  } catch {
    return 0;
  }
}

/**
 * Total de itens (localStorage + cookies + registros) de um menu.
 */
export function countMenuHistory(entry: MenuHistoryEntry): number {
  return countMenuLocalStorage(entry) + countMenuAccountHistory(entry) + (entry.cookies?.filter((c) => document.cookie.includes(c + '=')).length ?? 0);
}

export function countMenuActivity(entry: MenuHistoryEntry): number {
  return countMenuHistory(entry) + (entry.visitCount ?? 0);
}

export function getVisitedBrowserUrls(entry?: MenuHistoryEntry): string[] {
  if (entry) return entry.visitedUrls ?? [];
  return getMenuHistory().flatMap((item) => item.visitedUrls ?? []);
}

/**
 * Remove um cookie pelo nome (todas as variações de path/domain).
 */
function clearCookie(name: string): void {
  const paths = ['/', '/MacacoLoucoVisualNovo'];
  paths.forEach((path) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`;
  });
}

/**
 * Apaga TODO o histórico de um único menu, sem tocar nos demais.
 */
export function clearMenuHistory(entry: MenuHistoryEntry): void {
  for (const key of entry.keys ?? []) {
    // O histórico de contas é compartilhado; ele é filtrado por keywords abaixo.
    if (key === 'manus_account_history') continue;
    localStorage.removeItem(key);
  }

  for (const prefix of entry.prefixes ?? []) {
    const toRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) toRemove.push(key);
    }
    toRemove.forEach((key) => localStorage.removeItem(key));
  }

  for (const cookie of entry.cookies ?? []) {
    clearCookie(cookie);
  }

  if (entry.noteKeywords?.length) {
    const keywords = entry.noteKeywords;
    try {
      const raw = localStorage.getItem('manus_account_history');
      if (raw) {
        const records: any[] = JSON.parse(raw);
        const filtered = records.filter((r) => !keywords.some((k) => r.notes?.includes(k)));
        if (filtered.length !== records.length) {
          localStorage.setItem('manus_account_history', JSON.stringify(filtered));
        }
      }
    } catch {
      // ignora erros de parsing
    }
  }

  const visits = readMenuVisitsRecord();
  if (visits[entry.path]) {
    delete visits[entry.path];
    if (Object.keys(visits).length > 0) {
      localStorage.setItem(MENU_VISITS_STORAGE_KEY, JSON.stringify(visits));
    } else {
      localStorage.removeItem(MENU_VISITS_STORAGE_KEY);
    }
  }
}

/** Remove todos os dados internos conhecidos pelo aplicativo. */
export function clearAllManagedHistory(): void {
  for (const entry of getMenuHistory()) {
    clearMenuHistory(entry);
  }
  localStorage.removeItem('manus_account_history');
  localStorage.removeItem('manus_successful_configs');
  localStorage.removeItem(MENU_VISITS_STORAGE_KEY);
}
