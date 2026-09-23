import { generateUniversalDevice, UniversalDeviceProfile } from './universalDeviceGenerator';

export interface DraelDeviceProfile extends UniversalDeviceProfile {
  draelDeviceId: string;
  draelSessionId: string;
  draelVisitorId: string;
  draelClientId: string;
  draelAntiBotToken: string;
}

export function generateDraelDevice(): DraelDeviceProfile {
  const base = generateUniversalDevice('drael');
  const rand = (n: number) => Math.random().toString(36).substring(2, 2 + n);
  return {
    ...base,
    draelDeviceId: 'drl_dev_' + rand(16),
    draelSessionId: 'sess_' + rand(20),
    draelVisitorId: 'vis_' + rand(14),
    draelClientId: 'client_' + rand(12),
    draelAntiBotToken: 'abt_' + rand(24),
    cookies: {
      ...base.cookies,
      DRL_DEVICE_ID: 'drl_dev_' + rand(16),
      DRL_SESSION: 'sess_' + rand(20),
      DRL_VISITOR_ID: 'vis_' + rand(14),
      DRL_ANTI_BOT_TOKEN: 'abt_' + rand(24),
      DRL_LANG: 'pt-BR',
    },
  };
}

export function generateDraelSignupUrl(referralLink?: string): string {
  const baseUrl = 'https://drael.sh';
  if (referralLink) {
    return `${baseUrl}?ref=${encodeURIComponent(referralLink)}`;
  }
  return baseUrl;
}

export function buildDraelScriptBody(device: DraelDeviceProfile, persona: any): string {
  const profile = JSON.stringify({
    draelDeviceId: device.draelDeviceId,
    draelSessionId: device.draelSessionId,
    draelVisitorId: device.draelVisitorId,
    draelClientId: device.draelClientId,
    draelAntiBotToken: device.draelAntiBotToken,
    macAddress: device.macAddress,
    imei: device.imei,
    androidId: device.androidId,
    fingerprint: device.fingerprint,
    userAgent: device.userAgent,
    persona: persona ? { name: persona.fullName, email: persona.email, phone: persona.phone } : null,
  }).replace(/"/g, '\\"');

  return `
    const drlProfile = JSON.parse("${profile}");
    localStorage.setItem('drael_device_profile', JSON.stringify(drlProfile));
    localStorage.setItem('drael_device_id', drlProfile.draelDeviceId);
    localStorage.setItem('drael_session_id', drlProfile.draelSessionId);
    localStorage.setItem('drael_visitor_id', drlProfile.draelVisitorId);
    localStorage.setItem('drael_anti_bot_token', drlProfile.draelAntiBotToken);
    localStorage.setItem('_device_fingerprint', drlProfile.fingerprint);
    if (drlProfile.persona) localStorage.setItem('drael_persona', JSON.stringify(drlProfile.persona));

    const setCookie = (k, v) => { document.cookie = k + '=' + v + '; path=/; max-age=31536000; SameSite=Lax; Secure'; };
    setCookie('DRL_DEVICE_ID', drlProfile.draelDeviceId);
    setCookie('DRL_SESSION', drlProfile.draelSessionId);
    setCookie('DRL_VISITOR_ID', drlProfile.draelVisitorId);
    setCookie('DRL_ANTI_BOT_TOKEN', drlProfile.draelAntiBotToken);
    setCookie('DRL_LANG', 'pt-BR');
  `;
}
