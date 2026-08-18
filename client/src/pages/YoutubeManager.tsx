import ManusStyleInjectionPage from '@/components/ManusStyleInjectionPage';
import YoutubeDownloader from '@/components/YoutubeDownloader';
import { MODULE_GUIDES } from '@/lib/moduleGuides';
import { generateYoutubeDevice, buildYoutubeScriptBody } from '@/lib/youtubeDeviceGenerator';

export default function YoutubeManager() {
  return (
    <>
      <ManusStyleInjectionPage
        config={{
          siteKey: 'youtube',
          siteName: 'YouTube',
          siteTitle: 'YOUTUBE DEVICE MASTER',
          tagline: 'Streaming de vídeo sem anúncios • youtube.com (bloqueio estilo Brave embutido)',
          siteUrl: 'https://www.youtube.com',
          guide: MODULE_GUIDES['youtube'],
          accent: {
            text: 'text-red-400',
            border: 'border-red-400/30',
            bg: 'bg-red-400/20',
            gradientFrom: 'from-red-500/30',
            gradientTo: 'to-rose-500/30',
            hex: '#ff0033',
          },
          platform: 'universal',
          generateDevice: generateYoutubeDevice,
          buildScriptBody: (device, persona) => buildYoutubeScriptBody(device, persona),
          deviceInfo: (device) => [
            { label: 'YT DEVICE ID', value: device.ytDeviceId, highlight: true },
            { label: 'YT SESSION', value: device.ytSessionId, highlight: true },
            { label: 'VISITOR DATA', value: device.ytVisitorData, highlight: true },
            { label: 'CLIENT VERSION', value: device.ytClientVersion },
            { label: 'PREF', value: device.ytPref },
            { label: 'MAC ADDRESS', value: device.macAddress },
            { label: 'IMEI', value: device.imei },
            { label: 'ANDROID ID', value: device.androidId },
          ],
        }}
      />
      <div className="container max-w-7xl mx-auto px-4">
        <YoutubeDownloader />
      </div>
    </>
  );
}
