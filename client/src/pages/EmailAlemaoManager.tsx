import ModuleGuide from '@/components/ModuleGuide';
import AliasExtensionPanel, { type AliasPanelConfig } from '@/components/AliasExtensionPanel';
import { MODULE_GUIDES } from '@/lib/moduleGuides';
import { useState, useEffect } from 'react';
import {
  generateRandomEmail,
  generateEmailWithBirthday,
  generateEmailWithNameAndBirthday,
  generateMicrosoftPassword,
  EmailAccount,
} from '@/lib/emailManager';
import {
  ALEMAO_EMAIL_PROVIDERS,
  ALEMAO_COUNTRIES,
  generateAlemaoSignupUrl,
  generateIcloudUrl,
  getDefaultDomain,
  DUCK_EMAIL_PROTECTION_URL,
  DUCK_EMAIL_START_URL,
  DUCK_EMAIL_LOGIN_URL,
  SIMPLELOGIN_HOME_URL,
  SIMPLELOGIN_START_URL,
  SIMPLELOGIN_LOGIN_URL,
  FIREFOX_RELAY_HOME_URL,
  FIREFOX_RELAY_START_URL,
  FIREFOX_RELAY_LOGIN_URL,
  ADDY_HOME_URL,
  ADDY_START_URL,
  ADDY_LOGIN_URL,
  generatePersonalDuckAddress,
  generatePrivateDuckAddress,
  generatePersonalSimpleLoginAddress,
  generatePrivateSimpleLoginAddress,
  generatePersonalFirefoxRelayAddress,
  generatePrivateFirefoxRelayAddress,
  generatePersonalAddyAddress,
  generatePrivateAddyAddress,
  isAliasExtensionId,
  type AliasAddress,
  type AliasExtensionId,
} from '@/lib/emailAlemaoManager';
import { Mail, Copy, ExternalLink, Plus, Trash2, Zap, RefreshCw, Apple } from 'lucide-react';
import { toast } from 'sonner';
import { useLocation } from 'wouter';

interface AliasPanelState {
  forwardTo: string;
  personalName: string;
  personalAddress: string;
  privateService: string;
  privateAddress: string;
  addresses: AliasAddress[];
}

const STORAGE_KEYS: Record<AliasExtensionId, { addresses: string; forward: string }> = {
  duck: { addresses: 'emailalemao_duck_addresses', forward: 'emailalemao_duck_forward' },
  simplelogin: { addresses: 'emailalemao_simplelogin_addresses', forward: 'emailalemao_simplelogin_forward' },
  firefoxrelay: { addresses: 'emailalemao_firefoxrelay_addresses', forward: 'emailalemao_firefoxrelay_forward' },
  addy: { addresses: 'emailalemao_addy_addresses', forward: 'emailalemao_addy_forward' },
};

function createInitialAliasState(id: AliasExtensionId): AliasPanelState {
  if (id === 'simplelogin') {
    return {
      forwardTo: '',
      personalName: '',
      personalAddress: generatePersonalSimpleLoginAddress('seunome'),
      privateService: '',
      privateAddress: generatePrivateSimpleLoginAddress(),
      addresses: [],
    };
  }
  if (id === 'firefoxrelay') {
    return {
      forwardTo: '',
      personalName: '',
      personalAddress: generatePersonalFirefoxRelayAddress('seunome'),
      privateService: '',
      privateAddress: generatePrivateFirefoxRelayAddress(),
      addresses: [],
    };
  }
  if (id === 'addy') {
    return {
      forwardTo: '',
      personalName: 'seunome',
      personalAddress: generatePersonalAddyAddress('seunome'),
      privateService: '',
      privateAddress: generatePrivateAddyAddress('amazon', 'seunome'),
      addresses: [],
    };
  }
  return {
    forwardTo: '',
    personalName: '',
    personalAddress: generatePersonalDuckAddress('seunome'),
    privateService: '',
    privateAddress: generatePrivateDuckAddress(),
    addresses: [],
  };
}

