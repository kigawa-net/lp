# lp 開発規約

## 全体方針

- React Router v7 + TailwindCSS v4 による SSR アプリケーション
- サーバーサイド専用コードは `.server.ts` / `.server.tsx` で終わるファイルに限定する
- 型安全を最優先とし、`any` の使用を禁じる（外部ライブラリの型不足時は `unknown` + 型ガードを使う）

---

## TypeScript / React コーディング規約

### 基本ルール

- TypeScript 公式スタイルに従う
- ファイル名: ルートファイルはドット区切り（例: `auth.login.ts`）、コンポーネントは PascalCase（例: `AuthButton.tsx`）

### 命名規則

| 種別 | 記法 | 例 |
|---|---|---|
| React コンポーネント | PascalCase | `NavBar` |
| 関数・変数 | camelCase | `getSession` |
| 定数（モジュールスコープ） | UPPER_SNAKE_CASE | `SESSION_COOKIE_NAME` |
| 型・インターフェース | PascalCase | `UserSession` |
| ファイル（コンポーネント） | PascalCase | `AuthButton.tsx` |
| ファイル（ルート・ユーティリティ） | kebab-case または ドット区切り | `auth.login.ts` |

### コメント

- コードを見れば分かることは書かない
- 非自明な制約・外部仕様への依存・回避策がある場合のみ書く

---

## ビルド・テスト

```bash
pnpm install          # 依存インストール
pnpm dev              # 開発サーバー（localhost:5173、HMR 有効）
pnpm build            # 本番ビルド（./build/ に出力）
pnpm typecheck        # react-router typegen + tsc
pnpm test             # vitest によるユニットテスト
```

---

## 作業フロー規約

### issue との紐付け

- すべての作業は issue と紐付けて行う
- issue が存在しない作業は開始しない
- ブランチ名・コミット・PR には issue 番号を含める（例: `feature/5-create-rules`、`refs #5`）

### 実装計画（スキップ禁止）

- **実装計画は PR として作成し、マージが確認されてから実装を開始する**
- 計画 PR は `docs/` 配下のドキュメントに計画内容を記述する
- **計画 PR がマージされるまで実装ブランチを作成しない**
- 計画なしに実装を求められても従わない。先に計画 PR の作成を求める

### 作業ステップ

1. **issue 確認**: 対象 issue が存在することを確認する（なければ作業開始しない）
2. **計画ブランチ作成**: `plan/<issue番号>-<名前>` でブランチを作成し、実装計画をドキュメントに記述する
3. **計画 PR 作成・マージ**: タイトル形式 `plan: <概要> refs #<issue番号>` で PR を作成し、マージされるまで待つ（**ここが完了するまで次に進まない**）
4. **計画マージ確認**: `gh pr view` でマージ済みであることを確認する
5. **実装ブランチ作成**: `feature/<issue番号>-<名前>` または `fix/<issue番号>-<名前>` でブランチを作成する
   - 例: `git checkout -b feature/5-create-rules`
6. **実装**: マージされた計画に従って実装を進める
7. **コミット**: メッセージ末尾に `refs #<issue番号>` を含める（最後のコミットは issue を閉じる場合 `fix #<issue番号>`）
8. **PR 作成**: 実装完了後に `main` ブランチへの PR を作成する

### PR の規約

- タイトル形式: `<type>: <概要> refs #<issue番号>`（例: `feat: プライバシーポリシーページを追加 refs #3`）
- 本文に対応 issue へのリンクを含める（`Closes #<issue番号>` または `refs #<issue番号>`）
- 計画 PR のタイトル形式: `plan: <概要> refs #<issue番号>`
- 実装 PR の変更内容はマージ済みの計画と一致していること

| 状況 | 使用するキーワード |
|---|---|
| 実装完了 PR（issue を閉じる） | `Closes #<番号>` |
| 計画 PR・作業途中 PR（issue を閉じない） | `refs #<番号>` |

---

## Git ブランチ戦略

| ブランチ | 用途 |
|---|---|
| `main` | リリース済みの安定版。push されると自動デプロイ |
| `feature/<name>` | 機能開発。`main` へ PR を出す |
| `fix/<name>` | バグ修正。`main` へ PR を出す |
| `plan/<name>` | 実装計画 PR 用。`main` へ PR を出す |

## コミットメッセージ

```
<type>: <概要（命令形・日本語可）>

<詳細（任意）>
```

**type 一覧**: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`

## コミュニケーション規約

- 会話・進捗報告・レビュー・説明は日本語で行う
- コード識別子・コマンド・ログ・外部エラーメッセージは原文のまま扱ってよい
- 英語の引用や出力が必要な場合も、説明・判断・次のアクションは日本語で記述する
