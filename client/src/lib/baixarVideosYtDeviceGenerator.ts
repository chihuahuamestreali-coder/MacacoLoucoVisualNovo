import { generateUniversalDevice, UniversalDeviceProfile } from './universalDeviceGenerator';

export const BAIXAR_VIDEOS_YT_URL = 'https://www.clipto.com/pt/media-tool/youtube-video';

export interface BaixarVideosYtDeviceProfile extends UniversalDeviceProfile {
  bvyDeviceId: string;
  bvySessionId: string;
  bvyVisitorId: string;
  bvyClientId: string;
  bvyAntiBotToken: string;
}

export function generateBaixarVideosYtDevice(): BaixarVideosYtDeviceProfile {
  const base = generateUniversalDevice('baixar-videos-yt');
  const rand = (n: number) => Math.random().toString(36).substring(2, 2 + n);
  return {
    ...base,
    bvyDeviceId: 'bvy_dev_' + rand(16),
    bvySessionId: 'sess_' + rand(20),
    bvyVisitorId: 'vis_' + rand(14),
    bvyClientId: 'client_' + rand(12),
    bvyAntiBotToken: 'abt_' + rand(24),
    cookies: {
      ...base.cookies,
      BVY_DEVICE_ID: 'bvy_dev_' + rand(16),
      BVY_SESSION: 'sess_' + rand(20),
      BVY_VISITOR_ID: 'vis_' + rand(14),
      BVY_ANTI_BOT_TOKEN: 'abt_' + rand(24),
      BVY_LANG: 'pt-BR',
    },
  };
}

export function buildBaixarVideosYtScriptBody(device: BaixarVideosYtDeviceProfile, persona: any): string {
  const profile = JSON.stringify({
    bvyDeviceId: device.bvyDeviceId,
    bvySessionId: device.bvySessionId,
    bvyVisitorId: device.bvyVisitorId,
    bvyClientId: device.bvyClientId,
    bvyAntiBotToken: device.bvyAntiBotToken,
    macAddress: device.macAddress,
    imei: device.imei,
    androidId: device.androidId,
    fingerprint: device.fingerprint,
    userAgent: device.userAgent,
    persona: persona ? { name: persona.fullName, email: persona.email, phone: persona.phone } : null,
  }).replace(/"/g, '\\"');

  return `
    const bvyProfile = JSON.parse("${profile}");
    localStorage.setItem('bvy_device_profile', JSON.stringify(bvyProfile));
    localStorage.setItem('bvy_device_id', bvyProfile.bvyDeviceId);
    localStorage.setItem('bvy_session_id', bvyProfile.bvySessionId);
    localStorage.setItem('bvy_visitor_id', bvyProfile.bvyVisitorId);
    localStorage.setItem('bvy_anti_bot_token', bvyProfile.bvyAntiBotToken);
    localStorage.setItem('_device_fingerprint', bvyProfile.fingerprint);
    if (bvyProfile.persona) localStorage.setItem('bvy_persona', JSON.stringify(bvyProfile.persona));

    const setCookie = (k, v) => { document.cookie = k + '=' + v + '; path=/; max-age=31536000; SameSite=Lax; Secure'; };
    setCookie('BVY_DEVICE_ID', bvyProfile.bvyDeviceId);
    setCookie('BVY_SESSION', bvyProfile.bvySessionId);
    setCookie('BVY_VISITOR_ID', bvyProfile.bvyVisitorId);
    setCookie('BVY_ANTI_BOT_TOKEN', bvyProfile.bvyAntiBotToken);
    setCookie('BVY_LANG', 'pt-BR');
  `;
}
