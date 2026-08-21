import ModuleGuide from '@/components/ModuleGuide';
import { MODULE_GUIDES } from '@/lib/moduleGuides';
/**
 * EmailPlus Pro - Kit completo de Email
 * Design: Cyberpunk Industrial (tema email, ciano + esmeralda)
 *
 * Agrega no mesmo perfil:
 * - Gerador multi-provedor (Outlook, Hotmail, Proton, Tuta)
 * - Persona completa (nome, telefone, data, CPF, endereço)
 * - User-Agent realista com rotação
 * - Motor Anti-Detecção 16+ técnicas
 * - Comportamento humano simulado
 * - Simulação de App Nativo (WebView)
 * - Injeção in-site (console do site real) + bookmarklet
 * - Histórico de contas e relatório de desempenho
 */

import { useState, useEffect } from 'react';
import { EMAIL_PROVIDERS, COUNTRIES, EMAIL_REGIONAL_PROFILES, generateSignupUrl, generateRandomEmail, generateEmailWithBirthday, generateEmailWithNameAndBirthday, generateMicrosoftPassword, EmailAccount } from '@/lib/emailManager';
import { generatePersonalData, PersonalData } from '@/lib/personalDataGenerator';
import { generateRandomUserAgent, generateCompleteAntiDetectionScript, generateUserAgentRotationInfo, UserAgentProfile } from '@/lib/cookieAndUserAgentManager';
import { generateAdvancedAntiDetection } from '@/lib/advancedAntiDetection';
import { generateBehaviorInjectionScript } from '@/lib/humanBehaviorSimulator';
import { generateNativeAppSimulationForProfile } from '@/lib/nativeAppSimulator';
import { saveAccountRecord, getAccountHistory, generatePerformanceReport, AccountRecord, PerformanceReport } from '@/lib/accountHistoryManager';
import { copyInjectionScript, openSiteInNewTab, wrapInSiteScript, toBookmarklet, IN_SITE_STEPS } from '@/lib/inSiteInjection';
import { Mail, Globe, Copy, ExternalLink, Plus, Trash2, Zap, RefreshCw, Shield, BarChart3, CheckCircle2, AlertCircle, Loader2, Smartphone, TerminalSquare, ClipboardCheck, User, Cpu, FileCode2, Bookmark } from 'lucide-react';
import { toast } from 'sonner';
import { useLocation } from 'wouter';

