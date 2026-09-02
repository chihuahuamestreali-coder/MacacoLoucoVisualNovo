import { generateSpotifyDevice, type SpotifyDeviceProfile } from './spotifyDeviceGenerator';

export type SpotifyPlusDeviceProfile = SpotifyDeviceProfile & {
  spPlaylistId: string;
  spMarket: string;
  braveShield: boolean;
};

const EMBED_KINDS = ['album', 'playlist', 'track', 'artist', 'episode', 'show'];

export function parseSpotifyTarget(rawUrl: string): {
  url: string;
  kind: string;
  id: string;
} {
  const trimmed = (rawUrl || '').trim();
  if (!trimmed) {
    return { url: '', kind: 'home', id: '' };
  }
  const withProto = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const parsed = new URL(withProto);
    const parts = parsed.pathname.split('/').filter(Boolean);
    let i = 0;
    if (parts[0] && /^intl-[a-z0-9-]+$/i.test(parts[0])) i = 1;
    if (parts[i] === 'embed') i += 1;
    const kind = parts[i] || 'home';
    const id = (parts[i + 1] || '').split('?')[0];
    return { url: parsed.toString(), kind, id };
  } catch {
    return { url: withProto, kind: 'custom', id: '' };
  }
}

export function toSpotifyEmbedUrl(rawUrl: string): string {
  const target = parseSpotifyTarget(rawUrl);
  if (!target.id) return '';
  const kind = EMBED_KINDS.includes(target.kind) ? target.kind : 'album';
  return `https://open.spotify.com/embed/${kind}/${target.id}?utm_source=generator&theme=0`;
}

export function generateSpotifyPlusDevice(): SpotifyPlusDeviceProfile {
  const base = generateSpotifyDevice();
  const rand = (n: number) => Math.random().toString(36).substring(2, 2 + n);
  return {
    ...base,
    spPlaylistId: 'pl_' + rand(22),
    spMarket: 'BR',
    braveShield: true,
  };
}

