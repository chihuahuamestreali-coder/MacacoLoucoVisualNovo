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
  {
    id: 'simplelogin',
    name: 'EXTENSAO SIMPLELOGIN',
    domains: ['aleeas.com'],
    color: 'from-violet-600 to-purple-800',
    signupNote: 'SimpleLogin (Proton): aliases @aleeas.com encaminhando para o seu Gmail. Desative ou exclua cada alias.',
  },
  {
    id: 'firefoxrelay',
    name: 'EXTENSAO FIREFOX RELAY',
    domains: ['mozmail.com'],
    color: 'from-sky-600 to-blue-800',
    signupNote: 'Firefox Relay (Mozilla): enderecos mascarados @mozmail.com que encaminham para a caixa real.',
  },
  {
    id: 'addy',
    name: 'EXTENSAO ADDY.IO',
    domains: ['anonaddy.me', 'anonaddy.com'],
    color: 'from-orange-600 to-amber-800',
    signupNote: 'Addy.io: aliases por servico (amazon@, facebook@, aliexpress@) com controle de encaminhamento.',
  },
];

const SHARED_DEFAULT_DOMAINS: Record<string, string> = {
  apple: 'icloud.com',
  duck: 'duck.com',
  simplelogin: 'aleeas.com',
  firefoxrelay: 'mozmail.com',
  addy: 'anonaddy.me',
};

