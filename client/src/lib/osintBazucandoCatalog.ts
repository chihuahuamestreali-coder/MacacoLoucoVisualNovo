export type BazucandoCommand = {
  id: string;
  nome: string;
  url: string;
};

export type BazucandoCategoria = {
  id: string;
  nome: string;
  descricao: string;
  comandos: BazucandoCommand[];
};

export const BAZUCANDO_META = {
  title: 'Bazucando',
  origin: 'Bot OSINT Brasil (planilha)',
  license: 'publico',
} as const;

export const BAZUCANDO_CATEGORIAS: BazucandoCategoria[] = [
  {
    id: 'beneficios_sociais',
    nome: 'Beneficios Sociais',
    descricao: 'Consultas de programas sociais do governo',
    comandos: [
      {
        id: 'bolsa_familia',
        nome: 'Bolsa Familia',
        url: 'https://www.beneficiossociais.caixa.gov.br/consulta/beneficio/04.01.00-00_00.asp',
      },
      {
        id: 'auxilio_emergencial',
        nome: 'Auxilio Emergencial',
        url: 'https://consultaauxilio.cidadania.gov.br/consulta/#/',
      },
      {
        id: 'cadunico',
        nome: 'CadUnico',
        url: 'https://cadunico.dataprev.gov.br/',
      },
      {
        id: 'bpc',
        nome: 'BPC - Beneficio de Prestacao Continuada',
        url: 'https://www.gov.br/pt-br/servicos/consultar-beneficio-de-prestacao-continuada',
      },
    ],
  },
  {
    id: 'desaparecidos',
    nome: 'Pessoas Desaparecidas',
    descricao: 'Portais estaduais de pessoas desaparecidas',
    comandos: [
      {
        id: 'rj',
        nome: 'RJ - Policia Civil',
        url: 'https://desaparecidos.pcivil.rj.gov.br/pesquisar',
      },
      {
        id: 'sp',
        nome: 'SP - Policia Civil',
        url: 'https://www.ssp.sp.gov.br/desaparecidos/',
      },
      {
        id: 'mg',
        nome: 'MG - Policia Civil',
        url: 'https://desaparecidos.policiacivil.mg.gov.br/desaparecido/album',
      },
      {
        id: 'nacional',
        nome: 'Cadastro Nacional de Desaparecidos',
        url: 'https://www.gov.br/mj/pt-br/assuntos/sua-protecao/pessoas-desaparecidas',
      },
    ],
  },
  {
    id: 'processos',
    nome: 'Consulta de Processos',
    descricao: 'Portais judiciais brasileiros',
    comandos: [
      {
        id: 'esaj_tjsp',
        nome: 'e-SAJ TJSP',
        url: 'https://esaj.tjsp.jus.br/esaj/portal.do',
      },
      {
        id: 'bnmp',
        nome: 'Banco Nacional de Mandados de Prisao',
        url: 'https://portalbnmp.cnj.jus.br/#/pesquisa-peca#',
      },
      {
        id: 'jusbrasil',
        nome: 'JusBrasil',
        url: 'https://www.jusbrasil.com.br/',
      },
      {
        id: 'escavador',
        nome: 'Escavador',
        url: 'https://www.escavador.com/',
      },
      {
        id: 'stf',
        nome: 'STF - Supremo Tribunal Federal',
        url: 'https://portal.stf.jus.br/processos/',
      },
      {
        id: 'stj',
        nome: 'STJ - Superior Tribunal de Justica',
        url: 'https://processo.stj.jus.br/processo/pesquisa/',
      },
    ],
  },
  {
    id: 'cnpj',
    nome: 'Consulta CNPJ / Empresas',
    descricao: 'Consulta de dados empresariais',
    comandos: [
      {
        id: 'receita_federal',
        nome: 'Receita Federal',
        url: 'http://servicos.receita.fazenda.gov.br/Servicos/cnpjreva/Cnpjreva_Solicitacao.asp',
      },
      {
        id: 'brasilcnpj',
        nome: 'Brasil CNPJ',
        url: 'https://brasilcnpj.net/',
      },
      {
        id: 'cnpj_ws',
        nome: 'CNPJ.ws',
        url: 'https://cnpj.ws/',
      },
    ],
  },
  {
    id: 'dorks',
    nome: 'Google Dorks',
    descricao: 'Tecnicas de busca avancada no Google',
    comandos: [
      {
        id: 'sql_dump',
        nome: 'Buscar dumps SQL',
        url: 'https://www.google.com/search?q=site%3Acom.br+ext%3Asql+%22CREATE+TABLE%22',
      },
      {
        id: 'gov_docs',
        nome: 'Documentos governamentais',
        url: 'https://www.google.com/search?q=site%3Agov.br+ext%3Apdf',
      },
      {
        id: 'cameras',
        nome: 'Cameras expostas',
        url: 'https://www.google.com/search?q=inurl%3A%22viewerframe%22+OR+inurl%3A%22axis-cgi%22',
      },
    ],
  },
  {
    id: 'geolocalizacao',
    nome: 'Geolocalizacao e Mapas',
    descricao: 'Ferramentas de analise geografica',
    comandos: [
      {
        id: 'google_maps',
        nome: 'Google Maps',
        url: 'https://www.google.com/maps',
      },
      {
        id: 'google_earth',
        nome: 'Google Earth Web',
        url: 'https://earth.google.com/web/',
      },
      {
        id: 'bing_maps',
        nome: 'Bing Maps',
        url: 'https://www.bing.com/maps',
      },
    ],
  },
  {
    id: 'imagens',
    nome: 'Analise de Imagens',
    descricao: 'Busca reversa e analise de imagens',
    comandos: [
      {
        id: 'google_lens',
        nome: 'Google Lens',
        url: 'https://lens.google.com/',
      },
      {
        id: 'yandex_images',
        nome: 'Yandex Images',
        url: 'https://yandex.com/images/',
      },
      {
        id: 'tineye',
        nome: 'TinEye',
        url: 'https://tineye.com/',
      },
    ],
  },
];

export const BAZUCANDO_ATALHOS: Record<string, string> = {
  beneficios: 'beneficios_sociais',
  categorias: 'categorias',
  desaparecidos: 'desaparecidos',
  processos: 'processos',
  cnpj: 'cnpj',
  dorks: 'dorks',
  geo: 'geolocalizacao',
  geolocalizacao: 'geolocalizacao',
  imagens: 'imagens',
  ajuda: 'ajuda',
  start: 'start',
};

export function getBazucandoCategoria(id: string): BazucandoCategoria | undefined {
  return BAZUCANDO_CATEGORIAS.find((item) => item.id === id);
}