const SP_PLUS_BRAVE_SHIELD = `
  (function() {
    try {
      if (window.__SP_PLUS_BRAVE__) return;
      window.__SP_PLUS_BRAVE__ = true;

      var AD_HOSTS = [
        'doubleclick.net',
        'googlesyndication.com',
        'googleadservices.com',
        'adservice.google.com',
        'pagead2.googlesyndication.com',
        'securepubads.g.doubleclick.net',
        'adclick.g.doubleclick.net',
        'ade.googlesyndication.com',
        'ads.spotify.com',
        'audio-ak-spotify-com.akamaized.net',
        'audio-fa.scdn.co',
        'adclick.spotify.com',
        'spclient.wg.spotify.com/ads',
        'gew1-spclient.spotify.com/ads',
        'guc3-spclient.spotify.com/ads',
        'spotify.com/v1/ads',
        'spotify.com/ads/',
        'adstudio.spotify.com',
        'pixel.spotify.com',
        'analytics.spotify.com'
      ];

      var AD_SELECTORS = [
        '[data-testid="ad-banner"]',
        '[data-testid="upgrade-button"]',
        '[data-testid="upgrade-to-premium"]',
        '[data-testid="banner-playlist-view"]',
        '[data-testid="upsell-footer"]',
        '[data-testid="audio-ad"]',
        '[data-testid="video-ad"]',
        '[data-testid="ad-slot"]',
        '[data-testid="premium-upsell"]',
        '[data-testid="now-playing-ad"]',
        '[data-testid="now-playing-bar-ad"]',
        '[data-testid="now-playing-view"]',
        '[data-testid="tracklist-ad"]',
        '[data-testid="video-npx"]',
        '[aria-label*="Anuncio"]',
        '[aria-label*="Anúncio"]',
        '[aria-label*="Advertisement"]',
        '[aria-label*="Now Playing View"]',
        '[class*="ad-banner"]',
        '[class*="upsell"]',
        '[class*="Advertise"]',
        '[class*="advertisement"]',
        '[class*="AdSlot"]',
        '[class*="sponsored"]',
        '[class*="nowPlayingView"]',
        '[class*="NowPlayingView"]',
        '.Root__right-sidebar',
        '.Root__top-bar [class*="ad"]',
        '.ReactModalPortal [class*="ad"]',
        '.npv [class*="ad"]'
      ];

      var style = document.createElement('style');
      style.id = 'sp-plus-brave-css';
      style.textContent = [
        '[data-testid="ad-banner"],[data-testid="upgrade-button"],[data-testid="upgrade-to-premium"],',
        '[data-testid="banner-playlist-view"],[data-testid="upsell-footer"],[data-testid="audio-ad"],',
        '[data-testid="video-ad"],[data-testid="ad-slot"],[data-testid="premium-upsell"],',
        '[data-testid="now-playing-ad"],[data-testid="now-playing-bar-ad"],[data-testid="now-playing-view"],',
        '[data-testid="tracklist-ad"],[data-testid="video-npx"],.Root__right-sidebar,',
        '[class*="ad-banner"],[class*="upsell"],[class*="Advertise"],[class*="advertisement"],',
        '[class*="AdSlot"],[class*="sponsored"],[class*="nowPlayingView"],[class*="NowPlayingView"]{display:none!important;visibility:hidden!important;width:0!important;height:0!important;max-height:0!important;overflow:hidden!important;pointer-events:none!important;}'
      ].join('');
      (document.head || document.documentElement).appendChild(style);

      function isAdHost(url) {
        if (!url) return false;
        var u = String(url).toLowerCase();
        for (var i = 0; i < AD_HOSTS.length; i++) {
          if (u.indexOf(AD_HOSTS[i]) !== -1) return true;
        }
        return /[?&](ad|ads|advert|sponsored|promo)=/i.test(u) || /\\/ads?(\\/|\\?|$)/i.test(u);
      }

      function looksLikeAdRow(el) {
        if (!el || !el.getAttribute) return false;
        var label = (el.getAttribute('aria-label') || '') + ' ' + (el.textContent || '');
        return /an[uú]ncio|advertisement|sponsored|apresentado por|ad break|musica vai continuar|música vai continuar|curta 3 meses|saiba mais/i.test(label);
      }

      function cleanAds() {
        var i, j, el, els, rows;
        for (i = 0; i < AD_SELECTORS.length; i++) {
          els = document.querySelectorAll(AD_SELECTORS[i]);
          for (j = 0; j < els.length; j++) {
            el = els[j];
            if (el && el.parentNode) el.parentNode.removeChild(el);
          }
        }
        rows = document.querySelectorAll('[data-testid="tracklist-row"],[role="row"],[data-testid="now-playing-widget"]');
        for (i = 0; i < rows.length; i++) {
          if (looksLikeAdRow(rows[i]) && rows[i].parentNode) {
            rows[i].parentNode.removeChild(rows[i]);
          }
        }
        var badges = document.querySelectorAll('span,div,p');
        for (i = 0; i < badges.length; i++) {
          el = badges[i];
          if (!el || !el.childNodes || el.childNodes.length > 2) continue;
          var t = (el.textContent || '').trim();
          if (t === 'Anuncio' || t === 'Anúncio' || t === 'Ad' || t === 'Advertisement') {
            if (el.parentNode) el.parentNode.removeChild(el);
          }
        }
      }

      if (window.fetch) {
        var nativeFetch = window.fetch.bind(window);
        window.fetch = function(input, init) {
          var url = typeof input === 'string' ? input : (input && input.url);
          if (isAdHost(url)) {
            return Promise.resolve(new Response('{}', { status: 204, statusText: 'No Content' }));
          }
          return nativeFetch(input, init);
        };
      }

      if (window.XMLHttpRequest) {
        var NativeXHR = window.XMLHttpRequest;
        window.XMLHttpRequest = function() {
          var xhr = new NativeXHR();
          var open = xhr.open;
          xhr.open = function(method, url) {
            if (isAdHost(url)) {
              arguments[1] = 'data:text/plain,';
            }
            return open.apply(xhr, arguments);
          };
          return xhr;
        };
      }

      if (!window.googletag) {
        window.googletag = { cmd: [], push: function(fn) { try { fn && fn(); } catch (e) {} }, openSlots: function() { return []; } };
      }
      if (window.googletag && window.googletag.cmd) {
        window.googletag.cmd.push = function(fn) { try { fn && fn(); } catch (e) {} };
      }

      cleanAds();
      new MutationObserver(cleanAds).observe(document.documentElement, { childList: true, subtree: true, attributes: true });
      setInterval(cleanAds, 1200);

      console.log('%c Spotify-Plus Brave Shield ATIVO', 'color: #1DB954; font-weight: bold; font-size: 14px;');
    } catch (err) { console.error('SP-Plus brave shield erro:', err); }
  })();
`;

