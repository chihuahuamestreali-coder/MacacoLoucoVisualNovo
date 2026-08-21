/**
 * Email Manager - Gerenciador de Emails para múltiplos provedores
 * Suporta: Outlook, Hotmail, Proton, Tuta
 */

export interface EmailProvider {
  id: string;
  name: string;
  domains: string[];
  baseUrl: string;
  color: string;
  domainUrls?: Record<string, string>; // Mapeamento de domínio para URL de signup
}

export interface EmailRegionalProfile {
  id: string;
  name: string;
  countryCode: string;
  locale: string;
  timeZone: string;
  currency: string;
  dateFormat: string;
}

export interface Country {
  id: string;
  name: string;
  code: string;
  marketCode: string;
  defaultDomain: string;
}

// Provedores de Email
export const EMAIL_PROVIDERS: EmailProvider[] = [
  {
    id: 'outlook',
    name: 'Outlook',
    domains: ['outlook.com', 'outlook.pt', 'outlook.fr', 'outlook.it', 'outlook.es', 'outlook.com.tr', 'outlook.com.au', 'outlook.com.br', 'outlook.de', 'outlook.nl', 'outlook.com.mx', 'outlook.jp'],
    baseUrl: 'https://signup.live.com/signup.aspx',
    color: 'from-blue-600 to-blue-800',
    domainUrls: {
      'outlook.com': 'https://signup.live.com/signup.aspx?mkt=EN-US&lic=1',
      'outlook.pt': 'https://signup.live.com/signup.aspx?mkt=PT-PT&lic=1',
      'outlook.fr': 'https://signup.live.com/signup.aspx?mkt=FR-FR&lic=1',
      'outlook.it': 'https://signup.live.com/signup.aspx?mkt=IT-IT&lic=1',
      'outlook.es': 'https://signup.live.com/signup.aspx?mkt=ES-ES&lic=1',
      'outlook.com.tr': 'https://signup.live.com/signup.aspx?mkt=TR-TR&lic=1',
      'outlook.com.au': 'https://signup.live.com/signup.aspx?mkt=EN-AU&lic=1',
      'outlook.com.br': 'https://signup.live.com/signup.aspx?mkt=PT-BR&lic=1',
      'outlook.de': 'https://signup.live.com/signup.aspx?mkt=DE-DE&lic=1',
      'outlook.nl': 'https://signup.live.com/signup.aspx?mkt=NL-NL&lic=1',
      'outlook.com.mx': 'https://signup.live.com/signup.aspx?mkt=ES-MX&lic=1',
      'outlook.jp': 'https://signup.live.com/signup.aspx?mkt=JA-JP&lic=1',
    },
  },
  {
    id: 'hotmail',
    name: 'Hotmail',
    domains: ['hotmail.com'],
    baseUrl: 'https://signup.live.com/signup.aspx?lic=1',
    color: 'from-blue-500 to-blue-700',
    domainUrls: {
      'hotmail.com': 'https://signup.live.com/signup.aspx?lic=1',
    },
  },
  {
    id: 'proton',
    name: 'Proton Mail',
    domains: ['protonmail.com', 'proton.me'],
    baseUrl: 'https://account.proton.me/signup',
    color: 'from-purple-600 to-purple-800',
  },
  {
    id: 'tuta',
    name: 'Tuta Mail',
    domains: ['tutanota.com', 'tutamail.com', 'tuta.io'],
    baseUrl: 'https://tuta.com/pt-br',
    color: 'from-green-600 to-green-800',
  },
];

// Perfis regionais usados apenas como referência de idioma, fuso, moeda e formato.
// Eles não alteram o IP público nem substituem uma conexão oficial da região.
export const EMAIL_REGIONAL_PROFILES: EmailRegionalProfile[] = [
  { id: 'de', name: 'Alemanha', countryCode: 'DE', locale: 'de-DE', timeZone: 'Europe/Berlin', currency: 'EUR', dateFormat: 'DD.MM.YYYY' },
  { id: 'fr', name: 'França', countryCode: 'FR', locale: 'fr-FR', timeZone: 'Europe/Paris', currency: 'EUR', dateFormat: 'DD/MM/YYYY' },
  { id: 'nl', name: 'Holanda', countryCode: 'NL', locale: 'nl-NL', timeZone: 'Europe/Amsterdam', currency: 'EUR', dateFormat: 'DD-MM-YYYY' },
  { id: 'pt', name: 'Portugal', countryCode: 'PT', locale: 'pt-PT', timeZone: 'Europe/Lisbon', currency: 'EUR', dateFormat: 'DD/MM/YYYY' },
  { id: 'es', name: 'Espanha', countryCode: 'ES', locale: 'es-ES', timeZone: 'Europe/Madrid', currency: 'EUR', dateFormat: 'DD/MM/YYYY' },
  { id: 'it', name: 'Itália', countryCode: 'IT', locale: 'it-IT', timeZone: 'Europe/Rome', currency: 'EUR', dateFormat: 'DD/MM/YYYY' },
];

