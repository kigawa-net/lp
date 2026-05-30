# 実装計画: プライバシーポリシーに kigawa.net alpha を追加 refs #12

## 概要

開発中のアプリケーション「kigawa.net alpha」からフィードバックを受け取る環境整備の一環として、プライバシーポリシーの対象アプリ一覧に `kigawa.net alpha` を追加する。

## 変更対象ファイル

- `app/routes/privacy.tsx`

## 変更内容

`coveredApps` 配列に以下のエントリを追加する:

```ts
{
  name: "kigawa.net alpha",
  description: "開発中のアプリケーション（フィードバック収集環境）",
  href: "https://alpha.kigawa.net",
},
```

追加後の `coveredApps`:

1. `kigawa.net` — ランディングページ・ポートフォリオサイト
2. `portfolio.kigawa.net` — kigawa のポートフォリオサイト
3. `kigawa.net alpha` — 開発中のアプリケーション（フィードバック収集環境）

## 実装ステップ

1. `feature/12-add-alpha-to-privacy` ブランチを `main` から作成
2. `app/routes/privacy.tsx` の `coveredApps` に `kigawa.net alpha` エントリを追加
3. `pnpm typecheck` で型エラーがないことを確認
4. コミット・PR 作成
