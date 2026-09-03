import ModuleGuide from '@/components/ModuleGuide';
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
} from '@/lib/emailAlemaoManager';
import { Mail, Copy, ExternalLink, Plus, Trash2, Zap, RefreshCw, Apple } from 'lucide-react';
import { toast } from 'sonner';
import { useLocation } from 'wouter';

export default function EmailAlemaoManager() {
  const [, setLocation] = useLocation();
  const [selectedProvider, setSelectedProvider] = useState(ALEMAO_EMAIL_PROVIDERS[0]);

  const brasilCountry = ALEMAO_COUNTRIES.find((c) => c.id === 'br') || ALEMAO_COUNTRIES[0];
  const [selectedCountry, setSelectedCountry] = useState(brasilCountry);
  const [selectedDomain, setSelectedDomain] = useState(getDefaultDomain(ALEMAO_EMAIL_PROVIDERS[0].id, brasilCountry));

  const [emailType, setEmailType] = useState<'name' | 'birthday' | 'combined'>('name');
  const [generatedEmail, setGeneratedEmail] = useState(generateRandomEmail());
  const [generatedPassword, setGeneratedPassword] = useState(generateMicrosoftPassword());
  const [emailAccounts, setEmailAccounts] = useState<EmailAccount[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEmail, setNewEmail] = useState('');

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

  const signupPreview = generateAlemaoSignupUrl(selectedProvider, selectedCountry, selectedDomain);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ModuleGuide guide={MODULE_GUIDES['emailAlemao']} accentClass="text-amber-300" />
      <div className="border-b border-amber-400/30 bg-background/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Mail className="text-amber-400" size={28} />
            <div>
              <h1 className="text-2xl font-bold text-amber-400 font-mono">EMAIL(3) ALEMAO</h1>
              <p className="text-xs text-muted-foreground font-mono">Apple ID / iCloud • v1.2</p>
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
            </div>
          </div>

          <div className="lg:col-span-2">
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
          </div>
        </div>
      </main>
    </div>
  );
}
