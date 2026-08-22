import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";
import {
  Activity,
  Bot,
  Globe2,
  Link2,
  LockKeyhole,
  Radio,
  ShieldCheck,
  Smartphone,
  Sparkles,
  SquareTerminal,
  TerminalSquare,
  UserRound,
} from "lucide-react";
import { tools as hubTools } from "@/global-hub/tools";
import { modules as hubModules } from "@/global-hub/data";
import { generateManusDeviceProfile, generateManusSignupUrl } from "@/lib/manusDeviceGenerator";
import { generatePersonalData, formatPersonalDataForDisplay } from "@/lib/personalDataGenerator";
import { generateRandomUserAgent, generateCompleteAntiDetectionScript } from "@/lib/cookieAndUserAgentManager";
import { generateBehaviorInjectionScript } from "@/lib/humanBehaviorSimulator";
import { generateNativeAppSimulationForProfile } from "@/lib/nativeAppSimulator";
import { generateAdvancedAntiDetection } from "@/lib/advancedAntiDetection";
import { wrapInSiteScript } from "@/lib/inSiteInjection";

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
  randomize?: boolean;
}

export interface ModuleDef {
  code: string;
  category: string;
  title: string;
  description: string;
  status: string;
  tone: "purple" | "cyan";
  icon: ComponentType<LucideProps>;
  randomize?: boolean;
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

const jsonDump = (value: unknown): string => JSON.stringify(value, null, 2);

export const tools: Record<string, ToolDef> = {
  ...hubTools,
  "17": {
    file: "manus-device-profile.json",
    lang: "json",
    run: "perfil local · dados fictícios",
    fields: [],
    randomize: true,
    build: () => {
      const profile = generateManusDeviceProfile();
      return jsonDump({
        deviceName: profile.deviceName,
        model: profile.model,
        manufacturer: profile.manufacturer,
        resolution: profile.resolution,
        userAgent: profile.userAgent,
        macAddress: profile.macAddress,
        imei: profile.imei,
        androidId: profile.androidId,
        cpuCores: profile.cpuCores,
        ramMb: profile.ramMb,
        screenDensity: profile.screenDensity,
        buildVersion: profile.buildVersion,
        securityPatch: profile.securityPatch,
        fingerprint: profile.fingerprint,
      });
    },
  },
  "18": {
    file: "manus-injection.js",
    lang: "javascript",
    run: "colar no console da guia do Manus",
    fields: [field("referral", "LINK DE CONVITE (OPCIONAL)", "")],
    randomize: true,
    build: (e) => {
      const profile = generateManusDeviceProfile();
      const body = `
  localStorage.setItem('device_profile', ${JSON.stringify(JSON.stringify(profile))});
  localStorage.setItem('_device_fingerprint', ${JSON.stringify(profile.fingerprint)});
  localStorage.setItem('_device_model', ${JSON.stringify(profile.model)});
  localStorage.setItem('_device_mac', ${JSON.stringify(profile.macAddress)});
  localStorage.setItem('_device_imei', ${JSON.stringify(profile.imei)});
  sessionStorage.setItem('device_fingerprint', ${JSON.stringify(profile.fingerprint)});
  sessionStorage.setItem('device_profile', ${JSON.stringify(JSON.stringify(profile))});
  try {
    Object.defineProperty(navigator, 'userAgent', { get: function() { return ${JSON.stringify(profile.userAgent)}; }, configurable: true });
  } catch(err) {}
  try {
    const [width, height] = ${JSON.stringify(profile.resolution)}.split('x').map(Number);
    Object.defineProperty(window, 'innerWidth', { get: function() { return width; }, configurable: true });
    Object.defineProperty(window, 'innerHeight', { get: function() { return height; }, configurable: true });
  } catch(err) {}
`;
      return wrapInSiteScript("MANUS", body, ["Identidade de dispositivo", "User-Agent", "Resolução"], "#a855f7");
    },
  },
  "19": {
    file: "anti-deteccao-completa.js",
    lang: "javascript",
    run: "colar no console do site alvo",
    fields: [],
    randomize: true,
    build: () => {
      const userAgent = generateRandomUserAgent();
      const advanced = generateAdvancedAntiDetection();
      const complete = generateCompleteAntiDetectionScript(userAgent);
      return wrapInSiteScript(
        "ANTI-DETECÇÃO",
        `${advanced}\n${complete}`,
        ["Motor Anti-Detecção 16+", "Webdriver Bypass", "Canvas & WebGL"],
        "#22d3ee",
      );
    },
  },
  "20": {
    file: "comportamento-humano.js",
    lang: "javascript",
    run: "colar no console do site alvo",
    fields: [
      field("minDelay", "DELAY MÍNIMO (MS)", "1000"),
      field("maxDelay", "DELAY MÁXIMO (MS)", "5000"),
      field("typing", "VELOCIDADE DE DIGITAÇÃO (MS)", "150"),
    ],
    build: (e) =>
      wrapInSiteScript(
        "COMPORTAMENTO HUMANO",
        generateBehaviorInjectionScript({
          minDelay: Number(e.minDelay) || 1000,
          maxDelay: Number(e.maxDelay) || 5000,
          minTypingSpeed: 80,
          maxTypingSpeed: Number(e.typing) || 150,
          enableMouseMovement: true,
          enableScrolling: true,
        }),
        ["Delays humanos", "Digitação lenta", "Scroll natural"],
        "#22d3ee",
      ),
  },
  "21": {
    file: "app-nativo-simulado.js",
    lang: "javascript",
    run: "colar no console do site alvo",
    fields: [field("platform", "PLATAFORMA (instagram | tiktok | facebook | aliexpress | ...)", "manus")],
    randomize: true,
    build: (e) => {
      const profile = generateManusDeviceProfile();
      const platform = (e.platform || "manus") as Parameters<typeof generateNativeAppSimulationForProfile>[0]["platform"];
      return wrapInSiteScript(
        "APP NATIVO",
        generateNativeAppSimulationForProfile({
          platform,
          userAgent: profile.userAgent,
          imei: profile.imei,
        }),
        ["Simulação de WebView", "App Nativo"],
        "#22d3ee",
      );
    },
  },
  "22": {
    file: "dados-pessoais.txt",
    lang: "text",
    run: "perfil local · dados fictícios",
    fields: [],
    randomize: true,
    build: () => {
      const data = generatePersonalData();
      return formatPersonalDataForDisplay(data);
    },
  },
  "23": {
    file: "user-agent.json",
    lang: "json",
    run: "perfil local · dados fictícios",
    fields: [],
    randomize: true,
    build: () => {
      const ua = generateRandomUserAgent();
      return jsonDump(ua);
    },
  },
  "24": {
    file: "manus-signup-url.txt",
    lang: "text",
    run: "abrir URL no navegador",
    fields: [field("referral", "LINK DE CONVITE (OPCIONAL)", "")],
    build: (e) => {
      const url = generateManusSignupUrl(e.referral || undefined);
      return `URL DE CADASTRO MANUS\n${url}`;
    },
  },
};

const MANUS_MODULES: ModuleDef[] = [
  { code: "17", category: "MANUS", title: "Perfil de dispositivo Manus", description: "Gera uma identidade técnica completa de dispositivo para o fluxo Manus.", status: "SCRIPT", tone: "purple", icon: Smartphone, randomize: true },
  { code: "18", category: "MANUS", title: "Injeção in-site Manus", description: "Script pronto para colar no console do Manus com o perfil de dispositivo.", status: "SCRIPT", tone: "cyan", icon: TerminalSquare, randomize: true },
  { code: "19", category: "MANUS", title: "Anti-detecção completa", description: "Motor 16+ de spoofing: webdriver, canvas, webgl, cookies, histórico e mais.", status: "SCRIPT", tone: "purple", icon: ShieldCheck, randomize: true },
  { code: "20", category: "MANUS", title: "Comportamento humano", description: "Simula delays, digitação lenta, movimento de mouse e scroll natural.", status: "SCRIPT", tone: "cyan", icon: Activity },
  { code: "21", category: "MANUS", title: "App nativo simulado", description: "Simula as propriedades internas de WebView que apps móveis procuram.", status: "SCRIPT", tone: "purple", icon: Smartphone, randomize: true },
  { code: "22", category: "MANUS", title: "Dados pessoais", description: "Persona completa: nome, email, telefone, CPF, senha e endereço.", status: "SCRIPT", tone: "cyan", icon: UserRound, randomize: true },
  { code: "23", category: "MANUS", title: "User-Agent realista", description: "Perfil de user-agent diverso com sistema e navegador.", status: "SCRIPT", tone: "purple", icon: Globe2, randomize: true },
  { code: "24", category: "MANUS", title: "URL de cadastro com convite", description: "Gera o link de cadastro do Manus com parâmetro de convite.", status: "SCRIPT", tone: "cyan", icon: Link2 },
];

const stripCategory = (category: string): string =>
  category === "MODERAÇÃO" ? "MOD" : category === "AUTOMAÇÃO" ? "AUTO" : category;

export const modules: ModuleDef[] = [
  ...hubModules.map((mod) => ({
    code: mod.code,
    category: mod.category,
    title: mod.title,
    description: mod.description,
    status: mod.status,
    tone: (Number(mod.code) % 2 === 0 ? "cyan" : "purple") as "cyan" | "purple",
    icon: mod.icon,
  })),
  ...MANUS_MODULES,
];

export const categories: CategoryDef[] = [
  { id: "bot", label: "Bots", detail: "discord.js & slash", icon: Bot },
  { id: "webhook", label: "Webhooks", detail: "Envios & embeds", icon: Radio },
  { id: "mod", label: "Moderação", detail: "Automod & punições", icon: LockKeyhole },
  { id: "auto", label: "Automação", detail: "Cargos & rotinas", icon: SquareTerminal },
  { id: "manus", label: "Manus Scripts", detail: "Device & anti-detecção", icon: Sparkles },
];

export const categoryOf: Record<string, string> = {
  BOT: "bot",
  WEBHOOK: "webhook",
  MODERAÇÃO: "mod",
  AUTOMAÇÃO: "auto",
  MANUS: "manus",
};

export { stripCategory };

export const safeProfile = {
  name: "MacacoLouco / MASTER HUB",
  mode: "gerador-de-scripts-local",
  modules: 24,
  groups: ["bot", "webhook", "moderação", "automação", "manus"],
  actions: ["generate-script", "copy", "download"],
  restrictions: ["no-remote-script", "no-credential-collection", "no-external-mutation"],
};
