import { OSINT_SOURCES, type OsintSource } from '@/lib/osintBrazucaCatalog';

export type QueryKind = 'nome' | 'cpf' | 'cnpj' | 'telefone' | 'email' | 'usuario' | 'misto';

export type SearchHit = {
  id: string;
  source: string;
  category: string;
  title: string;
  snippet: string;
  url: string;
  official: boolean;
};

export type WikiHit = {
  title: string;
  snippet: string;
  url: string;
  pageid: number;
};

export type CompanyHit = {
  cnpj: string;
  razaoSocial: string;
  nomeFantasia?: string;
  situacao?: string;
  municipio?: string;
  uf?: string;
  cnae?: string;
  abertura?: string;
  telefone?: string;
  email?: string;
  socios?: string[];
};

export type BrazucaDossier = {
  query: string;
  kind: QueryKind;
  normalized: string;
  variations: string[];
  wiki: WikiHit[];
  company: CompanyHit | null;
  hits: SearchHit[];
  dorks: Array<{ label: string; query: string; url: string }>;
  searchedAt: string;
};

const g = (q: string) => `https://www.google.com/search?hl=pt-BR&q=${encodeURIComponent(q)}`;

const onlyDigits = (value: string) => value.replace(/\D/g, '');

export function detectQueryKind(raw: string): QueryKind {
  const value = raw.trim();
  const digits = onlyDigits(value);
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'email';
  if (digits.length === 14) return 'cnpj';
  if (digits.length === 11 && /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/.test(value.replace(/\s/g, ''))) return 'cpf';
  if (digits.length === 11 && /^(\+?55)?\s*\(?\d{2}\)?\s*9?\d{4}-?\d{4}$/.test(value)) return 'telefone';
  if (digits.length === 10 || digits.length === 11) {
    if (value.includes('(') || value.startsWith('+55') || /^\d{10,11}$/.test(digits)) {
      if (!value.includes('.') && !value.includes(' ')) return digits.length === 11 ? 'cpf' : 'telefone';
    }
  }
  if (/^@?[\w.]{3,32}$/.test(value) && !value.includes(' ')) return 'usuario';
  if (/\d{11,14}/.test(digits) && /[a-zA-Z]/.test(value)) return 'misto';
  return 'nome';
}

export function nameVariations(query: string): string[] {
  const clean = query.trim().replace(/\s+/g, ' ');
  if (!clean) return [];
  const parts = clean.split(' ');
  const noAccents = clean.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const firstLast = parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1]}` : clean;
  const dotted = parts.map((part) => part.toLowerCase()).join('.');
  const underscored = parts.map((part) => part.toLowerCase()).join('_');
  return Array.from(new Set([clean, clean.toUpperCase(), noAccents, firstLast, dotted, underscored]));
}

function sourceSearchUrl(source: OsintSource, query: string): string {
  return source.searchUrl ? source.searchUrl(query) : source.url;
}

function buildHits(query: string, kind: QueryKind): SearchHit[] {
  const quoted = `"${query}"`;
  const extra: SearchHit[] = [
    {
      id: 'google-web',
      source: 'Google',
      category: 'Motor de busca',
      title: `Resultados web para ${query}`,
      snippet: 'Busca ampla em páginas públicas, notícias, PDFs e menções do nome.',
      url: g(quoted),
      official: false,
    },
    {
      id: 'google-news',
      source: 'Google Notícias',
      category: 'Motor de busca',
      title: `Notícias sobre ${query}`,
      snippet: 'Cobertura jornalística e menções em portais .br.',
      url: `https://www.google.com/search?hl=pt-BR&tbm=nws&q=${encodeURIComponent(quoted)}`,
      official: false,
    },
    {
      id: 'google-docs',
      source: 'Google Documentos',
      category: 'Motor de busca',
      title: `PDFs, planilhas e docs com ${query}`,
      snippet: 'Arquivos públicos indexados (PDF, XLS, DOC) contendo o termo.',
      url: g(`${quoted} (filetype:pdf OR filetype:xls OR filetype:xlsx OR filetype:doc OR filetype:docx)`),
      official: false,
    },
    {
      id: 'google-gov',
      source: 'Google Gov',
      category: 'Motor de busca',
      title: `Menções em gov.br / jus.br`,
      snippet: 'Diários oficiais, tribunais e portais de governo.',
      url: g(`${quoted} (site:gov.br OR site:jus.br OR site:mp.br)`),
      official: false,
    },
  ];

  if (kind === 'nome' || kind === 'misto' || kind === 'usuario') {
    extra.push(
      {
        id: 'google-social',
        source: 'Google Social',
        category: 'Redes sociais',
        title: `Perfis e menções sociais de ${query}`,
        snippet: 'Facebook, Instagram, LinkedIn, X e YouTube indexados.',
        url: g(`${quoted} (site:facebook.com OR site:instagram.com OR site:linkedin.com OR site:x.com OR site:twitter.com OR site:youtube.com)`),
        official: false,
      },
      {
        id: 'google-paste',
        source: 'Google Paste',
        category: 'Motor de busca',
        title: `Documentos expostos com ${query}`,
        snippet: 'Pastebin, Google Docs e arquivos públicos com o termo.',
        url: g(`${quoted} (site:pastebin.com OR site:docs.google.com OR ext:txt)`),
        official: false,
      },
    );
  }

  const catalogHits = OSINT_SOURCES.map((source) => ({
    id: source.id,
    source: source.title,
    category: source.category,
    title: `${source.title} · ${query}`,
    snippet: source.description,
    url: sourceSearchUrl(source, query),
    official: true,
  }));

  return [...extra, ...catalogHits];
}

