import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'wouter';
import ModuleGuide from '@/components/ModuleGuide';
import type { ModuleGuide as ModuleGuideData } from '@/lib/moduleGuides';
import { MODULE_GUIDES } from '@/lib/moduleGuides';
import { generateSpotifyPlusDevice, buildSpotifyPlusScriptBody, parseSpotifyTarget, toSpotifyEmbedUrl } from '@/lib/spotifyPlusDeviceGenerator';
import { generatePersonalData } from '@/lib/personalDataGenerator';
import { generateRandomUserAgent, generateCompleteAntiDetectionScript } from '@/lib/cookieAndUserAgentManager';
import { generateBehaviorInjectionScript } from '@/lib/humanBehaviorSimulator';
import { generateNativeAppSimulationForProfile } from '@/lib/nativeAppSimulator';
import { generateAdvancedAntiDetection } from '@/lib/advancedAntiDetection';
import { saveAccountRecord, getAccountHistory, generatePerformanceReport } from '@/lib/accountHistoryManager';
import { copyInjectionScript, wrapInSiteScript, toBookmarklet, BOOKMARKLET_STEPS } from '@/lib/inSiteInjection';
import { Zap, Copy, Shield, BarChart3, Trash2, ClipboardCheck, AlertCircle, CheckCircle2, Loader2, Smartphone, Globe, Fingerprint, TerminalSquare, Link2, Music, X, Play } from 'lucide-react';
import { toast } from 'sonner';

const ACCENT = {
  text: 'text-emerald-400',
  border: 'border-emerald-400/30',
  bg: 'bg-emerald-400/20',
  gradientFrom: 'from-emerald-500/30',
  gradientTo: 'to-green-500/30',
  hex: '#1DB954',
};

const DEFAULT_URL = '';

