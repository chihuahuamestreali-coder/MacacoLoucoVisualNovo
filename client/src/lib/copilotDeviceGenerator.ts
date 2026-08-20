/**
 * Microsoft Copilot Device Generator - Identidade para Microsoft Copilot (copilot.microsoft.com)
 * Campos específicos: CPT_DEVICE_ID, CPT_SESSION, CPT_ANON_ID, CPT_UID, CPT_MODEL, CPT_LOCALE
 * Plataforma: assistente de IA da Microsoft (login/criação de conta, PT-BR)
 */
import { generateUniversalDevice, UniversalDeviceProfile } from './universalDeviceGenerator';

export interface CopilotDeviceProfile extends UniversalDeviceProfile {
  cptDeviceId: string;
  cptSessionId: string;
  cptAnonId: string;
  cptUid: string;
  cptModel: string;
  cptLocale: string;
}

export const COPILOT_MODELS = ['copilot-chat', 'copilot-chat-pro', 'gpt-4o', 'gpt-4-turbo'];

export function generateCopilotDevice(): CopilotDeviceProfile {
  const base = generateUniversalDevice('copilot');
  const rand = (n: number) => Math.random().toString(36).substring(2, 2 + n);
  const model = COPILOT_MODELS[Math.floor(Math.random() * COPILOT_MODELS.length)];
  return {
    ...base,
    cptDeviceId: 'cpt_dev_' + rand(16),
    cptSessionId: 'sess_' + rand(20),
    cptAnonId: 'anon_' + rand(18),
    cptUid: 'uid_' + rand(14),
    cptModel: model,
    cptLocale: 'pt-BR',
    cookies: {
      ...base.cookies,
      CPT_DEVICE_ID: 'cpt_dev_' + rand(16),
      CPT_SESSION: 'sess_' + rand(20),
      CPT_ANON_ID: 'anon_' + rand(18),
      CPT_UID: 'uid_' + rand(14),
      CPT_MODEL: model,
      CPT_LOCALE: 'pt-BR',
    },
  };
}

export function buildCopilotScriptBody(device: CopilotDeviceProfile, persona: any): string {
  const profile = JSON.stringify({
    cptDeviceId: device.cptDeviceId,
    cptSessionId: device.cptSessionId,
    cptAnonId: device.cptAnonId,
    cptUid: device.cptUid,
    cptModel: device.cptModel,
    cptLocale: device.cptLocale,
    macAddress: device.macAddress,
    imei: device.imei,
    androidId: device.androidId,
    fingerprint: device.fingerprint,
    userAgent: device.userAgent,
    persona: persona ? { name: persona.fullName, email: persona.email, phone: persona.phone } : null,
  }).replace(/"/g, '\\"');

  return `
    // COPILOT - identidade e sessão (domínio real)
    const cptProfile = JSON.parse("${profile}");
    localStorage.setItem('cpt_device_profile', JSON.stringify(cptProfile));
    localStorage.setItem('cpt_device_id', cptProfile.cptDeviceId);
    localStorage.setItem('cpt_session_id', cptProfile.cptSessionId);
    localStorage.setItem('cpt_anon_id', cptProfile.cptAnonId);
    localStorage.setItem('cpt_uid', cptProfile.cptUid);
    localStorage.setItem('_device_fingerprint', cptProfile.fingerprint);
    if (cptProfile.persona) localStorage.setItem('cpt_persona', JSON.stringify(cptProfile.persona));

    // Cookies de sessão no domínio do Microsoft Copilot
    const setCookie = (k, v) => { document.cookie = k + '=' + v + '; path=/; max-age=31536000; SameSite=Lax'; };
    setCookie('CPT_DEVICE_ID', cptProfile.cptDeviceId);
    setCookie('CPT_SESSION', cptProfile.cptSessionId);
    setCookie('CPT_ANON_ID', cptProfile.cptAnonId);
    setCookie('CPT_UID', cptProfile.cptUid);
    setCookie('CPT_MODEL', cptProfile.cptModel);
    setCookie('CPT_LOCALE', cptProfile.cptLocale);
  `;
}
