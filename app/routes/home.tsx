import type {Route} from "./+types/home";
import {ParticleBackground} from "~/components/ParticleBackground";

export function meta({}: Route.MetaArgs) {
  return [
    {title: "kigawa.net — ITですべてをつなげる"},
    {
      name: "description",
      content: "IT、ネットワークで世の中のあらゆるものとシステムを融合する。",
    },
  ];
}

const missions = [
  {
    key: "融合 (Fusion)",
    value: "境界のない接続",
    description:
      "既存のインフラ、デバイス、データをネットワークの力で一つのシステムへ統合。",
    accent: "primary" as const,
  },
  {
    key: "堅牢 (Robust)",
    value: "揺るぎない信頼",
    description:
      "融合された巨大なシステムを、IaCとKubernetesで安全かつ確実に維持。",
    accent: "secondary" as const,
  },
  {
    key: "機能 (Function)",
    value: "最小の摩擦",
    description:
      "複雑な接続をシンプルに整理し、一切の無駄を削ぎ落とした高効率な動作。",
    accent: "primary" as const,
  },
];

const projects = [
  {
    name: "portfolio",
    tag: "portfolio",
    description:
      "kigawaのポートフォリオサイト。",
    accent: "primary" as const,
    href: "https://portfolio.kigawa.net",
  },
];

function accentText(accent: "primary" | "secondary") {
  return accent === "primary" ? "text-primary" : "text-secondary";
}

function accentBorderTop(accent: "primary" | "secondary") {
  return accent === "primary" ? "border-t-primary" : "border-t-secondary";
}

function accentBorderBottom(accent: "primary" | "secondary") {
  return accent === "primary" ? "border-b-primary" : "border-b-secondary";
}

export default function Home() {
  return (
    <div className="relative min-h-screen bg-base text-ink overflow-x-hidden">
      <ParticleBackground/>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <div
          className="bg-white/60 backdrop-blur-xl backdrop-saturate-160 border border-white/50 shadow-glass rounded-3xl px-10 py-14 max-w-3xl w-full">
          <p className="text-primary text-sm tracking-[0.3em] uppercase mb-6 font-medium">
            kigawa.net
          </p>
          <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6">
            ITですべてを
            <br/>
            <span className="text-primary">つなげる</span>
          </h1>
          <p className="text-lg md:text-xl text-ink/60 tracking-widest leading-relaxed">
            IT、ネットワークで世の中のあらゆるものと
            <br className="hidden md:block"/>
            システムを融合する
          </p>
          <div className="flex justify-center gap-3 mt-10">
            <span className="inline-block w-8 h-1 rounded-full bg-primary"/>
            <span className="inline-block w-8 h-1 rounded-full bg-secondary"/>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="relative z-10 px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-secondary text-xs tracking-[0.4em] uppercase mb-4">
              Our Mission
            </p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Fusion &amp; Robustness
            </h2>
            <p className="text-ink/55 text-lg max-w-xl mx-auto leading-relaxed">
              世の中を支える堅牢なシステムを築く。
              <br/>
              機能的で無駄のないシステム。
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {missions.map((m) => (
              <div
                key={m.key}
                className={`bg-white/60 backdrop-blur-xl backdrop-saturate-160 border border-white/50 shadow-glass rounded-2xl p-8 border-t-2 ${accentBorderTop(m.accent)}`}
              >
                <p className={`${accentText(m.accent)} font-bold text-sm tracking-wider mb-3`}>
                  {m.key}
                </p>
                <p className="text-ink font-semibold text-lg mb-3">{m.value}</p>
                <p className="text-ink/55 text-sm leading-relaxed">
                  {m.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects */}
      <section className="relative z-10 px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-primary text-xs tracking-[0.4em] uppercase mb-4">
              Projects
            </p>
            <h2 className="text-3xl md:text-4xl font-bold">システム</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {projects.map((p) => (
              <div
                key={p.name}
                className={`bg-white/60 backdrop-blur-xl backdrop-saturate-160 border border-white/50 shadow-glass rounded-2xl p-8 border-b-2 ${accentBorderBottom(p.accent)} hover:shadow-lg transition-shadow duration-300`}
              >
                <p className="text-ink/35 text-xs tracking-widest mb-3">
                  {p.tag}
                </p>
                <p className={`${accentText(p.accent)} font-black text-2xl mb-4`}>
                  {p.name}
                </p>
                <p className="text-ink/55 text-sm leading-relaxed">
                  {p.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 text-center py-12 text-ink/30 text-sm tracking-wider">
        © 2025 kigawa.net
      </footer>
    </div>
  );
}
