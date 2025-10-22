// src/lib/monitoring.ts

const API_ENDPOINT = '/api/logs';
const API_KEY = process.env.NEXT_PUBLIC_MONITORING_API_KEY;

interface LogPayload {
  endpoint: string;
  status_code: number;
  response_ms: number;
}

/**
 * API Monitorにログを送信します。
 * APIキーが設定されていない場合は何もしません。
 * @param payload ログデータ
 */
export function sendLog(payload: LogPayload) {
  if (!API_KEY) {
    // console.log('Monitoring API key is not set. Skipping log.');
    return;
  }

  fetch(API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(error => {
    console.error('Failed to send log to API Monitor:', error);
  });
}

/**
 * このアプリケーション自身のエラーをAPI監視サーバーに送信します。
 * @param {Error} error - 発生したErrorオブジェクト。
 * @param {Record<string, any>} [metadata] - 追加情報（例: コンポーネント名など）。
 */
export async function reportError(error: Error, metadata: Record<string, unknown> = {}) {
  const endpoint = `${process.env.NEXT_PUBLIC_API_ENDPOINT || ''}/api/errors`;
  const projectId = process.env.NEXT_PUBLIC_SELF_MONITORING_PROJECT_ID;

  if (!projectId) {
    console.warn('SELF_MONITORING_PROJECT_ID is not set. Skipping error report.');
    return;
  }

  const payload = {
    projectId: projectId,
    errorMessage: error.message,
    stackTrace: error.stack,
    timestamp: new Date().toISOString(),
    metadata: {
      ...metadata,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Node.js',
      page: typeof window !== 'undefined' ? window.location.href : 'N/A',
    },
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      keepalive: true,
    });

    if (!response.ok) {
      // エラー報告のエラーはコンソールに出力するのみ
      console.error('Failed to report error to self-monitoring endpoint:', await response.text());
    }
  } catch (e) {
    console.error('An error occurred while reporting another error:', e);
  }
}

/**
 * このアプリケーションのサーバーサイドで発生したエラーをAPI監視サーバーに送信します。
 * @param {Error} error - 発生したErrorオブジェクト。
 * @param {Record<string, unknown>} [metadata] - 追加情報（例: APIルート名など）。
 */
export async function reportServerError(error: Error, metadata: Record<string, unknown> = {}) {
  const endpoint = `${process.env.NEXT_PUBLIC_API_ENDPOINT || ''}/api/errors`;
  const projectId = process.env.NEXT_PUBLIC_SELF_MONITORING_PROJECT_ID;

  if (!projectId) {
    console.warn('SELF_MONITORING_PROJECT_ID is not set. Skipping server error report.');
    return;
  }

  const payload = {
    projectId: projectId,
    errorMessage: error.message,
    stackTrace: error.stack,
    timestamp: new Date().toISOString(),
    metadata: {
      ...metadata,
      environment: process.env.NODE_ENV || 'development',
      type: 'ServerError',
    },
  };

  try {
    // Use native fetch for server-side
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      // keepalive is not typically used on server-side fetch, but won't hurt
    });

    if (!response.ok) {
      console.error('Failed to report server error to self-monitoring endpoint:', await response.text());
    }
  } catch (e) {
    console.error('An error occurred while reporting another server error:', e);
  }
}