// Países com Market Codes para Outlook/Hotmail
export const COUNTRIES: Country[] = [
  {
    id: 'pt',
    name: 'Portugal',
    code: 'PT',
    marketCode: 'PT-PT',
    defaultDomain: 'outlook.pt',
  },
  {
    id: 'fr',
    name: 'França',
    code: 'FR',
    marketCode: 'FR-FR',
    defaultDomain: 'outlook.fr',
  },
  {
    id: 'it',
    name: 'Itália',
    code: 'IT',
    marketCode: 'IT-IT',
    defaultDomain: 'outlook.it',
  },
  {
    id: 'es',
    name: 'Espanha',
    code: 'ES',
    marketCode: 'ES-ES',
    defaultDomain: 'outlook.es',
  },
  {
    id: 'tr',
    name: 'Turquia',
    code: 'TR',
    marketCode: 'TR-TR',
    defaultDomain: 'outlook.com.tr',
  },
  {
    id: 'au',
    name: 'Austrália',
    code: 'AU',
    marketCode: 'EN-AU',
    defaultDomain: 'outlook.com.au',
  },
  {
    id: 'us',
    name: 'Estados Unidos',
    code: 'US',
    marketCode: 'EN-US',
    defaultDomain: 'outlook.com',
  },
  {
    id: 'gb',
    name: 'Reino Unido',
    code: 'GB',
    marketCode: 'EN-GB',
    defaultDomain: 'outlook.com',
  },
  {
    id: 'de',
    name: 'Alemanha',
    code: 'DE',
    marketCode: 'DE-DE',
    defaultDomain: 'outlook.de',
  },
  {
    id: 'nl',
    name: 'Holanda',
    code: 'NL',
    marketCode: 'NL-NL',
    defaultDomain: 'outlook.nl',
  },
  {
    id: 'br',
    name: 'Brasil',
    code: 'BR',
    marketCode: 'PT-BR',
    defaultDomain: 'outlook.com.br',
  },
  {
    id: 'mx',
    name: 'México',
    code: 'MX',
    marketCode: 'ES-MX',
    defaultDomain: 'outlook.com.mx',
  },
  {
    id: 'jp',
    name: 'Japão',
    code: 'JP',
    marketCode: 'JA-JP',
    defaultDomain: 'outlook.jp',
  },
  {
    id: 'cn',
    name: 'China',
    code: 'CN',
    marketCode: 'ZH-CN',
    defaultDomain: 'outlook.com',
  },
  {
    id: 'in',
    name: 'Índia',
    code: 'IN',
    marketCode: 'EN-IN',
    defaultDomain: 'outlook.com',
  },
];

/**
 * Gera URL de signup para Outlook/Hotmail baseado no domínio
 */
export function generateOutlookSignupUrl(domain: string): string {
  const outlookProvider = EMAIL_PROVIDERS.find(p => p.id === 'outlook');
  if (!outlookProvider || !outlookProvider.domainUrls) {
    return 'https://signup.live.com/signup.aspx?lic=1';
  }
  return outlookProvider.domainUrls[domain] || 'https://signup.live.com/signup.aspx?lic=1';
}

/**
 * Gera URL de signup para Hotmail
 */
export function generateHotmailSignupUrl(): string {
  return 'https://signup.live.com/signup.aspx?lic=1';
}

/**
 * Gera URL de signup para Proton
 */
export function generateProtonSignupUrl(): string {
  return 'https://account.proton.me/signup';
}

/**
 * Gera URL de signup para Tuta
 */
export function generateTutaSignupUrl(): string {
  return 'https://tuta.com/pt-br';
}

/**
 * Gera URL de signup baseado no provedor e domínio
 */
