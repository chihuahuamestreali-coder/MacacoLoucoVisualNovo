import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import ModuleGuide from '@/components/ModuleGuide';
import type { ModuleGuide as ModuleGuideData } from '@/lib/moduleGuides';
import { generatePersonalData } from '@/lib/personalDataGenerator';
import { generateAdvancedAntiDetection } from '@/lib/advancedAntiDetection';
import { generateRandomUserAgent, generateCompleteAntiDetectionScript } from '@/lib/cookieAndUserAgentManager';
import { generateBehaviorInjectionScript } from '@/lib/humanBehaviorSimulator';
import { generateNativeAppSimulationForProfile } from '@/lib/nativeAppSimulator';
import { saveAccountRecord, getAccountHistory, generatePerformanceReport } from '@/lib/accountHistoryManager';
import { copyInjectionScript, openSiteInNewTab, wrapInSiteScript, IN_SITE_STEPS } from '@/lib/inSiteInjection';
import { Zap, Copy, ExternalLink, Shield, BarChart3, Trash2, ClipboardCheck, AlertCircle, CheckCircle2, Loader2, Smartphone, Globe, Fingerprint, TerminalSquare } from 'lucide-react';
import { toast } from 'sonner';

export type ManusStyleConfig = {
  siteKey: string;
  siteName: string;
  siteTitle: string;
  tagline: string;
  siteUrl: string;
  guide: ModuleGuideData;
  accent: {
    text: string;
    border: string;
    bg: string;
    gradientFrom: string;
    gradientTo: string;
    hex: string;
  };
  platform: string;
  generateDevice: () => any;
  buildScriptBody: (device: any, persona: any, userAgent: any, opts: { simulateNativeApp: boolean; antiFraudMode: boolean }) => string;
  deviceInfo?: (device: any) => { label: string; value: string; highlight?: boolean }[];
};