export default function EmailPlusManager() {
  const [, setLocation] = useLocation();
  const [selectedProvider, setSelectedProvider] = useState(EMAIL_PROVIDERS[0]);

  const brasilCountry = COUNTRIES.find(c => c.id === 'br') || COUNTRIES[0];
  const [selectedCountry, setSelectedCountry] = useState(brasilCountry);
  const [selectedDomain, setSelectedDomain] = useState(brasilCountry.defaultDomain);
  const [selectedRegionalProfile, setSelectedRegionalProfile] = useState(EMAIL_REGIONAL_PROFILES[0]);
  const isRegionalProvider = selectedProvider.id === 'proton' || selectedProvider.id === 'tuta';

  const [emailType, setEmailType] = useState<'name' | 'birthday' | 'combined'>('name');
  const [generatedEmail, setGeneratedEmail] = useState(generateRandomEmail());
  const [generatedPassword, setGeneratedPassword] = useState(generateMicrosoftPassword());
  const [emailAccounts, setEmailAccounts] = useState<EmailAccount[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEmail, setNewEmail] = useState('');

  const [currentPersonalData, setCurrentPersonalData] = useState<PersonalData | null>(null);
  const [currentUserAgent, setCurrentUserAgent] = useState<UserAgentProfile | null>(null);
  const [rotationInfo, setRotationInfo] = useState(generateUserAgentRotationInfo());
  const [antiFraudMode, setAntiFraudMode] = useState(true);
  const [simulateNativeApp, setSimulateNativeApp] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const [showHistory, setShowHistory] = useState(false);
  const [performanceReport, setPerformanceReport] = useState<PerformanceReport | null>(null);
  const [accountHistory, setAccountHistory] = useState<any[]>([]);

  const [injectionStatus, setInjectionStatus] = useState<'idle' | 'opening' | 'injecting' | 'success' | 'error'>('idle');
  const [injectionMessage, setInjectionMessage] = useState('');
  const [lastInjectedAt, setLastInjectedAt] = useState('');
  const [copiedScript, setCopiedScript] = useState(false);
  const [showScriptPreview, setShowScriptPreview] = useState(false);
  const [bookmarklet, setBookmarklet] = useState('');

  // Carrega contas do localStorage (chave própria do EmailPlus)
  useEffect(() => {
    const saved = localStorage.getItem('emailplus_accounts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setEmailAccounts(parsed.map((a: any) => ({
          ...a,
          createdAt: new Date(a.createdAt),
        })));
      } catch (e) {
        console.error('Erro ao carregar contas:', e);
      }
    }
  }, []);

  // Salva contas no localStorage
  useEffect(() => {
    localStorage.setItem('emailplus_accounts', JSON.stringify(emailAccounts));
  }, [emailAccounts]);

  // Carrega histórico e relatório de desempenho
  useEffect(() => {
    const history = getAccountHistory();
    setAccountHistory(history);
    const report = generatePerformanceReport();
    setPerformanceReport(report);
  }, []);

  // Atualiza domínios quando provedor muda
  useEffect(() => {
    if (selectedProvider.id === 'outlook' || selectedProvider.id === 'hotmail') {
      if (!selectedProvider.domains.includes(selectedDomain)) {
        setSelectedDomain(selectedProvider.domains[0]);
      }
    } else {
      setSelectedDomain(selectedProvider.domains[0]);
    }
  }, [selectedProvider]);

  // Regenera email e senha quando o tipo muda
  useEffect(() => {
    handleGenerateNewEmail();
  }, [emailType]);

  const handleGenerateNewEmail = () => {
    let email = '';
    switch (emailType) {
      case 'name':
        email = generateRandomEmail();
        break;
      case 'birthday':
        email = generateEmailWithBirthday();
        break;
      case 'combined':
        email = generateEmailWithNameAndBirthday();
        break;
    }
    setGeneratedEmail(email);
    setGeneratedPassword(generateMicrosoftPassword());
  };

  const getFullEmail = () => `${generatedEmail}@${selectedDomain}`;

  const handleCopyEmail = () => {
    const fullEmail = getFullEmail();
    navigator.clipboard.writeText(fullEmail);
    toast.success('Email copiado!', {
      description: fullEmail,
    });
  };

  const handleCopyEmailWithPassword = () => {
    const fullEmail = getFullEmail();
    const emailWithPassword = `${fullEmail}\n\n${generatedPassword}`;
    navigator.clipboard.writeText(emailWithPassword);
    toast.success('Email e senha copiados!', {
      description: emailWithPassword,
    });
  };

  const handleRegeneratePassword = () => {
    setGeneratedPassword(generateMicrosoftPassword());
    toast.success('Senha regenerada!');
  };

  const handleRotateUserAgent = () => {
    const newUa = generateRandomUserAgent();
    setCurrentUserAgent(newUa);
    setRotationInfo(generateUserAgentRotationInfo());
    toast.success('User-Agent rotacionado!', {
      description: newUa.device,
    });
  };

  const handleOpenSignup = () => {
    const url = generateSignupUrl(selectedProvider, selectedDomain);
    openSiteInNewTab(url);
    setInjectionStatus('injecting');
    setInjectionMessage(`${selectedProvider.name} aberto em nova guia. Cole o script no Console (F12).`);
    toast.success('Abrindo página de signup...', {
      description: `${selectedProvider.name} - ${selectedDomain}`,
    });
  };

  const handleAddAccount = () => {
    if (!newEmail.trim()) {
      toast.error('Email vazio', {
        description: 'Digite um email válido',
      });
      return;
    }

    const account: EmailAccount = {
      id: `${Date.now()}`,
      email: newEmail,
      provider: selectedProvider.id,
      country: selectedCountry.id,
      domain: selectedDomain,
      createdAt: new Date(),
      password: generatedPassword,
      status: 'created',
    };

    setEmailAccounts([...emailAccounts, account]);
    setNewEmail('');
    setShowAddForm(false);
    toast.success('Conta adicionada!', {
      description: newEmail,
    });
  };

  const handleDeleteAccount = (id: string) => {
    setEmailAccounts(emailAccounts.filter(a => a.id !== id));
    toast.success('Conta removida');
  };

  const handleCopyAccountEmailPassword = (account: EmailAccount) => {
    const text = `${account.email}\n\n${account.password || 'Sem senha'}`;
    navigator.clipboard.writeText(text);
    toast.success('Email e senha copiados!', {
      description: text,
    });
  };

  /**
   * Gera o perfil completo: email + senha + persona + User-Agent
   * e registra no histórico de contas.
   */
  const handleGenerateFullProfile = async () => {
    setIsGenerating(true);
    setInjectionStatus('idle');
    setInjectionMessage('');

    await new Promise(resolve => setTimeout(resolve, 1200));

    handleGenerateNewEmail();
    const personalData = generatePersonalData();
    const userAgent = generateRandomUserAgent();

    setCurrentPersonalData(personalData);
    setCurrentUserAgent(userAgent);
    setRotationInfo(generateUserAgentRotationInfo());
    setIsGenerating(false);

    toast.success('Perfil completo gerado!', {
      description: `${personalData.fullName} • ${userAgent.device}`,
    });
  };

  /**
   * Constrói o script de injeção in-site combinando:
   * 1. Simulação de App Nativo (WebView)
   * 2. Motor Avançado Anti-Detecção (16+ técnicas)
   * 3. Script completo anti-detecção (16 etapas)
   * 4. Comportamento humano simulado
   */
  const buildInSiteScript = (): string => {
    const userAgent = currentUserAgent || generateRandomUserAgent();
    const imei = String(Math.floor(Math.random() * 1e15)).padStart(15, '0');

    const nativeAppCode = simulateNativeApp
      ? generateNativeAppSimulationForProfile({ platform: 'gmail', userAgent: userAgent.userAgent, imei })
      : '';

    let fullCode = nativeAppCode;
    if (antiFraudMode) {
      fullCode += '\n' + generateAdvancedAntiDetection();
      fullCode += '\n' + generateCompleteAntiDetectionScript(userAgent);
      fullCode += '\n' + generateBehaviorInjectionScript({
        minDelay: 1000,
        maxDelay: 5000,
        minTypingSpeed: 80,
        maxTypingSpeed: 200,
        enableMouseMovement: true,
        enableScrolling: true,
      });
    }

    const features = [
      'Gerador de Email',
      'Dados Pessoais',
      'User-Agent',
      ...(antiFraudMode ? ['Motor Anti-Detecção 16+', 'Comportamento Humano'] : []),
      ...(simulateNativeApp ? ['App Nativo (WebView)'] : []),
    ];

    return wrapInSiteScript('EmailPlus', fullCode, features, '#00d9ff');
  };

  const saveAccountRecordForInjection = () => {
    const record: AccountRecord = {
      id: `emailplus_${Date.now()}`,
      email: getFullEmail(),
      createdAt: new Date(),
      status: 'pending',
      deviceFingerprint: currentUserAgent?.userAgent || 'n/a',
      userAgent: currentUserAgent?.userAgent || 'n/a',
      personalData: {
        name: currentPersonalData?.fullName || 'n/a',
        phone: currentPersonalData?.phone || 'n/a',
        birthDate: currentPersonalData?.birthDate || 'n/a',
        city: currentPersonalData?.city || 'n/a',
        state: currentPersonalData?.state || 'n/a',
      },
      behaviorConfig: {
        minDelay: antiFraudMode ? 1000 : 500,
        maxDelay: antiFraudMode ? 5000 : 3000,
        typingSpeed: antiFraudMode ? 150 : 100,
      },
      notes: `Anti-fraude: ${antiFraudMode ? 'Ativo' : 'Inativo'} — injeção in-site`,
    };
    saveAccountRecord(record);
  };

  const handleCopyScript = async () => {
    if (!currentPersonalData || !currentUserAgent) {
      toast.error('Gere um perfil completo primeiro!');
      return;
    }

    saveAccountRecordForInjection();

    try {
      const script = buildInSiteScript();
      const result = await copyInjectionScript(script);
      setBookmarklet(toBookmarklet(script));
      if (result.success) {
        setCopiedScript(true);
        setInjectionStatus('success');
        setInjectionMessage('Script de injeção EmailPlus copiado! Cole no Console do site oficial.');
        setLastInjectedAt(new Date().toLocaleTimeString('pt-BR'));
        toast.success('Script de injeção EmailPlus copiado!', {
          description: 'Agora abra o signup, pressione F12, cole no Console e dê Enter.',
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

  const buildRegionalProfileScript = (): string => {
    const profile = JSON.stringify({
      provider: selectedProvider.id,
      providerName: selectedProvider.name,
      ...selectedRegionalProfile,
    });

    return `(() => {
  const profile = ${profile};
  localStorage.setItem('emailplus_region_profile', JSON.stringify(profile));
  document.documentElement.lang = profile.locale;
  console.info('EmailPlus: perfil regional de referência salvo', profile);
  console.info('Limitação: este perfil não altera IP, VPN, proxy, geolocalização do navegador ou país da conexão.');
})();`;
  };

  const handleCopyRegionalProfile = async () => {
    if (!isRegionalProvider) return;
    try {
      const result = await copyInjectionScript(buildRegionalProfileScript());
      if (result.success) {
        toast.success(`Perfil regional ${selectedRegionalProfile.name} copiado!`, {
          description: `${selectedRegionalProfile.locale} • ${selectedRegionalProfile.timeZone} • ${selectedRegionalProfile.currency}`,
        });
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error('Falha ao copiar o perfil regional');
    }
  };

  const handleCopyBookmarklet = async () => {
    if (!bookmarklet) {
      toast.error('Gere e copie o script primeiro!');
      return;
    }
    try {
      await navigator.clipboard.writeText(bookmarklet);
      toast.success('Bookmarklet copiado!', {
        description: 'Crie um favorito (Ctrl+D) com o código e clique com a guia do site aberta.',
      });
    } catch {
      toast.error('Falha ao copiar o bookmarklet');
    }
  };

  const copyPersonalData = () => {
    if (!currentPersonalData) {
      toast.error('Gere um perfil completo primeiro!');
      return;
    }

    const dataText = `Nome: ${currentPersonalData.fullName}
Email: ${currentPersonalData.email}
Telefone: ${currentPersonalData.phone}
Data de Nascimento: ${currentPersonalData.birthDate}
CPF: ${currentPersonalData.cpf}
Senha: ${currentPersonalData.password}
Endereço: ${currentPersonalData.address.street}, ${currentPersonalData.address.number}
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

  const getStatusIcon = () => {
    switch (injectionStatus) {
      case 'idle': return <Loader2 size={18} />;
      case 'opening': return <Loader2 size={18} className="animate-spin" />;
      case 'injecting': return <Loader2 size={18} className="animate-spin" />;
      case 'success': return <CheckCircle2 size={18} />;
      case 'error': return <AlertCircle size={18} />;
    }
  };

  const getStatusBg = () => {
    switch (injectionStatus) {
      case 'idle': return 'bg-secondary/30 border-border';
      case 'opening': return 'bg-yellow-500/10 border-yellow-500/50';
      case 'injecting': return 'bg-yellow-500/10 border-yellow-500/50';
      case 'success': return 'bg-green-500/10 border-green-500/50';
      case 'error': return 'bg-red-500/10 border-red-500/50';
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ModuleGuide guide={MODULE_GUIDES['emailPlus']} accentClass="text-cyan-300" />
      {/* Header */}
      <div className="border-b border-cyan-400/30 bg-background/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Mail className="text-cyan-400" size={28} />
            <div>
              <h1 className="text-2xl font-bold text-cyan-400 font-mono">EMAILPLUS PRO</h1>
              <p className="text-xs text-muted-foreground font-mono">Kit Completo de Email + Anti-Detecção 16+ • v1.0</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 border border-blue-500/50 rounded transition-colors font-bold text-sm"
            >
              <BarChart3 size={16} /> HISTÓRICO
            </button>
            <button
              onClick={() => setLocation('/')}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-400 border border-cyan-500/50 rounded transition-colors font-bold text-sm"
            >
              <Zap size={16} /> DEVICE MASTER
            </button>
            <div className="text-right">
              <p className="text-cyan-400 font-bold font-mono">{emailAccounts.length}</p>
              <p className="text-xs text-muted-foreground font-mono">Contas</p>
            </div>
          </div>
        </div>
      </div>

      <main className="container py-8">
        {/* PAINEL DE STATUS DA INJEÇÃO */}
        <div className={`rounded-lg p-5 mb-8 border-2 transition-all ${
          injectionStatus === 'success' ? 'bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-green-500/50' :
          injectionStatus === 'error' ? 'bg-gradient-to-r from-red-900/30 to-rose-900/30 border-red-500/50' :
          injectionStatus !== 'idle' ? 'bg-gradient-to-r from-yellow-900/30 to-amber-900/30 border-yellow-500/50' :
          'bg-gradient-to-r from-secondary/50 to-secondary/30 border-cyan-500/30'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-foreground font-mono flex items-center gap-2">
              <TerminalSquare size={20} className={
                injectionStatus === 'success' ? 'text-green-400' :
                injectionStatus === 'error' ? 'text-red-400' :
                'text-cyan-400'
              } />
              ▌STATUS DA INJEÇÃO IN-SITE▌
            </h3>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${
              injectionStatus === 'success' ? 'bg-green-500/20 text-green-400' :
              injectionStatus === 'error' ? 'bg-red-500/20 text-red-400' :
              injectionStatus !== 'idle' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-secondary text-muted-foreground'
            }`}>
              {getStatusIcon()}
              {injectionStatus === 'idle' && 'Aguardando'}
              {injectionStatus === 'opening' && 'Abrindo...'}
              {injectionStatus === 'injecting' && 'Injetando...'}
              {injectionStatus === 'success' && '✓ Sucesso'}
              {injectionStatus === 'error' && '✗ Erro'}
            </div>
          </div>

          {injectionMessage && (
            <div className={`p-3 rounded-lg border text-sm font-mono ${getStatusBg()}`}>
              {injectionStatus === 'success' && <CheckCircle2 size={16} className="inline mr-2 text-green-400" />}
              {injectionStatus === 'error' && <AlertCircle size={16} className="inline mr-2 text-red-400" />}
              {(injectionStatus === 'opening' || injectionStatus === 'injecting') && <Loader2 size={16} className="inline mr-2 text-yellow-400 animate-spin" />}
              {injectionMessage}
              {lastInjectedAt && injectionStatus === 'success' && (
                <span className="ml-3 text-green-400/60 text-xs">• {lastInjectedAt}</span>
              )}
            </div>
          )}

          {injectionStatus === 'idle' && (
            <p className="text-muted-foreground text-xs font-mono">
              Gere o perfil completo e copie o script. Depois abra o signup do provedor e cole no Console (F12) da própria guia.
            </p>
          )}
        </div>

        {/* RELATÓRIO DE DESEMPENHO */}
        {showHistory && performanceReport && (
          <div className="rounded-lg p-6 bg-card border border-blue-400/30 mb-8">
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
            <div className="space-y-3">
              {accountHistory.slice().reverse().map(record => (
                <div key={record.id} className="flex items-center justify-between border border-blue-400/20 rounded p-3 text-xs font-mono">
                  <div className="flex-1 min-w-0">
                    <p className="text-cyan-300 font-bold truncate">{record.email}</p>
                    <p className="text-muted-foreground truncate">{record.personalData?.name || 'Sem nome'} • {record.userAgent}</p>
                  </div>
                  <span className={`ml-3 px-2 py-1 rounded text-[10px] font-bold ${
                    record.status === 'success' ? 'bg-green-500/20 text-green-400' :
                    record.status === 'fraud_detected' ? 'bg-red-500/20 text-red-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>{record.status}</span>
                </div>
              ))}
            </div>
            <button
              onClick={handleClearHistory}
              className="w-full mt-4 px-3 py-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 border border-red-500/50 rounded transition-colors font-bold text-xs"
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
              {/* Modo Anti-Fraude */}
              <div className="border-2 border-cyan-400/50 rounded-lg p-4 bg-card">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-cyan-400 font-mono flex items-center gap-2">
                    <Shield size={14} /> MODO ANTI-FRAUDE
                  </label>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    antiFraudMode ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>{antiFraudMode ? 'ATIVO' : 'INATIVO'}</span>
                </div>
                <p className="text-[11px] text-muted-foreground font-mono mb-3">
                  Adiciona ao script: Motor 16+ técnicas, script completo anti-detecção e comportamento humano.
                </p>
                <button
                  onClick={() => setAntiFraudMode(!antiFraudMode)}
                  className="w-full px-3 py-2 bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-400 border border-cyan-500/50 rounded transition-colors font-bold text-xs"
                >
                  {antiFraudMode ? 'DESATIVAR' : 'ATIVAR'}
                </button>
              </div>

              {/* Simulação de App Nativo */}
              <div className="border-2 border-blue-400/50 rounded-lg p-4 bg-card">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-blue-400 font-mono flex items-center gap-2">
                    <Smartphone size={14} /> APP NATIVO (WEBVIEW)
                  </label>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    simulateNativeApp ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>{simulateNativeApp ? 'ATIVO' : 'INATIVO'}</span>
                </div>
                <p className="text-[11px] text-muted-foreground font-mono mb-3">
                  Simula metadados de WebView/app no perfil local (não acessa serviços externos).
                </p>
                <button
                  onClick={() => setSimulateNativeApp(!simulateNativeApp)}
                  className="w-full px-3 py-2 bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 border border-blue-500/50 rounded transition-colors font-bold text-xs"
                >
                  {simulateNativeApp ? 'DESATIVAR' : 'ATIVAR'}
                </button>
              </div>

              {/* Provider Selection */}
              <div className="border border-cyan-400/30 rounded-lg p-4 bg-card">
                <label className="text-xs font-bold text-cyan-400 font-mono mb-2 block">PROVEDOR</label>
                <select
                  value={selectedProvider.id}
                  onChange={(e) => {
                    const provider = EMAIL_PROVIDERS.find(p => p.id === e.target.value);
                    if (provider) setSelectedProvider(provider);
                  }}
                  className="w-full px-3 py-2 bg-secondary border border-cyan-400/30 rounded text-foreground font-mono text-sm"
                >
                  {EMAIL_PROVIDERS.map(provider => (
                    <option key={provider.id} value={provider.id}>{provider.name}</option>
                  ))}
                </select>
              </div>

              {isRegionalProvider && (
                <div className="border-2 border-emerald-400/40 rounded-lg p-4 bg-card">
                  <label className="text-xs font-bold text-emerald-400 font-mono mb-2 block">PERFIL REGIONAL EUROPEU</label>
                  <select
                    value={selectedRegionalProfile.id}
                    onChange={(e) => {
                      const profile = EMAIL_REGIONAL_PROFILES.find((item) => item.id === e.target.value);
                      if (profile) setSelectedRegionalProfile(profile);
                    }}
                    className="w-full px-3 py-2 bg-secondary border border-emerald-400/30 rounded text-foreground font-mono text-sm"
                  >
                    {EMAIL_REGIONAL_PROFILES.map((profile) => (
                      <option key={profile.id} value={profile.id}>{profile.name} — {profile.locale}</option>
                    ))}
                  </select>
                  <p className="mt-2 text-[11px] leading-5 text-muted-foreground font-mono">
                    Referência local: {selectedRegionalProfile.timeZone} • {selectedRegionalProfile.currency} • {selectedRegionalProfile.dateFormat}.
                    Isso não altera IP, VPN, proxy ou a geolocalização real da conexão.
                  </p>
                </div>
              )}

              {/* Country Selection */}
              <div className="border border-cyan-400/30 rounded-lg p-4 bg-card">
                <label className="text-xs font-bold text-cyan-400 font-mono mb-2 block">PAÍS</label>
                <select
                  value={selectedCountry.id}
                  onChange={(e) => {
                    const country = COUNTRIES.find(c => c.id === e.target.value);
                    if (country) {
                      setSelectedCountry(country);
                      setSelectedDomain(country.defaultDomain);
                    }
                  }}
                  className="w-full px-3 py-2 bg-secondary border border-cyan-400/30 rounded text-foreground font-mono text-sm"
                >
                  {COUNTRIES.map(country => (
                    <option key={country.id} value={country.id}>{country.name}</option>
                  ))}
                </select>
              </div>

              {/* Domain Selection */}
              {(selectedProvider.id === 'outlook' || selectedProvider.id === 'hotmail') && (
                <div className="border border-cyan-400/30 rounded-lg p-4 bg-card">
                  <label className="text-xs font-bold text-cyan-400 font-mono mb-2 block">DOMÍNIO</label>
                  <select
                    value={selectedDomain}
                    onChange={(e) => setSelectedDomain(e.target.value)}
                    className="w-full px-3 py-2 bg-secondary border border-cyan-400/30 rounded text-foreground font-mono text-sm"
                  >
                    {selectedProvider.domains.map(domain => (
                      <option key={domain} value={domain}>{domain}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Email Type Selection */}
              <div className="border border-cyan-400/30 rounded-lg p-4 bg-card">
                <label className="text-xs font-bold text-cyan-400 font-mono mb-2 block">TIPO DE EMAIL</label>
                <div className="space-y-2">
                  {[
                    { value: 'name', label: 'Nome + Números' },
                    { value: 'birthday', label: 'Data de Nascimento' },
                    { value: 'combined', label: 'Nome + Data' },
                  ].map(type => (
                    <label key={type.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="emailType"
                        value={type.value}
                        checked={emailType === type.value}
                        onChange={(e) => setEmailType(e.target.value as any)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-mono">{type.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Generated Email */}
              <div className="border-2 border-cyan-400 rounded-lg p-4 bg-secondary/50">
                <p className="text-xs text-cyan-400 font-mono mb-2">EMAIL GERADO</p>
                <p className="text-lg font-bold text-cyan-300 font-mono break-all mb-2">
                  {getFullEmail()}
                </p>
                <p className="text-xs text-muted-foreground font-mono mb-3">SENHA GERADA (copiada ao adicionar conta)</p>
                <p className="text-lg font-bold text-green-400 font-mono break-all mb-4">
                  {generatedPassword}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleGenerateNewEmail}
                    className="flex-1 px-3 py-2 bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-400 border border-cyan-500/50 rounded transition-colors font-bold text-xs"
                  >
                    <Zap size={14} className="inline mr-1" /> GERAR
                  </button>
                  <button
                    onClick={handleRegeneratePassword}
                    className="flex-1 px-3 py-2 bg-green-500/20 hover:bg-green-500/40 text-green-400 border border-green-500/50 rounded transition-colors font-bold text-xs"
                  >
                    <RefreshCw size={14} className="inline mr-1" /> SENHA
                  </button>
                </div>
              </div>

              {/* Copy Buttons */}
              <div className="space-y-2">
                <button
                  onClick={handleCopyEmail}
                  className="w-full px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-400 border border-cyan-500/50 rounded transition-colors font-bold text-sm flex items-center justify-center gap-2"
                >
                  <Copy size={16} /> COPIAR EMAIL
                </button>
                <button
                  onClick={handleCopyEmailWithPassword}
                  className="w-full px-4 py-2 bg-green-500/20 hover:bg-green-500/40 text-green-400 border border-green-500/50 rounded transition-colors font-bold text-sm flex items-center justify-center gap-2"
                >
                  <Copy size={16} /> EMAIL + SENHA
                </button>
                <button
                  onClick={handleOpenSignup}
                  className="w-full px-4 py-2 bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 border border-blue-500/50 rounded transition-colors font-bold text-sm flex items-center justify-center gap-2"
                >
                  <ExternalLink size={16} /> ABRIR SIGNUP
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Profile & Tools */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <button
                onClick={handleGenerateFullProfile}
                disabled={isGenerating}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-400 border-2 border-cyan-400 rounded font-mono font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Zap size={20} />
                {isGenerating ? 'GERANDO PERFIL COMPLETO...' : 'GERAR PERFIL COMPLETO (EMAIL + PERSONA + USER-AGENT)'}
              </button>
              {isGenerating && (
                <div className="mt-3 p-3 bg-secondary/50 rounded border border-cyan-400/30">
                  <div className="text-xs text-cyan-400 font-mono mb-2">SCAN EM PROGRESSO</div>
                  <div className="h-1 bg-secondary rounded overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-cyan-400 to-emerald-500 animate-pulse" />
                  </div>
                </div>
              )}
            </div>

            {!currentPersonalData && !currentUserAgent ? (
              <div className="border border-cyan-400/30 rounded-lg p-12 bg-card text-center">
                <Mail size={48} className="mx-auto mb-4 text-cyan-400/50" />
                <p className="text-muted-foreground font-mono">Gere o perfil completo para ver persona, User-Agent e scripts</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Personal Data Card */}
                {currentPersonalData && (
                  <div className="border border-green-400/30 rounded-lg p-6 bg-card">
                    <h3 className="text-lg font-bold text-green-400 mb-4 font-mono flex items-center gap-2">
                      <User size={18} /> ▌DADOS PESSOAIS▌
                    </h3>
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
                      <div>
                        <p className="text-muted-foreground mb-1">CPF</p>
                        <p className="text-foreground font-bold">{currentPersonalData.cpf}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">SENHA</p>
                        <p className="text-green-400 font-bold break-all">{currentPersonalData.password}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-muted-foreground mb-1">ENDEREÇO</p>
                        <p className="text-foreground font-bold">
                          {currentPersonalData.address.street}, {currentPersonalData.address.number} - {currentPersonalData.address.neighborhood}
                          <span className="text-muted-foreground"> • {currentPersonalData.zipCode} - {currentPersonalData.city}, {currentPersonalData.state}</span>
                        </p>
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

                {/* User-Agent Card */}
                {currentUserAgent && (
                  <div className="border border-purple-400/30 rounded-lg p-6 bg-card">
                    <h3 className="text-lg font-bold text-purple-400 mb-4 font-mono flex items-center gap-2">
                      <Cpu size={18} /> ▌USER-AGENT & ROTAÇÃO▌
                    </h3>
                    <div className="grid grid-cols-2 gap-4 mb-4 text-xs font-mono">
                      <div>
                        <p className="text-muted-foreground mb-1">DISPOSITIVO</p>
                        <p className="text-foreground font-bold">{currentUserAgent.device}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">PLATAFORMA</p>
                        <p className="text-foreground font-bold">{currentUserAgent.platform} • {currentUserAgent.osVersion}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-muted-foreground mb-1">NAVEGADOR</p>
                        <p className="text-foreground font-bold">{currentUserAgent.browserVersion}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-muted-foreground mb-1">USER-AGENT</p>
                        <p className="text-cyan-300 font-bold break-all text-[11px]">{currentUserAgent.userAgent}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-muted-foreground mb-1">PRÓXIMA ROTAÇÃO</p>
                        <p className="text-foreground font-bold flex items-center gap-2">
                          <Globe size={14} className="text-purple-400" />
                          {rotationInfo.next.device} • intervalo {(rotationInfo.rotationInterval / 60000).toFixed(0)} min
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleRotateUserAgent}
                      className="w-full px-3 py-2 bg-purple-500/20 hover:bg-purple-500/40 text-purple-400 border border-purple-500/50 rounded transition-colors font-bold text-xs"
                    >
                      <RefreshCw size={14} className="inline mr-2" />
                      ROTACIONAR USER-AGENT
                    </button>
                  </div>
                )}

                {/* Injection Section */}
                <div className="p-4 bg-secondary/30 rounded border border-cyan-400/30 font-mono text-xs space-y-3">
                  <p className="text-green-400 font-bold mb-2 flex items-center gap-2">
                    ▶ INJEÇÃO IN-SITE (CONSOLE DO SITE REAL)
                    {injectionStatus === 'success' && copiedScript && (
                      <span className="px-2 py-0.5 bg-green-500/30 text-green-400 border border-green-500/50 rounded text-[10px]">
                        SCRIPT COPIADO
                      </span>
                    )}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={handleCopyScript}
                      disabled={!currentPersonalData || !currentUserAgent}
                      className="w-full px-4 py-4 font-bold text-sm transition-all flex items-center justify-center gap-3 rounded border bg-gradient-to-r from-cyan-500/30 to-emerald-500/30 hover:from-cyan-500/50 hover:to-emerald-500/50 border-cyan-400 text-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <TerminalSquare size={18} />
                      {isRegionalProvider ? 'COPIAR SCRIPT DO PROVEDOR' : 'COPIAR SCRIPT DE INJEÇÃO'}
                    </button>
                    {isRegionalProvider && (
                      <button
                        onClick={handleCopyRegionalProfile}
                        disabled={!currentPersonalData || !currentUserAgent}
                        className="w-full px-4 py-4 font-bold text-sm transition-all flex items-center justify-center gap-3 rounded border bg-emerald-500/20 hover:bg-emerald-500/40 border-emerald-400 text-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Globe size={18} />
                        COPIAR PERFIL REGIONAL ({selectedRegionalProfile.name.toUpperCase()})
                      </button>
                    )}
                    <button
                      onClick={handleCopyBookmarklet}
                      className="w-full px-4 py-4 font-bold text-sm transition-all flex items-center justify-center gap-3 rounded border bg-blue-500/20 hover:bg-blue-500/40 border-blue-400 text-blue-300"
                    >
                      <Bookmark size={18} />
                      COPIAR BOOKMARKLET
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={handleOpenSignup}
                      className="w-full px-4 py-4 font-bold text-sm transition-all flex items-center justify-center gap-3 rounded border bg-blue-500/20 hover:bg-blue-500/40 border-blue-400 text-blue-300"
                    >
                      <ExternalLink size={18} />
                      ABRIR SIGNUP (NOVA GUIA)
                    </button>
                    <button
                      onClick={() => setShowScriptPreview(!showScriptPreview)}
                      disabled={!currentPersonalData || !currentUserAgent}
                      className="w-full px-4 py-4 font-bold text-sm transition-all flex items-center justify-center gap-3 rounded border bg-secondary hover:bg-secondary/60 border-border text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FileCode2 size={18} />
                      {showScriptPreview ? 'OCULTAR SCRIPT' : 'VER SCRIPT GERADO'}
                    </button>
                  </div>

                  {showScriptPreview && currentPersonalData && currentUserAgent && (
                    <pre className="bg-black/40 border border-cyan-400/20 rounded p-3 text-[10px] text-cyan-200/80 overflow-auto max-h-64 whitespace-pre-wrap break-all">
                      {buildInSiteScript()}
                    </pre>
                  )}

                  <div className="border-t border-cyan-400/20 pt-3 mt-2">
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
                      <p className="text-yellow-300 mt-2 font-bold">⚠️ O script roda NO DOMÍNIO do provedor (sem aba intermediária, sem redirect).</p>
                    </div>
                  </div>
                </div>

                {/* Saved Accounts */}
                <div className="flex items-center justify-between mb-4 mt-8">
                  <h2 className="text-xl font-bold text-cyan-400 font-mono">CONTAS SALVAS</h2>
                  <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-400 border border-cyan-500/50 rounded transition-colors font-bold text-sm flex items-center gap-2"
                  >
                    <Plus size={16} /> ADICIONAR
                  </button>
                </div>

                {showAddForm && (
                  <div className="border border-cyan-400/30 rounded-lg p-4 bg-card mb-4">
                    <input
                      type="text"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="Digite o email"
                      className="w-full px-3 py-2 bg-secondary border border-cyan-400/30 rounded text-foreground font-mono text-sm mb-2"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleAddAccount}
                        className="flex-1 px-4 py-2 bg-green-500/20 hover:bg-green-500/40 text-green-400 border border-green-500/50 rounded transition-colors font-bold text-sm"
                      >
                        Adicionar
                      </button>
                      <button
                        onClick={() => setShowAddForm(false)}
                        className="flex-1 px-4 py-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 border border-red-500/50 rounded transition-colors font-bold text-sm"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                {emailAccounts.length === 0 ? (
                  <div className="border border-cyan-400/30 rounded-lg p-12 bg-card text-center">
                    <Mail size={48} className="mx-auto mb-4 text-cyan-400/50" />
                    <p className="text-muted-foreground font-mono">Nenhuma conta salva</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {emailAccounts.map(account => (
                      <div key={account.id} className="border border-cyan-400/30 rounded-lg p-4 bg-card">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <p className="font-bold text-cyan-400 font-mono break-all">{account.email}</p>
                            <p className="text-xs text-muted-foreground font-mono mt-1">
                              {account.provider} • {account.domain}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDeleteAccount(account.id)}
                            className="px-3 py-1 text-red-400 hover:bg-red-500/20 rounded transition-colors font-bold text-xs"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        {account.password && (
                          <p className="text-sm text-green-400 font-mono mb-3 break-all">
                            Senha: {account.password}
                          </p>
                        )}
                        <p className="text-xs text-emerald-400 font-mono mb-3">
                          ✓ Status: {account.status === 'created' ? 'Criada' : account.status || 'Ativa'} • Dados persistidos em localStorage
                        </p>
                        <button
                          onClick={() => handleCopyAccountEmailPassword(account)}
                          className="w-full px-3 py-2 bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-400 border border-cyan-500/50 rounded transition-colors font-bold text-xs flex items-center justify-center gap-2"
                        >
                          <Copy size={14} /> COPIAR EMAIL + SENHA
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-cyan-400/30 mt-16 py-8 text-center text-xs text-muted-foreground font-mono">
        <p>EmailPlus Pro v1.0 • Kit completo de Email + Anti-Detecção 16+</p>
        <p className="mt-2">⚠️ Use responsavelmente. Respeite os termos de serviço dos provedores.</p>
      </footer>
    </div>
  );
}
