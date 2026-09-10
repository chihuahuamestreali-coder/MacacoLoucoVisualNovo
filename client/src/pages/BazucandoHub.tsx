import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowLeft, BookOpen, Crosshair, ExternalLink, Flag, FolderOpen, Home, Send } from 'lucide-react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import ModuleGuide from '@/components/ModuleGuide';
import { MODULE_GUIDES } from '@/lib/moduleGuides';
import {
  BAZUCANDO_CATEGORIAS,
  BAZUCANDO_META,
  getBazucandoCategoria,
  type BazucandoCategoria,
} from '@/lib/osintBazucandoCatalog';

type Botao = {
  texto: string;
  acao?: string;
  url?: string;
};

type Mensagem = {
  id: string;
  tipo: 'bot' | 'user';
  conteudo: string;
  botoes?: Botao[][];
  hora: string;
};

const horaAtual = () => new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

const nextId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

function formatarMarkdown(texto: string) {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*([^*\n]+)\*/g, '<strong>$1</strong>')
    .replace(/_([^_\n]+)_/g, '<em>$1</em>');
}

function respostaStart(): { conteudo: string; botoes: Botao[][] } {
  return {
    conteudo: [
      '*Bot OSINT Brasil*',
      '',
      'Bem-vindo! Sou um bot de consultas OSINT com foco em dados brasileiros.',
      '',
      'Use os comandos abaixo ou clique nos botoes:',
      '',
      '• /categorias - Ver todas as categorias',
      '• /beneficios - Programas sociais',
      '• /desaparecidos - Portais de desaparecidos',
      '• /processos - Consulta processual',
      '• /cnpj - Consulta de empresas',
      '• /dorks - Google Dorks',
      '• /ajuda - Instrucoes detalhadas',
      '',
      'Este bot apenas fornece links para fontes publicas.',
    ].join('\n'),
    botoes: [[{ texto: 'Ver Categorias', acao: 'categorias' }], [{ texto: 'Ajuda', acao: 'ajuda' }]],
  };
}

function respostaCategorias(): { conteudo: string; botoes: Botao[][] } {
  return {
    conteudo: '*Selecione uma categoria:*',
    botoes: BAZUCANDO_CATEGORIAS.map((cat) => [{ texto: cat.nome, acao: `cat_${cat.id}` }]),
  };
}

function respostaCategoria(cat: BazucandoCategoria): { conteudo: string; botoes: Botao[][] } {
  return {
    conteudo: [`*${cat.nome}*`, '', cat.descricao, '', '_Clique nos botoes para acessar:_'].join('\n'),
    botoes: [
      ...cat.comandos.map((cmd) => [{ texto: cmd.nome, url: cmd.url }]),
      [{ texto: 'Voltar', acao: 'categorias' }],
    ],
  };
}

function respostaAjuda(): { conteudo: string; botoes: Botao[][] } {
  return {
    conteudo: [
      '*Ajuda - Bot OSINT Brasil*',
      '',
      '*Como usar:*',
      '1. Digite /categorias ou clique no botao',
      '2. Escolha uma categoria',
      '3. Clique no link para abrir a fonte',
      '',
      '*Comandos disponiveis:*',
      '• /categorias - Todas as categorias',
      '• /beneficios - Programas sociais',
      '• /desaparecidos - Portais de desaparecidos',
      '• /processos - Consulta processual',
      '• /cnpj - Consulta CNPJ',
      '• /dorks - Google Dorks',
      '• /geo - Geolocalizacao',
      '• /imagens - Analise de imagens',
      '• /start - Menu inicial',
      '',
      '*Importante:*',
      '• Este site NAO armazena dados pessoais',
      '• Apenas fornece links para fontes publicas',
      '• Use de forma etica e legal (LGPD)',
    ].join('\n'),
    botoes: [[{ texto: 'Menu Inicial', acao: 'start' }]],
  };
}

function processarAcao(acao: string): { conteudo: string; botoes: Botao[][] } {
  if (acao === 'start') return respostaStart();
  if (acao === 'categorias') return respostaCategorias();
  if (acao === 'ajuda') return respostaAjuda();
  if (acao.startsWith('cat_')) {
    const cat = getBazucandoCategoria(acao.slice(4));
    if (cat) return respostaCategoria(cat);
  }
  const atalho: Record<string, string> = {
    beneficios: 'beneficios_sociais',
    desaparecidos: 'desaparecidos',
    processos: 'processos',
    cnpj: 'cnpj',
    dorks: 'dorks',
    geo: 'geolocalizacao',
    geolocalizacao: 'geolocalizacao',
    imagens: 'imagens',
  };
  if (atalho[acao]) {
    const cat = getBazucandoCategoria(atalho[acao]);
    if (cat) return respostaCategoria(cat);
  }
  return {
    conteudo: 'Acao nao reconhecida.',
    botoes: [[{ texto: 'Inicio', acao: 'start' }]],
  };
}