export default function ManusStyleInjectionPage({ config }: { config: ManusStyleConfig }) {
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

  const { siteKey, siteName, siteTitle, tagline, siteUrl, guide, accent, platform, generateDevice, buildScriptBody, deviceInfo } = config;

  useEffect(() => {
    setAccountHistory(getAccountHistory());
    setPerformanceReport(generatePerformanceReport());
  }, []);

  const handleGenerateDevice = async () => {
    setIsGenerating(true);
    setInjectionStatus('idle');
    setInjectionMessage('');
    await new Promise(resolve => setTimeout(resolve, 1200));

    const newDevice = generateDevice();
    const personalData = generatePersonalData();
    const userAgent = generateRandomUserAgent();

    setCurrentDevice(newDevice);
    setCurrentPersonalData(personalData);
    setCurrentUserAgent(userAgent);
    setIsGenerating(false);

    toast.success('Novo dispositivo gerado!', {
      description: `${newDevice.deviceName} • ${personalData.fullName}`,
    });
  };

  const buildInSiteScript = (): string => {
    const body = buildScriptBody(currentDevice, currentPersonalData, currentUserAgent, {
      simulateNativeApp,
      antiFraudMode,
    });

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
      ? generateNativeAppSimulationForProfile({ platform: platform as any, userAgent: currentUserAgent?.userAgent || currentDevice.userAgent, imei: currentDevice.imei || currentDevice.fingerprint })
      : '';

    const fullCode = [advancedAntiDetectionCode, antiDetectionCode, nativeAppCode, behaviorCode, body].filter(Boolean).join('\n');

    const features = [
      'Motor Anti-Detecção 16+',
      ...(simulateNativeApp ? ['App Nativo'] : []),
      ...(antiFraudMode ? ['Comportamento Humano'] : []),
    ];

    return wrapInSiteScript(siteName, fullCode, features, accent.hex);
  };

  const saveAccountRecordForInjection = () => {
    if (!currentDevice || !currentPersonalData) return;
    saveAccountRecord({
      id: `account_${Date.now()}`,
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
      notes: `Anti-fraude: ${antiFraudMode ? 'Ativo' : 'Inativo'} — injeção in-site (${siteName})`,
    });
  };

  const handleCopyScript = async () => {
    if (!currentDevice || !currentPersonalData) {
      toast.error('Gere um dispositivo primeiro!');
      return;
    }

    saveAccountRecordForInjection();

    try {
      const script = buildInSiteScript();
      const result = await copyInjectionScript(script);
      if (result.success) {
        setCopiedScript(true);
        setInjectionStatus('success');
        setInjectionMessage(`Script de injeção ${siteName} copiado! Cole no Console do site oficial.`);
        setLastInjectedAt(new Date().toLocaleTimeString('pt-BR'));
        toast.success(`Script de injeção ${siteName} copiado!`, {
          description: 'Agora abra o site, pressione F12, cole no Console e dê Enter.',
        });
      } else {
        setInjectionStatus('error');
        setInjectionMessage(result.message);
        toast.error(result.message);
      }
    } catch (e) {
      setInjectionStatus('error');
      setInjectionMessage('Erro ao copiar o script de injeção');
      console.error(e);
      toast.error('Erro ao copiar o script de injeção');
    }
  };

  const handleOpenSite = () => {
    openSiteInNewTab(siteUrl);
    setInjectionStatus('injecting');
    setInjectionMessage(`${siteName} aberto em nova guia. Cole o script no Console (F12).`);
    toast.info(`${siteName} aberto em nova guia`, {
      description: 'Pressione F12 → Console → cole o script → Enter.',
    });
  };

  const copyPersonalData = () => {
    if (!currentPersonalData) {
      toast.error('Gere um dispositivo primeiro!');
      return;
    }
    const dataText = `Nome: ${currentPersonalData.fullName}
Email: ${currentPersonalData.email}
Telefone: ${currentPersonalData.phone}
Data de Nascimento: ${currentPersonalData.birthDate}
Endereço: ${currentPersonalData.address}
Cidade: ${currentPersonalData.city}
Estado: ${currentPersonalData.state}
CEP: ${currentPersonalData.zipCode}`;
    navigator.clipboard.writeText(dataText);
    toast.success('Dados pessoais copiados!', {
      description: 'Cole nos campos do formulário',
    });
  };

  const handleClearHistory = () => {
    if (confirm('Tem certeza que deseja limpar todo o histórico de contas?')) {
      localStorage.removeItem('manus_account_history');
      setAccountHistory([]);
      setPerformanceReport(null);
      toast.success('Histórico limpo!');
    }
  };

  const deviceFields = deviceInfo && currentDevice ? deviceInfo(currentDevice) : [];

  return (
    <div className="min-h-screen bg-background text-foreground font-mono">
      <ModuleGuide guide={guide} accentClass={accent.text} />

      {/* Background Grid Effect */}
      <div className="fixed inset-0 pointer-events-none opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(0deg, transparent 24%, rgba(0, 217, 255, 0.05) 25%, rgba(0, 217, 255, 0.05) 26%, transparent 27%, transparent 74%, rgba(0, 217, 255, 0.05) 75%, rgba(0, 217, 255, 0.05) 76%, transparent 77%, transparent),
              linear-gradient(90deg, transparent 24%, rgba(0, 217, 255, 0.05) 25%, rgba(0, 217, 255, 0.05) 26%, transparent 27%, transparent 74%, rgba(0, 217, 255, 0.05) 75%, rgba(0, 217, 255, 0.05) 76%, transparent 77%, transparent)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Header */}
      <header className={`border-b ${accent.border} bg-background/80 backdrop-blur-sm sticky top-0 z-50`}>
        <div className="container max-w-7xl mx-auto px-4 py-4 lg:py-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="text-center lg:text-left">
              <h1 className={`text-2xl lg:text-4xl font-bold ${accent.text} font-mono mb-1`}>
                ▌{siteTitle}▌
              </h1>
              <p className="text-xs lg:text-sm text-muted-foreground font-mono">
                {tagline}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-400/20 hover:bg-blue-400/40 text-blue-400 border border-blue-400/50 rounded transition-all font-bold text-xs"
              >
                <BarChart3 size={16} />
                HISTÓRICO
              </button>
              <button
                onClick={() => setLocation('/')}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-400/20 hover:bg-cyan-400/40 text-cyan-400 border border-cyan-400/50 rounded transition-all font-bold text-xs neon-glow"
              >
                ← DEVICE MASTER
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-7xl mx-auto px-4 py-8 relative z-10">
        {/* Info Banner */}
        <div className="neon-glow-purple rounded-lg p-4 mb-8 bg-secondary/50 border-2 border-purple-500/50">
          <div className="flex gap-3">
            <Shield size={20} className="text-purple-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-purple-400 mb-1">🛡️ Modo Anti-Fraude</h3>
              <p className="text-sm text-foreground font-mono mb-2">
                {antiFraudMode ? '✓ ATIVO' : '✗ INATIVO'} - Simula comportamento humano realista para evitar detecção
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

        {/* PAINEL DE STATUS DA INJEÇÃO */}
        <div className={`rounded-lg p-5 mb-8 border-2 transition-all ${
          injectionStatus === 'success' ? 'bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-green-500/50' :
          injectionStatus === 'error' ? 'bg-gradient-to-r from-red-900/30 to-rose-900/30 border-red-500/50' :
          injectionStatus !== 'idle' ? 'bg-gradient-to-r from-yellow-900/30 to-amber-900/30 border-yellow-500/50' :
          'bg-gradient-to-r from-secondary/50 to-secondary/30 border-purple-500/30'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-foreground font-mono flex items-center gap-2">
              <TerminalSquare size={20} className={injectionStatus === 'success' ? 'text-green-400' : injectionStatus === 'error' ? 'text-red-400' : 'text-cyan-400'} />
              ▌STATUS DA INJEÇÃO▌
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
              {injectionStatus === 'success' && '✓ Sucesso'}
              {injectionStatus === 'error' && '✗ Erro'}
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
              Clique em "ABRIR SITE + INJETAR" para abrir uma nova aba do site com o device já preparado.
            </p>
          )}
        </div>

        {showHistory && performanceReport && (
          <div className="neon-glow rounded-lg p-6 bg-card border border-blue-400/30 mb-8">
            <h2 className="text-lg font-bold text-blue-400 mb-4 font-mono">▌RELATÓRIO DE DESEMPENHO▌</h2>
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
              LIMPAR HISTÓRICO
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Generator */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <div className="neon-glow rounded-lg p-6 bg-card">
                <h2 className={`text-xl font-bold ${accent.text} mb-4 font-mono`}>▌GERADOR▌</h2>

                <button
                  onClick={handleGenerateDevice}
                  disabled={isGenerating}
                  className="w-full mb-4 flex items-center justify-center gap-2 px-6 py-4 bg-purple-400/20 hover:bg-purple-400/40 text-purple-400 border-2 border-purple-400 rounded font-mono font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed neon-glow"
                >
                  <Zap size={20} />
                  {isGenerating ? 'GERANDO...' : 'GERAR NOVO DISPOSITIVO'}
                </button>

                {isGenerating && (
                  <div className="mb-4 p-3 bg-secondary/50 rounded border border-purple-400/30">
                    <div className="text-xs text-purple-400 font-mono mb-2">SCAN EM PROGRESSO</div>
                    <div className="h-1 bg-secondary rounded overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-400 to-pink-500 animate-pulse" />
                    </div>
                  </div>
                )}

                <div className="p-3 bg-green-500/10 rounded border border-green-500/30 text-xs text-green-400 font-mono mb-4">
                  <p className="font-bold mb-1">💡 DICA:</p>
                  <p>Ative o modo anti-fraude para maximizar o sucesso das criações!</p>
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground font-mono">Cada dispositivo inclui:</p>
                  <ul className="text-xs text-foreground font-mono space-y-1 ml-2">
                    <li>✓ Dados pessoais realistas</li>
                    <li>✓ User-Agent diverso</li>
                    <li>✓ Comportamento humano</li>
                    <li>✓ Anti-detecção ativa</li>
                    <li>✓ Cookies e sessão do site</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Device Info */}
          <div className="lg:col-span-2">
            {!currentDevice ? (
              <div className="neon-glow rounded-lg p-12 bg-card text-center">
                <div className="text-6xl mb-4">◆</div>
                <h3 className={`text-xl font-bold ${accent.text} mb-2 font-mono`}>NENHUM DISPOSITIVO</h3>
                <p className="text-muted-foreground font-mono">Clique em "Gerar Novo Dispositivo" para começar</p>
              </div>
            ) : (
              <div className="space-y-4">
                <label className="flex items-start gap-3 border border-blue-400/30 rounded-md p-4 bg-secondary/20 cursor-pointer">
                  <input type="checkbox" checked={simulateNativeApp} onChange={(event) => setSimulateNativeApp(event.target.checked)} className="mt-1" />
                  <div>
                    <div className="font-semibold text-blue-200">Simulação local de app {siteName}</div>
                    <p className="text-xs text-muted-foreground mt-1">Adiciona metadados fictícios de WebView/app ao perfil local. Não acessa nem altera serviços externos.</p>
                  </div>
                </label>

                {/* Device Card */}
                <div className="neon-glow rounded-lg p-6 bg-card border border-purple-400/30">
                  <h3 className={`text-lg font-bold ${accent.text} mb-4 font-mono`}>
                    ▌{currentDevice.deviceName}▌
                  </h3>
                  <div className="grid grid-cols-2 gap-4 mb-6 text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <Smartphone size={14} className="text-purple-400" />
                      <div>
                        <p className="text-muted-foreground mb-1">MODELO</p>
                        <p className="text-foreground font-bold">{currentDevice.model}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe size={14} className="text-purple-400" />
                      <div>
                        <p className="text-muted-foreground mb-1">FABRICANTE</p>
                        <p className="text-foreground font-bold">{currentDevice.manufacturer}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 rounded-sm bg-purple-400/30" />
                      <div>
                        <p className="text-muted-foreground mb-1">RESOLUÇÃO</p>
                        <p className="text-foreground font-bold">{currentDevice.resolution}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 rounded-sm bg-purple-400/30" />
                      <div>
                        <p className="text-muted-foreground mb-1">RAM</p>
                        <p className="text-foreground font-bold">{currentDevice.ramMb}GB</p>
                      </div>
                    </div>
                    {deviceFields.map((field, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-3.5 h-3.5 rounded-sm bg-purple-400/30" />
                        <div className="min-w-0">
                          <p className="text-muted-foreground mb-1">{field.label}</p>
                          <p className={`${field.highlight ? 'text-green-400' : 'text-foreground'} font-bold break-all text-[10px]`}>{field.value}</p>
                        </div>
                      </div>
                    ))}
                    <div className="col-span-2 flex items-center gap-2">
                      <Fingerprint size={14} className="text-purple-400" />
                      <div>
                        <p className="text-muted-foreground mb-1">FINGERPRINT</p>
                        <p className="text-foreground font-bold break-all text-[10px]">{currentDevice.fingerprint}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Personal Data Card */}
                {currentPersonalData && (
                  <div className="neon-glow rounded-lg p-6 bg-card border border-green-400/30">
                    <h3 className="text-lg font-bold text-green-400 mb-4 font-mono">▌DADOS PESSOAIS▌</h3>
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
                        <p className="text-muted-foreground mb-1">LOCALIZAÇÃO</p>
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

                {/* Injection Section */}
                <div className="p-4 bg-secondary/30 rounded border border-purple-400/30 font-mono text-xs space-y-3">
                  <p className="text-green-400 font-bold mb-2 flex items-center gap-2">
                    ▶ INJEÇÃO DE DEVICE (IN-SITE)
                    {injectionStatus === 'success' && copiedScript && (
                      <span className="px-2 py-0.5 bg-green-500/30 text-green-400 border border-green-500/50 rounded text-[10px]">
                        SCRIPT COPIADO
                      </span>
                    )}
                  </p>

                  {/* BOTÕES - INJEÇÃO IN-SITE */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={handleCopyScript}
                      disabled={!currentDevice || !currentPersonalData}
                      className="w-full px-4 py-4 font-bold text-sm transition-all flex items-center justify-center gap-3 rounded border bg-gradient-to-r from-purple-500/30 to-cyan-500/30 hover:from-purple-500/50 hover:to-cyan-500/50 border-cyan-400 text-cyan-300 neon-glow disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <TerminalSquare size={18} />
                      COPIAR SCRIPT DE INJEÇÃO
                    </button>
                    <button
                      onClick={handleOpenSite}
                      disabled={!currentDevice || !currentPersonalData}
                      className="w-full px-4 py-4 font-bold text-sm transition-all flex items-center justify-center gap-3 rounded border bg-purple-500/20 hover:bg-purple-500/40 border-purple-400 text-purple-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ExternalLink size={18} />
                      ABRIR SITE (NOVA GUIA)
                    </button>
                  </div>

                  {/* Como funciona */}
                  <div className="border-t border-purple-400/20 pt-3 mt-2">
                    <p className="text-cyan-400 font-bold mb-2 flex items-center gap-2">
                      <ClipboardCheck size={14} />
                      COMO INJETAR NO SITE REAL
                    </p>
                    <div className="bg-cyan-400/10 rounded p-3 border border-cyan-400/30 space-y-1 text-xs">
                      {IN_SITE_STEPS.map((step, i) => (
                        <p key={i} className="text-cyan-300">
                          <span className="text-cyan-400 font-bold">{i + 1}.</span> {step}
                        </p>
                      ))}
                      <p className="text-yellow-300 mt-2 font-bold">⚠️ O script roda NO DOMÍNIO {siteUrl} (sem aba intermediária, sem redirect).</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={`border-t ${accent.border} mt-16 py-8 text-center text-xs text-muted-foreground font-mono`}>
        <p>{siteTitle} PRO v1.0 • Anti-Fraude Avançado</p>
        <p className="mt-2">⚠️ Use responsavelmente. Respeite os termos de serviço de cada plataforma.</p>
      </footer>
    </div>
  );
}
