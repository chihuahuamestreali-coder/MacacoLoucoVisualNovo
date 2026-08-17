# CONTINUACAO.md — Device Master (MacacoLoucoVisualNovo)

Documento de handoff técnico neutro para retomada do projeto em qualquer
ambiente/agente de código. Descreve o estado atual, a arquitetura e o
procedimento exato para adicionar um novo módulo seguindo o padrão existente.

## 1. Repositórios

- **Repositório ativo (trabalhar SÓ aqui):** https://github.com/chihuahuamestreali-coder/MacacoLoucoVisualNovo
- Branch principal: `main`
- Base path da app: `/MacacoLoucoVisualNovo` (em `vite.config.ts` e `client/src/App.tsx`)
- Deploy: GitHub Pages via GitHub Actions (`.github/workflows/deploy.yml`, artifact `./dist/public`)
- Site publicado: https://chihuahuamestreali-coder.github.io/MacacoLoucoVisualNovo/
- Repositório original `Gerador_Manus-Infinity`: **NÃO tocar** (fonte histórica intocada)

## 2. Stack e comandos

- React 19 + TypeScript + Vite 7 + TailwindCSS 4 + shadcn/ui + Radix UI + wouter
- pnpm (packageManager pnpm@10.4.1)
- Servidor Express mínimo em `server/index.ts`

```bash
git clone https://github.com/chihuahuamestreali-coder/MacacoLoucoVisualNovo.git
pnpm install
pnpm check        # tsc --noEmit
pnpm build        # vite build + esbuild do server
pnpm dev --host 0.0.0.0   # preview local
```

## 3. Estado atual

- Último commit: `be5b38a` — "feat: add AppleContas module with in-site injection (Manus-style)"
- Home: `FIELD MANUAL / 32 MÓDULOS + 3 HUBS`
- Documentação de mudanças acumuladas: `MELHORIAS_E_ADICOES.txt` (seções 1–12)
- Backups: `projeto.zip` na raiz (sem node_modules/.git/dist)

## 4. Arquitetura de um módulo "estilo Manus" (padrão atual)

O padrão atual é **injeção in-site**: o usuário copia um script, abre o site
oficial em nova guia, pressiona F12 e cola o script no Console. O script roda
NO DOMÍNIO do site real (grava localStorage/sessionStorage/cookies/overrides
no lugar certo). NÃO usar o método antigo (about:blank + document.write +
redirect), que era cross-origin e não transferia nada.

Componentes de um módulo novo (usar como template o módulo `apple-contas`):

1. **Gerador**: `client/src/lib/<chave>DeviceGenerator.ts`
   - Exporta a interface do perfil, a função `generate<Nome>Device()` e
     `build<Nome>ScriptBody(device, persona)`.
   - Base comum: `generateUniversalDevice(platform)` de
     `client/src/lib/universalDeviceGenerator.ts` (MAC/IMEI/Android ID/
     fingerprint/userAgent). Estender com campos específicos do site.
   - O corpo do script serializa o perfil em JSON e grava localStorage +
     cookies via `document.cookie` no domínio real.

2. **Página**: `client/src/pages/<Nome>Manager.tsx`
   - Envolve `ManusStyleInjectionPage` (`client/src/components/ManusStyleInjectionPage.tsx`)
     passando um `config` com: `siteKey`, `siteName`, `siteTitle`, `tagline`,
     `siteUrl`, `guide` (do `moduleGuides`), `accent` (text/border/bg/
     gradientFrom/gradientTo/hex), `platform`, `generateDevice`,
     `buildScriptBody` e `deviceInfo`.

3. **Guia**: `client/src/lib/moduleGuides.ts`
   - Adicionar entrada em `MODULE_GUIDES` com a chave usada como `siteKey`:
     `key`, `title`, `mission`, `scope`, `family`, `fields[]`,
     `recommendedFlow[]`, `whyDifferent`, `limitations`.

