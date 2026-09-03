import { Mail, Copy, ExternalLink, Plus, Trash2, Zap, EyeOff, Shield } from 'lucide-react';
import type { AliasAddress } from '@/lib/emailAlemaoManager';

export interface AliasPanelTheme {
  border: string;
  title: string;
  muted: string;
  button: string;
  buttonAlt: string;
  save: string;
}

export interface AliasPanelConfig {
  title: string;
  subtitle: string;
  howItWorks: string;
  exampleAlias: string;
  personalTitle: string;
  personalHelp: string;
  personalPlaceholder: string;
  privateTitle: string;
  privateHelp: string;
  privatePlaceholder: string;
  privateNeedsUsername?: boolean;
  savedTitle: string;
  emptyLabel: string;
  startLabel: string;
  loginLabel: string;
  homeLabel: string;
  startUrl: string;
  loginUrl: string;
  homeUrl: string;
  theme: AliasPanelTheme;
}

interface AliasExtensionPanelProps {
  config: AliasPanelConfig;
  forwardTo: string;
  onForwardToChange: (value: string) => void;
  personalName: string;
  onPersonalNameChange: (value: string) => void;
  personalAddress: string;
  privateService: string;
  onPrivateServiceChange: (value: string) => void;
  privateAddress: string;
  addresses: AliasAddress[];
  onGeneratePersonal: () => void;
  onGeneratePrivate: () => void;
  onCopy: (address: string) => void;
  onSave: (type: AliasAddress['type'], address: string, service: string) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onOpen: (url: string, label: string) => void;
}

