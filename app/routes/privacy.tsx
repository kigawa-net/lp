import type {Route} from "./+types/privacy";
import {ParticleBackground} from "~/particle/ParticleBackground";

export function meta({}: Route.MetaArgs) {
  return [
    {title: "プライバシーポリシー — kigawa.net"},
    {name: "description", content: "kigawa.net のプライバシーポリシー"},
  ];
}

const coveredApps = [
  {
    name: "kigawa.net",
    description: "ランディングページ・ポートフォリオサイト",
    href: "https://kigawa.net",
  },
  {
    name: "portfolio.kigawa.net",
    description: "kigawaのポートフォリオサイト",
    href: "https://portfolio.kigawa.net",
  },
];

const sections = [
  {
    title: "収集する情報",
    body: "ログイン機能をご利用いただく場合、Keycloak を通じてユーザー名・メールアドレス等のアカウント情報を取得します。ログインせずに閲覧する場合、個人情報は収集しません。また、サーバーアクセスログ（IPアドレス、アクセス日時、リクエスト内容）を運用上の目的で記録する場合があります。",
  },
  {
    title: "情報の利用目的",
    body: "取得した情報は、サービスの提供・改善、認証・セッション管理、および障害対応にのみ使用します。第三者への販売・提供は行いません。",
  },
  {
    title: "Cookie・セッション",
    body: "認証セッションの維持を目的として Cookie を使用します。ブラウザの設定により Cookie を無効にすることが可能ですが、ログイン機能が利用できなくなります。",
  },
  {
    title: "第三者サービス",
    body: "本サービスは Discord（招待リンク）および GitHub（外部リンク）へのリンクを含みます。これらのサービスにおける情報の取り扱いは、各サービスのプライバシーポリシーに従います。",
  },
  {
    title: "情報の保管・セキュリティ",
    body: "個人情報は適切なセキュリティ対策を施したサーバーで管理します。ただし、インターネット上の完全な安全性を保証するものではありません。",
  },
  {
    title: "情報の開示・削除",
    body: "ご自身の情報の確認・修正・削除を希望される場合は、下記の連絡先までお問い合わせください。合理的な範囲で対応します。",
  },
  {
    title: "ポリシーの変更",
    body: "本ポリシーは予告なく変更する場合があります。変更後はこのページに最新版を掲載します。",
  },
  {
    title: "お問い合わせ",
    body: "プライバシーポリシーに関するお問い合わせは contact@kigawa.net までご連絡ください。",
  },
];

export default function Privacy(_: Route.ComponentProps) {
  return (
    <div className="relative min-h-screen bg-base text-ink overflow-x-hidden">
      <ParticleBackground/>

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-24">
        <div className="mb-4">
          <a
            href="/"
            className="text-primary text-sm hover:brightness-110 transition-[filter] duration-200"
          >
            ← ホームへ戻る
          </a>
        </div>

        <div className="glass-panel glass-primary rounded-3xl px-10 py-14 mb-10">
          <p className="text-primary text-xs tracking-[0.4em] uppercase mb-4">Privacy Policy</p>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">プライバシーポリシー</h1>
          <p className="text-ink/50 text-sm">最終更新日：2026年5月19日</p>
        </div>

        <div className="glass-panel glass-primary rounded-2xl p-8 mb-6">
          <h2 className="text-primary font-bold text-lg mb-4">対象アプリ・サービス</h2>
          <p className="text-ink/70 text-sm leading-relaxed mb-4">
            本プライバシーポリシーは、以下のアプリ・サービスに適用されます。
          </p>
          <div className="flex flex-col gap-3">
            {coveredApps.map((app) => (
              <a
                key={app.name}
                href={app.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 text-ink/70 hover:text-primary transition-colors duration-200"
              >
                <span className="text-primary font-bold w-52 shrink-0">{app.name}</span>
                <span className="text-sm">{app.description}</span>
              </a>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {sections.map((s, i) => (
            <div key={i} className="glass-panel glass-secondary rounded-2xl p-8">
              <h2 className="text-secondary font-bold text-lg mb-3">{s.title}</h2>
              <p className="text-ink/70 text-sm leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </div>

      <footer className="relative z-10 text-center py-12 text-ink/30 text-sm tracking-wider">
        © 2026 kigawa.net
      </footer>
    </div>
  );
}