const ALIAS_PANEL_CONFIG: Record<AliasExtensionId, AliasPanelConfig> = {
  duck: {
    title: 'EXTENSAO DUCKDUCK',
    subtitle: 'DuckDuckGo Email Protection • @duck.com encaminha para o seu Gmail',
    howItWorks: 'O site ve um endereco @duck.com. O DuckDuckGo encaminha a mensagem para o seu Gmail. Gratuito. Voce pode criar enderecos privados unicos e desativar so o que estiver com spam.',
    exampleAlias: 'algumacoisa@duck.com',
    personalTitle: '1. PERSONAL DUCK ADDRESS',
    personalHelp: 'Seu endereco pessoal, no formato seunome@duck.com. Use como identidade principal. Encaminha tudo para o Gmail configurado acima.',
    personalPlaceholder: 'seunome',
    privateTitle: '2. PRIVATE DUCK ADDRESS',
    privateHelp: 'Gerado automaticamente, tipo amaze-gem-spider@duck.com. Um endereco diferente por servico (Amazon, Facebook, loja, newsletter). Se um receber spam, desative so aquele.',
    privatePlaceholder: 'servico (ex: amazon, facebook, loja-x)',
    savedTitle: 'ENDERECOS DUCK SALVOS',
    emptyLabel: 'Nenhum endereco Duck salvo',
    startLabel: 'CRIAR CONTA DUCK',
    loginLabel: 'ENTRAR NO DUCK',
    homeLabel: 'ABRIR EMAIL PROTECTION',
    startUrl: DUCK_EMAIL_START_URL,
    loginUrl: DUCK_EMAIL_LOGIN_URL,
    homeUrl: DUCK_EMAIL_PROTECTION_URL,
    theme: {
      border: 'border-emerald-400/40',
      title: 'text-emerald-400',
      muted: 'text-emerald-300',
      button: 'bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 border border-emerald-500/50',
      buttonAlt: 'bg-emerald-500/10 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40',
      save: 'bg-green-500/20 hover:bg-green-500/40 text-green-400 border border-green-500/50',
    },
  },
  simplelogin: {
    title: 'EXTENSAO SIMPLELOGIN',
    subtitle: 'SimpleLogin (Proton) • @aleeas.com encaminha para o seu Gmail',
    howItWorks: 'Voce cria aliases como random@aleeas.com. O SimpleLogin encaminha para o Gmail. A grande vantagem e desativar ou excluir cada alias individualmente. Pertence ao ecossistema Proton.',
    exampleAlias: 'random@aleeas.com',
    personalTitle: '1. PERSONAL SIMPLELOGIN',
    personalHelp: 'Seu alias pessoal no formato seunome@aleeas.com. Use como identidade principal. Encaminha tudo para o Gmail configurado acima.',
    personalPlaceholder: 'seunome',
    privateTitle: '2. PRIVATE SIMPLELOGIN',
    privateHelp: 'Alias aleatorio tipo k7m2n9p1@aleeas.com. Um endereco diferente por servico. Se um receber spam, desative so aquele.',
    privatePlaceholder: 'servico (ex: amazon, facebook, loja-x)',
    savedTitle: 'ALIASES SIMPLELOGIN SALVOS',
    emptyLabel: 'Nenhum alias SimpleLogin salvo',
    startLabel: 'CRIAR CONTA SIMPLELOGIN',
    loginLabel: 'ENTRAR NO SIMPLELOGIN',
    homeLabel: 'ABRIR SIMPLELOGIN',
    startUrl: SIMPLELOGIN_START_URL,
    loginUrl: SIMPLELOGIN_LOGIN_URL,
    homeUrl: SIMPLELOGIN_HOME_URL,
    theme: {
      border: 'border-violet-400/40',
      title: 'text-violet-400',
      muted: 'text-violet-300',
      button: 'bg-violet-500/20 hover:bg-violet-500/40 text-violet-300 border border-violet-500/50',
      buttonAlt: 'bg-violet-500/10 hover:bg-violet-500/30 text-violet-300 border border-violet-500/40',
      save: 'bg-green-500/20 hover:bg-green-500/40 text-green-400 border border-green-500/50',
    },
  },
  firefoxrelay: {
    title: 'EXTENSAO FIREFOX RELAY',
    subtitle: 'Mozilla Firefox Relay • @mozmail.com mascara o endereco real',
    howItWorks: 'O Firefox Relay cria enderecos mascarados @mozmail.com que encaminham para a sua caixa real. Feito para evitar fornecer o Gmail verdadeiro aos sites.',
    exampleAlias: 'mascara@mozmail.com',
    personalTitle: '1. PERSONAL RELAY',
    personalHelp: 'Seu endereco mascarado pessoal, no formato seunome@mozmail.com. Encaminha tudo para o Gmail configurado acima.',
    personalPlaceholder: 'seunome',
    privateTitle: '2. PRIVATE RELAY',
    privateHelp: 'Mascara gerada automaticamente, tipo brave.k8m2n1@mozmail.com. Use um endereco diferente por site. Se receber spam, desative so aquele.',
    privatePlaceholder: 'servico (ex: amazon, facebook, newsletter)',
    savedTitle: 'MASCARAS RELAY SALVAS',
    emptyLabel: 'Nenhuma mascara Firefox Relay salva',
    startLabel: 'CRIAR CONTA RELAY',
    loginLabel: 'ENTRAR NO RELAY',
    homeLabel: 'ABRIR FIREFOX RELAY',
    startUrl: FIREFOX_RELAY_START_URL,
    loginUrl: FIREFOX_RELAY_LOGIN_URL,
    homeUrl: FIREFOX_RELAY_HOME_URL,
    theme: {
      border: 'border-sky-400/40',
      title: 'text-sky-400',
      muted: 'text-sky-300',
      button: 'bg-sky-500/20 hover:bg-sky-500/40 text-sky-300 border border-sky-500/50',
      buttonAlt: 'bg-sky-500/10 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40',
      save: 'bg-green-500/20 hover:bg-green-500/40 text-green-400 border border-green-500/50',
    },
  },
  addy: {
    title: 'EXTENSAO ADDY.IO',
    subtitle: 'Addy.io • aliases por servico encaminhando para o Gmail',
    howItWorks: 'Crie muitos aliases e controle o encaminhamento. Formato por servico: amazon@seunome.anonaddy.com, facebook@seunome.anonaddy.com, aliexpress@, newsletter@.',
    exampleAlias: 'amazon@seunome.anonaddy.com',
    personalTitle: '1. PERSONAL ADDY',
    personalHelp: 'Seu endereco pessoal no formato seunome@anonaddy.me. Use como identidade principal. Encaminha tudo para o Gmail configurado acima.',
    personalPlaceholder: 'seunome',
    privateTitle: '2. PRIVATE ADDY POR SERVICO',
    privateHelp: 'Alias nomeado por servico, tipo amazon@seunome.anonaddy.com. Ideal para Amazon, Facebook, AliExpress, newsletter. Desative so o que estiver com spam.',
    privatePlaceholder: 'servico (ex: amazon, facebook, aliexpress, newsletter)',
    privateNeedsUsername: true,
    savedTitle: 'ALIASES ADDY.IO SALVOS',
    emptyLabel: 'Nenhum alias Addy.io salvo',
    startLabel: 'CRIAR CONTA ADDY.IO',
    loginLabel: 'ENTRAR NO ADDY.IO',
    homeLabel: 'ABRIR ADDY.IO',
    startUrl: ADDY_START_URL,
    loginUrl: ADDY_LOGIN_URL,
    homeUrl: ADDY_HOME_URL,
    theme: {
      border: 'border-orange-400/40',
      title: 'text-orange-400',
      muted: 'text-orange-300',
      button: 'bg-orange-500/20 hover:bg-orange-500/40 text-orange-300 border border-orange-500/50',
      buttonAlt: 'bg-orange-500/10 hover:bg-orange-500/30 text-orange-300 border border-orange-500/40',
      save: 'bg-green-500/20 hover:bg-green-500/40 text-green-400 border border-green-500/50',
    },
  },
};

