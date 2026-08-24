/**
 * Google Dork Generator — Busca avançada do Google (operadores "dork")
 *
 * Monta pesquisas muito mais precisas combinando palavras-chave com
 * operadores de busca do próprio Google (site:, intitle:, inurl:,
 * filetype:, intext:, related:, numrange:, etc.) e gera o link direto
 * para abrir o resultado no navegador.
 */

export const GOOGLE_DORK_OPERATORS: Array<{ code: string; label: string }> = [
  { code: 'site:exemplo.com', label: 'Somente em um site' },
  { code: 'intitle:"frase"', label: 'Frase no título' },
  { code: 'inurl:termo', label: 'Termo na URL' },
  { code: 'intext:termo', label: 'Termo no corpo' },
  { code: 'filetype:pdf', label: 'Só PDFs' },
  { code: 'filetype:xlsx', label: 'Só planilhas' },
  { code: 'site:.br', label: 'Só domínios .br' },
  { code: 'related:site.com', label: 'Sites parecidos' },
  { code: 'cache:site.com', label: 'Versão em cache' },
  { code: 'numrange:100-200', label: 'Faixa de números' },
  { code: 'before:2024-01-01', label: 'Antes de uma data' },
  { code: 'after:2024-01-01', label: 'Depois de uma data' },
];

export const GOOGLE_DORK_PRESETS: Array<{ id: string; label: string; operators: string }> = [
  { id: "precisa", label: "Busca precisa (frase exata)", operators: '"$KEYWORDS"' },
  { id: "arquivos", label: "Documentos/arquivos", operators: '$KEYWORDS (filetype:pdf OR filetype:docx OR filetype:xlsx)' },
  { id: "titulo", label: "Palavra no título", operators: 'intitle:"$KEYWORDS"' },
  { id: "url", label: "Palavra na URL", operators: 'inurl:$KEYWORDS' },
  { id: "site", label: "Dentro de um site", operators: '$KEYWORDS site:' },
  { id: "br", label: "Só Brasil (.br)", operators: '$KEYWORDS site:.br' },
  { id: "similar", label: "Sites similares", operators: 'related:' },
  { id: "recente", label: "Resultados recentes", operators: '$KEYWORDS after:2025-01-01' },
];

export function buildDorkQuery(keywords: string, operators: string): string {
  const kw = keywords.trim();
  const ops = operators.trim();
  if (!kw && !ops) return "";
  return [kw, ops].filter(Boolean).join(" ").replace(/\s+/g, " ");
}

export function buildGoogleSearchUrl(dork: string): string {
  const query = dork.trim();
  return query ? `https://www.google.com/search?q=${encodeURIComponent(query)}` : "https://www.google.com";
}

export function applyDorkPreset(presetId: string, keywords: string): string {
  const preset = GOOGLE_DORK_PRESETS.find((p) => p.id === presetId);
  if (!preset) return keywords;
  return preset.operators.replaceAll("$KEYWORDS", keywords.trim());
}
