import ManusStyleInjectionPage from '@/components/ManusStyleInjectionPage';
import { MODULE_GUIDES } from '@/lib/moduleGuides';
import { generateCopilotDevice, buildCopilotScriptBody } from '@/lib/copilotDeviceGenerator';

export default function CopilotManager() {
  return (
    <ManusStyleInjectionPage
      config={{
        siteKey: 'copilot',
        siteName: 'Microsoft Copilot Chat',
        siteTitle: 'COPILOT CHAT DEVICE MASTER',
        tagline: 'Assistente conversacional Microsoft • copilot.microsoft.com (chat, PT-BR)',
        siteUrl: 'https://copilot.microsoft.com/',
        guide: MODULE_GUIDES['copilot'],
        accent: {
          text: 'text-sky-400',
          border: 'border-sky-400/30',
          bg: 'bg-sky-400/20',
          gradientFrom: 'from-sky-500/30',
          gradientTo: 'to-teal-500/30',
          hex: '#0ea5e9',
        },
        platform: 'universal',
        generateDevice: generateCopilotDevice,
        buildScriptBody: (device, persona) => buildCopilotScriptBody(device, persona),
        deviceInfo: (device) => [
          { label: 'CPT DEVICE ID', value: device.cptDeviceId, highlight: true },
          { label: 'CPT SESSION', value: device.cptSessionId, highlight: true },
          { label: 'CPT ANON ID', value: device.cptAnonId },
          { label: 'CPT UID', value: device.cptUid },
          { label: 'CPT MODEL', value: device.cptModel },
          { label: 'MAC ADDRESS', value: device.macAddress },
          { label: 'IMEI', value: device.imei },
          { label: 'ANDROID ID', value: device.androidId },
        ],
      }}
    />
  );
}
