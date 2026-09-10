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

export type RelatedPerson = {
  id: string;
  name: string;
  birthDate: string;
  deathDate?: string;
  place?: string;
  occupation?: string;
  description: string;
  cpf: string;
  source: string;
  url: string;
  extraUrls: Array<{ label: string; url: string }>;
};

export type BrazucaDossier = {
  query: string;
  kind: QueryKind;
  normalized: string;
  variations: string[];
  wiki: WikiHit[];
  company: CompanyHit | null;
  people: RelatedPerson[];
  hits: SearchHit[];
  dorks: Array<{ label: string; query: string; url: string }>;
  activeFilters: string[];
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

function titleCaseName(value: string): string {
  return value
    .trim()
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]+>/g, ' ').replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
}

function extractBirthDate(text: string): string {
  const patterns = [
    /nascid[oa]\s+em\s+(\d{1,2}\s+de\s+[a-zç]+\s+de\s+\d{4})/i,
    /(\d{1,2}\s+de\s+[a-zç]+\s+de\s+\d{4})/i,
    /(\d{4}-\d{2}-\d{2})/,
    /(\d{1,2}\/\d{1,2}\/\d{4})/,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return match[1];
  }
  return 'não publicado';
}

function extractPlace(text: string): string | undefined {
  const match = text.match(/(?:em|de)\s+([A-ZÁÉÍÓÚÂÊÔÃÕ][\wÀ-ÿ]+(?:\s+[A-ZÁÉÍÓÚÂÊÔÃÕ][\wÀ-ÿ]+){0,3})/);
  return match?.[1];
}

function personMatchesQuery(name: string, query: string): boolean {
  const normalize = (value: string) =>
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  const nameN = normalize(name);
  const queryParts = normalize(query).split(' ').filter((part) => part.length > 1);
  if (queryParts.length === 0) return false;
  return queryParts.every((part) => nameN.includes(part));
}

function sourceLinksForPerson(name: string): Array<{ label: string; url: string }> {
  const quoted = `"${name}"`;
  return OSINT_SOURCES.filter((source) => Boolean(source.searchUrl))
    .slice(0, 8)
    .map((source) => ({
      label: source.title,
      url: source.searchUrl ? source.searchUrl(name) : source.url,
    }))
    .concat([
      { label: 'Google', url: g(quoted) },
      { label: 'JusBrasil', url: `https://www.jusbrasil.com.br/busca?q=${encodeURIComponent(name)}` },
      { label: 'Escavador', url: `https://www.escavador.com/busca?q=${encodeURIComponent(name)}` },
    ]);
}

function claimDate(entity: WikidataEntity, prop: string): string | undefined {
  const value = entity.claims?.[prop]?.[0]?.mainsnak?.datavalue?.value;
  if (value && typeof value === 'object' && 'time' in value && typeof value.time === 'string') {
    const match = value.time.match(/([+-]?\d{4}-\d{2}-\d{2})/);
    return match?.[1]?.replace(/^\+/, '');
  }
  return undefined;
}

function claimLabel(entity: WikidataEntity, entities: Record<string, WikidataEntity>, prop: string): string | undefined {
  const id = entity.claims?.[prop]?.[0]?.mainsnak?.datavalue?.value;
  if (id && typeof id === 'object' && 'id' in id && typeof id.id === 'string') {
    const related = entities[id.id];
    return related?.labels?.pt?.value ?? related?.labels?.en?.value;
  }
  return undefined;
}

type WikidataEntity = {
  id: string;
  labels?: Record<string, { value: string }>;
  descriptions?: Record<string, { value: string }>;
  claims?: Record<string, Array<{ mainsnak?: { datavalue?: { value?: unknown } } }>>;
  sitelinks?: Record<string, { title: string }>;
};

