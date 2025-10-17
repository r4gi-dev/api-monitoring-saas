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