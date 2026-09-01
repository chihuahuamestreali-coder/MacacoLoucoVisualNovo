import ManusStyleInjectionPage from '@/components/ManusStyleInjectionPage';
import { MODULE_GUIDES } from '@/lib/moduleGuides';
import { generateSpotifyDevice, buildSpotifyScriptBody } from '@/lib/spotifyDeviceGenerator';

export default function SpotifyManager() {
  return (
    <>
      <ManusStyleInjectionPage
        config={{
          siteKey: 'spotify',
          siteName: 'Spotify',
          siteTitle: 'SPOTIFY DEVICE MASTER',
          tagline: 'Streaming de música sem anúncios • open.spotify.com (bloqueio estilo Brave embutido)',
          siteUrl: 'https://open.spotify.com',
          guide: MODULE_GUIDES['spotify'],
          accent: {
            text: 'text-emerald-400',
            border: 'border-emerald-400/30',
            bg: 'bg-emerald-400/20',
            gradientFrom: 'from-emerald-500/30',
            gradientTo: 'to-green-500/30',
            hex: '#1DB954',
          },
          platform: 'universal',
          generateDevice: generateSpotifyDevice,
          buildScriptBody: (device, persona) => buildSpotifyScriptBody(device, persona),
          deviceInfo: (device) => [
            { label: 'SP DEVICE ID', value: device.spDeviceId, highlight: true },
            { label: 'SP SESSION', value: device.spSession, highlight: true },
            { label: 'ANONYMOUS ID', value: device.spAnonymousId, highlight: true },
            { label: 'CLIENT VERSION', value: device.spClientVersion },
            { label: 'LOCALE', value: device.spLocale },
            { label: 'MAC ADDRESS', value: device.macAddress },
            { label: 'IMEI', value: device.imei },
            { label: 'ANDROID ID', value: device.androidId },
          ],
        }}
      />
    </>
  );
}
