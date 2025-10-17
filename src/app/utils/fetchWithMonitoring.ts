// fetchWithMonitoring.ts
import { sendLog } from '@/lib/monitoring';

export async function fetchWithMonitoring(url: string, options?: RequestInit) {
  const startTime = Date.now();

  try {
    const response = await fetch(url, options);
    const endTime = Date.now();

    // ログを送信
    sendLog({
      endpoint: new URL(url).pathname, // パスのみを記録
      status_code: response.status,
      response_ms: endTime - startTime,
    });

    return response;
  } catch (error) {
    const endTime = Date.now();

    // ネットワークエラーなどは500として記録
    sendLog({
      endpoint: new URL(url).pathname,
      status_code: 500,
      response_ms: endTime - startTime,
    });

    // エラーを再スローして、呼び出し元で処理できるようにする
    throw error;
  }
}

// --- 使い方 ---
// これまでの fetch(url) を fetchWithMonitoring(url) に置き換えるだけです。
// 例:
// const response = await fetchWithMonitoring('https://api.example.com/data');
