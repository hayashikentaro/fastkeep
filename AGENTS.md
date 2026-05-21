# FastKeep 検証ルール

## 完了条件

FastKeep の Web 変更は、`build` が通るだけでは完了ではありません。次を満たしてください。

- 対象画面が実際にブラウザで表示できる
- Next.js の runtime error overlay が出ない
- 白画面にならない
- browser console の error / warning がない
- JS / CSS / document / fetch / XHR の 4xx / 5xx がない
- サーバーログに runtime error がない

## 推奨コマンド

```bash
npm run typecheck
npm run lint
npm run build
npm run test:e2e
```

実 Supabase 接続も含めて確認する場合は、`.env.local` を設定したうえで次を実行します。

```bash
RUN_SUPABASE_SMOKE=1 npm run test:e2e
```

`npm run test:e2e` は Playwright で `/login`、`/`、`/api/smoke/runtime` を開き、runtime error、白画面、重大な console error、JS/CSS 404 を検知します。
