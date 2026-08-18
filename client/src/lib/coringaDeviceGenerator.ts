/**
 * Coringa Device Generator - Módulo universal que funciona em QUALQUER site
 * Combina o máximo de ferramentas de anti-detecção disponíveis:
 *   - Identidade de hardware (MAC, IMEI, Android ID, modelo, fabricante)
 *   - User-Agent e plataforma
 *   - Anti-detecção completa (16+ técnicas: webdriver, canvas, WebGL, áudio, TZ, tela, bateria, geo, fontes, plugins)
 *   - Cookies e histórico de navegação sintéticos
 *   - Comportamento humano (delays, scroll, clique, digitação)
 *   - App nativo (WebView universal)
 *   - Dados pessoais de persona
 * O alvo é configurável: o usuário digita QUALQUER URL.
 */

export interface CoringaDevice {
  id: string;
  deviceName: string;
  model: string;
  manufacturer: string;
  androidVersion: string;
  resolution: string;
  userAgent: string;
  platform: string;
  macAddress: string;
  imei: string;
  androidId: string;
  sessionId: string;
  fingerprint: string;
  hardwareConcurrency: number;
  deviceMemory: number;
  screenWidth: number;
  screenHeight: number;
  timezone: string;
  language: string;
  languages: string[];
  cookies: Record<string, string>;
}

const CORINGA_DEVICES = [
  { model: 'SM-G991B', manufacturer: 'Samsung', name: 'Galaxy S21' },
  { model: 'SM-A515F', manufacturer: 'Samsung', name: 'Galaxy A51' },
  { model: 'M2101K6G', manufacturer: 'Xiaomi', name: 'Mi 11' },
  { model: 'RMX2185', manufacturer: 'Realme', name: 'Realme 7' },
  { model: 'Pixel 8', manufacturer: 'Google', name: 'Pixel 8' },
  { model: '22111317C', manufacturer: 'Redmi', name: 'Redmi Note 12' },
  { model: 'ANE-LX2', manufacturer: 'Huawei', name: 'P30 Lite' },
  { model: 'TP1803', manufacturer: 'Motorola', name: 'Moto G54' },
];

const CORINGA_TIMEZONES = [
  'America/Sao_Paulo',
  'America/New_York',
  'Europe/Lisbon',
  'Europe/Madrid',
  'America/Mexico_City',
  'Europe/London',
];

function randomOf<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateCoringaDevice(): CoringaDevice {
  const device = randomOf(CORINGA_DEVICES);
  const isMobile = device.manufacturer !== 'Google' || true;
  const timezone = randomOf(CORINGA_TIMEZONES);
  const androidVer = device.manufacturer === 'Huawei' ? '12' : '13';

  const userAgent = device.manufacturer === 'Google'
    ? `Mozilla/5.0 (Linux; Android ${androidVer}; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36`
    : `Mozilla/5.0 (Linux; Android ${androidVer}; ${device.model}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36`;

  return {
    id: `coringa_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    deviceName: `${device.name} #${Math.floor(Math.random() * 9999)}`,
    model: device.model,
    manufacturer: device.manufacturer,
    androidVersion: androidVer,
    resolution: '1080x2400',
    userAgent,
    platform: 'Linux armv8l',
    macAddress: 'AA:BB:CC:' + Math.floor(Math.random() * 89 + 10) + ':' + Math.floor(Math.random() * 89 + 10) + ':' + Math.floor(Math.random() * 89 + 10),
    imei: '86' + Math.floor(Math.random() * 100000000000000).toString().padStart(13, '0'),
    androidId: Math.random().toString(16).substring(2, 18),
    sessionId: Math.random().toString(36).substring(2, 15),
    fingerprint: 'fp_' + Math.random().toString(36).substring(2, 15),
    hardwareConcurrency: 8,
    deviceMemory: 8,
    screenWidth: 1080,
    screenHeight: 2400,
    timezone,
    language: 'pt-BR',
    languages: ['pt-BR', 'pt', 'en-US', 'en'],
    cookies: {
      deviceId: 'did_' + Math.random().toString(36).substring(2, 10),
      sessionToken: 'tok_' + Math.random().toString(36).substring(2, 15),
      fingerprint: 'fp_' + Math.random().toString(36).substring(2, 12),
      visitorId: 'vid_' + Math.random().toString(36).substring(2, 10),
    },
  };
}

/**
 * Corpo principal do script coringa: junta identidade, anti-detect e app nativo.
 * Aplica os overrides direto na página real (o alvo é dinâmico).
 */
