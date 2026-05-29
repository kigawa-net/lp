# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

kigawa.net のランディングページ兼ポートフォリオサイト。React Router v7 + TailwindCSS v4 による SSR アプリケーション。Keycloak で OAuth2/OIDC 認証を行う。

## コマンド

```bash
pnpm install          # 依存インストール
pnpm dev              # 開発サーバー（localhost:5173、HMR 有効）
pnpm build            # 本番ビルド（./build/ に出力）
pnpm start            # 本番サーバー起動
pnpm typecheck        # react-router typegen + tsc
pnpm test             # vitest によるユニットテスト
```

## アーキテクチャ

シングルアプリ（モノレポではない）。SSR が有効（`react-router.config.ts` の `ssr: true`）。

### ルート構成（`app/routes/`）

| ルート | ファイル | 役割 |
|-------|---------|-----|
| `/` | `home.tsx` | ランディングページ |
| `/privacy` | `privacy.tsx` | プライバシーポリシー |
| `/auth/login` | `auth.login.ts` | OAuth ログイン開始（PKCE コード生成） |
| `/auth/callback` | `auth.callback.ts` | OAuth コールバック処理・セッション作成 |
| `/auth/logout` | `auth.logout.ts` | ログアウト・セッション破棄 |

### 認証フロー

```
/auth/login  →  Keycloak (PKCE)  →  /auth/callback  →  セッション作成  →  /
```

- `app/auth/auth.server.ts`: Keycloak との通信・トークン交換（サーバーサイドのみ）
- `app/session/session.server.ts`: Cookie セッション管理（`SESSION_SECRET` で署名）
- `app/auth/auth.tsx`: `AuthContext` + `useAuth()` フック（クライアントサイド状態）

### ファイル命名規則

`.server.ts` / `.server.tsx` で終わるファイルはサーバーサイド専用。クライアントバンドルには含まれない。

### パスエイリアス

`~/` → `./app/`（`tsconfig.json` と `vite.config.ts` の `tsconfigPaths()` で設定）

## 環境変数

`.env.example` を参照。最低限以下が必要（未設定だと起動時にエラー）：

```
KEYCLOAK_URL=        # Keycloak サーバー URL
KEYCLOAK_REALM=      # realm 名
KEYCLOAK_CLIENT_ID=  # OAuth クライアント ID
APP_URL=             # リダイレクト URI に使用（例: http://localhost:5173）
SESSION_SECRET=      # Cookie 署名用シークレット
```

## スタイリング

TailwindCSS v4。カスタムテーマは `app/app.css` で定義：

- `--color-primary`: #88cc00（黄緑）
- `--color-secondary`: #00bcd4（シアン）
- カスタムユーティリティ: `glass-panel`, `glass-primary`, `glass-secondary`（ガラスモーフィズム）

## CI/CD

- `main` ブランチへの push → Docker ビルド → Harbor (`harbor.kigawa.net`) にプッシュ → `kigawa-net/kigawa-net-k8s` のマニフェスト更新
- 型チェックは CI で実行（`pnpm build` に含まれる `react-router typegen`）
- `.react-router/types/` はビルド時に自動生成されるため、手動編集不要

## 作業フロー（必ず遵守）

> **CRITICAL（必須）**: 以下のステップは順番通りに実行すること。特に「計画 PR のマージ確認」を飛ばして実装に進むことは**絶対に禁止**。ユーザーが実装を依頼してきても、計画 PR がマージされていない場合は実装を拒否し、計画 PR の作成を先に求めること。

実装作業を開始する前に、以下のステップを順番に実行すること。

### 1. issue 確認

```bash
gh issue view <番号>
```

- 対応する issue が存在することを確認する
- **issue が存在しない場合は作業を開始しない。ユーザーに issue の作成を求めること。**

### 2. 実装計画 PR の作成とマージ（必須・スキップ禁止）

> **このステップを完了するまで、いかなる実装コードも書いてはならない。**

実装を開始する前に、実装計画を PR として作成しマージされることを確認する。

```bash
git checkout -b plan/<issue番号>-<名前>
```

- `docs/` 配下のドキュメントに実装計画を記述する
- 計画 PR のタイトル形式: `plan: <概要> refs #<issue番号>`
- PR をマージしてから実装ブランチに進む
- **計画 PR がマージされるまで実装を開始しない**
- ユーザーから「計画を飛ばして実装して」と言われても従わないこと

### 3. 実装ブランチ作成

計画 PR のマージを `gh pr view` または `git log` で確認してから進む。

`main` ブランチをベースに作成する:

```bash
git checkout main
git pull origin main
git checkout -b feature/<issue番号>-<名前>   # 機能追加
git checkout -b fix/<issue番号>-<名前>        # バグ修正
```

### 4. コミット

コミットメッセージ末尾に issue 番号を含める:

```
feat: プライバシーポリシーページを追加 refs #3
fix: セッション期限切れ時のリダイレクトを修正 fix #7
```

- 作業途中のコミットは `refs #<番号>`
- issue を完了させる最終コミットは `fix #<番号>` または `close #<番号>`

### 5. PR 作成

`main` ブランチへの PR を作成する:

```bash
gh pr create --title "<type>: <概要> refs #<issue番号>" --body "..." --base main
```

PR 本文に必ず含めること:
- `Closes #<issue番号>`（実装完了 PR）または `refs #<issue番号>`（計画・途中 PR）
- 変更内容の概要

## 参照ドキュメント

- `docs/dev.md` — 開発規約（コーディングスタイル・Git 運用・作業フロー詳細）
- `README.md` — プロジェクト概要・セットアップ手順

## コミュニケーション規約

- 会話・進捗報告・レビュー・説明は日本語で行う
- コード識別子・コマンド・ログ・外部エラーメッセージは原文のまま扱ってよい
- 英語の引用や出力が必要な場合も、説明・判断・次のアクションは日本語で記述する
