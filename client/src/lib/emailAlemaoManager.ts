export interface AlemaoEmailProvider {
  id: string;
  name: string;
  domains: string[];
  color: string;
  signupNote: string;
}

export interface AlemaoCountry {
  id: string;
  name: string;
  code: string;
  locale: string;
  appleLocale: string;
  applePath: string;
  defaultDomains: Record<string, string>;
}

export const ALEMAO_EMAIL_PROVIDERS: AlemaoEmailProvider[] = [
  {
    id: 'apple',
    name: 'Apple ID / iCloud',
    domains: ['icloud.com', 'me.com', 'mac.com'],
    color: 'from-slate-500 to-zinc-700',
    signupNote: 'Primeiro cria a Apple ID no pais escolhido; depois use iCloud.com com essa conta.',
  },
  {
    id: 'duck',
    name: 'EXTENSAO DUCKDUCK',
    domains: ['duck.com'],
    color: 'from-emerald-600 to-green-800',
    signupNote: 'DuckDuckGo Email Protection: Personal e Private @duck.com encaminhando para o seu Gmail.',
  },
];

export const ALEMAO_COUNTRIES: AlemaoCountry[] = [
  {
    id: 'br',
    name: 'Brasil',
    code: 'BR',
    locale: 'pt-BR',
    appleLocale: 'pt_BR',
    applePath: 'br',
    defaultDomains: { apple: 'icloud.com', duck: 'duck.com' },
  },
  {
    id: 'de',
    name: 'Alemanha',
    code: 'DE',
    locale: 'de-DE',
    appleLocale: 'de_DE',
    applePath: 'de',
    defaultDomains: { apple: 'icloud.com', duck: 'duck.com' },
  },
  {
    id: 'ru',
    name: 'Russia',
    code: 'RU',
    locale: 'ru-RU',
    appleLocale: 'ru_RU',
    applePath: 'ru',
    defaultDomains: { apple: 'icloud.com', duck: 'duck.com' },
  },
  {
    id: 'us',
    name: 'Estados Unidos',
    code: 'US',
    locale: 'en-US',
    appleLocale: 'en_US',
    applePath: 'us',
    defaultDomains: { apple: 'icloud.com', duck: 'duck.com' },
  },
  {
    id: 'eu',
    name: 'Europa',
    code: 'EU',
    locale: 'en-GB',
    appleLocale: 'en_GB',
    applePath: 'de',
    defaultDomains: { apple: 'icloud.com', duck: 'duck.com' },
  },
  {
    id: 'fr',
    name: 'Franca',
    code: 'FR',
    locale: 'fr-FR',
    appleLocale: 'fr_FR',
    applePath: 'fr',
    defaultDomains: { apple: 'icloud.com', duck: 'duck.com' },
  },
  {
    id: 'pt',
    name: 'Portugal',
    code: 'PT',
    locale: 'pt-PT',
    appleLocale: 'pt_PT',
    applePath: 'pt',
    defaultDomains: { apple: 'icloud.com', duck: 'duck.com' },
  },
  {
    id: 'es',
    name: 'Espanha',
    code: 'ES',
    locale: 'es-ES',
    appleLocale: 'es_ES',
    applePath: 'es',
    defaultDomains: { apple: 'icloud.com', duck: 'duck.com' },
  },
  {
    id: 'it',
    name: 'Italia',
    code: 'IT',
    locale: 'it-IT',
    appleLocale: 'it_IT',
    applePath: 'it',
    defaultDomains: { apple: 'icloud.com', duck: 'duck.com' },
  },
  {
    id: 'nl',
    name: 'Holanda',
    code: 'NL',
    locale: 'nl-NL',
    appleLocale: 'nl_NL',
    applePath: 'nl',
    defaultDomains: { apple: 'icloud.com', duck: 'duck.com' },
  },
  {
    id: 'gb',
    name: 'Reino Unido',
    code: 'GB',
    locale: 'en-GB',
    appleLocale: 'en_GB',
    applePath: 'uk',
    defaultDomains: { apple: 'icloud.com', duck: 'duck.com' },
  },
  {
    id: 'tr',
    name: 'Turquia',
    code: 'TR',
    locale: 'tr-TR',
    appleLocale: 'tr_TR',
    applePath: 'tr',
    defaultDomains: { apple: 'icloud.com', duck: 'duck.com' },
  },
  {
    id: 'kz',
    name: 'Cazaquistao',
    code: 'KZ',
    locale: 'kk-KZ',
    appleLocale: 'kk_KZ',
    applePath: 'kz',
    defaultDomains: { apple: 'icloud.com', duck: 'duck.com' },
  },
  {
    id: 'by',
    name: 'Bielorrussia',
    code: 'BY',
    locale: 'be-BY',
    appleLocale: 'be_BY',
    applePath: 'by',
    defaultDomains: { apple: 'icloud.com', duck: 'duck.com' },
  },
];