function processarComando(texto: string): { conteudo: string; botoes: Botao[][] } {
  let comando = texto.trim().toLowerCase();
  if (comando.startsWith('/')) comando = comando.slice(1);
  if (comando === 'start') return respostaStart();
  if (comando === 'categorias') return respostaCategorias();
  if (comando === 'ajuda') return respostaAjuda();
  const atalho: Record<string, string> = {
    beneficios: 'beneficios_sociais',
    desaparecidos: 'desaparecidos',
    processos: 'processos',
    cnpj: 'cnpj',
    dorks: 'dorks',
    geo: 'geolocalizacao',
    geolocalizacao: 'geolocalizacao',
    imagens: 'imagens',
  };
  if (atalho[comando]) {
    const cat = getBazucandoCategoria(atalho[comando]);
    if (cat) return respostaCategoria(cat);
  }
  return {
    conteudo: ['Comando nao reconhecido.', '', 'Use /categorias para ver as opcoes ou /ajuda para instrucoes.'].join('\n'),
    botoes: [[{ texto: 'Categorias', acao: 'categorias' }], [{ texto: 'Ajuda', acao: 'ajuda' }]],
  };
}

export default function BazucandoHub() {
  const [, setLocation] = useLocation();
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  const pushBot = (resposta: { conteudo: string; botoes: Botao[][] }) => {
    setMensagens((current) => [
      ...current,
      { id: nextId(), tipo: 'bot', conteudo: resposta.conteudo, botoes: resposta.botoes, hora: horaAtual() },
    ]);
  };

  const runAcao = (acao: string, textoOriginal?: string) => {
    if (textoOriginal) {
      setMensagens((current) => [...current, { id: nextId(), tipo: 'user', conteudo: textoOriginal, hora: horaAtual() }]);
    }
    setTyping(true);
    window.setTimeout(() => {
      setTyping(false);
      pushBot(processarAcao(acao));
    }, 280);
  };

  const enviarComando = (event?: FormEvent) => {
    event?.preventDefault();
    const texto = input.trim();
    if (!texto) return;
    setMensagens((current) => [...current, { id: nextId(), tipo: 'user', conteudo: texto, hora: horaAtual() }]);
    setInput('');
    setTyping(true);
    window.setTimeout(() => {
      setTyping(false);
      pushBot(processarComando(texto));
    }, 280);
  };

  const limparConversa = () => {
    setMensagens([]);
    setTyping(true);
    window.setTimeout(() => {
      setTyping(false);
      pushBot(respostaStart());
    }, 280);
  };

  useEffect(() => {
    setTyping(true);
    const timer = window.setTimeout(() => {
      setTyping(false);
      pushBot(respostaStart());
    }, 280);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const el = chatRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [mensagens, typing]);

  return (
    <div className="min-h-screen bg-[#04140b] p-6 font-mono text-white md:p-12">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col gap-5 border-b border-emerald-300/20 pb-6 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-xl border border-yellow-300/30 bg-black/40">
              <Crosshair className="h-7 w-7 text-emerald-300" />
            </div>
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-200">
                <Flag className="h-4 w-4 text-yellow-300" />
                <span>OSINT Brasil / {BAZUCANDO_CATEGORIAS.length} categorias publicas</span>
              </div>
              <h1 className="text-3xl font-black uppercase tracking-[0.18em] text-white md:text-4xl">BAZUCANDO</h1>
              <p className="mt-2 max-w-3xl text-xs leading-5 text-slate-400">
                Clone do Brazuca na estrutura do bot OSINT Brasil: categorias, comandos e links publicos da planilha. Sem login e sem armazenamento de dados pessoais.
              </p>
            </div>
          </div>
          <Button onClick={() => setLocation('/')} variant="outline" className="border-emerald-300/30 bg-black/30 text-emerald-100 hover:bg-emerald-300/10">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Menu Principal
          </Button>
        </header>

        <ModuleGuide guide={MODULE_GUIDES.bazucando} accentClass="text-emerald-200" />

        <section className="mt-6 overflow-hidden rounded-2xl border border-yellow-300/20 bg-gradient-to-br from-emerald-950/40 via-black/80 to-yellow-950/20 shadow-2xl">
          <div className="flex items-center justify-between border-b border-emerald-300/20 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-emerald-500/20 text-emerald-200">
                <Crosshair className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Bot OSINT Brasil</p>
                <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-emerald-200/80">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  online · {BAZUCANDO_META.origin}
                </p>
              </div>
            </div>
            <button type="button" onClick={limparConversa} className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400 hover:text-yellow-200">
              Limpar conversa
            </button>
          </div>

          <div ref={chatRef} className="flex max-h-[560px] min-h-[420px] flex-col gap-3 overflow-y-auto px-4 py-5 md:px-6">
            {mensagens.map((mensagem) => (
              <div
                key={mensagem.id}
                className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                  mensagem.tipo === 'bot'
                    ? 'self-start border border-emerald-300/15 bg-black/50'
                    : 'self-end border border-yellow-300/20 bg-emerald-900/40'
                }`}
              >
                <div className="whitespace-pre-wrap text-slate-100" dangerouslySetInnerHTML={{ __html: formatarMarkdown(mensagem.conteudo) }} />
                {mensagem.botoes && mensagem.botoes.length > 0 && (
                  <div className="mt-3 flex flex-col gap-2 border-t border-white/10 pt-3">
                    {mensagem.botoes.map((linha, index) =>
                      linha.map((botao) =>
                        botao.url ? (
                          <a
                            key={`${mensagem.id}-${botao.texto}-${index}`}
                            href={botao.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg border border-emerald-300/20 bg-emerald-500/10 px-3 py-2 text-center text-xs font-semibold text-emerald-100 hover:border-yellow-300/40 hover:bg-emerald-500/20"
                          >
                            {botao.texto}
                          </a>
                        ) : (
                          <button
                            key={`${mensagem.id}-${botao.texto}-${index}`}
                            type="button"
                            onClick={() => runAcao(botao.acao ?? '', botao.texto)}
                            className="rounded-lg border border-emerald-300/20 bg-emerald-500/10 px-3 py-2 text-center text-xs font-semibold text-emerald-100 hover:border-yellow-300/40 hover:bg-emerald-500/20"
                          >
                            {botao.texto}
                          </button>
                        ),
                      ),
                    )}
                  </div>
                )}
                <p className="mt-2 text-right text-[10px] text-white/40">{mensagem.hora}</p>
              </div>
            ))}
            {typing && (
              <div className="flex self-start gap-1 rounded-2xl border border-emerald-300/15 bg-black/50 px-4 py-3">
                <span className="h-2 w-2 animate-pulse rounded-full bg-slate-400" />
                <span className="h-2 w-2 animate-pulse rounded-full bg-slate-400 [animation-delay:120ms]" />
                <span className="h-2 w-2 animate-pulse rounded-full bg-slate-400 [animation-delay:240ms]" />
              </div>
            )}
          </div>

          <form onSubmit={enviarComando} className="flex items-center gap-3 border-t border-emerald-300/20 bg-black/40 px-4 py-3">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Digite um comando (ex: /categorias)"
              aria-label="Digite um comando"
              className="min-w-0 flex-1 rounded-full border border-emerald-300/20 bg-black/60 px-4 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-300/50"
            />
            <Button type="submit" disabled={!input.trim()} className="h-11 w-11 rounded-full bg-emerald-500 p-0 text-black hover:bg-emerald-400">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </section>

        <section className="mt-10 rounded-2xl border border-emerald-300/20 bg-black/40 p-6 md:p-8">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-bold text-emerald-100">
                <FolderOpen className="h-5 w-5 text-yellow-300" /> Categorias da planilha
              </h2>
              <p className="mt-2 max-w-3xl text-xs leading-5 text-slate-400">
                Estrutura extraida do codigo da planilha: categorias, comandos e URLs publicas.
              </p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-yellow-200">{BAZUCANDO_CATEGORIAS.length} grupos</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {BAZUCANDO_CATEGORIAS.map((categoria) => (
              <div key={categoria.id} className="rounded-xl border border-white/10 bg-black/30 p-4">
                <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">{categoria.comandos.length} fontes</p>
                <p className="mt-1 font-bold text-white">{categoria.nome}</p>
                <p className="mt-2 text-xs leading-5 text-slate-400">{categoria.descricao}</p>
                <div className="mt-3 flex flex-col gap-1.5">
                  {categoria.comandos.map((comando) => (
                    <a
                      key={comando.id}
                      href={comando.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between rounded-lg border border-white/5 px-3 py-2 text-xs text-emerald-100 hover:border-yellow-300/40"
                    >
                      <span>{comando.nome}</span>
                      <ExternalLink className="h-3.5 w-3.5 text-yellow-200" />
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-white/10 bg-black/30 p-6">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-slate-300">
            <BookOpen className="h-4 w-4 text-emerald-200" /> Comandos
          </h3>
          <div className="flex flex-wrap gap-2">
            {['/start', '/categorias', '/beneficios', '/desaparecidos', '/processos', '/cnpj', '/dorks', '/geo', '/imagens', '/ajuda'].map((cmd) => (
              <button
                key={cmd}
                type="button"
                onClick={() => {
                  setMensagens((current) => [...current, { id: nextId(), tipo: 'user', conteudo: cmd, hora: horaAtual() }]);
                  setTyping(true);
                  window.setTimeout(() => {
                    setTyping(false);
                    pushBot(processarComando(cmd));
                  }, 280);
                }}
                className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-slate-400 hover:border-yellow-300/40 hover:text-yellow-100"
              >
                {cmd}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setLocation('/')}
              className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-slate-400 hover:border-yellow-300/40 hover:text-yellow-100"
            >
              <Home className="h-3 w-3" /> inicio
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