export function generateSignupUrl(
  provider: EmailProvider,
  domain?: string
): string {
  switch (provider.id) {
    case 'outlook':
      return generateOutlookSignupUrl(domain || 'outlook.com');
    case 'hotmail':
      return generateHotmailSignupUrl();
    case 'proton':
      return generateProtonSignupUrl();
    case 'tuta':
      return generateTutaSignupUrl();
    default:
      return provider.baseUrl;
  }
}

export interface EmailAccount {
  id: string;
  email: string;
  provider: string;
  country: string;
  domain: string;
  createdAt: Date;
  password?: string;
  notes?: string;
  status?: string;
}

// Nomes brasileiros comuns (masculino e feminino)
const BRAZILIAN_FIRST_NAMES = [
  'João', 'Maria', 'José', 'Ana', 'Carlos', 'Francisca', 'Paulo', 'Antônia',
  'Pedro', 'Mariana', 'Lucas', 'Juliana', 'Marcos', 'Fernanda', 'Felipe',
  'Camila', 'Rafael', 'Beatriz', 'Bruno', 'Isabella', 'Diego', 'Gabriela',
  'Fernando', 'Amanda', 'Gustavo', 'Leticia', 'André', 'Larissa', 'Thiago',
  'Vanessa', 'Ricardo', 'Natalia', 'Rodrigo', 'Bruna', 'Matheus', 'Carolina',
  'Fabio', 'Aline', 'Sergio', 'Debora', 'Julio', 'Simone', 'Cesar', 'Elaine',
  'Claudio', 'Viviane', 'Marcelo', 'Roberta', 'Leandro', 'Cristina', 'Renato',
  'Priscila', 'Gilberto', 'Adriana', 'Mauricio', 'Silvia', 'Flavio', 'Rosana',
];

// Sobrenomes brasileiros comuns
const BRAZILIAN_LAST_NAMES = [
  'Silva', 'Santos', 'Oliveira', 'Souza', 'Costa', 'Ferreira', 'Rodrigues',
  'Martins', 'Alves', 'Gomes', 'Pereira', 'Carvalho', 'Ribeiro', 'Teixeira',
  'Rocha', 'Barbosa', 'Dias', 'Monteiro', 'Cardoso', 'Mendes', 'Tavares',
  'Neves', 'Machado', 'Pinto', 'Mota', 'Brito', 'Correia', 'Campos',
  'Lopes', 'Moura', 'Vieira', 'Freitas', 'Cavalcanti', 'Medeiros', 'Leite',
  'Borges', 'Menezes', 'Guedes', 'Fonseca', 'Nogueira', 'Ramos', 'Batista',
  'Lourenço', 'Marques', 'Cabral', 'Rezende', 'Siqueira', 'Vasconcelos',
  'Figueiredo', 'Brás', 'Duarte', 'Galvão', 'Humberto', 'Ivo', 'Jansen',
];

/**
 * Remove acentos de uma string
 */