export function buildSpotifyPlusScriptBody(
  device: SpotifyPlusDeviceProfile,
  persona: any,
  targetUrl?: string,
): string {
  const target = parseSpotifyTarget(targetUrl || 'https://open.spotify.com');
  const profile = JSON.stringify({
    spDeviceId: device.spDeviceId,
    spSession: device.spSession,
    spAnonymousId: device.spAnonymousId,
    spClientVersion: device.spClientVersion,
    spLocale: device.spLocale,
    spPlaylistId: device.spPlaylistId,
    spMarket: device.spMarket,
    macAddress: device.macAddress,
    imei: device.imei,
    androidId: device.androidId,
    fingerprint: device.fingerprint,
    userAgent: device.userAgent,
    targetUrl: target.url,
    targetKind: target.kind,
    targetId: target.id,
    persona: persona ? { name: persona.fullName, email: persona.email, phone: persona.phone } : null,
  });

  return `
    const spPlusProfile = JSON.parse(${JSON.stringify(profile)});
    localStorage.setItem('sp_plus_device_profile', JSON.stringify(spPlusProfile));
    localStorage.setItem('sp_plus_target_url', spPlusProfile.targetUrl);
    localStorage.setItem('sp_plus_target_kind', spPlusProfile.targetKind);
    localStorage.setItem('sp_plus_target_id', spPlusProfile.targetId);
    localStorage.setItem('sp_device_profile', JSON.stringify(spPlusProfile));
    localStorage.setItem('sp_device_id', spPlusProfile.spDeviceId);
    localStorage.setItem('sp_session', spPlusProfile.spSession);
    localStorage.setItem('sp_anonymous_id', spPlusProfile.spAnonymousId);
    localStorage.setItem('sp_client_version', spPlusProfile.spClientVersion);
    localStorage.setItem('_device_fingerprint', spPlusProfile.fingerprint);
    if (spPlusProfile.persona) localStorage.setItem('sp_persona', JSON.stringify(spPlusProfile.persona));

    const setCookie = (k, v) => { document.cookie = k + '=' + v + '; path=/; max-age=31536000; SameSite=Lax'; };
    setCookie('sp_t', spPlusProfile.spDeviceId);
    setCookie('sp_dc', spPlusProfile.spSession);
    setCookie('sp_landing', spPlusProfile.targetUrl || 'https://open.spotify.com/');
    setCookie('sp_key', spPlusProfile.spAnonymousId.substring(0, 12));
    setCookie('sp_new_session', '1');
    setCookie('SP_DEVICE_ID', spPlusProfile.spDeviceId);
    setCookie('SP_SESSION', spPlusProfile.spSession);
    setCookie('SP_PLUS_TARGET', encodeURIComponent(spPlusProfile.targetUrl || ''));

    ${SP_PLUS_BRAVE_SHIELD}
  `;
}