const ALIAS_LABEL: Record<AliasExtensionId, string> = {
  duck: 'Duck',
  simplelogin: 'SimpleLogin',
  firefoxrelay: 'Firefox Relay',
  addy: 'Addy.io',
};

export default function EmailAlemaoManager() {
  const [, setLocation] = useLocation();
  const [selectedProvider, setSelectedProvider] = useState(ALEMAO_EMAIL_PROVIDERS[0]);

  const brasilCountry = ALEMAO_COUNTRIES.find((c) => c.id === 'br') || ALEMAO_COUNTRIES[0];
  const [selectedCountry, setSelectedCountry] = useState(() => brasilCountry);
  const [selectedDomain, setSelectedDomain] = useState(() => getDefaultDomain(ALEMAO_EMAIL_PROVIDERS[0].id, brasilCountry));

  const [emailType, setEmailType] = useState<'name' | 'birthday' | 'combined'>('name');
  const [generatedEmail, setGeneratedEmail] = useState(generateRandomEmail());
  const [generatedPassword, setGeneratedPassword] = useState(generateMicrosoftPassword());
  const [emailAccounts, setEmailAccounts] = useState<EmailAccount[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEmail, setNewEmail] = useState('');

  const [aliasState, setAliasState] = useState<Record<AliasExtensionId, AliasPanelState>>({
    duck: createInitialAliasState('duck'),
    simplelogin: createInitialAliasState('simplelogin'),
    firefoxrelay: createInitialAliasState('firefoxrelay'),
    addy: createInitialAliasState('addy'),
  });

  useEffect(() => {
    const saved = localStorage.getItem('emailalemao_accounts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setEmailAccounts(parsed.map((a: EmailAccount) => ({
          ...a,
          createdAt: new Date(a.createdAt),
        })));
      } catch (e) {
        console.error('Erro ao carregar contas:', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('emailalemao_accounts', JSON.stringify(emailAccounts));
  }, [emailAccounts]);

  useEffect(() => {
    setAliasState((prev) => {
      const next = { ...prev };
      (Object.keys(STORAGE_KEYS) as AliasExtensionId[]).forEach((id) => {
        const keys = STORAGE_KEYS[id];
        const savedAddresses = localStorage.getItem(keys.addresses);
        if (savedAddresses) {
          try {
            const parsed = JSON.parse(savedAddresses);
            next[id] = {
              ...next[id],
              addresses: parsed.map((item: AliasAddress) => ({
                ...item,
                createdAt: new Date(item.createdAt),
              })),
            };
          } catch (e) {
            console.error(`Erro ao carregar enderecos ${id}:`, e);
          }
        }
        const savedForward = localStorage.getItem(keys.forward);
        if (savedForward) {
          next[id] = { ...next[id], forwardTo: savedForward };
        }
      });
      return next;
    });
  }, []);

  useEffect(() => {
    (Object.keys(STORAGE_KEYS) as AliasExtensionId[]).forEach((id) => {
      localStorage.setItem(STORAGE_KEYS[id].addresses, JSON.stringify(aliasState[id].addresses));
      localStorage.setItem(STORAGE_KEYS[id].forward, aliasState[id].forwardTo);
    });
  }, [aliasState]);

  useEffect(() => {
    const nextDomain = getDefaultDomain(selectedProvider.id, selectedCountry);
    if (selectedProvider.domains.includes(selectedDomain)) return;
    setSelectedDomain(nextDomain);
  }, [selectedProvider, selectedCountry, selectedDomain]);

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

  const handleOpenSignup = () => {
    const url = generateAlemaoSignupUrl(selectedProvider, selectedCountry, selectedDomain);
    window.open(url, '_blank');
    toast.success('Abrindo pagina de signup no pais selecionado...', {
      description: `${selectedProvider.name} • ${selectedCountry.name} • ${selectedDomain}`,
    });
  };

  const handleOpenIcloud = () => {
    const url = generateIcloudUrl(selectedCountry);
    window.open(url, '_blank');
    toast.success('Abrindo iCloud.com...', {
      description: `Use a Apple ID criada • ${selectedCountry.name}`,
    });
  };

  const handleAddAccount = () => {
    if (!newEmail.trim()) {
      toast.error('Email vazio', {
        description: 'Digite um email valido',
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
    setEmailAccounts(emailAccounts.filter((a) => a.id !== id));
    toast.success('Conta removida');
  };

  const handleCopyAccountEmailPassword = (account: EmailAccount) => {
    const text = `${account.email}\n\n${account.password || 'Sem senha'}`;
    navigator.clipboard.writeText(text);
    toast.success('Email e senha copiados!', {
      description: text,
    });
  };

  const updateAlias = (id: AliasExtensionId, patch: Partial<AliasPanelState>) => {
    setAliasState((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  };

  const handleGeneratePersonal = (id: AliasExtensionId) => {
    const name = aliasState[id].personalName;
    if (id === 'simplelogin') updateAlias(id, { personalAddress: generatePersonalSimpleLoginAddress(name) });
    else if (id === 'firefoxrelay') updateAlias(id, { personalAddress: generatePersonalFirefoxRelayAddress(name) });
    else if (id === 'addy') updateAlias(id, { personalAddress: generatePersonalAddyAddress(name) });
    else updateAlias(id, { personalAddress: generatePersonalDuckAddress(name) });
  };

  const handleGeneratePrivate = (id: AliasExtensionId) => {
    if (id === 'simplelogin') updateAlias(id, { privateAddress: generatePrivateSimpleLoginAddress() });
    else if (id === 'firefoxrelay') updateAlias(id, { privateAddress: generatePrivateFirefoxRelayAddress() });
    else if (id === 'addy') updateAlias(id, { privateAddress: generatePrivateAddyAddress(aliasState[id].privateService, aliasState[id].personalName) });
    else updateAlias(id, { privateAddress: generatePrivateDuckAddress() });
  };

  const handleCopyAlias = (address: string, id: AliasExtensionId) => {
    navigator.clipboard.writeText(address);
    toast.success(`Endereco ${ALIAS_LABEL[id]} copiado!`, {
      description: address,
    });
  };

  const handleSaveAlias = (id: AliasExtensionId, type: AliasAddress['type'], address: string, service: string) => {
    if (!address.trim()) {
      toast.error(`Gere um endereco ${ALIAS_LABEL[id]} primeiro`);
      return;
    }
    const item: AliasAddress = {
      id: `${Date.now()}`,
      type,
      address,
      forwardTo: aliasState[id].forwardTo.trim() || 'seuemail@gmail.com',
      service: service.trim(),
      createdAt: new Date(),
      enabled: true,
    };
    updateAlias(id, { addresses: [item, ...aliasState[id].addresses] });
    toast.success(type === 'personal' ? `Personal ${ALIAS_LABEL[id]} salvo` : `Private ${ALIAS_LABEL[id]} salvo`, {
      description: address,
    });
  };

  const handleToggleAlias = (id: AliasExtensionId, itemId: string) => {
    updateAlias(id, {
      addresses: aliasState[id].addresses.map((item) => (
        item.id === itemId ? { ...item, enabled: !item.enabled } : item
      )),
    });
  };

  const handleDeleteAlias = (id: AliasExtensionId, itemId: string) => {
    updateAlias(id, { addresses: aliasState[id].addresses.filter((item) => item.id !== itemId) });
    toast.success(`Endereco ${ALIAS_LABEL[id]} removido`);
  };

  const handleOpenAlias = (url: string, label: string) => {
    window.open(url, '_blank');
    toast.success(label);
  };

  const signupPreview = generateAlemaoSignupUrl(selectedProvider, selectedCountry, selectedDomain);
  const activeAliasId = isAliasExtensionId(selectedProvider.id) ? selectedProvider.id : null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ModuleGuide guide={MODULE_GUIDES['emailAlemao']} accentClass="text-amber-300" />
      <div className="border-b border-amber-400/30 bg-background/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Mail className="text-amber-400" size={28} />
            <div>
              <h1 className="text-2xl font-bold text-amber-400 font-mono">EMAIL(3) ALEMAO</h1>
              <p className="text-xs text-muted-foreground font-mono">Apple ID / iCloud • Duck • SimpleLogin • Firefox Relay • Addy.io • v1.4</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={() => setLocation('/')}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500/20 hover:bg-amber-500/40 text-amber-400 border border-amber-500/50 rounded transition-colors font-bold text-sm"
            >
              <Zap size={16} /> DEVICE MASTER
            </button>
            <div className="text-right">
              <p className="text-amber-400 font-bold font-mono">{emailAccounts.length}</p>
              <p className="text-xs text-muted-foreground font-mono">Contas</p>
            </div>
          </div>
        </div>
      </div>

      <main className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <div className="border border-amber-400/30 rounded-lg p-4 bg-card">
                <label className="text-xs font-bold text-amber-400 font-mono mb-2 block">PROVEDOR</label>
                <select
                  value={selectedProvider.id}
                  onChange={(e) => {
                    const provider = ALEMAO_EMAIL_PROVIDERS.find((p) => p.id === e.target.value);
                    if (provider) {
                      setSelectedProvider(provider);
                      setSelectedDomain(getDefaultDomain(provider.id, selectedCountry));
                    }
                  }}
                  className="w-full px-3 py-2 bg-secondary border border-amber-400/30 rounded text-foreground font-mono text-sm"
                >
                  {ALEMAO_EMAIL_PROVIDERS.map((provider) => (
                    <option key={provider.id} value={provider.id}>{provider.name}</option>
                  ))}
                </select>
                <p className="mt-2 text-[11px] leading-5 text-muted-foreground font-mono">
                  {selectedProvider.signupNote}
                </p>
              </div>

              {selectedProvider.id === 'apple' && (
              <>
              <div className="border border-amber-400/30 rounded-lg p-4 bg-card">
                <label className="text-xs font-bold text-amber-400 font-mono mb-2 block">PAIS</label>
                <select
                  value={selectedCountry.id}
                  onChange={(e) => {
                    const country = ALEMAO_COUNTRIES.find((c) => c.id === e.target.value);
                    if (country) {
                      setSelectedCountry(country);
                      setSelectedDomain(getDefaultDomain(selectedProvider.id, country));
                    }
                  }}
                  className="w-full px-3 py-2 bg-secondary border border-amber-400/30 rounded text-foreground font-mono text-sm"
                >
                  {ALEMAO_COUNTRIES.map((country) => (
                    <option key={country.id} value={country.id}>{country.name}</option>
                  ))}
                </select>
                <p className="mt-2 text-[11px] leading-5 text-muted-foreground font-mono">
                  Signup abre em {selectedCountry.name} ({selectedCountry.locale}).
                </p>
              </div>

              <div className="border border-amber-400/30 rounded-lg p-4 bg-card">
                <label className="text-xs font-bold text-amber-400 font-mono mb-2 block">DOMINIO</label>
                <select
                  value={selectedDomain}
                  onChange={(e) => setSelectedDomain(e.target.value)}
                  className="w-full px-3 py-2 bg-secondary border border-amber-400/30 rounded text-foreground font-mono text-sm"
                >
                  {selectedProvider.domains.map((domain) => (
                    <option key={domain} value={domain}>@{domain}</option>
                  ))}
                </select>
              </div>

              <div className="border border-amber-400/30 rounded-lg p-4 bg-card">
                <label className="text-xs font-bold text-amber-400 font-mono mb-2 block">TIPO DE EMAIL</label>
                <div className="space-y-2">
                  {[
                    { value: 'name', label: 'Nome + Numeros' },
                    { value: 'birthday', label: 'Data de Nascimento' },
                    { value: 'combined', label: 'Nome + Data' },
                  ].map((type) => (
                    <label key={type.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="emailType"
                        value={type.value}
                        checked={emailType === type.value}
                        onChange={(e) => setEmailType(e.target.value as 'name' | 'birthday' | 'combined')}
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-mono">{type.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="border-2 border-amber-400 rounded-lg p-4 bg-secondary/50">
                <p className="text-xs text-amber-400 font-mono mb-2">EMAIL GERADO</p>
                <p className="text-lg font-bold text-amber-300 font-mono break-all mb-2">
                  {getFullEmail()}
                </p>
                <p className="text-xs text-muted-foreground font-mono mb-3">SENHA GERADA (copiada ao adicionar conta)</p>
                <p className="text-lg font-bold text-green-400 font-mono break-all mb-4">
                  {generatedPassword}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleGenerateNewEmail}
                    className="flex-1 px-3 py-2 bg-amber-500/20 hover:bg-amber-500/40 text-amber-400 border border-amber-500/50 rounded transition-colors font-bold text-xs"
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

              <div className="space-y-2">
                <button
                  onClick={handleCopyEmail}
                  className="w-full px-4 py-2 bg-amber-500/20 hover:bg-amber-500/40 text-amber-400 border border-amber-500/50 rounded transition-colors font-bold text-sm flex items-center justify-center gap-2"
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
                  className="w-full px-4 py-2 bg-red-500/20 hover:bg-red-500/40 text-red-300 border border-red-500/50 rounded transition-colors font-bold text-sm flex items-center justify-center gap-2"
                >
                  <ExternalLink size={16} /> ABRIR SIGNUP ({selectedCountry.name.toUpperCase()})
                </button>
                {selectedProvider.id === 'apple' && (
                  <button
                    onClick={handleOpenIcloud}
                    className="w-full px-4 py-2 bg-slate-500/20 hover:bg-slate-500/40 text-slate-200 border border-slate-500/50 rounded transition-colors font-bold text-sm flex items-center justify-center gap-2"
                  >
                    <Apple size={16} /> ABRIR ICLOUD.COM
                  </button>
                )}
                <p className="text-[10px] text-muted-foreground font-mono break-all leading-4">
                  {signupPreview}
                </p>
              </div>
              </>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-8">
            {activeAliasId && (
              <AliasExtensionPanel
                config={ALIAS_PANEL_CONFIG[activeAliasId]}
                forwardTo={aliasState[activeAliasId].forwardTo}
                onForwardToChange={(value) => updateAlias(activeAliasId, { forwardTo: value })}
                personalName={aliasState[activeAliasId].personalName}
                onPersonalNameChange={(value) => updateAlias(activeAliasId, { personalName: value })}
                personalAddress={aliasState[activeAliasId].personalAddress}
                privateService={aliasState[activeAliasId].privateService}
                onPrivateServiceChange={(value) => updateAlias(activeAliasId, { privateService: value })}
                privateAddress={aliasState[activeAliasId].privateAddress}
                addresses={aliasState[activeAliasId].addresses}
                onGeneratePersonal={() => handleGeneratePersonal(activeAliasId)}
                onGeneratePrivate={() => handleGeneratePrivate(activeAliasId)}
                onCopy={(address) => handleCopyAlias(address, activeAliasId)}
                onSave={(type, address, service) => handleSaveAlias(activeAliasId, type, address, service)}
                onToggle={(itemId) => handleToggleAlias(activeAliasId, itemId)}
                onDelete={(itemId) => handleDeleteAlias(activeAliasId, itemId)}
                onOpen={handleOpenAlias}
              />
            )}

            {selectedProvider.id === 'apple' && (
            <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-amber-400 font-mono">CONTAS SALVAS</h2>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/40 text-amber-400 border border-amber-500/50 rounded transition-colors font-bold text-sm flex items-center gap-2"
              >
                <Plus size={16} /> ADICIONAR
              </button>
            </div>

            {showAddForm && (
              <div className="border border-amber-400/30 rounded-lg p-4 bg-card mb-4">
                <input
                  type="text"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Digite o email"
                  className="w-full px-3 py-2 bg-secondary border border-amber-400/30 rounded text-foreground font-mono text-sm mb-2"
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
              <div className="border border-amber-400/30 rounded-lg p-12 bg-card text-center">
                <Mail size={48} className="mx-auto mb-4 text-amber-400/50" />
                <p className="text-muted-foreground font-mono">Nenhuma conta salva</p>
              </div>
            ) : (
              <div className="space-y-3">
                {emailAccounts.map((account) => (
                  <div key={account.id} className="border border-amber-400/30 rounded-lg p-4 bg-card">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <p className="font-bold text-amber-400 font-mono break-all">{account.email}</p>
                        <p className="text-xs text-muted-foreground font-mono mt-1">
                          {account.provider} • {account.country} • {account.domain}
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
                      Status: {account.status === 'created' ? 'Criada' : account.status || 'Ativa'} • Dados persistidos em localStorage
                    </p>
                    <button
                      onClick={() => handleCopyAccountEmailPassword(account)}
                      className="w-full px-3 py-2 bg-amber-500/20 hover:bg-amber-500/40 text-amber-400 border border-amber-500/50 rounded transition-colors font-bold text-xs flex items-center justify-center gap-2"
                    >
                      <Copy size={14} /> COPIAR EMAIL + SENHA
                    </button>
                  </div>
                ))}
              </div>
            )}
            </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
