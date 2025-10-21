# エラー検知機能 ガイド

このドキュメントは、本アプリケーションに実装されたエラー検知機能の導入方法と使い方について説明します。

## 1. 機能概要

この機能は、外部のWebアプリケーションやAPIで発生したクライアントサイドおよびサーバーサイドのエラーを収集し、本アプリケーションのダッシュボードで一元的に確認・管理するためのものです。

主な機能は以下の通りです。

- **エラー情報の受信:** 監視対象のアプリケーションからHTTPリクエスト経由でエラー情報を受け取ります。
- **エラー情報の保存:** 受け取ったエラー情報をデータベースに記録します。
- **エラー情報の表示:** ダッシュボードの「Error Reports」ページで、プロジェクトごとにエラーの一覧を表示します。

## 2. 導入方法

監視したいアプリケーションにエラー検知を導入する手順は以下の通りです。

### ステップ1: プロジェクトIDの取得

まず、本アプリケーションのダッシュボードで監視対象のプロジェクトを作成し、その **プロジェクトID (`project_id`)** を取得してください。（注: 現在、プロジェクト作成機能はUIから利用可能です）

### ステップ2: エラー報告関数の実装

次に、監視対象のアプリケーションのコードに、エラー情報を送信するための関数を追加します。以下は、JavaScript/TypeScript環境での実装例です。

この関数は、エラーオブジェクトを受け取り、指定されたエンドポイント (`/api/errors`) にPOSTリクエストを送信します。

```javascript
/**
 * エラー情報をAPI監視サーバーに送信します。
 * @param {Error} error - 発生したErrorオブジェクト。
 * @param {string} projectId - 監視対象のプロジェクトID。
 * @param {object} [metadata] - 追加情報（例: ユーザー情報、リクエスト情報など）。
 */
async function reportError(error, projectId, metadata = {}) {
  // TODO: 本番環境のURLに置き換えてください
  const endpoint = 'http://localhost:3000/api/errors';

  const payload = {
    projectId: projectId,
    errorMessage: error.message,
    stackTrace: error.stack,
    timestamp: new Date().toISOString(),
    metadata: {
      ...metadata,
      // ブラウザ環境であれば、ユーザーエージェントなどの情報も追加できます
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
    },
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error('Failed to report error:', await response.text());
    }
  } catch (e) {
    console.error('An error occurred while reporting another error:', e);
  }
}
```

### ステップ3: エラーハンドラでの呼び出し

実装した `reportError` 関数を、アプリケーションのエラーハンドリング箇所で呼び出します。

#### 例1: `try...catch` ブロックでの利用

```javascript
const MY_PROJECT_ID = '取得したプロジェクトID';

try {
  // エラーが発生する可能性のある処理
  const result = someFunctionThatMayFail();
} catch (error) {
  console.error('Caught an error:', error);
  // エラーをサーバーに報告
  reportError(error, MY_PROJECT_ID);
}
```

#### 例2: グローバルエラーハンドラでの利用 (ブラウザ環境)

予期しないすべてのエラーをキャッチするために、グローバルなエラーリスナーを設定します。

```javascript
window.addEventListener('error', (event) => {
  if (event.error) {
    reportError(event.error, MY_PROJECT_ID, { type: 'uncaughtException' });
  }
});

window.addEventListener('unhandledrejection', (event) => {
  if (event.reason instanceof Error) {
    reportError(event.reason, MY_PROJECT_ID, { type: 'unhandledRejection' });
  }
});
```

## 3. 機能の使い方

### エラー情報の確認

収集されたエラーは、ダッシュボードの **「Error Reports」** ページ (`/dashboard/errors`) で確認できます。

1. サイドバーから「Errors」をクリックします。
2. ページ上部のドロップダウンメニューから、エラーを確認したいプロジェクトを選択します。
3. 選択したプロジェクトで発生したエラーが、発生時刻の新しい順にテーブル表示されます。

### 表示される情報

- **Status:** エラーの状態（現在は「New」で固定）。
- **Error:** エラーメッセージの概要。
- **Time:** エラーが発生した時刻。
