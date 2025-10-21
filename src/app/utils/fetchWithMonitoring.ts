// fetchWithMonitoring.ts
import { sendLog, reportError } from '@/lib/monitoring';

export async function fetchWithMonitoring(url: string, options?: RequestInit) {
  const startTime = Date.now();
  const fullUrl = new URL(url, process.env.NEXT_PUBLIC_API_ENDPOINT).toString();

  try {
    const response = await fetch(fullUrl, options);
    const endTime = Date.now();

    // パフォーマンスログを送信
    sendLog({
      endpoint: new URL(fullUrl).pathname, // パスのみを記録
      status_code: response.status,
      response_ms: endTime - startTime,
    });

    // ステータスコードが400以上の場合、エラーとして報告
    if (!response.ok) {
      const errorPayload = {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        // Clone the response to read the body, as it can only be read once
        body: await response.clone().text().catch(() => 'Could not read response body'),
      };
      
      const error = new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      // reportErrorを呼び出し
      reportError(error, {
        type: 'HttpError',
        ...errorPayload,
      });
    }

    return response;
  } catch (error) {
    const endTime = Date.now();

    // ネットワークエラーなどは500として記録
    sendLog({
      endpoint: new URL(fullUrl).pathname,
      status_code: 500,
      response_ms: endTime - startTime,
    });

    // ネットワークエラーなどもエラーレポートに送信
    if (error instanceof Error) {
      reportError(error, { type: 'NetworkError' });
    }

    // エラーを再スローして、呼び出し元で処理できるようにする
    throw error;
  }
}

// --- 使い方 ---
// これまでの fetch(url) を fetchWithMonitoring(url) に置き換えるだけです。
// 例:
// const response = await fetchWithMonitoring('https://api.example.com/data');
