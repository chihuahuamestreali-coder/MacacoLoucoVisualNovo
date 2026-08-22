import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";

export interface ToolField {
  key: string;
  label: string;
  value: string;
  placeholder?: string;
  type?: "text" | "area";
}

export interface ToolDef {
  file: string;
  lang: string;
  run: string;
  fields: ToolField[];
  build: (values: Record<string, string>) => string;
}

export interface ModuleDef {
  code: string;
  category: string;
  title: string;
  description: string;
  status: string;
  tone: "cyan" | "amber";
  icon: ComponentType<LucideProps>;
}

export interface CategoryDef {
  id: string;
  label: string;
  detail: string;
  icon: ComponentType<LucideProps>;
}

const field = (
  key: string,
  label: string,
  value: string,
  placeholder?: string,
  type: "text" | "area" = "text",
): ToolField => ({ key, label, value, placeholder, type });

export const tools: Record<string, ToolDef> = {
  "01": {
    file: "bot.js",
    lang: "javascript",
    run: "npm i discord.js dotenv && node bot.js",
    fields: [
      field("name", "NOME DO BOT", "MacacoLouco"),
      field("prefix", "PREFIXO DE TEXTO", "!"),
      field("status", "STATUS DE ATIVIDADE", "vigiando o servidor"),
    ],
    build: (e) => `// ${e.file ?? "bot.js"} — bot base discord.js v14
import "dotenv/config";
import { Client, GatewayIntentBits, ActivityType } from "discord.js";

const PREFIX = ${JSON.stringify(e.prefix)};

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once("clientReady", () => {
  console.log(\`[${e.name}] online como \${client.user.tag}\`);
  client.user.setActivity(${JSON.stringify(e.status)}, { type: ActivityType.Watching });
});

client.on("messageCreate", async (message) => {
  if (message.author.bot || !message.content.startsWith(PREFIX)) return;
  const [command, ...args] = message.content.slice(PREFIX.length).trim().split(/\\s+/);

  if (command === "ping") {
    await message.reply(\`pong · \${client.ws.ping}ms\`);
  }

  if (command === "eco") {
    await message.reply(args.join(" ") || "nada para repetir");
  }
});

client.login(process.env.DISCORD_TOKEN);
`,
  },
  "02": {
    file: "command.js",
    lang: "javascript",
    run: "node deploy-commands.js && node bot.js",
    fields: [
      field("cmd", "NOME DO COMANDO", "info"),
      field("desc", "DESCRIÇÃO", "Mostra informações do servidor"),
      field("option", "NOME DA OPÇÃO (opcional)", "usuario"),
    ],
    build: (e) => `// comando slash /${e.cmd}
import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName(${JSON.stringify(e.cmd)})
  .setDescription(${JSON.stringify(e.desc)})${
    e.option
      ? `
  .addUserOption((option) =>
    option.setName(${JSON.stringify(e.option)}).setDescription("Alvo do comando").setRequired(false),
  )`
      : ``
  };

export async function execute(interaction) {
  ${
    e.option
      ? `const alvo = interaction.options.getUser(${JSON.stringify(e.option)}) ?? interaction.user;`
      : `const alvo = interaction.user;`
  }

  const embed = new EmbedBuilder()
    .setTitle(${JSON.stringify(e.desc)})
    .setColor(0x19e6c3)
    .addFields(
      { name: "Servidor", value: interaction.guild?.name ?? "DM", inline: true },
      { name: "Membros", value: String(interaction.guild?.memberCount ?? 0), inline: true },
      { name: "Solicitado por", value: alvo.tag, inline: true },
    )
    .setTimestamp();

  await interaction.reply({ embeds: [embed], ephemeral: true });
}
`,
  },
  "03": {
    file: "events.js",
    lang: "javascript",
    run: "node bot.js",
    fields: [
      field("event", "EVENTO", "guildMemberAdd"),
      field("channel", "ID DO CANAL DE LOG", "123456789012345678"),
    ],
    build: (e) => `// handler de eventos com carregamento dinâmico
import { Events } from "discord.js";

const LOG_CHANNEL = ${JSON.stringify(e.channel)};

export function registerEvents(client) {
  client.on(${JSON.stringify(e.event)}, async (payload) => {
    const guild = payload.guild ?? payload;
    const channel = guild?.channels?.cache.get(LOG_CHANNEL);
    if (!channel?.isTextBased()) return;

    await channel.send({
      content: \`[${e.event}] \${payload.user?.tag ?? payload.id ?? "evento"} · \${new Date().toISOString()}\`,
    });
  });

  client.on(Events.Error, (error) => console.error("[client]", error));
  process.on("unhandledRejection", (error) => console.error("[promise]", error));
}
`,
  },
  "04": {
    file: "deploy-commands.js",
    lang: "javascript",
    run: "node deploy-commands.js",
    fields: [
      field("appId", "APPLICATION ID", "000000000000000000"),
      field("guildId", "GUILD ID (vazio = global)", "000000000000000000"),
    ],
    build: (e) => `// registra os comandos slash via REST
import "dotenv/config";
import { REST, Routes } from "discord.js";
import * as info from "./command.js";

const commands = [info.data.toJSON()];
const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

const route = ${
    e.guildId
      ? `Routes.applicationGuildCommands(${JSON.stringify(e.appId)}, ${JSON.stringify(e.guildId)})`
      : `Routes.applicationCommands(${JSON.stringify(e.appId)})`
  };

try {
  const data = await rest.put(route, { body: commands });
  console.log(\`\${data.length} comando(s) registrado(s).\`);
} catch (error) {
  console.error(error);
}
`,
  },
  "05": {
    file: "send-webhook.js",
    lang: "javascript",
    run: "node send-webhook.js",
    fields: [
      field("url", "WEBHOOK URL", "", "https://discord.com/api/webhooks/..."),
      field("username", "NOME EXIBIDO", "MacacoLouco"),
      field("message", "MENSAGEM", "Deploy concluído com sucesso.", undefined, "area"),
    ],
    build: (e) => `// envia uma mensagem simples por webhook
const WEBHOOK_URL = process.env.WEBHOOK_URL ?? ${JSON.stringify(e.url || "COLE_SUA_URL_AQUI")};

const response = await fetch(WEBHOOK_URL, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    username: ${JSON.stringify(e.username)},
    content: ${JSON.stringify(e.message)},
    allowed_mentions: { parse: [] },
  }),
});

if (!response.ok) {
  throw new Error(\`Falha \${response.status}: \${await response.text()}\`);
}
console.log("Mensagem enviada.");
`,
  },
  "06": {
    file: "embed-webhook.js",
    lang: "javascript",
    run: "node embed-webhook.js",
    fields: [
      field("title", "TÍTULO DO EMBED", "Status do servidor"),
      field("desc", "DESCRIÇÃO", "Todos os serviços operando normalmente.", undefined, "area"),
      field("color", "COR (HEX)", "#19e6c3"),
    ],
    build: (e) => `// monta e envia um embed rico
const WEBHOOK_URL = process.env.WEBHOOK_URL;

const embed = {
  title: ${JSON.stringify(e.title)},
  description: ${JSON.stringify(e.desc)},
  color: 0x${(e.color || "#19e6c3").replace("#", "").padEnd(6, "0").slice(0, 6)},
  fields: [
    { name: "Ambiente", value: "produção", inline: true },
    { name: "Atualizado", value: new Date().toLocaleString("pt-BR"), inline: true },
  ],
  footer: { text: "MacacoLouco Discord Manager" },
  timestamp: new Date().toISOString(),
};

await fetch(WEBHOOK_URL, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ embeds: [embed] }),
});
`,
  },
  "07": {
    file: "webhook.sh",
    lang: "bash",
    run: "bash webhook.sh",
    fields: [
      field("url", "WEBHOOK URL", "", "https://discord.com/api/webhooks/..."),
      field("message", "MENSAGEM", "Build finalizado ✅"),
    ],
    build: (e) => `#!/usr/bin/env bash
set -euo pipefail

WEBHOOK_URL="\${WEBHOOK_URL:-${e.url || "https://discord.com/api/webhooks/ID/TOKEN"}}"

curl -sS -X POST "$WEBHOOK_URL" \\
  -H "Content-Type: application/json" \\
  -d "$(cat <<'JSON'
{
  "content": ${JSON.stringify(e.message)},
  "allowed_mentions": { "parse": [] }
}
JSON
)"

echo "\\nEnviado."
`,
  },
  "08": {
    file: "scheduled-webhook.js",
    lang: "javascript",
    run: "npm i node-cron && node scheduled-webhook.js",
    fields: [
      field("cron", "EXPRESSÃO CRON", "0 9 * * 1-5"),
      field("message", "MENSAGEM RECORRENTE", "Bom dia! Checklist diário disponível."),
    ],
    build: (e) => `// envio recorrente via node-cron
import cron from "node-cron";

const WEBHOOK_URL = process.env.WEBHOOK_URL;

async function send() {
  await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: ${JSON.stringify(e.message)} }),
  });
  console.log("[cron] enviado", new Date().toISOString());
}

cron.schedule(${JSON.stringify(e.cron)}, send, { timezone: "America/Sao_Paulo" });
console.log("Agendador ativo:", ${JSON.stringify(e.cron)});
`,
  },
  "09": {
    file: "automod.js",
    lang: "javascript",
    run: "node bot.js",
    fields: [
      field("words", "PALAVRAS BLOQUEADAS (VÍRGULA)", "spam, golpe, freenitro"),
      field("action", "AÇÃO (delete | warn | timeout)", "delete"),
    ],
    build: (e) => {
      const words = (e.words || "")
        .split(",")
        .map((w) => w.trim().toLowerCase())
        .filter(Boolean);
      return `// filtro de conteúdo simples
const BLOCKED = ${JSON.stringify(words)};

export function attachAutoMod(client) {
  client.on("messageCreate", async (message) => {
    if (message.author.bot || !message.guild) return;

    const text = message.content.toLowerCase();
    const hit = BLOCKED.find((word) => text.includes(word));
    if (!hit) return;

    await message.delete().catch(() => {});
    ${
      e.action === "timeout"
        ? "await message.member?.timeout(10 * 60 * 1000, `automod: ${hit}`).catch(() => {});"
        : e.action === "warn"
          ? "await message.channel.send({ content: `<@${message.author.id}> aviso: termo bloqueado (${hit}).` });"
          : "console.log(`[automod] removido de ${message.author.tag}: ${hit}`);"
    }
  });
}
`;
    },
  },
  "10": {
    file: "moderation-commands.js",
    lang: "javascript",
    run: "node deploy-commands.js",
    fields: [
      field("cmd", "COMANDO (ban | kick | timeout)", "ban"),
      field("reason", "MOTIVO PADRÃO", "Violação das regras do servidor"),
    ],
    build: (e) => `// comando de moderação com verificação de permissão
import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName(${JSON.stringify(e.cmd)})
  .setDescription("Aplica ${e.cmd} em um membro")
  .addUserOption((o) => o.setName("membro").setDescription("Membro alvo").setRequired(true))
  .addStringOption((o) => o.setName("motivo").setDescription("Motivo"))
  .setDefaultMemberPermissions(PermissionFlagsBits.${
    e.cmd === "kick" ? "KickMembers" : e.cmd === "timeout" ? "ModerateMembers" : "BanMembers"
  });

export async function execute(interaction) {
  const membro = interaction.options.getMember("membro");
  const motivo = interaction.options.getString("motivo") ?? ${JSON.stringify(e.reason)};

  if (!membro) return interaction.reply({ content: "Membro não encontrado.", ephemeral: true });
  if (!membro.manageable) {
    return interaction.reply({ content: "Sem hierarquia para agir sobre esse membro.", ephemeral: true });
  }

  ${
    e.cmd === "kick"
      ? "await membro.kick(motivo);"
      : e.cmd === "timeout"
        ? "await membro.timeout(60 * 60 * 1000, motivo);"
        : "await membro.ban({ reason: motivo, deleteMessageSeconds: 60 * 60 });"
  }

  await interaction.reply({ content: \`\${membro.user.tag} · ${e.cmd} aplicado. Motivo: \${motivo}\` });
}
`,
  },
  "11": {
    file: "message-log.js",
    lang: "javascript",
    run: "node bot.js",
    fields: [field("channel", "ID DO CANAL DE LOG", "123456789012345678")],
    build: (e) => `// registra mensagens apagadas e editadas
import { EmbedBuilder } from "discord.js";

const LOG_CHANNEL = ${JSON.stringify(e.channel)};

export function attachMessageLog(client) {
  const log = (guild, embed) => {
    const channel = guild?.channels.cache.get(LOG_CHANNEL);
    if (channel?.isTextBased()) channel.send({ embeds: [embed] });
  };

  client.on("messageDelete", (message) => {
    if (message.author?.bot) return;
    log(
      message.guild,
      new EmbedBuilder()
        .setTitle("Mensagem apagada")
        .setColor(0xdba44b)
        .setDescription(message.content?.slice(0, 1000) || "(sem texto)")
        .addFields({ name: "Autor", value: message.author?.tag ?? "?", inline: true })
        .setTimestamp(),
    );
  });

  client.on("messageUpdate", (before, after) => {
    if (before.author?.bot || before.content === after.content) return;
    log(
      before.guild,
      new EmbedBuilder()
        .setTitle("Mensagem editada")
        .setColor(0x19e6c3)
        .addFields(
          { name: "Antes", value: before.content?.slice(0, 500) || "—" },
          { name: "Depois", value: after.content?.slice(0, 500) || "—" },
        )
        .setTimestamp(),
    );
  });
}
`,
  },
  "12": {
    file: "anti-spam.js",
    lang: "javascript",
    run: "node bot.js",
    fields: [
      field("limit", "MENSAGENS PERMITIDAS", "5"),
      field("window", "JANELA (SEGUNDOS)", "7"),
      field("mute", "TIMEOUT (MINUTOS)", "10"),
    ],
    build: (e) => `// anti-spam com janela deslizante em memória
const LIMIT = ${Number(e.limit) || 5};
const WINDOW_MS = ${(Number(e.window) || 7) * 1e3};
const MUTE_MS = ${(Number(e.mute) || 10) * 6e4};

const buckets = new Map();

export function attachAntiSpam(client) {
  client.on("messageCreate", async (message) => {
    if (message.author.bot || !message.guild) return;

    const now = Date.now();
    const list = (buckets.get(message.author.id) ?? []).filter((t) => now - t < WINDOW_MS);
    list.push(now);
    buckets.set(message.author.id, list);

    if (list.length > LIMIT) {
      buckets.delete(message.author.id);
      await message.member?.timeout(MUTE_MS, "anti-spam").catch(() => {});
      await message.channel.send(\`<@\${message.author.id}> silenciado por flood.\`);
    }
  });
}
`,
  },
  "13": {
    file: "reaction-roles.js",
    lang: "javascript",
    run: "node bot.js",
    fields: [
      field("messageId", "ID DA MENSAGEM", "123456789012345678"),
      field(
        "map",
        "EMOJI=CARGO_ID (UMA POR LINHA)",
        "🎮=111111111111111111\n🎵=222222222222222222",
        undefined,
        "area",
      ),
    ],
    build: (e) => {
      const pairs = (e.map || "")
        .split("\n")
        .map((line) => line.split("="))
        .filter((parts) => parts.length === 2)
        .map(([k, v]) => [(k ?? "").trim(), (v ?? "").trim()]);
      return `// cargos por reação
const MESSAGE_ID = ${JSON.stringify(e.messageId)};
const ROLES = ${JSON.stringify(Object.fromEntries(pairs), null, 2)};

export function attachReactionRoles(client) {
  client.on("messageReactionAdd", async (reaction, user) => {
    if (user.bot || reaction.message.id !== MESSAGE_ID) return;
    const roleId = ROLES[reaction.emoji.name];
    if (!roleId) return;
    const member = await reaction.message.guild.members.fetch(user.id);
    await member.roles.add(roleId).catch(console.error);
  });

  client.on("messageReactionRemove", async (reaction, user) => {
    if (user.bot || reaction.message.id !== MESSAGE_ID) return;
    const roleId = ROLES[reaction.emoji.name];
    if (!roleId) return;
    const member = await reaction.message.guild.members.fetch(user.id);
    await member.roles.remove(roleId).catch(console.error);
  });
}
`;
    },
  },
  "14": {
    file: "welcome.js",
    lang: "javascript",
    run: "node bot.js",
    fields: [
      field("channel", "ID DO CANAL DE BOAS-VINDAS", "123456789012345678"),
      field("text", "MENSAGEM ({user} e {server})", "Bem-vindo {user} ao {server}! Leia as regras antes de postar."),
      field("role", "CARGO AUTOMÁTICO (ID, opcional)", ""),
    ],
    build: (e) => `// boas-vindas + cargo automático
import { EmbedBuilder } from "discord.js";

const CHANNEL = ${JSON.stringify(e.channel)};
const TEMPLATE = ${JSON.stringify(e.text)};

export function attachWelcome(client) {
  client.on("guildMemberAdd", async (member) => {
    const channel = member.guild.channels.cache.get(CHANNEL);
    const text = TEMPLATE.replace("{user}", \`<@\${member.id}>\`).replace("{server}", member.guild.name);

    if (channel?.isTextBased()) {
      await channel.send({
        embeds: [new EmbedBuilder().setDescription(text).setColor(0x19e6c3).setTimestamp()],
      });
    }
${e.role ? `\n    await member.roles.add(${JSON.stringify(e.role)}).catch(console.error);` : ``}
  });
}
`,
  },
  "15": {
    file: "backup-roles.js",
    lang: "javascript",
    run: "node backup-roles.js",
    fields: [
      field("guildId", "GUILD ID", "000000000000000000"),
      field("out", "ARQUIVO DE SAÍDA", "backup-roles.json"),
    ],
    build: (e) => `// exporta cargos e permissões do servidor para JSON
import "dotenv/config";
import { writeFile } from "node:fs/promises";
import { Client, GatewayIntentBits } from "discord.js";

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once("clientReady", async () => {
  const guild = await client.guilds.fetch(${JSON.stringify(e.guildId)});
  const roles = await guild.roles.fetch();

  const payload = roles.map((role) => ({
    id: role.id,
    name: role.name,
    color: role.hexColor,
    position: role.position,
    hoist: role.hoist,
    mentionable: role.mentionable,
    permissions: role.permissions.toArray(),
  }));

  await writeFile(${JSON.stringify(e.out)}, JSON.stringify(payload, null, 2), "utf8");
  console.log(\`\${payload.length} cargos exportados para ${e.out}\`);
  await client.destroy();
});

client.login(process.env.DISCORD_TOKEN);
`,
  },
  "16": {
    file: "announce.js",
    lang: "javascript",
    run: "node announce.js",
    fields: [
      field("channel", "ID DO CANAL", "123456789012345678"),
      field("when", "DATA/HORA (ISO)", "2026-09-01T18:00:00-03:00"),
      field("text", "ANÚNCIO", "Manutenção programada às 18h. Servidor ficará indisponível por 20 minutos.", undefined, "area"),
    ],
    build: (e) => `// anúncio programado com timer
import "dotenv/config";
import { Client, GatewayIntentBits } from "discord.js";

const WHEN = new Date(${JSON.stringify(e.when)});
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once("clientReady", async () => {
  const delay = WHEN.getTime() - Date.now();
  if (delay < 0) {
    console.error("Data já passou.");
    return client.destroy();
  }

  console.log(\`Anúncio agendado para \${WHEN.toLocaleString("pt-BR")}\`);
  setTimeout(async () => {
    const channel = await client.channels.fetch(${JSON.stringify(e.channel)});
    await channel.send(${JSON.stringify(e.text)});
    console.log("Anúncio publicado.");
    await client.destroy();
  }, delay);
});

client.login(process.env.DISCORD_TOKEN);
`,
  },
};
