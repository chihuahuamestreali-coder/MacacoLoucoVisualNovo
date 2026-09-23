import ManusStyleInjectionPage from '@/components/ManusStyleInjectionPage';
import { MODULE_GUIDES } from '@/lib/moduleGuides';
import { generateDraelDevice, buildDraelScriptBody } from '@/lib/draelDeviceGenerator';

export default function DraelManager() {
  return (
    <ManusStyleInjectionPage
      config={{
        siteKey: 'drael',
        siteName: 'Drael',
        siteTitle: 'DRAEL DEVICE MASTER',
        tagline: 'Portal drael.sh • perfil, injeção e anti-detecção',
        siteUrl: 'https://drael.sh',
        guide: MODULE_GUIDES['drael'],
        accent: {
          text: 'text-purple-400',
          border: 'border-purple-400/30',
          bg: 'bg-purple-400/20',
          gradientFrom: 'from-purple-500/30',
          gradientTo: 'to-fuchsia-500/30',
          hex: '#a855f7',
        },
        platform: 'universal',
        generateDevice: generateDraelDevice,
        buildScriptBody: (device, persona) => buildDraelScriptBody(device, persona),
        deviceInfo: (device) => [
          { label: 'DRL DEVICE ID', value: device.draelDeviceId, highlight: true },
          { label: 'DRL SESSION', value: device.draelSessionId, highlight: true },
          { label: 'DRL VISITOR', value: device.draelVisitorId },
          { label: 'MAC ADDRESS', value: device.macAddress },
          { label: 'IMEI', value: device.imei },
          { label: 'ANDROID ID', value: device.androidId },
        ],
      }}
    />
  );
}
