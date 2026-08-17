import ManusStyleInjectionPage from '@/components/ManusStyleInjectionPage';
import { MODULE_GUIDES } from '@/lib/moduleGuides';
import { generateAppleContasDevice, buildAppleContasScriptBody } from '@/lib/appleContasDeviceGenerator';

export default function AppleContasManager() {
  return (
    <ManusStyleInjectionPage
      config={{
        siteKey: 'apple-contas',
        siteName: 'Apple Contas',
        siteTitle: 'APPLE CONTAS DEVICE MASTER',
        tagline: 'Conta de ecossistema Apple • account.apple.com (login/criação, PT-BR)',
        siteUrl: 'https://account.apple.com/account',
        guide: MODULE_GUIDES['apple-contas'],
        accent: {
          text: 'text-slate-300',
          border: 'border-slate-400/30',
          bg: 'bg-slate-400/20',
          gradientFrom: 'from-slate-500/30',
          gradientTo: 'to-gray-500/30',
          hex: '#a2aaad',
        },
        platform: 'apple',
        generateDevice: generateAppleContasDevice,
        buildScriptBody: (device, persona) => buildAppleContasScriptBody(device, persona),
        deviceInfo: (device) => [
          { label: 'ACL DEVICE ID', value: device.aclDeviceId, highlight: true },
          { label: 'ACL SESSION', value: device.aclSessionId, highlight: true },
          { label: 'ACL DSID', value: device.aclDsid, highlight: true },
          { label: 'ACL ANON ID', value: device.aclAnonId },
          { label: 'LOCALE / COUNTRY', value: `${device.aclLocale} / ${device.aclCountry}` },
          { label: 'STOREFRONT', value: device.aclStorefront },
          { label: 'MAC ADDRESS', value: device.macAddress },
          { label: 'IMEI', value: device.imei },
        ],
      }}
    />
  );
}
