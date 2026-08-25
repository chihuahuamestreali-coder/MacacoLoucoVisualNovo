/**
 * Ponte opcional com uma extensão autorizada para apagar URLs do histórico do
 * navegador. Uma página web comum não tem permissão para usar chrome.history
 * ou browser.history; nesse caso a função retorna `unsupported` sem falhar.
 */

export type BrowserHistoryClearResult =
  | { status: 'cleared'; removed: number }
  | { status: 'unsupported'; reason: string }
  | { status: 'error'; reason: string };

const MESSAGE_SOURCE = 'macacolouco-history-cleaner';
const REQUEST_TYPE = 'CLEAR_BROWSER_HISTORY';
const RESPONSE_TYPE = 'BROWSER_HISTORY_CLEAR_RESULT';
const RESPONSE_TIMEOUT_MS = 900;

function createRequestId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `history-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/**
 * Solicita que uma extensão instalada e autorizada remova as URLs informadas.
 * A página continua funcionando normalmente quando nenhuma extensão responde.
 */
export function requestBrowserHistoryClear(urls: string[]): Promise<BrowserHistoryClearResult> {
  if (typeof window === 'undefined' || urls.length === 0) {
    return Promise.resolve({
      status: 'unsupported',
      reason: 'Nenhum contexto de navegador disponível para a solicitação.',
    });
  }

  const requestId = createRequestId();

  return new Promise((resolve) => {
    let settled = false;
    const finish = (result: BrowserHistoryClearResult) => {
      if (settled) return;
      settled = true;
      window.removeEventListener('message', handleMessage);
      window.clearTimeout(timeoutId);
      resolve(result);
    };

    const handleMessage = (event: MessageEvent) => {
      if (event.source !== window || !event.data) return;
      if (event.data.source !== MESSAGE_SOURCE || event.data.type !== RESPONSE_TYPE) return;
      if (event.data.requestId !== requestId) return;

      if (event.data.ok) {
        finish({ status: 'cleared', removed: Number(event.data.removed ?? urls.length) });
      } else {
        finish({
          status: 'error',
          reason: String(event.data.reason ?? 'A extensão recusou a solicitação.'),
        });
      }
    };

    const timeoutId = window.setTimeout(() => {
      finish({
        status: 'unsupported',
        reason: 'Nenhuma extensão autorizada respondeu. O navegador bloqueia essa operação em páginas comuns.',
      });
    }, RESPONSE_TIMEOUT_MS);

    window.addEventListener('message', handleMessage);
    window.postMessage(
      {
        source: MESSAGE_SOURCE,
        type: REQUEST_TYPE,
        requestId,
        urls: Array.from(new Set(urls)),
      },
      window.location.origin,
    );
  });
}

export function supportsBrowserHistoryBridge(): boolean {
  return typeof window !== 'undefined';
}
