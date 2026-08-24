/**
 * Identity Pack Global — Pacotão único de identidade para colar no console
 * de QUALQUER site (não é específico do Manus).
 *
 * Gera UMA única injeção que combina:
 *  - perfil de dispositivo (perfil)
 *  - injeção local (localStorage/sessionStorage)
 *  - user-agent realista
 *  - anti-detecção (webdriver, plugins, vendor, etc.)
 *  - canvas fingerprint override
 *  - webgl fingerprint override
 *  - audio context override
 *  - timezone override
 *  - screen/viewport override
 *  - app nativo simulado (universal)
 *  - comportamento humano (digitação, mouse, scroll)
 *  - dados pessoais (persona)
 *  - cookies realistas + fingerprint persistido
 *
 * O resultado é colado de UMA vez no console (F12) da aba do site alvo.
 */

import { generateDeviceProfile, type DeviceProfile } from "./deviceGenerator";
import { generatePersonalData, type PersonalData } from "./personalDataGenerator";
import { generateRandomUserAgent, type UserAgentProfile } from "./cookieAndUserAgentManager";
import { wrapInSiteScript } from "./inSiteInjection";

export interface IdentityPackResult {
  script: string;
  profile: DeviceProfile;
  persona: PersonalData;
  ua: UserAgentProfile;
}

export const IDENTITY_PACK_FEATURES: string[] = [
  "Perfil de dispositivo",
  "Injeção local",
  "User-Agent",
  "Anti-detecção",
  "Canvas",
  "WebGL",
  "Fingerprint",
  "App nativo",
  "Comportamento humano",
  "Dados pessoais",
  "Timezone",
  "Cookies",
];

