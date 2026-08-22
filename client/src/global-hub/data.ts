import {
  Activity,
  ArrowUpRight,
  BookOpen,
  Bot,
  Database,
  Earth,
  FileCheck2,
  KeyRound,
  LockKeyhole,
  Network,
  Radio,
  ServerCog,
  ShieldCheck,
  Sparkles,
  SquareTerminal,
} from "lucide-react";
import type { CategoryDef, ModuleDef } from "./tools";

export const modules: ModuleDef[] = [
  { code: "01", category: "BOT", title: "Bot base discord.js", description: "Cliente pronto com intents, status e comandos de texto.", status: "SCRIPT", tone: "cyan", icon: Bot },
  { code: "02", category: "BOT", title: "Comando slash", description: "Gera um /comando com embed e opção de usuário.", status: "SCRIPT", tone: "cyan", icon: SquareTerminal },
  { code: "03", category: "BOT", title: "Handler de eventos", description: "Registra eventos do client e envia log para um canal.", status: "SCRIPT", tone: "amber", icon: Network },
  { code: "04", category: "BOT", title: "Deploy de comandos", description: "Script REST para registrar comandos globais ou por guild.", status: "SCRIPT", tone: "cyan", icon: ServerCog },
  { code: "05", category: "WEBHOOK", title: "Enviar mensagem", description: "Script Node que dispara uma mensagem por webhook.", status: "SCRIPT", tone: "cyan", icon: ArrowUpRight },
  { code: "06", category: "WEBHOOK", title: "Embed builder", description: "Monta um embed colorido com campos e timestamp.", status: "SCRIPT", tone: "amber", icon: Sparkles },
  { code: "07", category: "WEBHOOK", title: "Webhook via cURL", description: "Script bash pronto para CI/CD e automações de deploy.", status: "SCRIPT", tone: "cyan", icon: SquareTerminal },
  { code: "08", category: "WEBHOOK", title: "Envio agendado", description: "Agenda mensagens recorrentes com node-cron.", status: "SCRIPT", tone: "amber", icon: Radio },
  { code: "09", category: "MODERAÇÃO", title: "Auto-moderação", description: "Filtro de termos com ação de apagar, avisar ou silenciar.", status: "SCRIPT", tone: "cyan", icon: ShieldCheck },
  { code: "10", category: "MODERAÇÃO", title: "Comando de punição", description: "Ban, kick ou timeout com checagem de permissão e hierarquia.", status: "SCRIPT", tone: "amber", icon: LockKeyhole },
  { code: "11", category: "MODERAÇÃO", title: "Log de mensagens", description: "Registra mensagens apagadas e editadas em um canal.", status: "SCRIPT", tone: "cyan", icon: FileCheck2 },
  { code: "12", category: "MODERAÇÃO", title: "Anti-spam", description: "Janela deslizante que silencia flood automaticamente.", status: "SCRIPT", tone: "cyan", icon: Activity },
  { code: "13", category: "AUTOMAÇÃO", title: "Cargo por reação", description: "Mapeia emojis para cargos em uma mensagem fixa.", status: "SCRIPT", tone: "cyan", icon: KeyRound },
  { code: "14", category: "AUTOMAÇÃO", title: "Boas-vindas", description: "Mensagem de entrada com embed e cargo automático.", status: "SCRIPT", tone: "amber", icon: Earth },
  { code: "15", category: "AUTOMAÇÃO", title: "Backup de cargos", description: "Exporta cargos e permissões do servidor para JSON.", status: "SCRIPT", tone: "cyan", icon: Database },
  { code: "16", category: "AUTOMAÇÃO", title: "Anúncio programado", description: "Publica um anúncio em data e hora definidas.", status: "SCRIPT", tone: "amber", icon: BookOpen },
];

export const categories: CategoryDef[] = [
  { id: "bot", label: "Bots", detail: "discord.js & slash", icon: Bot },
  { id: "webhook", label: "Webhooks", detail: "Envios & embeds", icon: Radio },
  { id: "mod", label: "Moderação", detail: "Automod & punições", icon: LockKeyhole },
  { id: "auto", label: "Automação", detail: "Cargos & rotinas", icon: SquareTerminal },
];

export const categoryOf: Record<string, string> = {
  BOT: "bot",
  WEBHOOK: "webhook",
  MODERAÇÃO: "mod",
  AUTOMAÇÃO: "auto",
};

export const safeProfile = {
  name: "MacacoLouco / Discord Manager",
  mode: "gerador-de-scripts-local",
  modules: 16,
  groups: ["bot", "webhook", "moderação", "automação"],
  actions: ["generate-script", "copy", "download"],
  restrictions: ["no-remote-script", "no-injection", "no-credential-collection", "no-external-mutation"],
};