function removeAccents(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Gera um email com padrao brasileiro realista (nome + numeros + letras + sobrenome)
 * Exemplo: marcos1998ribeiro, joao95moffati, lucasramalho15
 */
export function generateRandomEmail(): string {
  const firstName = BRAZILIAN_FIRST_NAMES[Math.floor(Math.random() * BRAZILIAN_FIRST_NAMES.length)];
  const lastName = BRAZILIAN_LAST_NAMES[Math.floor(Math.random() * BRAZILIAN_LAST_NAMES.length)];
  
  const cleanFirstName = removeAccents(firstName).toLowerCase();
  const cleanLastName = removeAccents(lastName).toLowerCase();
  
  // Gera numeros aleatorios (2-4 digitos)
  const numbers = String(Math.floor(Math.random() * 9000) + 1000).slice(0, Math.floor(Math.random() * 3) + 2);
  
  // Gera 0-2 letras aleatorias para adicionar variedade
  let randomLetters = '';
  const letterCount = Math.floor(Math.random() * 3);
  for (let i = 0; i < letterCount; i++) {
    randomLetters += String.fromCharCode(97 + Math.floor(Math.random() * 26));
  }
  
  // Combina: nome + numeros + letras + sobrenome
  return `${cleanFirstName}${numbers}${randomLetters}${cleanLastName}`;
}

/**
 * Gera um email com data de nascimento/aniversário (DDMMYYYY)
 */
export function generateEmailWithBirthday(): string {
  const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
  const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
  const year = String(Math.floor(Math.random() * (2005 - 1960 + 1)) + 1960);
  
  return `${day}${month}${year}`;
}

/**
 * Gera um email com nome + data de nascimento
 */
export function generateEmailWithNameAndBirthday(): string {
  const firstName = BRAZILIAN_FIRST_NAMES[Math.floor(Math.random() * BRAZILIAN_FIRST_NAMES.length)];
  const cleanFirstName = removeAccents(firstName).toLowerCase();
  const birthday = generateEmailWithBirthday();
  
  return `${cleanFirstName}${birthday}`;
}

// Palavras aleatórias para senhas (substantivos, adjetivos)
const PASSWORD_WORDS = [
  'Refrigente', 'garoTo', 'Moeda', 'Planeta', 'Tigre', 'Nuvem', 'Relampago',
  'Montanha', 'Oceano', 'Floresta', 'Tempestade', 'Cristal', 'Diamante', 'Ouro',
  'Prata', 'Bronze', 'Ferro', 'Pedra', 'Areia', 'Vento', 'Fogo', 'Agua', 'Terra',
  'Lua', 'Sol', 'Estrela', 'Cometa', 'Meteoro', 'Nebulosa', 'Galaxia', 'Universo',
  'Atomo', 'Molecula', 'Energia', 'Potencia', 'Velocidade', 'Forca', 'Gravidade',
  'Eletricidade', 'Magnetismo', 'Luz', 'Sombra', 'Escuridao', 'Claridade', 'Brilho',
  'Cor', 'Forma', 'Tamanho', 'Peso', 'Altura', 'Profundidade', 'Largura',
  'Comprimento', 'Distancia', 'Tempo', 'Espaco', 'Movimento', 'Pausa', 'Ritmo',
  'Melodia', 'Harmonia', 'Acordes', 'Notas', 'Musica', 'Silencio', 'Ruido',
  'Som', 'Eco', 'Voz', 'Grito', 'Sussurro', 'Risada', 'Choro', 'Suspiro',
  'Respiro', 'Pulso', 'Batida', 'Tremor', 'Vibra', 'Oscila', 'Flutua',
  'Mergulha', 'Voa', 'Corre', 'Salta', 'Danca', 'Gira', 'Rola', 'Desliza',
  'Escorrega', 'Cai', 'Sobe', 'Desce', 'Avanca', 'Recua', 'Para', 'Segue',
  'Persegue', 'Foge', 'Esconde', 'Busca', 'Encontra', 'Perde', 'Ganha',
  'Vence', 'Derrota', 'Triunfa', 'Falha', 'Sucesso', 'Fracasso', 'Vitoria',
];

/**
 * Gera uma senha segura para contas Microsoft
 * Requisitos: letras maiúsculas, minúsculas, números e caracteres especiais
 * Exemplo: Refrigente33@, garoTo023445#divertido
 */
export function generateMicrosoftPassword(): string {
  const specialChars = ['@', '#', '$', '%', '&', '!', '*', '+', '=', '?'];
  
  // Seleciona uma palavra aleatória
  const word1 = PASSWORD_WORDS[Math.floor(Math.random() * PASSWORD_WORDS.length)];
  
  // Gera números aleatórios (2-4 dígitos)
  const numbers = String(Math.floor(Math.random() * 9000) + 1000).slice(0, Math.floor(Math.random() * 3) + 2);
  
  // Seleciona um caractere especial aleatório
  const specialChar = specialChars[Math.floor(Math.random() * specialChars.length)];
  
  // Garante pelo menos 10 caracteres
  // 50% de chance de adicionar uma segunda palavra, ou se a senha for muito curta
  let finalPassword = `${word1}${numbers}${specialChar}`;
  
  if (finalPassword.length < 10 || Math.random() > 0.5) {
    const word2 = PASSWORD_WORDS[Math.floor(Math.random() * PASSWORD_WORDS.length)];
    finalPassword = `${word1}${numbers}${specialChar}${word2}`;
  }
  
  // Se ainda for menor que 10 caracteres, adiciona números aleatórios até atingir o mínimo
  while (finalPassword.length < 10) {
    finalPassword += Math.floor(Math.random() * 10).toString();
  }
  
  return finalPassword;
}

/**
 * Gera um email com senha
 */
export interface EmailWithPassword {
  email: string;
  password: string;
}

export function generateEmailWithPassword(domain: string): EmailWithPassword {
  const email = `${generateRandomEmail()}@${domain}`;
  const password = generateMicrosoftPassword();
  
  return { email, password };
}
