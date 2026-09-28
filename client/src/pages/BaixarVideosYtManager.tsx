import { useEffect } from 'react';
import ManusStyleInjectionPage from '@/components/ManusStyleInjectionPage';
import { MODULE_GUIDES } from '@/lib/moduleGuides';
import { generateBaixarVideosYtDevice, buildBaixarVideosYtScriptBody, BAIXAR_VIDEOS_YT_URL } from '@/lib/baixarVideosYtDeviceGenerator';
import { openSiteInNewTab } from '@/lib/inSiteInjection';

export default function BaixarVideosYtManager() {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      openSiteInNewTab(BAIXAR_VIDEOS_YT_URL);
    }, 800);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <ManusStyleInjectionPage
      config={{
        siteKey: 'baixar-videos-yt',
        siteName: 'Baixar_Videos_YT',
        siteTitle: 'BAIXAR_VIDEOS_YT DEVICE MASTER',
        tagline: 'Mesmas ferramentas do Manus • abre Clipto YouTube automaticamente',
        siteUrl: BAIXAR_VIDEOS_YT_URL,
        guide: MODULE_GUIDES['baixarVideosYt'],
        accent: {
          text: 'text-orange-400',
          border: 'border-orange-400/30',
          bg: 'bg-orange-400/20',
          gradientFrom: 'from-orange-500/30',
          gradientTo: 'to-red-500/30',
          hex: '#f97316',
        },
        platform: 'universal',
        generateDevice: generateBaixarVideosYtDevice,
        buildScriptBody: (device, persona) => buildBaixarVideosYtScriptBody(device, persona),
        deviceInfo: (device) => [
          { label: 'BVY DEVICE ID', value: device.bvyDeviceId, highlight: true },
          { label: 'BVY SESSION', value: device.bvySessionId, highlight: true },
          { label: 'BVY VISITOR', value: device.bvyVisitorId },
          { label: 'MAC ADDRESS', value: device.macAddress },
          { label: 'IMEI', value: device.imei },
          { label: 'ANDROID ID', value: device.androidId },
        ],
      }}
    />
  );
}