export function getDefaultDomain(providerId: string, country: AlemaoCountry): string {
  return country.defaultDomains[providerId] || ALEMAO_EMAIL_PROVIDERS.find((p) => p.id === providerId)?.domains[0] || '';
}

export function generateAppleIdSignupUrl(_country?: AlemaoCountry): string {
  return 'https://account.apple.com/account';
}

export function generateIcloudUrl(country: AlemaoCountry): string {
  return `https://www.icloud.com/?language=${encodeURIComponent(country.locale)}`;
}

export const DUCK_EMAIL_PROTECTION_URL = 'https://duckduckgo.com/email';
export const DUCK_EMAIL_START_URL = 'https://duckduckgo.com/email/start';
export const DUCK_EMAIL_LOGIN_URL = 'https://duckduckgo.com/email/login';
export const DUCK_DOMAIN = 'duck.com';

export function generateAlemaoSignupUrl(
  provider: AlemaoEmailProvider,
  country: AlemaoCountry,
  _domain: string,
): string {
  if (provider.id === 'duck') return DUCK_EMAIL_START_URL;
  return generateAppleIdSignupUrl(country);
}

export type DuckAddressType = 'personal' | 'private';

export interface DuckAddress {
  id: string;
  type: DuckAddressType;
  address: string;
  forwardTo: string;
  service: string;
  createdAt: Date;
  enabled: boolean;
}

const DUCK_ADJECTIVES = [
  'amaze', 'brave', 'calm', 'clever', 'cosmic', 'crisp', 'curious', 'dawn',
  'ember', 'fast', 'gentle', 'golden', 'hidden', 'ivory', 'jade', 'kind',
  'lucky', 'misty', 'noble', 'olive', 'quiet', 'rapid', 'silent', 'solar',
  'swift', 'tidal', 'ultra', 'vivid', 'wild', 'zen',
];

const DUCK_NOUNS = [
  'anchor', 'badge', 'cedar', 'comet', 'coral', 'crane', 'delta', 'echo',
  'falcon', 'gem', 'glacier', 'harbor', 'island', 'lantern', 'maple', 'meadow',
  'nebula', 'orchid', 'otter', 'pebble', 'pine', 'quartz', 'raven', 'river',
  'shadow', 'spider', 'stone', 'summit', 'tiger', 'willow',
];

function pickDuckWord(list: string[]): string {
  return list[Math.floor(Math.random() * list.length)];
}

export function sanitizeDuckLocalPart(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '')
    .replace(/^[._-]+|[._-]+$/g, '')
    .slice(0, 32);
}

export function generatePersonalDuckAddress(localPart: string): string {
  const clean = sanitizeDuckLocalPart(localPart) || 'seunome';
  return `${clean}@${DUCK_DOMAIN}`;
}

export function generatePrivateDuckAddress(): string {
  let first = pickDuckWord(DUCK_ADJECTIVES);
  let second = pickDuckWord(DUCK_NOUNS);
  let third = pickDuckWord(DUCK_NOUNS);
  while (second === third) {
    third = pickDuckWord(DUCK_NOUNS);
  }
  return `${first}-${second}-${third}@${DUCK_DOMAIN}`;
}