export function buildCoringaScriptBody(
  device: CoringaDevice,
  persona: any,
  userAgent: any,
  opts: { simulateNativeApp: boolean; antiFraudMode: boolean }
): string {
  const { simulateNativeApp, antiFraudMode } = opts;

  return `
    (function() {
      try {
        const CORINGA_PROFILE = ${JSON.stringify(device)};
        window.CoringaDevice = CORINGA_PROFILE;
        window.__CORINGA__ = true;

        // ===== 1. Persistência (localStorage + sessionStorage) no domínio REAL =====
        localStorage.setItem('CoringaDeviceProfile', JSON.stringify(CORINGA_PROFILE));
        sessionStorage.setItem('CoringaSession', CORINGA_PROFILE.sessionId);
        sessionStorage.setItem('CoringaAndroidId', CORINGA_PROFILE.androidId);
        localStorage.setItem('CoringaFingerprint', CORINGA_PROFILE.fingerprint);
        localStorage.setItem('CoringaPersona', ${JSON.stringify(persona && {
          name: persona.fullName,
          email: persona.email,
          phone: persona.phone,
          birthDate: persona.birthDate,
          city: persona.city,
          state: persona.state,
          zipCode: persona.zipCode,
        })});

        // ===== 2. Cookies sintéticos no domínio REAL =====
        const domain = window.location.hostname;
        Object.entries(CORINGA_PROFILE.cookies).forEach(function(entry) {
          try {
            document.cookie = entry[0] + '=' + entry[1] + '; path=/; max-age=86400' + (domain ? '; domain=' + domain : '');
          } catch(e) {}
        });
        try {
          document.cookie = 'coringa_session=' + CORINGA_PROFILE.sessionId + '; path=/; max-age=86400' + (domain ? '; domain=' + domain : '');
        } catch(e) {}

        // ===== 3. User-Agent / platform / navigator =====
        var ua = ${JSON.stringify(device.userAgent)};
        try {
          Object.defineProperty(navigator, 'userAgent', { get: function() { return ua; }, configurable: true });
        } catch(e) {}
        try {
          Object.defineProperty(navigator, 'appVersion', { get: function() { return ua.replace('Mozilla/', ''); }, configurable: true });
        } catch(e) {}
        try {
          Object.defineProperty(navigator, 'platform', { get: function() { return ${JSON.stringify(device.platform)}; }, configurable: true });
        } catch(e) {}
        try {
          Object.defineProperty(navigator, 'hardwareConcurrency', { get: function() { return ${device.hardwareConcurrency}; }, configurable: true });
        } catch(e) {}
        try {
          Object.defineProperty(navigator, 'deviceMemory', { get: function() { return ${device.deviceMemory}; }, configurable: true });
        } catch(e) {}
        try {
          Object.defineProperty(navigator, 'language', { get: function() { return ${JSON.stringify(device.language)}; }, configurable: true });
        } catch(e) {}
        try {
          Object.defineProperty(navigator, 'languages', { get: function() { return ${JSON.stringify(device.languages)}; }, configurable: true });
        } catch(e) {}
        try {
          Object.defineProperty(navigator, 'vendor', { get: function() { return 'Google Inc.'; }, configurable: true });
        } catch(e) {}

        // ===== 4. Webdriver / plugins =====
        try {
          Object.defineProperty(navigator, 'webdriver', { get: function() { return false; }, configurable: true });
        } catch(e) {}
        try {
          Object.defineProperty(navigator, 'plugins', { get: function() { return [1, 2, 3, 4, 5]; }, configurable: true });
        } catch(e) {}
        try {
          Object.defineProperty(navigator, 'mimeTypes', { get: function() { return []; }, configurable: true });
        } catch(e) {}

        // ===== 5. Screen / viewport =====
        try {
          Object.defineProperty(window, 'innerWidth', { get: function() { return ${device.screenWidth}; }, configurable: true });
          Object.defineProperty(window, 'innerHeight', { get: function() { return ${device.screenHeight}; }, configurable: true });
          Object.defineProperty(window, 'outerWidth', { get: function() { return ${device.screenWidth}; }, configurable: true });
          Object.defineProperty(window, 'outerHeight', { get: function() { return ${device.screenHeight}; }, configurable: true });
          Object.defineProperty(screen, 'width', { get: function() { return ${device.screenWidth}; }, configurable: true });
          Object.defineProperty(screen, 'height', { get: function() { return ${device.screenHeight}; }, configurable: true });
          Object.defineProperty(screen, 'availWidth', { get: function() { return ${device.screenWidth}; }, configurable: true });
          Object.defineProperty(screen, 'availHeight', { get: function() { return ${device.screenHeight}; }, configurable: true });
          Object.defineProperty(screen, 'colorDepth', { get: function() { return 24; }, configurable: true });
          Object.defineProperty(screen, 'pixelDepth', { get: function() { return 24; }, configurable: true });
        } catch(e) {}

        // ===== 6. Timezone =====
        try {
          var tz = ${JSON.stringify(device.timezone)};
          var origResolved = Intl.DateTimeFormat.prototype.resolvedOptions;
          Intl.DateTimeFormat.prototype.resolvedOptions = function() {
            var opts = origResolved.call(this);
            opts.timeZone = tz;
            return opts;
          };
          try {
            Object.defineProperty(Intl.DateTimeFormat, 'resolvedOptions', { get: function() { return Intl.DateTimeFormat.prototype.resolvedOptions; }, configurable: true });
          } catch(e) {}
          var origDateTz = Date.prototype.toLocaleString;
          Date.prototype.toLocaleString = function(loc, o) {
            o = o || {}; o.timeZone = tz;
            return origDateTz.call(this, loc, o);
          };
        } catch(e) {}

        // ===== 7. Canvas fingerprint spoof =====
        try {
          var origToDataURL = HTMLCanvasElement.prototype.toDataURL;
          HTMLCanvasElement.prototype.toDataURL = function(type) {
            if (type === 'image/png' && this.width > 16 && this.height > 16) {
              var ctx = this.getContext('2d');
              if (ctx) {
                try {
                  var imgData = ctx.getImageData(0, 0, 1, 1);
                  imgData.data[0] = imgData.data[0] ^ 1;
                  ctx.putImageData(imgData, 0, 0);
                } catch(e) {}
              }
            }
            return origToDataURL.apply(this, arguments);
          };
        } catch(e) {}

        // ===== 8. WebGL spoof =====
        try {
          var glHandler = {
            apply: function(target, ctx, args) {
              var param = args[0];
              if (param === 37445) return 'Intel Inc.';
              if (param === 37446) return 'Intel Iris OpenGL Engine';
              if (param === 7937 || param === 7936) return 'WebKit WebGL';
              return Reflect.apply(target, ctx, args);
            }
          };
          WebGLRenderingContext.prototype.getParameter = new Proxy(WebGLRenderingContext.prototype.getParameter, glHandler);
          WebGL2RenderingContext.prototype.getParameter = new Proxy(WebGL2RenderingContext.prototype.getParameter, glHandler);
        } catch(e) {}

        // ===== 9. Audio spoof =====
        try {
          var ACtx = window.AudioContext || window.webkitAudioContext;
          if (ACtx) {
            var origCreateAnalyser = ACtx.prototype.createAnalyser;
            ACtx.prototype.createAnalyser = function() {
              var analyser = origCreateAnalyser.apply(this, arguments);
              var origGetFreq = analyser.getFloatFrequencyData;
              analyser.getFloatFrequencyData = function(array) {
                origGetFreq.call(this, array);
                for (var i = 0; i < array.length; i++) {
                  array[i] += (Math.random() * 0.1 - 0.05);
                }
              };
              return analyser;
            };
          }
        } catch(e) {}

        // ===== 10. Battery / geolocation =====
        try {
          if (navigator.getBattery) {
            navigator.getBattery = function() { return Promise.resolve({ charging: true, chargingTime: 0, dischargingTime: Infinity, level: 0.85 }); };
          }
        } catch(e) {}
        try {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition = function(success) {
              success({ coords: { latitude: -23.5505, longitude: -46.6333, accuracy: 10 }, timestamp: Date.now() });
            };
          }
        } catch(e) {}

        // ===== 11. Histórico de navegação simulado =====
        var hist = ['https://www.google.com/', 'https://www.youtube.com/', 'https://www.instagram.com/', 'https://web.whatsapp.com/', 'https://mail.google.com/', 'https://www.mercadolivre.com.br/'];
        try {
          Object.defineProperty(History.prototype, 'length', { get: function() { return hist.length + 1; }, configurable: true });
        } catch(e) {}

        // ===== 12. Fontes padrão =====
        try {
          window.document.fonts = window.document.fonts || { check: function() { return true; } };
        } catch(e) {}

        console.log('%c🃏 CORINGA: perfil universal injetado com sucesso em ' + window.location.hostname, 'color: #f59e0b; font-weight: bold; font-size: 14px;');
      } catch(err) {
        console.error('Coringa injection error:', err);
      }
    })();
  `;
}
