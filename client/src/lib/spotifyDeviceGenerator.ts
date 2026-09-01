/**
 * Spotify Device Generator - Identidade para Spotify (open.spotify.com)
 * Campos específicos: SP_DEVICE_ID, SP_SESSION, SP_ANONYMOUS_ID, SP_CLIENT_VERSION, SP_LOCALE
 * Inclui motor de bloqueio de anúncios embutido (estilo Brave/ublock):
 *   - remove banners, overlays, "apresentado por" e cards de assinatura
 *   - suprime o contador de faixa anúncio e o badge "Anúncio" no player
 *   - observa o DOM continuamente para limpar anúncios que chegam via SPA
 * Plataforma: streaming de áudio (PT-BR)
 */
import { generateUniversalDevice, UniversalDeviceProfile } from './universalDeviceGenerator';

export interface SpotifyDeviceProfile extends UniversalDeviceProfile {
  spDeviceId: string;
  spSession: string;
  spAnonymousId: string;
  spClientVersion: string;
  spLocale: string;
  adBlock: boolean;
}

export const SP_CLIENT_VERSIONS = ['1.2.52', '1.2.47', '1.2.44'];

export function generateSpotifyDevice(): SpotifyDeviceProfile {
  const base = generateUniversalDevice('spotify');
  const rand = (n: number) => Math.random().toString(36).substring(2, 2 + n);
  const clientVersion = SP_CLIENT_VERSIONS[Math.floor(Math.random() * SP_CLIENT_VERSIONS.length)];
  return {
    ...base,
    spDeviceId: 'sp_dev_' + rand(18),
    spSession: 'sess_' + rand(20),
    spAnonymousId: 'anon_' + rand(24),
    spClientVersion: clientVersion,
    spLocale: 'pt-BR',
    adBlock: true,
    cookies: {
      ...base.cookies,
      sp_t: rand(20),
      sp_dc: rand(16),
      sp_landing: 'https://open.spotify.com/',
      sp_key: rand(12),
      sp_new_session: '1',
      SP_DEVICE_ID: 'sp_dev_' + rand(18),
      SP_SESSION: 'sess_' + rand(20),
      SP_CLIENT_VERSION: clientVersion,
    },
  };
}

/**
 * Motor de bloqueio de anúncios do Spotify (estilo Brave/ublock).
 * Remove o contador de faixa anúncio, banners "apresentado por", overlays e
 * badges de "Anúncio" no player web, e continua observando o DOM para limpar
 * anúncios que chegam via SPA.
 */
const SP_AD_BLOCKER = `
  (function() {
    try {
      if (window.__SP_AD_BLOCK__) return;
      window.__SP_AD_BLOCK__ = true;

      var AD_SELECTORS = [
        '[data-testid="ad-banner"]',
        '[data-testid="upgrade-button"]',
        '[data-testid="upgrade-to-premium"]',
        '[data-testid="banner-playlist-view"]',
        '[data-testid="upsell-footer"]',
        '[data-testid="audio-ad"]',
        '[data-testid="video-ad"]',
        '[data-testid="ad-slot"]',
        '[aria-label*="Anúncio"]',
        '[aria-label*="Ad"]',
        '.Root__top-bar [class*="ad"]',
        '.ReactModalPortal [class*="ad"]',
        '.npv [class*="ad"]',
        '[class*="ad-banner"]',
        '[class*="upsell"]',
        '[class*="Advertise"]',
        '[class*="advertisement"]'
      ];

      function cleanAds() {
        var i, el, els;
        for (i = 0; i < AD_SELECTORS.length; i++) {
          els = document.querySelectorAll(AD_SELECTORS[i]);
          for (var j = 0; j < els.length; j++) {
            el = els[j];
            if (el && el.parentNode) {
              el.parentNode.removeChild(el);
            }
          }
        }
      }

      cleanAds();
      new MutationObserver(cleanAds).observe(document.documentElement, { childList: true, subtree: true, attributes: true });

      if (!window.googletag) {
        window.googletag = { cmd: [], push: function(fn) { try { fn && fn(); } catch (e) {} }, openSlots: function() { return []; } };
      }
      if (window.googletag && window.googletag.cmd) {
        window.googletag.cmd.push = function(fn) { try { fn && fn(); } catch (e) {} };
      }

      console.log('%c✓ Bloqueio de anúncios do Spotify ATIVO (estilo Brave)', 'color: #1DB954; font-weight: bold; font-size: 14px;');
    } catch (err) { console.error('SP ad block erro:', err); }
  })();
`;

export function buildSpotifyScriptBody(device: SpotifyDeviceProfile, persona: any): string {
  const profile = JSON.stringify({
    spDeviceId: device.spDeviceId,
    spSession: device.spSession,
    spAnonymousId: device.spAnonymousId,
    spClientVersion: device.spClientVersion,
    spLocale: device.spLocale,
    macAddress: device.macAddress,
    imei: device.imei,
    androidId: device.androidId,
    fingerprint: device.fingerprint,
    userAgent: device.userAgent,
    persona: persona ? { name: persona.fullName, email: persona.email, phone: persona.phone } : null,
  });

  return `
    // SPOTIFY - identidade e sessão (domínio real)
    const spProfile = JSON.parse(${JSON.stringify(profile)});
    localStorage.setItem('sp_device_profile', JSON.stringify(spProfile));
    localStorage.setItem('sp_device_id', spProfile.spDeviceId);
    localStorage.setItem('sp_session', spProfile.spSession);
    localStorage.setItem('sp_anonymous_id', spProfile.spAnonymousId);
    localStorage.setItem('sp_client_version', spProfile.spClientVersion);
    localStorage.setItem('_device_fingerprint', spProfile.fingerprint);
    if (spProfile.persona) localStorage.setItem('sp_persona', JSON.stringify(spProfile.persona));

    // Cookies de sessão no domínio do Spotify
    const setCookie = (k, v) => { document.cookie = k + '=' + v + '; path=/; max-age=31536000; SameSite=Lax'; };
    setCookie('sp_t', spProfile.spDeviceId);
    setCookie('sp_dc', spProfile.spSession);
    setCookie('sp_landing', 'https://open.spotify.com/');
    setCookie('sp_key', spProfile.spAnonymousId.substring(0, 12));
    setCookie('sp_new_session', '1');
    setCookie('SP_DEVICE_ID', spProfile.spDeviceId);
    setCookie('SP_SESSION', spProfile.spSession);

    // Motor de bloqueio de anúncios (estilo Brave/ublock)
    ${SP_AD_BLOCKER}
  `;
}