export const ALEMAO_COUNTRIES: AlemaoCountry[] = [
  {
    id: 'br',
    name: 'Brasil',
    code: 'BR',
    locale: 'pt-BR',
    appleLocale: 'pt_BR',
    applePath: 'br',
    defaultDomains: { ...SHARED_DEFAULT_DOMAINS },
  },
  {
    id: 'de',
    name: 'Alemanha',
    code: 'DE',
    locale: 'de-DE',
    appleLocale: 'de_DE',
    applePath: 'de',
    defaultDomains: { ...SHARED_DEFAULT_DOMAINS },
  },
  {
    id: 'ru',
    name: 'Russia',
    code: 'RU',
    locale: 'ru-RU',
    appleLocale: 'ru_RU',
    applePath: 'ru',
    defaultDomains: { ...SHARED_DEFAULT_DOMAINS },
  },
  {
    id: 'us',
    name: 'Estados Unidos',
    code: 'US',
    locale: 'en-US',
    appleLocale: 'en_US',
    applePath: 'us',
    defaultDomains: { ...SHARED_DEFAULT_DOMAINS },
  },
  {
    id: 'eu',
    name: 'Europa',
    code: 'EU',
    locale: 'en-GB',
    appleLocale: 'en_GB',
    applePath: 'de',
    defaultDomains: { ...SHARED_DEFAULT_DOMAINS },
  },
  {
    id: 'fr',
    name: 'Franca',
    code: 'FR',
    locale: 'fr-FR',
    appleLocale: 'fr_FR',
    applePath: 'fr',
    defaultDomains: { ...SHARED_DEFAULT_DOMAINS },
  },
  {
    id: 'pt',
    name: 'Portugal',
    code: 'PT',
    locale: 'pt-PT',
    appleLocale: 'pt_PT',
    applePath: 'pt',
    defaultDomains: { ...SHARED_DEFAULT_DOMAINS },
  },
  {
    id: 'es',
    name: 'Espanha',
    code: 'ES',
    locale: 'es-ES',
    appleLocale: 'es_ES',
    applePath: 'es',
    defaultDomains: { ...SHARED_DEFAULT_DOMAINS },
  },
  {
    id: 'it',
    name: 'Italia',
    code: 'IT',
    locale: 'it-IT',
    appleLocale: 'it_IT',
    applePath: 'it',
    defaultDomains: { ...SHARED_DEFAULT_DOMAINS },
  },
  {
    id: 'nl',
    name: 'Holanda',
    code: 'NL',
    locale: 'nl-NL',
    appleLocale: 'nl_NL',
    applePath: 'nl',
    defaultDomains: { ...SHARED_DEFAULT_DOMAINS },
  },
  {
    id: 'gb',
    name: 'Reino Unido',
    code: 'GB',
    locale: 'en-GB',
    appleLocale: 'en_GB',
    applePath: 'uk',
    defaultDomains: { ...SHARED_DEFAULT_DOMAINS },
  },
  {
    id: 'tr',
    name: 'Turquia',
    code: 'TR',
    locale: 'tr-TR',
    appleLocale: 'tr_TR',
    applePath: 'tr',
    defaultDomains: { ...SHARED_DEFAULT_DOMAINS },
  },
  {
    id: 'kz',
    name: 'Cazaquistao',
    code: 'KZ',
    locale: 'kk-KZ',
    appleLocale: 'kk_KZ',
    applePath: 'kz',
    defaultDomains: { ...SHARED_DEFAULT_DOMAINS },
  },
  {
    id: 'by',
    name: 'Bielorrussia',
    code: 'BY',
    locale: 'be-BY',
    appleLocale: 'be_BY',
    applePath: 'by',
    defaultDomains: { ...SHARED_DEFAULT_DOMAINS },
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

export const SIMPLELOGIN_HOME_URL = 'https://simplelogin.io';
export const SIMPLELOGIN_START_URL = 'https://app.simplelogin.io/auth/register';
export const SIMPLELOGIN_LOGIN_URL = 'https://app.simplelogin.io/auth/login';
export const SIMPLELOGIN_DOMAIN = 'aleeas.com';

export const FIREFOX_RELAY_HOME_URL = 'https://relay.firefox.com';
export const FIREFOX_RELAY_START_URL = 'https://relay.firefox.com/accounts/profile/';
export const FIREFOX_RELAY_LOGIN_URL = 'https://relay.firefox.com/accounts/login/';
export const FIREFOX_RELAY_DOMAIN = 'mozmail.com';

export const ADDY_HOME_URL = 'https://addy.io';
export const ADDY_START_URL = 'https://app.addy.io/register';
export const ADDY_LOGIN_URL = 'https://app.addy.io/login';
export const ADDY_DOMAIN = 'anonaddy.me';
export const ADDY_NAMED_DOMAIN = 'anonaddy.com';

export function generateAlemaoSignupUrl(
  provider: AlemaoEmailProvider,
  country: AlemaoCountry,
  _domain: string,
): string {
  if (provider.id === 'duck') return DUCK_EMAIL_START_URL;
  if (provider.id === 'simplelogin') return SIMPLELOGIN_START_URL;
  if (provider.id === 'firefoxrelay') return FIREFOX_RELAY_START_URL;
  if (provider.id === 'addy') return ADDY_START_URL;
  return generateAppleIdSignupUrl(country);
}

export type DuckAddressType = 'personal' | 'private';
export type AliasAddressType = DuckAddressType;
export type AliasExtensionId = 'duck' | 'simplelogin' | 'firefoxrelay' | 'addy';

export interface DuckAddress {
  id: string;
  type: DuckAddressType;
  address: string;
  forwardTo: string;
  service: string;
  createdAt: Date;
  enabled: boolean;
}

export type AliasAddress = DuckAddress;

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

function randomToken(length = 8): string {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let out = '';
  for (let i = 0; i < length; i += 1) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
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

export function generatePersonalSimpleLoginAddress(localPart: string): string {
  const clean = sanitizeDuckLocalPart(localPart) || 'seunome';
  return `${clean}@${SIMPLELOGIN_DOMAIN}`;
}

export function generatePrivateSimpleLoginAddress(): string {
  return `${randomToken(6)}${randomToken(4)}@${SIMPLELOGIN_DOMAIN}`;
}

export function generatePersonalFirefoxRelayAddress(localPart: string): string {
  const clean = sanitizeDuckLocalPart(localPart) || 'seunome';
  return `${clean}@${FIREFOX_RELAY_DOMAIN}`;
}

export function generatePrivateFirefoxRelayAddress(): string {
  return `${pickDuckWord(DUCK_ADJECTIVES)}.${randomToken(6)}@${FIREFOX_RELAY_DOMAIN}`;
}

export function generatePersonalAddyAddress(localPart: string): string {
  const clean = sanitizeDuckLocalPart(localPart) || 'seunome';
  return `${clean}@${ADDY_DOMAIN}`;
}

export function generatePrivateAddyAddress(service: string, username: string): string {
  const user = sanitizeDuckLocalPart(username) || 'seunome';
  const svc = sanitizeDuckLocalPart(service) || pickDuckWord(DUCK_NOUNS);
  return `${svc}@${user}.${ADDY_NAMED_DOMAIN}`;
}

export const ALIAS_EXTENSION_IDS: AliasExtensionId[] = ['duck', 'simplelogin', 'firefoxrelay', 'addy'];

export function isAliasExtensionId(id: string): id is AliasExtensionId {
  return ALIAS_EXTENSION_IDS.includes(id as AliasExtensionId);
}
