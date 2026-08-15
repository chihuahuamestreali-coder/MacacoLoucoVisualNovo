/**
 * ChatGPT Device Generator - Identidade para ChatGPT (chatgpt.com)
 * Campos específicos: GPT_DEVICE_ID, GPT_SESSION, GPT_ANON_ID, GPT_UID, GPT_MODEL
 * Plataforma: assistente de IA (login/criação de conta, PT-BR)
 */
import { generateUniversalDevice, UniversalDeviceProfile } from './universalDeviceGenerator';

export interface ChatGptDeviceProfile extends UniversalDeviceProfile {
  gptDeviceId: string;
  gptSessionId: string;
  gptAnonId: string;
  gptUid: string;
  gptModel: string;
  gptLocale: string;
}

export const CHATGPT_MODELS = ['gpt-4o', 'gpt-4o-mini', 'gpt-5', 'o3'];

export function generateChatGptDevice(): ChatGptDeviceProfile {
  const base = generateUniversalDevice('chatgpt');
  const rand = (n: number) => Math.random().toString(36).substring(2, 2 + n);
  const model = CHATGPT_MODELS[Math.floor(Math.random() * CHATGPT_MODELS.length)];
  return {
    ...base,
    gptDeviceId: 'gpt_dev_' + rand(16),
    gptSessionId: 'sess_' + rand(20),
    gptAnonId: 'anon_' + rand(18),
    gptUid: 'uid_' + rand(14),
    gptModel: model,
    gptLocale: 'pt-BR',
    cookies: {
      ...base.cookies,
      GPT_DEVICE_ID: 'gpt_dev_' + rand(16),
      GPT_SESSION: 'sess_' + rand(20),
      GPT_ANON_ID: 'anon_' + rand(18),
      GPT_UID: 'uid_' + rand(14),
      GPT_MODEL: model,
      GPT_LOCALE: 'pt-BR',
    },
  };
}

export function buildChatGptScriptBody(device: ChatGptDeviceProfile, persona: any): string {
  const profile = JSON.stringify({
    gptDeviceId: device.gptDeviceId,
    gptSessionId: device.gptSessionId,
    gptAnonId: device.gptAnonId,
    gptUid: device.gptUid,
    gptModel: device.gptModel,
    gptLocale: device.gptLocale,
    macAddress: device.macAddress,
    imei: device.imei,
    androidId: device.androidId,
    fingerprint: device.fingerprint,
    userAgent: device.userAgent,
    persona: persona ? { name: persona.fullName, email: persona.email, phone: persona.phone } : null,
  }).replace(/"/g, '\\"');

  return `
    // CHATGPT - identidade e sessão (domínio real)
    const gptProfile = JSON.parse("${profile}");
    localStorage.setItem('gpt_device_profile', JSON.stringify(gptProfile));
    localStorage.setItem('gpt_device_id', gptProfile.gptDeviceId);
    localStorage.setItem('gpt_session_id', gptProfile.gptSessionId);
    localStorage.setItem('gpt_anon_id', gptProfile.gptAnonId);
    localStorage.setItem('gpt_uid', gptProfile.gptUid);
    localStorage.setItem('_device_fingerprint', gptProfile.fingerprint);
    if (gptProfile.persona) localStorage.setItem('gpt_persona', JSON.stringify(gptProfile.persona));

    // Cookies de sessão no domínio do ChatGPT
    const setCookie = (k, v) => { document.cookie = k + '=' + v + '; path=/; max-age=31536000; SameSite=Lax'; };
    setCookie('GPT_DEVICE_ID', gptProfile.gptDeviceId);
    setCookie('GPT_SESSION', gptProfile.gptSessionId);
    setCookie('GPT_ANON_ID', gptProfile.gptAnonId);
    setCookie('GPT_UID', gptProfile.gptUid);
    setCookie('GPT_MODEL', gptProfile.gptModel);
    setCookie('GPT_LOCALE', gptProfile.gptLocale);
  `;
}
