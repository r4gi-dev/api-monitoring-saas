# API Monitoring SaaS

## プロジェクト概要

このプロジェクトは、WebアプリケーションやAPIのパフォーマンスログとエラーレポートを一元的に収集・監視するためのSaaS型プラットフォームです。開発者は、自身のアプリケーションに簡単な設定を追加するだけで、リアルタイムにエラーやパフォーマンスの状況を把握し、問題の早期発見・解決に役立てることができます。

## 機能ハイライト

- **エラーレポート収集:** クライアントサイド（Reactコンポーネントエラー、グローバルエラー、ネットワークエラー）およびサーバーサイド（Next.js APIルートエラー）からの詳細なエラー情報を収集。
- **パフォーマンスログ収集:** 外部アプリケーションからのAPIリクエストのパフォーマンスデータ（エンドポイント、ステータスコード、応答時間）を収集。
- **ダッシュボード:** 収集されたエラーやログをプロジェクトごとに集約し、視覚的に分かりやすい形で表示する管理画面を提供。
- **型安全な実装:** TypeScriptを全面的に採用し、堅牢な開発体験を提供。

## 技術スタック

- **フレームワーク:** Next.js (App Router)
- **UIライブラリ:** React
- **言語:** TypeScript
- **データベース/認証:** Supabase
- **スタイリング:** Tailwind CSS
- **テスト:** Vitest, React Testing Library
- **その他:** ESLint, Prettier

## セットアップ

### 1. 環境変数の設定

プロジェクトルートに `.env.local` ファイルを作成し、以下の環境変数を設定してください。

```
NEXT_PUBLIC_SUPABASE_URL=あなたのSupabaseプロジェクトURL
SUPABASE_SERVICE_ROLE_KEY=あなたのSupabaseサービスロールキー
NEXT_PUBLIC_MONITORING_API_KEY=監視対象アプリケーションからのログ送信に使用するAPIキー
NEXT_PUBLIC_SELF_MONITORING_PROJECT_ID=このSaaSアプリケーション自身のエラーを報告するためのプロジェクトID
NEXT_PUBLIC_API_ENDPOINT=このSaaSアプリケーションのデプロイURL (例: http://localhost:3000 または https://your-app.vercel.app)
```

### 2. 依存関係のインストール

```bash
npm install
# または
yarn install
```

### 3. 開発サーバーの起動

```bash
npm run dev
# または
yarn dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開くと、アプリケーションが表示されます。

### 4. Supabaseのセットアップ

Supabaseプロジェクトで、以下のテーブルとRLS（Row Level Security）ポリシーを設定してください。

**`projects` テーブル:**
- `id` (UUID, Primary Key, default: `uuid_generate_v4()`) 
- `user_id` (UUID, references `auth.users.id`)
- `name` (text)
- `description` (text)
- `api_key` (text, UNIQUE, default: `uuid_generate_v4()`) 
- `created_at` (timestamp with time zone, default: `now()`) 

**`errors` テーブル:**
- `id` (UUID, Primary Key, default: `uuid_generate_v4()`) 
- `project_id` (UUID, references `public.projects.id`)
- `message` (text)
- `stack_trace` (text, nullable)
- `metadata` (jsonb, nullable)
- `occurred_at` (timestamp with time zone)

**`logs` テーブル:**
- `id` (UUID, Primary Key, default: `uuid_generate_v4()`) 
- `project_id` (UUID, references `public.projects.id`)
- `endpoint` (text)
- `status_code` (int)
- `response_ms` (int)
- `created_at` (timestamp with time zone, default: `now()`) 

**RLSポリシー:**
各テーブルに対して、`user_id` や `api_key` に基づく適切なRLSポリシーを設定し、データのセキュリティを確保してください。

## エラー監視機能の利用

このSaaSアプリケーションに外部からエラーやログを報告する方法については、詳細なガイドドキュメントを参照してください。

→ [エラー検知機能 ガイド](./ERROR_MONITORING_GUIDE.md)

## テストの実行

ユニットテストを実行するには：

```bash
npm run test
```

Vitest UI を起動してインタラクティブにテストを実行・確認するには：

```bash
npm run test:ui
```

## Learn More

Next.jsに関する詳細情報は、以下のリソースを参照してください：

- [Next.js Documentation](https://nextjs.org/docs) - Next.jsの機能とAPIについて学ぶ
- [Learn Next.js](https://nextjs.org/learn) - インタラクティブなNext.jsチュートリアル

Next.jsのGitHubリポジトリもご確認ください - フィードバックや貢献を歓迎します！

## Deploy on Vercel

Next.jsアプリケーションをデプロイする最も簡単な方法は、Next.jsの作成者である[Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme)を使用することです。

詳細については、[Next.jsデプロイメントドキュメント](https://nextjs.org/docs/app/building-your-application/deploying)をご確認ください。