export default function SpotifyPlusManager() {
  const [, setLocation] = useLocation();
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentDevice, setCurrentDevice] = useState<any>(null);
  const [currentPersonalData, setCurrentPersonalData] = useState<any>(null);
  const [currentUserAgent, setCurrentUserAgent] = useState<any>(null);
  const [antiFraudMode, setAntiFraudMode] = useState(true);
  const [simulateNativeApp, setSimulateNativeApp] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [performanceReport, setPerformanceReport] = useState<any>(null);
  const [accountHistory, setAccountHistory] = useState<any[]>([]);
  const [injectionStatus, setInjectionStatus] = useState<'idle' | 'injecting' | 'success' | 'error'>('idle');
  const [injectionMessage, setInjectionMessage] = useState('');
  const [lastInjectedAt, setLastInjectedAt] = useState<string>('');
  const [copiedScript, setCopiedScript] = useState(false);
  const [targetUrl, setTargetUrl] = useState<string>(DEFAULT_URL);
  const [showBookmarklet, setShowBookmarklet] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const [scriptPaste, setScriptPaste] = useState('');
  const [scriptRan, setScriptRan] = useState(false);

  const guide: ModuleGuideData = MODULE_GUIDES['spotifyPlus'];

  useEffect(() => {
    setAccountHistory(getAccountHistory());
    setPerformanceReport(generatePerformanceReport());
  }, []);

  const siteUrl = useMemo(() => parseSpotifyTarget(targetUrl).url, [targetUrl]);
  const targetMeta = useMemo(() => parseSpotifyTarget(targetUrl), [targetUrl]);
  const embedUrl = useMemo(() => toSpotifyEmbedUrl(targetUrl), [targetUrl]);

  useEffect(() => {
    if (!embedUrl) return;
    setShowPlayer(true);
    setScriptRan(false);
    setInjectionStatus('injecting');
    setInjectionMessage('Player aberto neste popup. Cole o script abaixo e clique em RODAR SCRIPT.');
  }, [embedUrl]);

  const handleGenerateDevice = async () => {
    setIsGenerating(true);
    setInjectionStatus('idle');
    setInjectionMessage('');
    setCopiedScript(false);
    await new Promise(resolve => setTimeout(resolve, 1200));

    const newDevice = generateSpotifyPlusDevice();
    const personalData = generatePersonalData();
    const userAgent = generateRandomUserAgent();

    setCurrentDevice(newDevice);
    setCurrentPersonalData(personalData);
    setCurrentUserAgent(userAgent);
    setIsGenerating(false);

    toast.success('IDs Spotify-Plus gerados!', {
      description: `${newDevice.spDeviceId} • ${personalData.fullName}`,
    });
  };

  const buildInSiteScript = (): string => {
    if (!currentDevice || !currentPersonalData) return '';
    const body = buildSpotifyPlusScriptBody(currentDevice, currentPersonalData, siteUrl);

    const antiDetectionCode = antiFraudMode && currentUserAgent
      ? generateCompleteAntiDetectionScript(currentUserAgent)
      : '';

    const advancedAntiDetectionCode = generateAdvancedAntiDetection();

    const behaviorCode = antiFraudMode
      ? generateBehaviorInjectionScript({
          minDelay: 1000,
          maxDelay: 5000,
          minTypingSpeed: 80,
          maxTypingSpeed: 200,
          enableMouseMovement: true,
          enableScrolling: true,
        })
      : '';

    const nativeAppCode = simulateNativeApp
      ? generateNativeAppSimulationForProfile({
          platform: 'universal',
          userAgent: currentUserAgent?.userAgent || currentDevice.userAgent,
          imei: currentDevice.imei || currentDevice.fingerprint,
        })
      : '';

    const fullCode = [advancedAntiDetectionCode, antiDetectionCode, nativeAppCode, behaviorCode, body].filter(Boolean).join('\n');

    const features = [
      'Brave Shield (Nav Brave)',
      'Filtro de playlist',
      'IDs Spotify',
      ...(simulateNativeApp ? ['App Nativo'] : []),
      ...(antiFraudMode ? ['Comportamento Humano'] : []),
    ];

    return wrapInSiteScript('Spotify-Plus', fullCode, features, ACCENT.hex);
  };

  const saveAccountRecordForInjection = () => {
    if (!currentDevice || !currentPersonalData) return;
    saveAccountRecord({
      id: `spplus_${Date.now()}`,
      email: currentPersonalData.email,
      createdAt: new Date(),
      status: 'pending',
      deviceFingerprint: currentDevice.fingerprint,
      userAgent: currentUserAgent?.userAgent || currentDevice.userAgent,
      personalData: {
        name: currentPersonalData.fullName,
        phone: currentPersonalData.phone,
        birthDate: currentPersonalData.birthDate,
        city: currentPersonalData.city,
        state: currentPersonalData.state,
      },
      behaviorConfig: { minDelay: antiFraudMode ? 1000 : 500, maxDelay: antiFraudMode ? 5000 : 3000, typingSpeed: antiFraudMode ? 150 : 100 },
      notes: `Spotify-Plus — alvo: ${siteUrl || 'nao definido'}`,
    });
  };

  const handleCopyScript = async () => {
    if (!currentDevice || !currentPersonalData) {
      toast.error('Gere os IDs primeiro!');
      return;
    }
    if (!siteUrl) {
      toast.error('Cole o link da pagina/playlist!');
      return;
    }

    saveAccountRecordForInjection();

    try {
      const script = buildInSiteScript();
      const result = await copyInjectionScript(script);
      if (result.success) {
        setCopiedScript(true);
        setScriptPaste(script);
        setInjectionStatus('success');
        setInjectionMessage('Script copiado. Abra o popup, cole no campo e clique em RODAR SCRIPT.');
        setLastInjectedAt(new Date().toLocaleTimeString('pt-BR'));
        toast.success('Script Spotify-Plus copiado!', {
          description: 'Cole no campo do popup e clique em RODAR SCRIPT.',
        });
      } else {
        setInjectionStatus('error');
        setInjectionMessage(result.message);
        toast.error(result.message);
      }
    } catch (e) {
      setInjectionStatus('error');
      setInjectionMessage('Erro ao copiar o script de injecao');
      console.error(e);
      toast.error('Erro ao copiar o script de injecao');
    }
  };

  const handleCopyBookmarklet = async () => {
    if (!currentDevice || !currentPersonalData) {
      toast.error('Gere os IDs primeiro!');
      return;
    }
    if (!siteUrl) {
      toast.error('Cole o link da pagina/playlist!');
      return;
    }

    saveAccountRecordForInjection();

    try {
      const script = toBookmarklet(buildInSiteScript());
      const result = await copyInjectionScript(script);
      if (result.success) {
        setInjectionStatus('success');
        setInjectionMessage('Bookmarklet Spotify-Plus copiado! Crie um favorito e clique com o Spotify aberto.');
        setLastInjectedAt(new Date().toLocaleTimeString('pt-BR'));
        toast.success('Bookmarklet copiado!', {
          description: 'Crie um favorito (Ctrl+D) com o codigo e clique nele com o Spotify aberto.',
        });
      } else {
        setInjectionStatus('error');
        setInjectionMessage(result.message);
        toast.error(result.message);
      }
    } catch (e) {
      setInjectionStatus('error');
      setInjectionMessage('Erro ao copiar o bookmarklet');
      console.error(e);
      toast.error('Erro ao copiar o bookmarklet');
    }
  };

  const handleCopyIds = () => {
    if (!currentDevice) {
      toast.error('Gere os IDs primeiro!');
      return;
    }
    const text = [
      `SP DEVICE ID: ${currentDevice.spDeviceId}`,
      `SP SESSION: ${currentDevice.spSession}`,
      `ANONYMOUS ID: ${currentDevice.spAnonymousId}`,
      `PLAYLIST ID: ${currentDevice.spPlaylistId}`,
      `CLIENT VERSION: ${currentDevice.spClientVersion}`,
      `LOCALE: ${currentDevice.spLocale}`,
      `MARKET: ${currentDevice.spMarket}`,
      `MAC: ${currentDevice.macAddress}`,
      `IMEI: ${currentDevice.imei}`,
      `ANDROID ID: ${currentDevice.androidId}`,
      `FINGERPRINT: ${currentDevice.fingerprint}`,
      `TARGET: ${siteUrl}`,
    ].join('\n');
    navigator.clipboard.writeText(text);
    toast.success('IDs copiados!', { description: currentDevice.spDeviceId });
  };

  const handleOpenPlayer = () => {
    if (!siteUrl) {
      toast.error('Cole o link da playlist ou musica!');
      return;
    }
    if (!embedUrl) {
      toast.error('Link invalido. Use album, playlist, track ou artista do Spotify.');
      return;
    }
    setShowPlayer(true);
    setScriptRan(false);
    setInjectionStatus('injecting');
    setInjectionMessage('Player aberto neste popup. Cole o script abaixo e clique em RODAR SCRIPT.');
    toast.success('Playlist carregada no popup', {
      description: 'Sem guia nova. Cole o script e rode aqui.',
    });
  };

  const handleRunPastedScript = () => {
    const raw = scriptPaste.trim();
    if (!raw) {
      toast.error('Cole o script no campo primeiro!');
      return;
    }
    try {
      const runner = new Function(raw);
      runner();
      setScriptRan(true);
      setInjectionStatus('success');
      setInjectionMessage('Script rodado neste popup. Player filtrado, sem anuncio na direita.');
      setLastInjectedAt(new Date().toLocaleTimeString('pt-BR'));
      toast.success('Script rodado no popup!', {
        description: 'Brave Shield ativo neste painel.',
      });
    } catch (e: any) {
      setInjectionStatus('error');
      setInjectionMessage('Erro ao rodar o script: ' + (e?.message || 'falha'));
      toast.error('Erro ao rodar o script');
    }
  };

  const handleCopyThenOpen = async () => {
    if (!currentDevice || !currentPersonalData) {
      toast.error('Gere os IDs primeiro!');
      return;
    }
    await handleCopyScript();
    handleOpenPlayer();
  };

  const copyPersonalData = () => {
    if (!currentPersonalData) {
      toast.error('Gere os IDs primeiro!');
      return;
    }
    const dataText = `Nome: ${currentPersonalData.fullName}
Email: ${currentPersonalData.email}
Telefone: ${currentPersonalData.phone}
Data de Nascimento: ${currentPersonalData.birthDate}
Endereco: ${currentPersonalData.address}
Cidade: ${currentPersonalData.city}
Estado: ${currentPersonalData.state}
CEP: ${currentPersonalData.zipCode}`;
    navigator.clipboard.writeText(dataText);
    toast.success('Dados pessoais copiados!', {
      description: 'Cole nos campos do formulario',
    });
  };

  const handleClearHistory = () => {
    if (confirm('Tem certeza que deseja limpar todo o historico de contas?')) {
      localStorage.removeItem('manus_account_history');
      setAccountHistory([]);
      setPerformanceReport(null);
      toast.success('Historico limpo!');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-mono">
      <ModuleGuide guide={guide} accentClass={ACCENT.text} />

      <div className="fixed inset-0 pointer-events-none opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(0deg, transparent 24%, rgba(29, 185, 84, 0.05) 25%, rgba(29, 185, 84, 0.05) 26%, transparent 27%, transparent 74%, rgba(29, 185, 84, 0.05) 75%, rgba(29, 185, 84, 0.05) 76%, transparent 77%, transparent),
              linear-gradient(90deg, transparent 24%, rgba(29, 185, 84, 0.05) 25%, rgba(29, 185, 84, 0.05) 26%, transparent 27%, transparent 74%, rgba(29, 185, 84, 0.05) 75%, rgba(29, 185, 84, 0.05) 76%, transparent 77%, transparent)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      <header className={`border-b ${ACCENT.border} bg-background/80 backdrop-blur-sm sticky top-0 z-50`}>
        <div className="container max-w-7xl mx-auto px-4 py-4 lg:py-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="text-center lg:text-left">
              <h1 className={`text-2xl lg:text-4xl font-bold ${ACCENT.text} font-mono mb-1`}>
                SPOTIFY-PLUS
              </h1>
              <p className="text-xs lg:text-sm text-muted-foreground font-mono">
                Nav Brave Shield • cole o link da playlist • zero anuncios
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-400/20 hover:bg-blue-400/40 text-blue-400 border border-blue-400/50 rounded transition-all font-bold text-xs"
              >
                <BarChart3 size={16} />
                HISTORICO
              </button>
              <button
                onClick={() => setLocation('/')}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-400/20 hover:bg-emerald-400/40 text-emerald-400 border border-emerald-400/50 rounded transition-all font-bold text-xs neon-glow"
              >
                DEVICE MASTER
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-7xl mx-auto px-4 py-8 relative z-10">
        <div className="neon-glow rounded-lg p-5 mb-8 bg-secondary/50 border-2 border-emerald-500/40">
          <div className="flex gap-3 items-start">
            <Link2 size={20} className="text-emerald-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-bold text-emerald-400 mb-1">COLE O LINK DA PLAYLIST / MUSICA</h3>
              <p className="text-sm text-foreground font-mono mb-3">
                Cole o link (album, playlist ou faixa). Carrega num popup nesta pagina — sem guia nova e sem o anuncio da direita.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="https://open.spotify.com/intl-pt/album/..."
                  className="flex-1 px-4 py-2 bg-background border border-emerald-400/40 rounded text-sm font-mono text-foreground focus:outline-none focus:border-emerald-400"
                />
                <button
                  onClick={handleOpenPlayer}
                  disabled={!embedUrl}
                  className="px-4 py-2 font-bold text-xs transition-all flex items-center justify-center gap-2 rounded border bg-emerald-500/20 hover:bg-emerald-500/40 border-emerald-400 text-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play size={16} />
                  CARREGAR NO POPUP
                </button>
              </div>
              {siteUrl && (
                <p className="text-xs text-emerald-400/70 mt-2 font-mono">
                  Alvo: {siteUrl}
                  {targetMeta.kind !== 'home' && targetMeta.kind !== 'custom' ? ` • tipo: ${targetMeta.kind}` : ''}
                  {targetMeta.id ? ` • id: ${targetMeta.id}` : ''}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="neon-glow rounded-lg p-4 mb-8 bg-secondary/50 border-2 border-purple-500/50">
          <div className="flex gap-3">
            <Shield size={20} className="text-purple-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-purple-400 mb-1">BRAVE SHIELD + ANTI-FRAUDE</h3>
              <p className="text-sm text-foreground font-mono mb-2">
                {antiFraudMode ? 'ATIVO' : 'INATIVO'} — bloqueio estilo Nav do Brave (hosts, DOM, fetch/XHR) + comportamento humano
              </p>
              <button
                onClick={() => setAntiFraudMode(!antiFraudMode)}
                className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                  antiFraudMode
                    ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                    : 'bg-red-500/20 text-red-400 border border-red-500/50'
                }`}
              >
                {antiFraudMode ? 'Desativar' : 'Ativar'} Anti-Fraude
              </button>
            </div>
          </div>
        </div>

        <div className={`rounded-lg p-5 mb-8 border-2 transition-all ${
          injectionStatus === 'success' ? 'bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-green-500/50' :
          injectionStatus === 'error' ? 'bg-gradient-to-r from-red-900/30 to-rose-900/30 border-red-500/50' :
          injectionStatus !== 'idle' ? 'bg-gradient-to-r from-yellow-900/30 to-amber-900/30 border-yellow-500/50' :
          'bg-gradient-to-r from-secondary/50 to-secondary/30 border-emerald-500/30'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-foreground font-mono flex items-center gap-2">
              <TerminalSquare size={20} className={injectionStatus === 'success' ? 'text-green-400' : injectionStatus === 'error' ? 'text-red-400' : 'text-emerald-400'} />
              STATUS DA INJECAO
            </h3>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${
              injectionStatus === 'success' ? 'bg-green-500/20 text-green-400' :
              injectionStatus === 'error' ? 'bg-red-500/20 text-red-400' :
              injectionStatus !== 'idle' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-secondary text-muted-foreground'
            }`}>
              {injectionStatus === 'success' ? <CheckCircle2 size={16} /> : injectionStatus === 'error' ? <AlertCircle size={16} /> : injectionStatus !== 'idle' ? <Loader2 size={16} className="animate-spin" /> : <Loader2 size={16} />}
              {injectionStatus === 'idle' && 'Aguardando'}
              {injectionStatus === 'injecting' && 'Injetando...'}
              {injectionStatus === 'success' && 'Sucesso'}
              {injectionStatus === 'error' && 'Erro'}
            </div>
          </div>

          {injectionMessage && (
            <div className={`p-3 rounded-lg border text-sm font-mono ${
              injectionStatus === 'success' ? 'bg-green-500/10 border-green-500/50' :
              injectionStatus === 'error' ? 'bg-red-500/10 border-red-500/50' :
              injectionStatus !== 'idle' ? 'bg-yellow-500/10 border-yellow-500/50' :
              'bg-secondary/30 border-border'
            }`}>
              {injectionStatus === 'success' && <CheckCircle2 size={16} className="inline mr-2 text-green-400" />}
              {injectionStatus === 'error' && <AlertCircle size={16} className="inline mr-2 text-red-400" />}
              {injectionStatus === 'injecting' && <Loader2 size={16} className="inline mr-2 text-yellow-400 animate-spin" />}
              {injectionMessage}
              {lastInjectedAt && injectionStatus === 'success' && (
                <span className="ml-3 text-green-400/60 text-xs">• {lastInjectedAt}</span>
              )}
            </div>
          )}

          {injectionStatus === 'idle' && (
            <p className="text-muted-foreground text-xs font-mono">
              Cole o link, gere os IDs, copie o script e rode no popup desta pagina. Sem guia nova. Sem anuncio na direita.
            </p>
          )}
        </div>

        {showHistory && performanceReport && (
          <div className="neon-glow rounded-lg p-6 bg-card border border-blue-400/30 mb-8">
            <h2 className="text-lg font-bold text-blue-400 mb-4 font-mono">RELATORIO DE DESEMPENHO</h2>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              <div className="bg-secondary/30 rounded p-3 text-center">
                <div className="text-2xl font-bold text-cyan-400">{performanceReport.totalAccounts}</div>
                <p className="text-xs text-muted-foreground">Total de Contas</p>
              </div>
              <div className="bg-secondary/30 rounded p-3 text-center">
                <div className="text-2xl font-bold text-green-400">{performanceReport.successfulAccounts}</div>
                <p className="text-xs text-muted-foreground">Bem-sucedidas</p>
              </div>
              <div className="bg-secondary/30 rounded p-3 text-center">
                <div className="text-2xl font-bold text-red-400">{performanceReport.fraudDetected}</div>
                <p className="text-xs text-muted-foreground">Fraude Detectada</p>
              </div>
              <div className="bg-secondary/30 rounded p-3 text-center">
                <div className="text-2xl font-bold text-purple-400">{performanceReport.pendingAccounts}</div>
                <p className="text-xs text-muted-foreground">Pendentes</p>
              </div>
              <div className="bg-secondary/30 rounded p-3 text-center">
                <div className="text-2xl font-bold text-yellow-400">{performanceReport.overallSuccessRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">Taxa de Sucesso</p>
              </div>
            </div>
            <button
              onClick={handleClearHistory}
              className="w-full px-3 py-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 border border-red-500/50 rounded transition-colors font-bold text-xs"
            >
              <Trash2 size={14} className="inline mr-2" />
              LIMPAR HISTORICO
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <div className="neon-glow rounded-lg p-6 bg-card">
                <h2 className={`text-xl font-bold ${ACCENT.text} mb-4 font-mono`}>GERADOR DE IDS</h2>

                <button
                  onClick={handleGenerateDevice}
                  disabled={isGenerating}
                  className="w-full mb-4 flex items-center justify-center gap-2 px-6 py-4 bg-emerald-400/20 hover:bg-emerald-400/40 text-emerald-400 border-2 border-emerald-400 rounded font-mono font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed neon-glow"
                >
                  <Zap size={20} />
                  {isGenerating ? 'GERANDO...' : 'GERAR IDS'}
                </button>

                {isGenerating && (
                  <div className="mb-4 p-3 bg-secondary/50 rounded border border-emerald-400/30">
                    <div className="text-xs text-emerald-400 font-mono mb-2">SCAN EM PROGRESSO</div>
                    <div className="h-1 bg-secondary rounded overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-400 to-green-500 animate-pulse" />
                    </div>
                  </div>
                )}

                <div className="p-3 bg-green-500/10 rounded border border-green-500/30 text-xs text-green-400 font-mono mb-4">
                  <p className="font-bold mb-1">DICA:</p>
                  <p>Cole o link da playlist, gere os IDs, copie o script e injete no Console do Spotify.</p>
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground font-mono">Cada perfil inclui:</p>
                  <ul className="text-xs text-foreground font-mono space-y-1 ml-2">
                    <li>SP Device ID / Session / Anonymous ID</li>
                    <li>Brave Shield (hosts + DOM + fetch)</li>
                    <li>Filtro de faixa/playlist sem anuncio</li>
                    <li>MAC / IMEI / Android ID</li>
                    <li>Anti-deteccao 16+</li>
                    <li>Comportamento humano</li>
                    <li>App nativo WebView</li>
                    <li>Dados pessoais de persona</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            {!currentDevice ? (
              <div className="neon-glow rounded-lg p-12 bg-card text-center">
                <Music className="w-16 h-16 mx-auto mb-4 text-emerald-400" />
                <h3 className={`text-xl font-bold ${ACCENT.text} mb-2 font-mono`}>NENHUM ID GERADO</h3>
                <p className="text-muted-foreground font-mono">Clique em GERAR IDS para comecar</p>
              </div>
            ) : (
              <div className="space-y-4">
                <label className="flex items-start gap-3 border border-emerald-400/30 rounded-md p-4 bg-secondary/20 cursor-pointer">
                  <input type="checkbox" checked={simulateNativeApp} onChange={(event) => setSimulateNativeApp(event.target.checked)} className="mt-1" />
                  <div>
                    <div className="font-semibold text-emerald-200">Simulacao local de app nativo Spotify</div>
                    <p className="text-xs text-muted-foreground mt-1">Adiciona metadados ficticios de WebView ao perfil local. Nao acessa nem altera servicos externos.</p>
                  </div>
                </label>

                <div className="neon-glow rounded-lg p-6 bg-card border border-emerald-400/30">
                  <h3 className={`text-lg font-bold ${ACCENT.text} mb-4 font-mono`}>
                    {currentDevice.deviceName}
                  </h3>
                  <div className="grid grid-cols-2 gap-4 mb-6 text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <Smartphone size={14} className="text-emerald-400" />
                      <div>
                        <p className="text-muted-foreground mb-1">MODELO</p>
                        <p className="text-foreground font-bold">{currentDevice.model}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe size={14} className="text-emerald-400" />
                      <div>
                        <p className="text-muted-foreground mb-1">FABRICANTE</p>
                        <p className="text-foreground font-bold">{currentDevice.manufacturer}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 rounded-sm bg-emerald-400/30" />
                      <div className="min-w-0">
                        <p className="text-muted-foreground mb-1">SP DEVICE ID</p>
                        <p className="text-green-400 font-bold break-all text-[10px]">{currentDevice.spDeviceId}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 rounded-sm bg-emerald-400/30" />
                      <div className="min-w-0">
                        <p className="text-muted-foreground mb-1">SP SESSION</p>
                        <p className="text-green-400 font-bold break-all text-[10px]">{currentDevice.spSession}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 rounded-sm bg-emerald-400/30" />
                      <div className="min-w-0">
                        <p className="text-muted-foreground mb-1">ANONYMOUS ID</p>
                        <p className="text-green-400 font-bold break-all text-[10px]">{currentDevice.spAnonymousId}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 rounded-sm bg-emerald-400/30" />
                      <div className="min-w-0">
                        <p className="text-muted-foreground mb-1">PLAYLIST ID</p>
                        <p className="text-foreground font-bold break-all text-[10px]">{currentDevice.spPlaylistId}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 rounded-sm bg-emerald-400/30" />
                      <div>
                        <p className="text-muted-foreground mb-1">CLIENT VERSION</p>
                        <p className="text-foreground font-bold">{currentDevice.spClientVersion}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 rounded-sm bg-emerald-400/30" />
                      <div>
                        <p className="text-muted-foreground mb-1">LOCALE / MARKET</p>
                        <p className="text-foreground font-bold">{currentDevice.spLocale} / {currentDevice.spMarket}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 rounded-sm bg-emerald-400/30" />
                      <div className="min-w-0">
                        <p className="text-muted-foreground mb-1">MAC ADDRESS</p>
                        <p className="text-green-400 font-bold break-all text-[10px]">{currentDevice.macAddress}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 rounded-sm bg-emerald-400/30" />
                      <div className="min-w-0">
                        <p className="text-muted-foreground mb-1">IMEI</p>
                        <p className="text-foreground font-bold break-all text-[10px]">{currentDevice.imei}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 rounded-sm bg-emerald-400/30" />
                      <div className="min-w-0">
                        <p className="text-muted-foreground mb-1">ANDROID ID</p>
                        <p className="text-foreground font-bold break-all text-[10px]">{currentDevice.androidId}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 rounded-sm bg-emerald-400/30" />
                      <div className="min-w-0">
                        <p className="text-muted-foreground mb-1">USER-AGENT</p>
                        <p className="text-foreground font-bold break-all text-[10px]">{currentUserAgent?.userAgent || currentDevice.userAgent}</p>
                      </div>
                    </div>
                    <div className="col-span-2 flex items-center gap-2">
                      <Fingerprint size={14} className="text-emerald-400" />
                      <div>
                        <p className="text-muted-foreground mb-1">FINGERPRINT</p>
                        <p className="text-foreground font-bold break-all text-[10px]">{currentDevice.fingerprint}</p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleCopyIds}
                    className="w-full px-3 py-2 bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400 border border-emerald-500/50 rounded transition-colors font-bold text-xs"
                  >
                    <Copy size={14} className="inline mr-2" />
                    COPIAR IDS
                  </button>
                </div>

                {currentPersonalData && (
                  <div className="neon-glow rounded-lg p-6 bg-card border border-green-400/30">
                    <h3 className="text-lg font-bold text-green-400 mb-4 font-mono">DADOS PESSOAIS</h3>
                    <div className="grid grid-cols-2 gap-4 mb-4 text-xs font-mono">
                      <div>
                        <p className="text-muted-foreground mb-1">NOME</p>
                        <p className="text-foreground font-bold">{currentPersonalData.fullName}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">EMAIL</p>
                        <p className="text-green-400 font-bold break-all">{currentPersonalData.email}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">TELEFONE</p>
                        <p className="text-foreground font-bold">{currentPersonalData.phone}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">DATA NASCIMENTO</p>
                        <p className="text-foreground font-bold">{currentPersonalData.birthDate}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-muted-foreground mb-1">LOCALIZACAO</p>
                        <p className="text-foreground font-bold">{currentPersonalData.city}, {currentPersonalData.state}</p>
                      </div>
                    </div>
                    <button
                      onClick={copyPersonalData}
                      className="w-full px-3 py-2 bg-green-500/20 hover:bg-green-500/40 text-green-400 border border-green-500/50 rounded transition-colors font-bold text-xs"
                    >
                      <Copy size={14} className="inline mr-2" />
                      COPIAR DADOS PESSOAIS
                    </button>
                  </div>
                )}

                <div className="p-4 bg-secondary/30 rounded border border-emerald-400/30 font-mono text-xs space-y-3">
                  <p className="text-green-400 font-bold mb-2 flex items-center gap-2">
                    INJECAO DE PERFIL (IN-SITE)
                    {injectionStatus === 'success' && copiedScript && (
                      <span className="px-2 py-0.5 bg-green-500/30 text-green-400 border border-green-500/50 rounded text-[10px]">
                        SCRIPT COPIADO
                      </span>
                    )}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={handleCopyScript}
                      disabled={!currentDevice || !currentPersonalData}
                      className="w-full px-4 py-4 font-bold text-sm transition-all flex items-center justify-center gap-3 rounded border bg-gradient-to-r from-emerald-500/30 to-green-500/30 hover:from-emerald-500/50 hover:to-green-500/50 border-emerald-400 text-emerald-300 neon-glow disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <TerminalSquare size={18} />
                      COPIAR SCRIPT
                    </button>
                    <button
                      onClick={handleCopyThenOpen}
                      disabled={!currentDevice || !currentPersonalData || !embedUrl}
                      className="w-full px-4 py-4 font-bold text-sm transition-all flex items-center justify-center gap-3 rounded border bg-emerald-500/20 hover:bg-emerald-500/40 border-emerald-400 text-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Play size={18} />
                      COPIAR + ABRIR POPUP
                    </button>
                    <button
                      onClick={handleOpenPlayer}
                      disabled={!embedUrl}
                      className="w-full px-4 py-4 font-bold text-sm transition-all flex items-center justify-center gap-3 rounded border bg-emerald-500/20 hover:bg-emerald-500/40 border-emerald-400 text-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Music size={18} />
                      ABRIR POPUP (MESMA PAGINA)
                    </button>
                    <button
                      onClick={handleCopyBookmarklet}
                      disabled={!currentDevice || !currentPersonalData}
                      className="w-full px-4 py-4 font-bold text-sm transition-all flex items-center justify-center gap-3 rounded border bg-blue-500/20 hover:bg-blue-500/40 border-blue-400 text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Copy size={18} />
                      COPIAR BOOKMARKLET
                    </button>
                  </div>

                  <div className="border-t border-emerald-400/20 pt-3 mt-2">
                    <p className="text-cyan-400 font-bold mb-2 flex items-center gap-2">
                      <ClipboardCheck size={14} />
                      COMO INJETAR NO SPOTIFY REAL
                    </p>
                    <div className="bg-cyan-400/10 rounded p-3 border border-cyan-400/30 space-y-1 text-xs">
                      <p className="text-cyan-300"><span className="text-cyan-400 font-bold">1.</span> Cole o link da playlist/musica no painel.</p>
                      <p className="text-cyan-300"><span className="text-cyan-400 font-bold">2.</span> Gere os IDs e clique em COPIAR SCRIPT.</p>
                      <p className="text-cyan-300"><span className="text-cyan-400 font-bold">3.</span> Clique em ABRIR POPUP (mesma pagina).</p>
                      <p className="text-cyan-300"><span className="text-cyan-400 font-bold">4.</span> No popup, cole o script e clique em RODAR SCRIPT.</p>
                      <p className="text-yellow-300 mt-2 font-bold">Nenhuma guia nova. O embed nao mostra o anuncio da direita (painel Premium / Anuncio 1 de 1).</p>
                    </div>
                  </div>

                  {showBookmarklet && (
                    <div className="border-t border-purple-400/20 pt-3 mt-2">
                      <p className="text-purple-400 font-bold mb-2 flex items-center gap-2">
                        <Link2 size={14} />
                        COMO USAR O BOOKMARKLET
                      </p>
                      <div className="bg-purple-400/10 rounded p-3 border border-purple-400/30 space-y-1 text-xs">
                        {BOOKMARKLET_STEPS.map((step, i) => (
                          <p key={i} className="text-purple-300">
                            <span className="text-purple-400 font-bold">{i + 1}.</span> {step}
                          </p>
                        ))}
                        <p className="text-yellow-300 mt-2 font-bold">O bookmarklet evita o bloqueio de colar do Console.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {showPlayer && embedUrl && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-3 sm:p-6">
          <div className="relative w-full max-w-5xl max-h-[95vh] overflow-hidden rounded-xl border-2 border-emerald-400/50 bg-[#121212] shadow-2xl flex flex-col">
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-emerald-400/30 bg-black/60">
              <div className="min-w-0">
                <p className="text-emerald-400 font-bold text-sm font-mono truncate">PLAYER POPUP • SEM ANUNCIO NA DIREITA</p>
                <p className="text-[10px] text-muted-foreground font-mono truncate">{siteUrl}</p>
              </div>
              <button
                onClick={() => setShowPlayer(false)}
                className="flex-shrink-0 p-2 rounded border border-emerald-400/40 text-emerald-300 hover:bg-emerald-500/20"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] min-h-0 flex-1 overflow-hidden">
              <div className="bg-black min-h-[320px] lg:min-h-[520px]">
                <iframe
                  key={embedUrl}
                  src={embedUrl}
                  title="Spotify-Plus Player"
                  width="100%"
                  height="100%"
                  style={{ minHeight: '520px', border: 0 }}
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                />
              </div>

              <div className="p-4 border-t lg:border-t-0 lg:border-l border-emerald-400/20 flex flex-col gap-3 overflow-auto">
                <p className="text-xs text-emerald-300 font-mono">
                  Cole o script gerado e rode aqui. O embed oficial nao inclui o painel Premium / Anuncio 1 de 1 da direita.
                </p>
                {scriptRan && (
                  <p className="text-[10px] text-green-400 font-bold font-mono flex items-center gap-1">
                    <CheckCircle2 size={12} /> SCRIPT RODADO NESTE POPUP
                  </p>
                )}
                <textarea
                  value={scriptPaste}
                  onChange={(e) => setScriptPaste(e.target.value)}
                  placeholder="Cole o script copiado aqui..."
                  className="flex-1 min-h-[160px] w-full px-3 py-2 bg-background border border-emerald-400/40 rounded text-[10px] font-mono text-foreground focus:outline-none focus:border-emerald-400"
                />
                <div className="grid grid-cols-1 gap-2">
                  <button
                    onClick={handleRunPastedScript}
                    disabled={!scriptPaste.trim()}
                    className="w-full px-4 py-3 font-bold text-xs transition-all flex items-center justify-center gap-2 rounded border bg-gradient-to-r from-emerald-500/40 to-green-500/40 hover:from-emerald-500/60 hover:to-green-500/60 border-emerald-400 text-emerald-200 disabled:opacity-50"
                  >
                    <Play size={14} />
                    RODAR SCRIPT NESTE POPUP
                  </button>
                  <button
                    onClick={handleCopyScript}
                    disabled={!currentDevice || !currentPersonalData}
                    className="w-full px-4 py-3 font-bold text-xs transition-all flex items-center justify-center gap-2 rounded border bg-emerald-500/10 hover:bg-emerald-500/25 border-emerald-400/60 text-emerald-300 disabled:opacity-50"
                  >
                    <TerminalSquare size={14} />
                    GERAR / COPIAR SCRIPT
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className={`border-t ${ACCENT.border} mt-16 py-8 text-center text-xs text-muted-foreground font-mono`}>
        <p>SPOTIFY-PLUS PRO v1.0 • Brave Shield • Filtro de Playlist</p>
        <p className="mt-2">Use com responsabilidade. Respeite os termos de servico de cada plataforma.</p>
      </footer>
    </div>
  );
}