async function searchWikidataPeople(query: string): Promise<RelatedPerson[]> {
  try {
    const searchUrl = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(query)}&language=pt&uselang=pt&type=item&limit=20&format=json&origin=*`;
    const searchResp = await fetch(searchUrl);
    if (!searchResp.ok) return [];
    const searchData = (await searchResp.json()) as { search?: Array<{ id: string; label?: string; description?: string }> };
    const ids = (searchData.search ?? []).map((item) => item.id).filter(Boolean);
    if (ids.length === 0) return [];
    const entitiesUrl = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${ids.join('|')}&props=labels|descriptions|claims|sitelinks&languages=pt|en&format=json&origin=*`;
    const entitiesResp = await fetch(entitiesUrl);
    if (!entitiesResp.ok) return [];
    const entitiesData = (await entitiesResp.json()) as { entities?: Record<string, WikidataEntity> };
    const entities = entitiesData.entities ?? {};
    const extraIds = Object.values(entities)
      .flatMap((entity) =>
        ['P19', 'P106']
          .map((prop) => entity.claims?.[prop]?.[0]?.mainsnak?.datavalue?.value)
          .filter((value): value is { id: string } => Boolean(value && typeof value === 'object' && 'id' in value)),
      )
      .map((value) => value.id);
    const missing = extraIds.filter((id) => !entities[id]);
    if (missing.length > 0) {
      const extraResp = await fetch(
        `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${missing.slice(0, 40).join('|')}&props=labels&languages=pt|en&format=json&origin=*`,
      );
      if (extraResp.ok) {
        const extraData = (await extraResp.json()) as { entities?: Record<string, WikidataEntity> };
        Object.assign(entities, extraData.entities ?? {});
      }
    }
    return ids
      .map((id) => entities[id])
      .filter((entity): entity is WikidataEntity => Boolean(entity))
      .filter((entity) => {
        const instance = entity.claims?.P31?.[0]?.mainsnak?.datavalue?.value;
        const instanceId = instance && typeof instance === 'object' && 'id' in instance ? instance.id : '';
        return instanceId === 'Q5' || Boolean(entity.claims?.P569) || Boolean(entity.sitelinks?.ptwiki);
      })
      .map((entity) => {
        const name = entity.labels?.pt?.value ?? entity.labels?.en?.value ?? '';
        const birth = claimDate(entity, 'P569') ?? 'não publicado';
        const death = claimDate(entity, 'P570');
        const place = claimLabel(entity, entities, 'P19');
        const occupation = claimLabel(entity, entities, 'P106');
        const wikiTitle = entity.sitelinks?.ptwiki?.title;
        const url = wikiTitle
          ? `https://pt.wikipedia.org/wiki/${encodeURIComponent(wikiTitle.replace(/ /g, '_'))}`
          : `https://www.wikidata.org/wiki/${entity.id}`;
        return {
          id: entity.id,
          name,
          birthDate: birth,
          deathDate: death,
          place,
          occupation,
          description:
            entity.descriptions?.pt?.value ??
            entity.descriptions?.en?.value ??
            [occupation, place].filter(Boolean).join(' · ') ??
            'Pessoa em fonte pública (Wikidata)',
          cpf: 'não publicado nesta fonte',
          source: 'Wikidata / Wikipedia',
          url,
          extraUrls: sourceLinksForPerson(name),
        } satisfies RelatedPerson;
      })
      .filter((person) => person.name && personMatchesQuery(person.name, query));
  } catch {
    return [];
  }
}

async function searchWikipediaPeople(query: string): Promise<RelatedPerson[]> {
  try {
    const url = `https://pt.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(`${query} pessoa`)}&utf8=&format=json&origin=*&srlimit=20`;
    const response = await fetch(url);
    if (!response.ok) return [];
    const data = (await response.json()) as {
      query?: { search?: Array<{ title: string; snippet: string; pageid: number }> };
    };
    return (data.query?.search ?? [])
      .map((item) => {
        const snippet = stripHtml(item.snippet);
        return {
          id: `wiki-${item.pageid}`,
          name: item.title,
          birthDate: extractBirthDate(snippet),
          place: extractPlace(snippet),
          description: snippet,
          cpf: 'não publicado nesta fonte',
          source: 'Wikipedia PT',
          url: `https://pt.wikipedia.org/?curid=${item.pageid}`,
          extraUrls: sourceLinksForPerson(item.title),
        } satisfies RelatedPerson;
      })
      .filter((person) => personMatchesQuery(person.name, query));
  } catch {
    return [];
  }
}

function mergePeople(groups: RelatedPerson[][]): RelatedPerson[] {
  const map = new Map<string, RelatedPerson>();
  const keyOf = (name: string) =>
    name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();
  for (const group of groups) {
    for (const person of group) {
      const key = keyOf(person.name);
      const current = map.get(key);
      if (!current) {
        map.set(key, person);
        continue;
      }
      map.set(key, {
        ...current,
        birthDate: current.birthDate !== 'não publicado' ? current.birthDate : person.birthDate,
        deathDate: current.deathDate ?? person.deathDate,
        place: current.place ?? person.place,
        occupation: current.occupation ?? person.occupation,
        description: current.description.length >= person.description.length ? current.description : person.description,
        extraUrls: [...current.extraUrls, ...person.extraUrls].filter(
          (item, index, list) => list.findIndex((entry) => entry.url === item.url) === index,
        ),
      });
    }
  }
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
}

export function filterHits(hits: SearchHit[], filters: string[]): SearchHit[] {
  if (filters.length === 0 || filters.includes('todas')) return hits;
  return hits.filter((hit) => filters.includes(hit.category) || filters.includes(hit.id) || filters.includes(hit.source));
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

export async function runBrazucaSearch(raw: string, filters: string[] = []): Promise<BrazucaDossier> {
  const query = raw.trim().replace(/\s+/g, ' ');
  const kind = detectQueryKind(query);
  const [wiki, company, wikidataPeople, wikiPeople] = await Promise.all([
    searchWikipedia(query),
    searchCompany(query),
    kind === 'cnpj' ? Promise.resolve([] as RelatedPerson[]) : searchWikidataPeople(query),
    kind === 'cnpj' ? Promise.resolve([] as RelatedPerson[]) : searchWikipediaPeople(query),
  ]);
  const people = mergePeople([wikidataPeople, wikiPeople]);
  return {
    query,
    kind,
    normalized: titleCaseName(query),
    variations: nameVariations(query),
    wiki,
    company,
    people,
    hits: buildHits(query, kind),
    dorks: buildDorks(query),
    activeFilters: filters,
    searchedAt: new Date().toISOString(),
  };
}