export default function AliasExtensionPanel({
  config,
  forwardTo,
  onForwardToChange,
  personalName,
  onPersonalNameChange,
  personalAddress,
  privateService,
  onPrivateServiceChange,
  privateAddress,
  addresses,
  onGeneratePersonal,
  onGeneratePrivate,
  onCopy,
  onSave,
  onToggle,
  onDelete,
  onOpen,
}: AliasExtensionPanelProps) {
  const t = config.theme;

  return (
    <div className={`border-2 ${t.border} rounded-lg p-5 bg-card`}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h2 className={`text-xl font-bold ${t.title} font-mono flex items-center gap-2`}>
            <Shield size={20} /> {config.title}
          </h2>
          <p className="text-xs text-muted-foreground font-mono mt-1">{config.subtitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
        <div className={`border ${t.border} rounded-lg p-4 bg-secondary/30`}>
          <p className={`text-xs font-bold ${t.muted} font-mono mb-2`}>COMO FUNCIONA</p>
          <p className="text-[12px] leading-5 text-muted-foreground font-mono">{config.howItWorks}</p>
          <p className={`mt-3 text-[11px] leading-5 ${t.muted} font-mono break-all`}>
            {forwardTo.trim() || 'seuemail@gmail.com'}
            <br />↑
            <br />{config.exampleAlias}
          </p>
        </div>
        <div className={`border ${t.border} rounded-lg p-4 bg-secondary/30`}>
          <p className={`text-xs font-bold ${t.muted} font-mono mb-2`}>GMAIL DE DESTINO</p>
          <input
            type="text"
            value={forwardTo}
            onChange={(e) => onForwardToChange(e.target.value)}
            placeholder="seuemail@gmail.com"
            className={`w-full px-3 py-2 bg-secondary border ${t.border} rounded text-foreground font-mono text-sm mb-3`}
          />
          <div className="space-y-2">
            <button
              onClick={() => onOpen(config.startUrl, config.startLabel)}
              className={`w-full px-3 py-2 ${t.button} rounded transition-colors font-bold text-xs flex items-center justify-center gap-2`}
            >
              <ExternalLink size={14} /> {config.startLabel}
            </button>
            <button
              onClick={() => onOpen(config.loginUrl, config.loginLabel)}
              className={`w-full px-3 py-2 ${t.buttonAlt} rounded transition-colors font-bold text-xs flex items-center justify-center gap-2`}
            >
              <ExternalLink size={14} /> {config.loginLabel}
            </button>
            <button
              onClick={() => onOpen(config.homeUrl, config.homeLabel)}
              className={`w-full px-3 py-2 ${t.buttonAlt} rounded transition-colors font-bold text-xs flex items-center justify-center gap-2`}
            >
              <ExternalLink size={14} /> {config.homeLabel}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
        <div className={`border ${t.border} rounded-lg p-4 bg-secondary/20`}>
          <p className={`text-xs font-bold ${t.muted} font-mono mb-1`}>{config.personalTitle}</p>
          <p className="text-[11px] leading-5 text-muted-foreground font-mono mb-3">{config.personalHelp}</p>
          <input
            type="text"
            value={personalName}
            onChange={(e) => onPersonalNameChange(e.target.value)}
            placeholder={config.personalPlaceholder}
            className={`w-full px-3 py-2 bg-secondary border ${t.border} rounded text-foreground font-mono text-sm mb-2`}
          />
          <p className={`text-sm font-bold ${t.muted} font-mono break-all mb-3`}>{personalAddress}</p>
          <div className="flex gap-2 mb-2">
            <button
              onClick={onGeneratePersonal}
              className={`flex-1 px-3 py-2 ${t.button} rounded transition-colors font-bold text-xs`}
            >
              <Zap size={14} className="inline mr-1" /> GERAR
            </button>
            <button
              onClick={() => onCopy(personalAddress)}
              className={`flex-1 px-3 py-2 ${t.buttonAlt} rounded transition-colors font-bold text-xs`}
            >
              <Copy size={14} className="inline mr-1" /> COPIAR
            </button>
          </div>
          <button
            onClick={() => onSave('personal', personalAddress, 'pessoal')}
            className={`w-full px-3 py-2 ${t.save} rounded transition-colors font-bold text-xs`}
          >
            <Plus size={14} className="inline mr-1" /> SALVAR PERSONAL
          </button>
        </div>

        <div className={`border ${t.border} rounded-lg p-4 bg-secondary/20`}>
          <p className={`text-xs font-bold ${t.muted} font-mono mb-1`}>{config.privateTitle}</p>
          <p className="text-[11px] leading-5 text-muted-foreground font-mono mb-3">{config.privateHelp}</p>
          <input
            type="text"
            value={privateService}
            onChange={(e) => onPrivateServiceChange(e.target.value)}
            placeholder={config.privatePlaceholder}
            className={`w-full px-3 py-2 bg-secondary border ${t.border} rounded text-foreground font-mono text-sm mb-2`}
          />
          <p className={`text-sm font-bold ${t.muted} font-mono break-all mb-3`}>{privateAddress}</p>
          <div className="flex gap-2 mb-2">
            <button
              onClick={onGeneratePrivate}
              className={`flex-1 px-3 py-2 ${t.button} rounded transition-colors font-bold text-xs`}
            >
              <Zap size={14} className="inline mr-1" /> GERAR
            </button>
            <button
              onClick={() => onCopy(privateAddress)}
              className={`flex-1 px-3 py-2 ${t.buttonAlt} rounded transition-colors font-bold text-xs`}
            >
              <Copy size={14} className="inline mr-1" /> COPIAR
            </button>
          </div>
          <button
            onClick={() => onSave('private', privateAddress, privateService)}
            className={`w-full px-3 py-2 ${t.save} rounded transition-colors font-bold text-xs`}
          >
            <Plus size={14} className="inline mr-1" /> SALVAR PRIVATE
          </button>
        </div>
      </div>

      <div>
        <h3 className={`text-sm font-bold ${t.title} font-mono mb-3`}>{config.savedTitle}</h3>
        {addresses.length === 0 ? (
          <div className={`border ${t.border} rounded-lg p-6 text-center`}>
            <p className="text-muted-foreground font-mono text-xs flex items-center justify-center gap-2">
              <Mail size={14} /> {config.emptyLabel}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {addresses.map((item) => (
              <div key={item.id} className={`border ${t.border} rounded-lg p-3 bg-secondary/20`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className={`font-bold ${t.muted} font-mono break-all text-sm`}>{item.address}</p>
                    <p className="text-[11px] text-muted-foreground font-mono mt-1">
                      {item.type === 'personal' ? 'Personal' : 'Private'}
                      {item.service ? ` • ${item.service}` : ''}
                      {' • encaminha para '}
                      {item.forwardTo}
                      {' • '}
                      {item.enabled ? 'ativo' : 'desativado'}
                    </p>
                  </div>
                  <button
                    onClick={() => onDelete(item.id)}
                    className="px-2 py-1 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => onCopy(item.address)}
                    className={`flex-1 px-3 py-1.5 ${t.buttonAlt} rounded font-bold text-[11px]`}
                  >
                    <Copy size={12} className="inline mr-1" /> COPIAR
                  </button>
                  <button
                    onClick={() => onToggle(item.id)}
                    className="flex-1 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded font-bold text-[11px]"
                  >
                    <EyeOff size={12} className="inline mr-1" /> {item.enabled ? 'DESATIVAR' : 'REATIVAR'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
