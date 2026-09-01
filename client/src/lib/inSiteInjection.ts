/**
 * In-Site Injection Helper - Injeção dentro do site real (console/bookmarklet)
 *
 * POR QUE É MELHOR QUE A ABA INTERMEDIÁRIA (about:blank → document.write → redirect):
 *
 * 1. A aba about:blank e o site alvo têm ORIGENS diferentes (cross-origin).
 *    Quando o script escrevia localStorage/cookies/overrides na aba about:blank
 *    e depois redirecionava para o site, NADA era transferido:
 *    - localStorage é isolado por domínio (about:blank ≠ br.shein.com)
 *    - cookies são isolados por domínio
 *    - overrides de navigator/window morrem na navegação
 *    - o overlay "DEVICE INJETADO" só aparecia na aba intermediária
 *
 * 2. Com a injeção DENTRO do site real (F12 → Console → colar → Enter):
 *    - O script roda NO MESMO ORIGIN do site (ex.: br.shein.com)
 *    - localStorage, sessionStorage e cookies são gravados NO DOMÍNIO CERTO
 *    - overrides de navigator, WebGL, geolocation valem para a página real
 *    - a pessoa fica literalmente NA página de login/cadastro do site
 *    - nenhuma "aba fantasma" entre o usuário e o destino
 *
 * O script gerado é um IIFE autossuficiente que não depende de nada do host
 * (apenas do perfil já serializado), pode ser colado no console ou usado
 * como bookmarklet.
 */

export interface InSiteInjectionResult {
  success: boolean;
  message: string;
}

/**
 * Copia o script de injeção para a área de transferência.
 * Usa a API Clipboard quando disponível, com fallback via execCommand.
 */
export async function copyInjectionScript(script: string): Promise<InSiteInjectionResult> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await Promise.race([
        navigator.clipboard.writeText(script),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('clipboard-timeout')), 1500)),
      ]);
      return { success: true, message: 'Script copiado!' };
    }
  } catch {
    // fallback abaixo
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = script;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok
      ? { success: true, message: 'Script copiado!' }
      : { success: false, message: 'Falha ao copiar. Copie manualmente.' };
  } catch {
    return { success: false, message: 'Falha ao copiar. Copie manualmente.' };
  }
}

/**
 * Abre o site alvo em uma nova guia (sem nenhuma injeção intermediária).
 * A injeção será feita manualmente no console da própria guia.
 */
export function openSiteInNewTab(targetUrl: string): void {
  window.open(targetUrl, '_blank', 'noopener');
}

/**
 * Converte um script de injeção (IIFE já gerado por wrapInSiteScript) em um
 * bookmarklet (javascript: URL). O usuário cria um favorito uma vez e clica
 * nele com a guia do site aberta — evita o "allow pasting" do console.
 *
 * Encoda o corpo do script para ser seguro como URL de favorito.
 */
export function toBookmarklet(script: string): string {
  const body = script
    .replace(/^\/\*[\s\S]*?\*\/\s*/m, '')
    .trim();
  return 'javascript:' + encodeURIComponent(body);
}

/**
 * Passos exibidos na UI para orientar o usuário no fluxo BOOKMARKLET
 * (recomendado quando o console bloqueia o paste com "Unexpected identifier").
 */
export const BOOKMARKLET_STEPS: string[] = [
  'Gere o perfil na Etapa 1',
  'Clique em "Copiar Bookmarklet"',
  'Crie um favorito no navegador (Ctrl+D) com o código copiado',
  'Abra o site oficial (nova guia)',
  'Clique no favorito com a guia do site aberta',
  'Pronto: o script roda no domínio do site real',
];

/**
 * Passos exibidos na UI para orientar o usuário na injeção in-site.
 */
export const IN_SITE_STEPS: string[] = [
  'Gere o perfil na Etapa 1',
  'Clique em "Copiar Script de Injeção"',
  'Clique em "Abrir Site Oficial" (nova guia)',
  'Na guia do site, pressione F12 (ou Ctrl+Shift+J)',
  'Na aba "Console", cole o script (Ctrl+V) e pressione Enter',
  'Pronto: o perfil é gravado NO domínio do site real',
];

/**
 * Envolve o script de injeção em um IIFE de console limpo.
 * Reutilizado por todos os módulos para manter o padrão in-site.
 */
export function wrapInSiteScript(
  siteName: string,
  body: string,
  features: string[],
  accentColor: string = '#00d9ff'
): string {
  return `
/* ============================================================
   ${siteName} - INJEÇÃO IN-SITE (console do site real)
   Copiado do DEVICE MASTER PRO. Rode na guia do site oficial.
   ============================================================ */
(function() {
  try {
    ${body}

    console.log('%c✓ ${siteName} & ${features.length} módulos injetados COM SUCESSO no site real!', 'color: ${accentColor}; font-weight: bold; font-size: 14px;');
    console.log('%c➜ Perfil gravado no domínio: ' + location.hostname, 'color: ${accentColor};');
    console.log('%c➜ Agora preencha o cadastro/login normalmente.', 'color: #a3a3a3;');
  } catch(err) {
    console.error('%c✗ Erro na injeção ${siteName}: ' + err.message, 'color: #ef4444; font-weight: bold;');
    console.error(err);
  }
})();
`;
}