4. **Rota**: `client/src/App.tsx`
   - Import do manager + `<Route path={"/<rota>"} component={...} />`.

5. **Card na Home**: `client/src/pages/Home.tsx`
   - Entrada no array `generators` (title/desc/path/icon/logo/badge).
   - Adicionar o path ao filtro de uma categoria em `categories`.
   - Atualizar os contadores: `FIELD MANUAL / NN MÓDULOS + 3 HUBS` e a linha
     "NN módulos reorganizados".

6. **Ícone de marca** (opcional): `client/public/brand-icons/<logo>.svg`
   - Padrão dos demais: quadrado branco arredondado + logo.

7. **App nativo** (opcional): `client/src/lib/nativeAppSimulator.ts`
   - Adicionar a plataforma à union `AppSimulationOptions['platform']` e um
     `case` em `generateNativeAppSimulationForProfile`; o manager deve usar
     `platform: '<chave>'` para ativá-la.

## 5. Arquivos-chave

| Arquivo | Função |
|---|---|
| `client/src/lib/inSiteInjection.ts` | `copyInjectionScript`, `openSiteInNewTab`, `wrapInSiteScript`, `toBookmarklet`, `IN_SITE_STEPS`, `BOOKMARKLET_STEPS` |
| `client/src/components/ManusStyleInjectionPage.tsx` | Página padrão estilo Manus (gerador, anti-fraude, histórico, injeção) |
| `client/src/lib/universalDeviceGenerator.ts` | Base universal (MAC/IMEI/Android ID/fingerprint) |
| `client/src/lib/moduleGuides.ts` | Guias Field Manual (camada documental, teal #35D0BA) |
| `client/src/lib/accountHistoryManager.ts` | Histórico de contas + relatório de desempenho |
| `client/src/components/IpDisplay.tsx` | Badge de IP público (todas as páginas, atualiza 60s, clique copia) |
| `client/src/pages/Home.tsx` | Home + mini-menu ImgBB + categorias |
| `client/src/App.tsx` | Rotas (base `/MacacoLoucoVisualNovo`) |

## 6. Módulos existentes (rotas)

`/` Home · `/aliexpress` · `/mercado-livre` · `/amazon` · `/shopee` · `/shein`
· `/cider` · `/ugphone` · `/geelark` · `/redfinger` · `/vmoscloud` · `/ldplayer`
· `/instagram` · `/facebook` · `/tiktok` · `/manus` · `/claude` · `/chatgpt`
· `/gmail` · `/emails` · `/temu` · `/github-manager` · `/discord-site`
· `/discord-manager` (Dark) · `/private-tunnels` · `/dark` · `/ursa`
· `/monkeycode` · `/base44` · `/lovable` · `/emergente` · `/tensor` · `/seaart`
· `/copilot-designer` · `/leonardo` · `/apple-contas`
Hubs: `/van-gogh` · `/scooby-doo` (iFood + Zé Delivery; AiQFome não reintroduzir) · `/dark`

## 7. Regras de trabalho ao retomar

- Manter interface e funcionalidades existentes; não remover nada sem pedido.
- Mobile modules: `nativeAppSimulator.ts`; checkboxes ativadas por padrão.
- Após mudanças: rodar `pnpm check` e `pnpm build`; ambos sem erros.
- Ao final de cada etapa: atualizar `MELHORIAS_E_ADICOES.txt` e regenerar
  `projeto.zip` (zip da raiz excluindo node_modules/.git/dist).
- Push somente com autorização explícita + PAT válido do usuário.
- Respeitar termos de serviço das plataformas; dados de perfil são sintéticos.
- Úrsa redireciona para https://tuamaeaquelaursa.com/ após 1s (não mudar).
- ScoobyDooHub: cuidado com comparações órfãs que quebram o tsc (TS2367).
- `/dark` usa fundo preto absoluto #050505 e NÃO usa ModuleGuide.
