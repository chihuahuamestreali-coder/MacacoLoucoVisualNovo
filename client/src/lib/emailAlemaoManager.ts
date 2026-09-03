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
];

export const ALEMAO_COUNTRIES: AlemaoCountry[] = [
  {
    id: 'br',
    name: 'Brasil',
    code: 'BR',
    locale: 'pt-BR',
    appleLocale: 'pt_BR',
    applePath: 'br',
    defaultDomains: { apple: 'icloud.com' },
  },
  {
    id: 'de',
    name: 'Alemanha',
    code: 'DE',
    locale: 'de-DE',
    appleLocale: 'de_DE',
    applePath: 'de',
    defaultDomains: { apple: 'icloud.com' },
  },
  {
    id: 'ru',
    name: 'Russia',
    code: 'RU',
    locale: 'ru-RU',
    appleLocale: 'ru_RU',
    applePath: 'ru',
    defaultDomains: { apple: 'icloud.com' },
  },
  {
    id: 'us',
    name: 'Estados Unidos',
    code: 'US',
    locale: 'en-US',
    appleLocale: 'en_US',
    applePath: 'us',
    defaultDomains: { apple: 'icloud.com' },
  },
  {
    id: 'eu',
    name: 'Europa',
    code: 'EU',
    locale: 'en-GB',
    appleLocale: 'en_GB',
    applePath: 'de',
    defaultDomains: { apple: 'icloud.com' },
  },
  {
    id: 'fr',
    name: 'Franca',
    code: 'FR',
    locale: 'fr-FR',
    appleLocale: 'fr_FR',
    applePath: 'fr',
    defaultDomains: { apple: 'icloud.com' },
  },
  {
    id: 'pt',
    name: 'Portugal',
    code: 'PT',
    locale: 'pt-PT',
    appleLocale: 'pt_PT',
    applePath: 'pt',
    defaultDomains: { apple: 'icloud.com' },
  },
  {
    id: 'es',
    name: 'Espanha',
    code: 'ES',
    locale: 'es-ES',
    appleLocale: 'es_ES',
    applePath: 'es',
    defaultDomains: { apple: 'icloud.com' },
  },
  {
    id: 'it',
    name: 'Italia',
    code: 'IT',
    locale: 'it-IT',
    appleLocale: 'it_IT',
    applePath: 'it',
    defaultDomains: { apple: 'icloud.com' },
  },
  {
    id: 'nl',
    name: 'Holanda',
    code: 'NL',
    locale: 'nl-NL',
    appleLocale: 'nl_NL',
    applePath: 'nl',
    defaultDomains: { apple: 'icloud.com' },
  },
  {
    id: 'gb',
    name: 'Reino Unido',
    code: 'GB',
    locale: 'en-GB',
    appleLocale: 'en_GB',
    applePath: 'uk',
    defaultDomains: { apple: 'icloud.com' },
  },
  {
    id: 'tr',
    name: 'Turquia',
    code: 'TR',
    locale: 'tr-TR',
    appleLocale: 'tr_TR',
    applePath: 'tr',
    defaultDomains: { apple: 'icloud.com' },
  },
  {
    id: 'kz',
    name: 'Cazaquistao',
    code: 'KZ',
    locale: 'kk-KZ',
    appleLocale: 'kk_KZ',
    applePath: 'kz',
    defaultDomains: { apple: 'icloud.com' },
  },
  {
    id: 'by',
    name: 'Bielorrussia',
    code: 'BY',
    locale: 'be-BY',
    appleLocale: 'be_BY',
    applePath: 'by',
    defaultDomains: { apple: 'icloud.com' },
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

export function generateAlemaoSignupUrl(
  _provider: AlemaoEmailProvider,
  country: AlemaoCountry,
  _domain: string,
): string {
  return generateAppleIdSignupUrl(country);
}
