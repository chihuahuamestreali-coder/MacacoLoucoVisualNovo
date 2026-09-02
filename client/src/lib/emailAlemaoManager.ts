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
  yandexLanguage: string;
  yandexHost: string;
  mailruLang: string;
  appleLocale: string;
  applePath: string;
  defaultDomains: Record<string, string>;
}

export const ALEMAO_EMAIL_PROVIDERS: AlemaoEmailProvider[] = [
  {
    id: 'yandex',
    name: 'Yandex',
    domains: ['yandex.com', 'yandex.ru', 'yandex.com.tr', 'yandex.kz', 'yandex.by', 'yandex.ua'],
    color: 'from-red-600 to-yellow-600',
    signupNote: 'Abre o cadastro do Yandex no idioma/pais selecionado.',
  },
  {
    id: 'mailru',
    name: 'Mail.ru',
    domains: ['mail.ru', 'inbox.ru', 'list.ru', 'bk.ru', 'internet.ru'],
    color: 'from-blue-600 to-sky-700',
    signupNote: 'Abre o cadastro do Mail.ru no idioma/pais selecionado.',
  },
  {
    id: 'apple',
    name: 'Apple ID / iCloud',
    domains: ['icloud.com', 'me.com', 'mac.com'],
    color: 'from-slate-500 to-zinc-700',
    signupNote: 'Primeiro cria a Apple ID no pais escolhido; depois use iCloud.com com essa conta.',
  },
];

export const ALEMAO_COUNTRIES: AlemaoCountry[] = [
  {
    id: 'de',
    name: 'Alemanha',
    code: 'DE',
    locale: 'de-DE',
    yandexLanguage: 'de',
    yandexHost: 'https://passport.yandex.com',
    mailruLang: 'de_DE',
    appleLocale: 'de_DE',
    applePath: 'de',
    defaultDomains: { yandex: 'yandex.com', mailru: 'mail.ru', apple: 'icloud.com' },
  },
  {
    id: 'ru',
    name: 'Russia',
    code: 'RU',
    locale: 'ru-RU',
    yandexLanguage: 'ru',
    yandexHost: 'https://passport.yandex.ru',
    mailruLang: 'ru_RU',
    appleLocale: 'ru_RU',
    applePath: 'ru',
    defaultDomains: { yandex: 'yandex.ru', mailru: 'mail.ru', apple: 'icloud.com' },
  },
  {
    id: 'us',
    name: 'Estados Unidos',
    code: 'US',
    locale: 'en-US',
    yandexLanguage: 'en',
    yandexHost: 'https://passport.yandex.com',
    mailruLang: 'en_US',
    appleLocale: 'en_US',
    applePath: 'us',
    defaultDomains: { yandex: 'yandex.com', mailru: 'mail.ru', apple: 'icloud.com' },
  },
  {
    id: 'br',
    name: 'Brasil',
    code: 'BR',
    locale: 'pt-BR',
    yandexLanguage: 'pt',
    yandexHost: 'https://passport.yandex.com',
    mailruLang: 'pt_BR',
    appleLocale: 'pt_BR',
    applePath: 'br',
    defaultDomains: { yandex: 'yandex.com', mailru: 'mail.ru', apple: 'icloud.com' },
  },
  {
    id: 'eu',
    name: 'Europa',
    code: 'EU',
    locale: 'en-GB',
    yandexLanguage: 'en',
    yandexHost: 'https://passport.yandex.com',
    mailruLang: 'en_US',
    appleLocale: 'en_GB',
    applePath: 'de',
    defaultDomains: { yandex: 'yandex.com', mailru: 'mail.ru', apple: 'icloud.com' },
  },
  {
    id: 'fr',
    name: 'Franca',
    code: 'FR',
    locale: 'fr-FR',
    yandexLanguage: 'fr',
    yandexHost: 'https://passport.yandex.com',
    mailruLang: 'fr_FR',
    appleLocale: 'fr_FR',
    applePath: 'fr',
    defaultDomains: { yandex: 'yandex.com', mailru: 'mail.ru', apple: 'icloud.com' },
  },
  {
    id: 'pt',
    name: 'Portugal',
    code: 'PT',
    locale: 'pt-PT',
    yandexLanguage: 'pt',
    yandexHost: 'https://passport.yandex.com',
    mailruLang: 'pt_PT',
    appleLocale: 'pt_PT',
    applePath: 'pt',
    defaultDomains: { yandex: 'yandex.com', mailru: 'mail.ru', apple: 'icloud.com' },
  },
  {
    id: 'es',
    name: 'Espanha',
    code: 'ES',
    locale: 'es-ES',
    yandexLanguage: 'es',
    yandexHost: 'https://passport.yandex.com',
    mailruLang: 'es_ES',
    appleLocale: 'es_ES',
    applePath: 'es',
    defaultDomains: { yandex: 'yandex.com', mailru: 'mail.ru', apple: 'icloud.com' },
  },
  {
    id: 'it',
    name: 'Italia',
    code: 'IT',
    locale: 'it-IT',
    yandexLanguage: 'it',
    yandexHost: 'https://passport.yandex.com',
    mailruLang: 'it_IT',
    appleLocale: 'it_IT',
    applePath: 'it',
    defaultDomains: { yandex: 'yandex.com', mailru: 'mail.ru', apple: 'icloud.com' },
  },
  {
    id: 'nl',
    name: 'Holanda',
    code: 'NL',
    locale: 'nl-NL',
    yandexLanguage: 'nl',
    yandexHost: 'https://passport.yandex.com',
    mailruLang: 'nl_NL',
    appleLocale: 'nl_NL',
    applePath: 'nl',
    defaultDomains: { yandex: 'yandex.com', mailru: 'mail.ru', apple: 'icloud.com' },
  },
  {
    id: 'gb',
    name: 'Reino Unido',
    code: 'GB',
    locale: 'en-GB',
    yandexLanguage: 'en',
    yandexHost: 'https://passport.yandex.com',
    mailruLang: 'en_GB',
    appleLocale: 'en_GB',
    applePath: 'uk',
    defaultDomains: { yandex: 'yandex.com', mailru: 'mail.ru', apple: 'icloud.com' },
  },
  {
    id: 'tr',
    name: 'Turquia',
    code: 'TR',
    locale: 'tr-TR',
    yandexLanguage: 'tr',
    yandexHost: 'https://passport.yandex.com.tr',
    mailruLang: 'tr_TR',
    appleLocale: 'tr_TR',
    applePath: 'tr',
    defaultDomains: { yandex: 'yandex.com.tr', mailru: 'mail.ru', apple: 'icloud.com' },
  },
  {
    id: 'kz',
    name: 'Cazaquistao',
    code: 'KZ',
    locale: 'kk-KZ',
    yandexLanguage: 'kk',
    yandexHost: 'https://passport.yandex.kz',
    mailruLang: 'ru_RU',
    appleLocale: 'kk_KZ',
    applePath: 'kz',
    defaultDomains: { yandex: 'yandex.kz', mailru: 'mail.ru', apple: 'icloud.com' },
  },
  {
    id: 'by',
    name: 'Bielorrussia',
    code: 'BY',
    locale: 'be-BY',
    yandexLanguage: 'be',
    yandexHost: 'https://passport.yandex.by',
    mailruLang: 'ru_RU',
    appleLocale: 'be_BY',
    applePath: 'by',
    defaultDomains: { yandex: 'yandex.by', mailru: 'mail.ru', apple: 'icloud.com' },
  },
];

