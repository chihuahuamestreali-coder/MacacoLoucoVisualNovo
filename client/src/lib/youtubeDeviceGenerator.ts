/**
 * YouTube Device Generator - Identidade para YouTube (youtube.com)
 * Campos específicos: YT_DEVICE_ID, YT_SESSION, YT_VISITOR_DATA, YT_CLIENT_VERSION, YT_PREF
 * Inclui motor de bloqueio de anúncios embutido (estilo Brave/ublock):
 *   - remove banners, overlays e cards patrocinados
 *   - pula automaticamente pré-roll/mid-roll quando aparece o botão "Pular"
 *   - observa o DOM continuamente para limpar anúncios que chegam via SPA
 * Plataforma: streaming de vídeo (PT-BR)
 */
import { generateUniversalDevice, UniversalDeviceProfile } from './universalDeviceGenerator';

export interface YoutubeDeviceProfile extends UniversalDeviceProfile {
  ytDeviceId: string;
  ytSessionId: string;
  ytVisitorData: string;
  ytClientVersion: string;
  ytPref: string;
  ytLocale: string;
  adBlock: boolean;
}

export const YT_CLIENT_VERSIONS = ['2.20240819.00.00', '2.20240601.00.00', '2.20240712.00.00'];

export function generateYoutubeDevice(): YoutubeDeviceProfile {
  const base = generateUniversalDevice('youtube');
  const rand = (n: number) => Math.random().toString(36).substring(2, 2 + n);
  const visitorData = 'Cgt' + rand(18) + 'Eg' + rand(4);
  const clientVersion = YT_CLIENT_VERSIONS[Math.floor(Math.random() * YT_CLIENT_VERSIONS.length)];
  return {
    ...base,
    ytDeviceId: 'yt_dev_' + rand(16),
    ytSessionId: 'sess_' + rand(20),
    ytVisitorData: visitorData,
    ytClientVersion: clientVersion,
    ytPref: `f6=40000000&f7=100&hi=200&tz=America/Sao_Paulo`,
    ytLocale: 'pt-BR',
    adBlock: true,
    cookies: {
      ...base.cookies,
      VISITOR_INFO1_LIVE: 'yt_' + rand(11),
      PREF: `f6=40000000&f7=100&hi=200&tz=America/Sao_Paulo`,
      YSC: rand(11),
      GPSVisitedState: '1',
      YT_DEVICE_ID: 'yt_dev_' + rand(16),
      YT_SESSION: 'sess_' + rand(20),
      YT_CLIENT_VERSION: clientVersion,
    },
  };
}

/**
 * Motor de bloqueio de anúncios do YouTube (estilo Brave/ublock).
 * Remove banners, overlays e cards patrocinados e pula automaticamente os
 * vídeos de anúncio quando o botão "Pular anúncio" é liberado.
 */
const YT_AD_BLOCKER = `
  (function() {
    try {
      if (window.__YT_AD_BLOCK__) return;
      window.__YT_AD_BLOCK__ = true;

      var AD_SELECTORS = [
        'ytd-ad-slot-renderer',
        'ytd-player-legacy-desktop-watch-ads-renderer',
        'ytd-primetime-promo-renderer',
        'ytd-banner-promo-renderer',
        'ytd-statement-banner-renderer',
        'ytd-in-feed-ad-layout-renderer',
        'ytd-display-ad-renderer',
        'ytd-promoted-video-renderer',
        'ytd-promoted-sparkles-web-renderer',
        'ytd-companion-slot-renderer',
        'ytd-engagement-panel-title-list-renderer[is-visible] ytd-companion-slot-renderer',
        '.ytp-ad-module',
        '.ytp-ad-text-overlay',
        '.ytp-ad-simple-ad-badge',
        '.ytp-ad-player-overlay',
        '.ytp-ad-image-overlay',
        '.ad-container',
        '#masthead-ad',
        'ytd-mealbar-promo-renderer',
        'ytd-consent-bump-v2-lightbox'
      ];

      var SKIP_SELECTORS = [
        '.ytp-ad-skip-button',
        '.ytp-skip-ad-button',
        '.ytp-ad-skip-button-modern',
        'button[aria-label*="Pular anúncio"]',
        'button[aria-label*="Skip ad"]'
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
        for (i = 0; i < SKIP_SELECTORS.length; i++) {
          el = document.querySelector(SKIP_SELECTORS[i]);
          if (el && typeof el.click === 'function') {
            try { el.click(); } catch (e) {}
          }
        }
        var adShowing = document.querySelector('.ad-showing');
        if (adShowing) {
          var video = document.querySelector('video.html5-main-video');
          if (video) {
            try {
              video.muted = true;
              video.currentTime = video.duration || 0;
              video.play && video.play();
            } catch (e) {}
          }
        }
      }

      cleanAds();
      new MutationObserver(cleanAds).observe(document.documentElement, { childList: true, subtree: true });

      if (!window.googletag) {
        window.googletag = { cmd: [], push: function(fn) { try { fn && fn(); } catch (e) {} }, openSlots: function() { return []; } };
      }
      if (window.googletag && window.googletag.cmd) {
        window.googletag.cmd.push = function(fn) { try { fn && fn(); } catch (e) {} };
      }

      console.log('%c✓ Bloqueio de anúncios do YouTube ATIVO (estilo Brave)', 'color: #ff0033; font-weight: bold; font-size: 14px;');
    } catch (err) { console.error('YT ad block erro:', err); }
  })();
`;

export function buildYoutubeScriptBody(device: YoutubeDeviceProfile, persona: any): string {
  const profile = JSON.stringify({
    ytDeviceId: device.ytDeviceId,
    ytSessionId: device.ytSessionId,
    ytVisitorData: device.ytVisitorData,
    ytClientVersion: device.ytClientVersion,
    ytPref: device.ytPref,
    ytLocale: device.ytLocale,
    macAddress: device.macAddress,
    imei: device.imei,
    androidId: device.androidId,
    fingerprint: device.fingerprint,
    userAgent: device.userAgent,
    persona: persona ? { name: persona.fullName, email: persona.email, phone: persona.phone } : null,
  }).replace(/"/g, '\\"');

  return `
    // YOUTUBE - identidade e sessão (domínio real)
    const ytProfile = JSON.parse("${profile}");
    localStorage.setItem('yt_device_profile', JSON.stringify(ytProfile));
    localStorage.setItem('yt_device_id', ytProfile.ytDeviceId);
    localStorage.setItem('yt_session_id', ytProfile.ytSessionId);
    localStorage.setItem('yt_visitor_data', ytProfile.ytVisitorData);
    localStorage.setItem('yt_client_version', ytProfile.ytClientVersion);
    localStorage.setItem('_device_fingerprint', ytProfile.fingerprint);
    if (ytProfile.persona) localStorage.setItem('yt_persona', JSON.stringify(ytProfile.persona));

    // Cookies de sessão no domínio do YouTube
    const setCookie = (k, v) => { document.cookie = k + '=' + v + '; path=/; max-age=31536000; SameSite=Lax'; };
    setCookie('VISITOR_INFO1_LIVE', ytProfile.ytVisitorData);
    setCookie('PREF', ytProfile.ytPref);
    setCookie('YSC', 'yt_' + Math.random().toString(36).substring(2, 13));
    setCookie('GPSVisitedState', '1');
    setCookie('YT_DEVICE_ID', ytProfile.ytDeviceId);
    setCookie('YT_SESSION', ytProfile.ytSessionId);

    // Motor de bloqueio de anúncios (estilo Brave/ublock)
    ${YT_AD_BLOCKER}
  `;
}
