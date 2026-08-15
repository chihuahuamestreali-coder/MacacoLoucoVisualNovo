import ManusStyleInjectionPage from '@/components/ManusStyleInjectionPage';
import { MODULE_GUIDES } from '@/lib/moduleGuides';
import { generateChatGptDevice, buildChatGptScriptBody } from '@/lib/chatgptDeviceGenerator';

export default function ChatGptManager() {
  return (
    <ManusStyleInjectionPage
      config={{
        siteKey: 'chatgpt',
        siteName: 'ChatGPT',
        siteTitle: 'CHATGPT DEVICE MASTER',
        tagline: 'Assistente de IA OpenAI • chatgpt.com (login de criação, PT-BR)',
        siteUrl: 'https://chatgpt.com/auth/login',
        guide: MODULE_GUIDES['chatgpt'],
        accent: {
          text: 'text-green-400',
          border: 'border-green-400/30',
          bg: 'bg-green-400/20',
          gradientFrom: 'from-green-500/30',
          gradientTo: 'to-emerald-500/30',
          hex: '#10a37f',
        },
        platform: 'universal',
        generateDevice: generateChatGptDevice,
        buildScriptBody: (device, persona) => buildChatGptScriptBody(device, persona),
        deviceInfo: (device) => [
          { label: 'GPT DEVICE ID', value: device.gptDeviceId, highlight: true },
          { label: 'GPT SESSION', value: device.gptSessionId, highlight: true },
          { label: 'GPT ANON ID', value: device.gptAnonId },
          { label: 'GPT UID', value: device.gptUid },
          { label: 'GPT MODEL', value: device.gptModel },
          { label: 'MAC ADDRESS', value: device.macAddress },
          { label: 'IMEI', value: device.imei },
          { label: 'ANDROID ID', value: device.androidId },
        ],
      }}
    />
  );
}