function buildDorks(query: string): Array<{ label: string; query: string; url: string }> {
  const quoted = `"${query}"`;
  const items = [
    { label: 'Nome exato no Brasil', query: `${quoted} site:.br` },
    { label: 'CPF + nome em arquivos', query: `cpf ${quoted} (ext:pdf OR ext:xls OR ext:txt)` },
    { label: 'CNPJ / empresa', query: `${quoted} (cnpj OR "razao social" OR socio)` },
    { label: 'Processos', query: `${quoted} (processo OR "ação" OR sentença OR jusbrasil OR escavador)` },
    { label: 'Diário oficial', query: `${quoted} ("diário oficial" OR dou OR doe)` },
    { label: 'Telefone / contato', query: `${quoted} (telefone OR celular OR whatsapp OR contato)` },
    { label: 'Endereço', query: `${quoted} (endereço OR rua OR bairro OR cep)` },
    { label: 'Currículo / Lattes', query: `${quoted} (lattes OR currículo OR cnpq)` },
    { label: 'Gov e tribunais', query: `${quoted} (site:gov.br OR site:jus.br)` },
    { label: 'Redes sociais', query: `${quoted} (site:facebook.com OR site:instagram.com OR site:linkedin.com)` },
  ];
  return items.map((item) => ({ ...item, url: g(item.query) }));
}

async function searchWikipedia(query: string): Promise<WikiHit[]> {
  try {
    const url = `https://pt.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&utf8=&format=json&origin=*&srlimit=5`;
    const response = await fetch(url);
    if (!response.ok) return [];
    const data = (await response.json()) as {
      query?: { search?: Array<{ title: string; snippet: string; pageid: number }> };
    };
    return (data.query?.search ?? []).map((item) => ({
      title: item.title,
      snippet: item.snippet.replace(/<[^>]+>/g, ''),
      pageid: item.pageid,
      url: `https://pt.wikipedia.org/?curid=${item.pageid}`,
    }));
  } catch {
    return [];
  }
}

async function searchCompany(query: string): Promise<CompanyHit | null> {
  const cnpj = onlyDigits(query);
  if (cnpj.length !== 14) return null;
  try {
    const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`);
    if (!response.ok) return null;
    const data = (await response.json()) as {
      cnpj: string;
      razao_social?: string;
      nome_fantasia?: string;
      descricao_situacao_cadastral?: string;
      municipio?: string;
      uf?: string;
      cnae_fiscal_descricao?: string;
      data_inicio_atividade?: string;
      ddd_telefone_1?: string;
      email?: string;
      qsa?: Array<{ nome_socio?: string }>;
    };
    return {
      cnpj: data.cnpj,
      razaoSocial: data.razao_social ?? 'Não informado',
      nomeFantasia: data.nome_fantasia,
      situacao: data.descricao_situacao_cadastral,
      municipio: data.municipio,
      uf: data.uf,
      cnae: data.cnae_fiscal_descricao,
      abertura: data.data_inicio_atividade,
      telefone: data.ddd_telefone_1,
      email: data.email,
      socios: (data.qsa ?? []).map((item) => item.nome_socio).filter((name): name is string => Boolean(name)),
    };
  } catch {
    return null;
  }
}

export async function runBrazucaSearch(raw: string): Promise<BrazucaDossier> {
  const query = raw.trim().replace(/\s+/g, ' ');
  const kind = detectQueryKind(query);
  const [wiki, company] = await Promise.all([searchWikipedia(query), searchCompany(query)]);
  return {
    query,
    kind,
    normalized: query,
    variations: nameVariations(query),
    wiki,
    company,
    hits: buildHits(query, kind),
    dorks: buildDorks(query),
    searchedAt: new Date().toISOString(),
  };
}
