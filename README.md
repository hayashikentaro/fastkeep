# FastKeep Web MVP

FastKeep は軽量な Google Keep 風メモアプリです。メモの正本は Supabase Postgres に保存し、期限があるメモだけ Google Calendar に片方向で投影します。

このフェーズは Web のみです。iOS、React Native / Expo、MCP サーバー、Google Keep インポート、画像添付、音声メモ、共有、課金、双方向 Calendar 同期、繰り返し予定は含みません。

## 機能

- Supabase Auth のメールリンクログイン
- メモの作成、編集、削除、固定、アーカイブ
- メモ色と期限日時の設定
- Google Calendar OAuth 接続
- 期限付きメモの Google Calendar `primary` への作成、更新、削除
- Calendar 投影状態の表示

## 技術スタック

- Next.js App Router
- TypeScript
- Supabase Auth / Postgres
- Google Calendar API
- Tailwind CSS
- Vercel 想定

## セットアップ

1. 依存関係をインストールします。

```bash
npm install
```

2. `.env.example` を参考に `.env.local` を作成します。

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

APP_BASE_URL=http://localhost:3000
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
```

3. Supabase SQL Editor で `supabase/schema.sql` を実行します。

4. Supabase Auth の URL 設定に以下を追加します。

- Site URL: `http://localhost:3000`
- Redirect URLs: `http://localhost:3000/auth/callback`

5. Google Cloud Console で OAuth クライアントを作成し、承認済みリダイレクト URI に以下を追加します。

- `http://localhost:3000/auth/google/callback`

6. 開発サーバーを起動します。

```bash
npm run dev
```

## Vercel へデプロイする場合

Vercel の Environment Variables に `.env.example` と同じキーを設定します。`APP_BASE_URL` と `GOOGLE_REDIRECT_URI` は本番ドメインに合わせてください。

例:

```env
APP_BASE_URL=https://your-app.vercel.app
GOOGLE_REDIRECT_URI=https://your-app.vercel.app/auth/google/callback
```

Supabase Auth と Google Cloud Console のリダイレクト URI にも本番 URL を追加してください。

## データ設計メモ

`notes` がメモの正本です。Google Calendar には期限付きメモを予定として投影し、`calendar_event_id` と `calendar_projection_status` を `notes` に保持します。

`google_connections` には Google OAuth トークンを保存します。MVP では Supabase の RLS とサーバー側の service role key でアクセスを制御します。本番運用では、必要に応じてトークン暗号化や Secret Manager の導入を検討してください。

## 開発用コマンド

```bash
npm run dev
npm run typecheck
npm run lint
npm run build
```
