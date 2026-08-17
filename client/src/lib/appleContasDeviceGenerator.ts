/**
 * AppleContas Device Generator - Identidade para Apple ID / Apple Contas (account.apple.com)
 * Campos específicos: ACL_DEVICE_ID, ACL_SESSION, ACL_ANON_ID, ACL_DSID, ACL_LOCALE
 * Plataforma: conta de ecossistema Apple (login/criação, PT-BR)
 */
import { generateUniversalDevice, UniversalDeviceProfile } from './universalDeviceGenerator';

export interface AppleContasDeviceProfile extends UniversalDeviceProfile {
  aclDeviceId: string;
  aclSessionId: string;
  aclAnonId: string;
  aclDsid: string;
  aclLocale: string;
  aclCountry: string;
  aclStorefront: string;
}

export function generateAppleContasDevice(): AppleContasDeviceProfile {
  const base = generateUniversalDevice('apple');
  const rand = (n: number) => Math.random().toString(36).substring(2, 2 + n);
  const dsid = String(Math.floor(Math.random() * 9e9) + 1e9);
  return {
    ...base,
    aclDeviceId: 'acl_dev_' + rand(16),
    aclSessionId: 'sess_' + rand(20),
    aclAnonId: 'anon_' + rand(18),
    aclDsid: dsid,
    aclLocale: 'pt-BR',
    aclCountry: 'BR',
    aclStorefront: '143,34',
    cookies: {
      ...base.cookies,
      ACL_DEVICE_ID: 'acl_dev_' + rand(16),
      ACL_SESSION: 'sess_' + rand(20),
      ACL_ANON_ID: 'anon_' + rand(18),
      ACL_DSID: dsid,
      ACL_LOCALE: 'pt-BR',
      ACL_COUNTRY: 'BR',
      ACL_STOREFRONT: '143,34',
    },
  };
}

export function buildAppleContasScriptBody(device: AppleContasDeviceProfile, persona: any): string {
  const profile = JSON.stringify({
    aclDeviceId: device.aclDeviceId,
    aclSessionId: device.aclSessionId,
    aclAnonId: device.aclAnonId,
    aclDsid: device.aclDsid,
    aclLocale: device.aclLocale,
    aclCountry: device.aclCountry,
    aclStorefront: device.aclStorefront,
    macAddress: device.macAddress,
    imei: device.imei,
    androidId: device.androidId,
    fingerprint: device.fingerprint,
    userAgent: device.userAgent,
    persona: persona ? { name: persona.fullName, email: persona.email, phone: persona.phone } : null,
  }).replace(/"/g, '\\"');

  return `
    // APPLE CONTAS - identidade e sessão (domínio real)
    const aclProfile = JSON.parse("${profile}");
    localStorage.setItem('acl_device_profile', JSON.stringify(aclProfile));
    localStorage.setItem('acl_device_id', aclProfile.aclDeviceId);
    localStorage.setItem('acl_session_id', aclProfile.aclSessionId);
    localStorage.setItem('acl_anon_id', aclProfile.aclAnonId);
    localStorage.setItem('acl_dsid', aclProfile.aclDsid);
    localStorage.setItem('_device_fingerprint', aclProfile.fingerprint);
    if (aclProfile.persona) localStorage.setItem('acl_persona', JSON.stringify(aclProfile.persona));

    // Cookies de sessão no domínio da Apple
    const setCookie = (k, v) => { document.cookie = k + '=' + v + '; path=/; max-age=31536000; SameSite=Lax'; };
    setCookie('ACL_DEVICE_ID', aclProfile.aclDeviceId);
    setCookie('ACL_SESSION', aclProfile.aclSessionId);
    setCookie('ACL_ANON_ID', aclProfile.aclAnonId);
    setCookie('ACL_DSID', aclProfile.aclDsid);
    setCookie('ACL_LOCALE', aclProfile.aclLocale);
    setCookie('ACL_COUNTRY', aclProfile.aclCountry);
    setCookie('ACL_STOREFRONT', aclProfile.aclStorefront);
  `;
}