const YANDEX_DOMAIN_HOSTS: Record<string, string> = {
  'yandex.ru': 'https://passport.yandex.ru',
  'yandex.com': 'https://passport.yandex.com',
  'yandex.com.tr': 'https://passport.yandex.com.tr',
  'yandex.kz': 'https://passport.yandex.kz',
  'yandex.by': 'https://passport.yandex.by',
  'yandex.ua': 'https://passport.yandex.ua',
};

export function getDefaultDomain(providerId: string, country: AlemaoCountry): string {
  return country.defaultDomains[providerId] || ALEMAO_EMAIL_PROVIDERS.find((p) => p.id === providerId)?.domains[0] || '';
}

export function generateYandexSignupUrl(country: AlemaoCountry, domain: string): string {
  const host = YANDEX_DOMAIN_HOSTS[domain] || country.yandexHost;
  const params = new URLSearchParams({
    language: country.yandexLanguage,
    retpath: 'https://mail.yandex.com',
  });
  return `${host}/auth/registration?${params.toString()}`;
}

export function generateMailruSignupUrl(country: AlemaoCountry): string {
  const params = new URLSearchParams({
    lang: country.mailruLang,
    from: 'main',
  });
  return `https://account.mail.ru/signup?${params.toString()}`;
}

export function generateAppleIdSignupUrl(country: AlemaoCountry): string {
  const path = country.applePath ? `/${country.applePath}` : '';
  return `https://appleid.apple.com${path}/account?locale=${encodeURIComponent(country.appleLocale)}`;
}

export function generateIcloudUrl(country: AlemaoCountry): string {
  return `https://www.icloud.com/?language=${encodeURIComponent(country.locale)}`;
}

export function generateAlemaoSignupUrl(
  provider: AlemaoEmailProvider,
  country: AlemaoCountry,
  domain: string,
): string {
  switch (provider.id) {
    case 'yandex':
      return generateYandexSignupUrl(country, domain);
    case 'mailru':
      return generateMailruSignupUrl(country);
    case 'apple':
      return generateAppleIdSignupUrl(country);
    default:
      return provider.id;
  }
}