export function generateGlobalIdentityPack(): IdentityPackResult {
  const profile = generateDeviceProfile();
  const persona = generatePersonalData();
  const ua = generateRandomUserAgent();

  const profileJson = JSON.stringify(profile);
  const personaJson = JSON.stringify(persona);
  const uaJson = JSON.stringify(ua);

  const [width, height] = profile.resolution.split("x").map(Number);
  const screenWidth = width || 1080;
  const screenHeight = height || 2340;

  const body = `
    // ================= 1. IDENTIDADE GERADA =================
    const __asgardProfile = ${profileJson};
    const __asgardPersona = ${personaJson};
    const __asgardUA = ${uaJson};

    // ================= 2. INJEÇÃO LOCAL =================
    try {
      localStorage.setItem('device_profile', JSON.stringify(__asgardProfile));
      localStorage.setItem('_device_fingerprint', __asgardProfile.fingerprint);
      localStorage.setItem('_device_model', __asgardProfile.model);
      localStorage.setItem('_device_mac', __asgardProfile.macAddress);
      localStorage.setItem('_device_imei', __asgardProfile.imei);
      localStorage.setItem('_identity_ua', JSON.stringify(__asgardUA));
      localStorage.setItem('_persona', JSON.stringify(__asgardPersona));
      sessionStorage.setItem('device_fingerprint', __asgardProfile.fingerprint);
      sessionStorage.setItem('device_profile', JSON.stringify(__asgardProfile));
      sessionStorage.setItem('persona', JSON.stringify(__asgardPersona));
    } catch(e) {}

    // ================= 3. USER-AGENT / NAVIGATOR =================
    try { Object.defineProperty(navigator, 'userAgent', { get: () => __asgardUA.userAgent, configurable: true }); } catch(e) {}
    try { Object.defineProperty(navigator, 'appVersion', { get: () => __asgardUA.userAgent.replace('Mozilla/', ''), configurable: true }); } catch(e) {}
    try { Object.defineProperty(navigator, 'platform', { get: () => __asgardUA.platform, configurable: true }); } catch(e) {}
    try { Object.defineProperty(navigator, 'languages', { get: () => ['pt-BR', 'pt', 'en-US', 'en'], configurable: true }); } catch(e) {}
    try { Object.defineProperty(navigator, 'language', { get: () => 'pt-BR', configurable: true }); } catch(e) {}
    try { Object.defineProperty(navigator, 'vendor', { get: () => 'Google Inc.', configurable: true }); } catch(e) {}
    try { Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => __asgardProfile.cpuCores, configurable: true }); } catch(e) {}
    try { Object.defineProperty(navigator, 'deviceMemory', { get: () => __asgardProfile.ramMb, configurable: true }); } catch(e) {}
    try { Object.defineProperty(navigator, 'webdriver', { get: () => false, configurable: true }); } catch(e) {}
    try { Object.defineProperty(navigator, 'maxTouchPoints', { get: () => 5, configurable: true }); } catch(e) {}
    try { Object.defineProperty(navigator, 'cookieEnabled', { get: () => true, configurable: true }); } catch(e) {}

    // ================= 4. TELA / VIEWPORT =================
    try { Object.defineProperty(window, 'innerWidth', { get: () => ${screenWidth}, configurable: true }); } catch(e) {}
    try { Object.defineProperty(window, 'innerHeight', { get: () => ${screenHeight}, configurable: true }); } catch(e) {}
    try { Object.defineProperty(screen, 'width', { get: () => ${screenWidth}, configurable: true }); } catch(e) {}
    try { Object.defineProperty(screen, 'height', { get: () => ${screenHeight}, configurable: true }); } catch(e) {}
    try { Object.defineProperty(screen, 'availWidth', { get: () => ${screenWidth}, configurable: true }); } catch(e) {}
    try { Object.defineProperty(screen, 'availHeight', { get: () => ${Math.max(screenHeight - 40, 600)}, configurable: true }); } catch(e) {}
    try { Object.defineProperty(window, 'devicePixelRatio', { get: () => 2.0, configurable: true }); } catch(e) {}
    try { Object.defineProperty(screen, 'colorDepth', { get: () => 24, configurable: true }); } catch(e) {}

    // ================= 5. CANVAS FINGERPRINT =================
    try {
      const _origToDataURL = HTMLCanvasElement.prototype.toDataURL;
      HTMLCanvasElement.prototype.toDataURL = function(...args) {
        try {
          const ctx = this.getContext && this.getContext('2d');
          if (ctx && typeof ctx.getImageData === 'function') {
            const imgData = ctx.getImageData(0, 0, 1, 1);
            imgData.data[0] = imgData.data[0] ^ 1;
            ctx.putImageData(imgData, 0, 0);
          }
        } catch(e) {}
        return _origToDataURL.apply(this, args);
      };
    } catch(e) {}

    // ================= 6. WEBGL FINGERPRINT =================
    try {
      const _glProxy = {
        apply(target, ctx, args) {
          const param = args[0];
          if (param === 37445) return 'Intel Inc.';
          if (param === 37446) return 'Intel Iris OpenGL Engine';
          return Reflect.apply(target, ctx, args);
        }
      };
      if (WebGLRenderingContext && WebGLRenderingContext.prototype.getParameter) {
        WebGLRenderingContext.prototype.getParameter = new Proxy(WebGLRenderingContext.prototype.getParameter, _glProxy);
      }
      if (window.WebGL2RenderingContext && WebGL2RenderingContext.prototype.getParameter) {
        WebGL2RenderingContext.prototype.getParameter = new Proxy(WebGL2RenderingContext.prototype.getParameter, _glProxy);
      }
    } catch(e) {}

    // ================= 7. AUDIO CONTEXT =================
    try {
      const _AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (_AudioCtx && _AudioCtx.prototype.createAnalyser) {
        const _origAnalyser = _AudioCtx.prototype.createAnalyser;
        _AudioCtx.prototype.createAnalyser = function(...args) {
          const analyser = _origAnalyser.apply(this, args);
          const _origGetFloat = analyser.getFloatFrequencyData;
          analyser.getFloatFrequencyData = function(arr) {
            _origGetFloat.call(this, arr);
            for (let i = 0; i < arr.length; i++) arr[i] += (Math.random() * 0.1 - 0.05);
          };
          return analyser;
        };
      }
    } catch(e) {}

    // ================= 8. TIMEZONE =================
    try {
      Object.defineProperty(Intl.DateTimeFormat.prototype, 'resolvedOptions', {
        value: function() {
          const o = Intl.DateTimeFormat.prototype.resolvedOptions.call(this);
          o.timeZone = ${JSON.stringify(persona.timezone)};
          return o;
        }
      });
    } catch(e) {}

    // ================= 9. PLUGINS / MIMETYPES =================
    try { Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5], configurable: true }); } catch(e) {}
    try { Object.defineProperty(navigator, 'mimeTypes', { get: () => [1, 2, 3, 4, 5], configurable: true }); } catch(e) {}

    // ================= 10. BATTERY =================
    try { if (navigator.getBattery) navigator.getBattery = () => Promise.resolve({ charging: true, chargingTime: 0, dischargingTime: Infinity, level: 0.85 }); } catch(e) {}

    // ================= 11. GEOLOCATION =================
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition = (cb) => cb({ coords: { latitude: -23.5505, longitude: -46.6333, accuracy: 10 }, timestamp: Date.now() });
      }
    } catch(e) {}

    // ================= 12. APP NATIVO UNIVERSAL =================
    try {
      window.isWebview = true;
      window.__APP_ENV__ = 'native';
      window.__NATIVE_SHELL__ = true;
      if (!window.ReactNativeWebView) window.ReactNativeWebView = { postMessage: function(){} };
    } catch(e) {}

    // ================= 13. COMPORTAMENTO HUMANO =================
    try {
      window.humanDelay = function(min = 1000, max = 5000) {
        return new Promise(r => setTimeout(r, Math.floor(Math.random() * (max - min + 1)) + min));
      };
      window.typeText = async function(el, text) {
        el.focus();
        for (const ch of text) {
          el.value += ch;
          el.dispatchEvent(new Event('input', { bubbles: true }));
          await new Promise(r => setTimeout(r, 80 + Math.random() * 120));
        }
      };
      window.moveMouse = async function(x1, y1, x2, y2) {
        for (let i = 0; i <= 10; i++) {
          const t = i / 10;
          document.dispatchEvent(new MouseEvent('mousemove', { clientX: x1 + (x2 - x1) * t, clientY: y1 + (y2 - y1) * t, bubbles: true }));
          await new Promise(r => setTimeout(r, 50));
        }
      };
      window.scrollNaturally = async function(target) {
        const cur = window.scrollY, dist = target - cur;
        for (let i = 0; i <= 20; i++) {
          window.scrollTo(0, cur + dist * (i / 20));
          await new Promise(r => setTimeout(r, 50));
        }
      };
    } catch(e) {}

    // ================= 14. COOKIES + FINGERPRINT =================
    try {
      const _ts = Date.now();
      document.cookie.split(';').forEach(function(c) {
        document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
      });
      document.cookie = '_ga=GA1.2.' + Math.floor(Math.random() * 1e9) + '.' + _ts + '; path=/; max-age=' + 31536000;
      document.cookie = '_gid=GA1.2.' + Math.floor(Math.random() * 1e9) + '.' + _ts + '; path=/; max-age=' + 31536000;
      document.cookie = '_asgard_identity=' + __asgardProfile.fingerprint + '; path=/; max-age=' + 31536000;
    } catch(e) {}
  `;

  const script = wrapInSiteScript(
    "ASGARD · IDENTIDADE GLOBAL",
    body,
    IDENTITY_PACK_FEATURES,
    "#c084fc",
  );

  return { script, profile, persona, ua };
}
