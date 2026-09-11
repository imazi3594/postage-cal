import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Share } from "lucide-react";
import { loadSaved } from "@/lib/stamp-settings";
import { applyCrisis, applySolveMode } from "@/lib/theme";

const FEATURES = [
  { icon: "✨", title: "自訂面值", body: "支援紀念郵票、特別版郵票，上限 $50。" },
  { icon: "📦", title: "庫存管理", body: "可隨時將缺貨的通用郵票標示為缺貨，組合僅計算有貨面值。" },
  { icon: "🌐", title: "離線使用", body: "採用 PWA 技術，沒有網絡也能照常運算。" },
  { icon: "🌙", title: "深色模式", body: "支援淺色／深色主題，呵護雙眼。" },
] as const;

export function AboutPage() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const saved = loadSaved();
    applyCrisis(saved.enabled.length === 0 && saved.extras.length === 0);
    applySolveMode(saved.mode);
  }, []);

  async function share() {
    const url = `${window.location.origin}${window.location.pathname}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "郵票組合計數機", text: "香港郵票組合計數機", url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* user cancelled */
    }
  }

  return (
    <div className="relative mx-auto flex w-full max-w-lg flex-col px-5 py-4 sm:px-8 sm:py-6">
      <header className="flex items-center gap-2">
        <Link
          to="/"
          aria-label="返回計數機"
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-md text-ink transition-[background-color] duration-(--motion-quick) ease-(--ease-smooth-out) hover:bg-surface-2"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <h1 className="text-base font-semibold tracking-tight text-ink">關於</h1>
      </header>

      <section className="stagger-in mt-1 overflow-visible text-center">
        <HeroArt />
        <h2 className="mt-3 font-sans text-[1.65rem] font-bold tracking-tight text-ink">郵票組合計數機</h2>
        <p className="mt-2.5 flex items-center justify-center gap-2.5 font-display text-[0.625rem] font-semibold tracking-[0.14em] text-primary">
          <span className="h-px w-7 bg-primary/45" aria-hidden />
          POSTAGE COMBINATION CALCULATOR
          <span className="h-px w-7 bg-primary/45" aria-hidden />
        </p>
      </section>

      <section className="stagger-in mt-8" style={{ animationDelay: "60ms" }}>
        <SectionTitle>關於本程式</SectionTitle>
        <p className="mt-3 text-[0.9375rem] leading-[1.85] text-muted">
          這是一個郵票組合的智能計算工具。當您手邊有多種不同面值的郵票，卻不知道如何組合成目標郵費時，本程式能即時為您運算最理想的貼法：金額必須剛好相符，不多不少。
        </p>
      </section>

      <section className="stagger-in mt-8" style={{ animationDelay: "110ms" }}>
        <SectionTitle>計算邏輯與演算法</SectionTitle>
        <div className="mt-4 overflow-hidden rounded-2xl bg-surface px-4 shadow-(--shadow-border)">
          <div className="flex items-start gap-3.5 py-[1.05rem]">
            <span className="w-8 shrink-0 text-center text-lg leading-7" aria-hidden>
              🔢
            </span>
            <div className="min-w-0">
              <p className="font-semibold leading-7 text-[#009247]">最少郵票</p>
              <p className="mt-1 text-sm leading-[1.75] text-muted">優先尋找「最少郵票總數」的方案，節省信封空間。</p>
            </div>
          </div>
          <div className="h-px bg-border/80" />
          <div className="flex items-start gap-3.5 py-[1.05rem]">
            <span className="w-8 shrink-0 text-center text-lg leading-7" aria-hidden>
              💲
            </span>
            <div className="min-w-0">
              <p className="font-semibold leading-7 text-[#7c3aed]">減少種類</p>
              <p className="mt-1 text-sm leading-[1.75] text-muted">
                在枚數合理的前提下，盡量減少使用的面值種類，以便一次撕下同款郵票。
              </p>
            </div>
          </div>
        </div>
        <p className="mt-4 text-[0.9375rem] leading-[1.85] text-muted">
          組合必須剛好等於目標郵費。同枚數時會優先整數面值，例如 $3 用 $2+$1，而不是 $2.8+$0.2。
        </p>
      </section>

      <section className="stagger-in mt-8" style={{ animationDelay: "160ms" }}>
        <SectionTitle>核心功能</SectionTitle>
        <ul className="mt-4 flex flex-col gap-3">
          {FEATURES.map((item) => (
            <li
              key={item.title}
              className="flex items-start gap-3.5 rounded-2xl border border-border/80 bg-surface px-4 py-4 shadow-(--shadow-border)"
            >
              <span className="w-8 shrink-0 text-center text-xl leading-7" aria-hidden>
                {item.icon}
              </span>
              <div className="min-w-0 pt-0.5">
                <p className="font-semibold leading-snug text-ink">{item.title}</p>
                <p className="mt-1 text-sm leading-[1.75] text-muted">{item.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <footer className="stagger-in mt-10 flex flex-col items-center gap-3.5 pb-10 text-center" style={{ animationDelay: "250ms" }}>
        <a
          href="https://grok.com"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2.5 rounded-full bg-surface py-1.5 pr-2.5 pl-2.5 no-underline shadow-(--shadow-border) transition-[transform,background-color] duration-(--motion-quick) ease-(--ease-smooth-out) hover:bg-surface-2"
        >
          <span className="inline-flex size-7 items-center justify-center rounded-full bg-primary/12 text-primary">
            <GrokMark className="size-3.5" />
          </span>
          <span className="flex items-center gap-1.5 pr-0.5">
            <span className="text-[0.625rem] font-semibold tracking-[0.16em] text-subtle">BUILT WITH</span>
            <span className="font-display text-[0.95rem] font-semibold tracking-tight text-ink">Grok</span>
            <span className="rounded-md bg-primary/12 px-1.5 py-0.5 font-display text-[0.625rem] font-bold tracking-wide text-primary">
              AI
            </span>
          </span>
        </a>
        <p className="max-w-[22rem] px-1 text-[0.875rem] leading-[1.85] text-subtle">
          本應用程式之介面及運算由Grok協助開發而成。
        </p>
        <div className="mt-1 flex w-full gap-3">
          <button
            type="button"
            onClick={() => void share()}
            className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-surface-2 text-sm font-semibold text-ink transition-[background-color] duration-(--motion-quick) ease-(--ease-smooth-out) hover:bg-border"
          >
            <Share className="size-4" aria-hidden />
            {copied ? "已複製連結" : "分享程式"}
          </button>
          <Link
            to="/"
            className="inline-flex h-12 flex-1 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-fg transition-[opacity] duration-(--motion-quick) ease-(--ease-smooth-out) hover:opacity-90"
          >
            返回首頁
          </Link>
        </div>
      </footer>
    </div>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <h2 className="flex items-center gap-2.5 font-sans text-[1.0625rem] font-bold tracking-tight text-ink">
      <span className="h-4 w-[3px] shrink-0 rounded-full bg-primary" aria-hidden />
      {children}
    </h2>
  );
}

function HeroArt() {
  return (
    <svg viewBox="0 0 260 200" className="mx-auto block h-auto w-full max-w-[17.5rem]" aria-hidden>
      <defs>
        <linearGradient id="hero-coin" x1="0.2" y1="0" x2="0.85" y2="1">
          <stop offset="0%" stopColor="#fff4c2" />
          <stop offset="38%" stopColor="#f0c64a" />
          <stop offset="100%" stopColor="#c48416" />
        </linearGradient>
        <radialGradient id="hero-coin-inner" cx="0.42" cy="0.38" r="0.7">
          <stop offset="0%" stopColor="#fff1a8" />
          <stop offset="70%" stopColor="#e8b031" />
          <stop offset="100%" stopColor="#c07a12" />
        </radialGradient>
        <linearGradient id="hero-env" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e7f3fb" />
        </linearGradient>
        <linearGradient id="hero-flap" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f4faff" />
          <stop offset="100%" stopColor="#d5eaf7" />
        </linearGradient>
        <filter id="hero-soft" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2.2" stdDeviation="2.2" floodColor="#1a3344" floodOpacity="0.2" />
        </filter>
        <filter id="hero-coin-soft" x="-25%" y="-25%" width="150%" height="150%">
          <feDropShadow dx="0" dy="3" stdDeviation="2.6" floodColor="#8a5a00" floodOpacity="0.35" />
        </filter>
      </defs>

      <path d="M28 22 L32 32 L22 28 Z" fill="#f5c542" />
      <path d="M228 44 L234 50 L224 52 Z" fill="#f6d36a" />
      <path d="M24 168 L30 172 L22 176 Z" fill="#e8b84a" />

      <MiniStamp x={6} y={92} rotate={-16} paper="#d7f0c6" ink="#2f6b28" label="$2" maskId="hero-perf-a" />
      <MiniStamp x={168} y={22} rotate={10} paper="#f3d4ea" ink="#8a3060" label="$10" maskId="hero-perf-b" />
      <MiniStamp x={198} y={78} rotate={18} paper="#ddd0f8" ink="#5a348f" label="$5.5" maskId="hero-perf-c" />

      <g filter="url(#hero-soft)">
        <path d="M62 86 L130 48 L198 86" fill="url(#hero-flap)" stroke="#5a9fd4" strokeWidth="2.6" strokeLinejoin="round" />
        <rect x="62" y="84" width="136" height="72" rx="5" fill="url(#hero-env)" stroke="#5a9fd4" strokeWidth="2.6" />
        <path d="M64 86 L130 128 L196 86" fill="none" stroke="#9cc5e0" strokeWidth="1.7" />
        <path d="M62 86 L62 156" stroke="#e85d4c" strokeWidth="3.2" />
        <path d="M198 86 L198 156" stroke="#3b82c4" strokeWidth="3.2" />
        <path d="M66 86 H92" stroke="#e85d4c" strokeWidth="3" strokeLinecap="round" />
        <path d="M96 86 H118" stroke="#3b82c4" strokeWidth="3" strokeLinecap="round" />
        <path d="M142 86 H164" stroke="#3b82c4" strokeWidth="3" strokeLinecap="round" />
        <path d="M168 86 H192" stroke="#e85d4c" strokeWidth="3" strokeLinecap="round" />
        <path d="M66 156 H92" stroke="#e85d4c" strokeWidth="3" strokeLinecap="round" />
        <path d="M96 156 H118" stroke="#3b82c4" strokeWidth="3" strokeLinecap="round" />
        <path d="M142 156 H164" stroke="#3b82c4" strokeWidth="3" strokeLinecap="round" />
        <path d="M168 156 H192" stroke="#e85d4c" strokeWidth="3" strokeLinecap="round" />
      </g>

      <g transform="translate(130 132)" filter="url(#hero-coin-soft)">
        {Array.from({ length: 28 }, (_, i) => (
          <rect
            key={i}
            x={-1.15}
            y={-36.5}
            width={2.3}
            height={4.2}
            rx={0.6}
            fill="#d9a01c"
            transform={`rotate(${(360 / 28) * i})`}
          />
        ))}
        <circle r="33" fill="url(#hero-coin)" stroke="#f8e7a0" strokeWidth="1.4" />
        <circle r="26.5" fill="none" stroke="#a56b12" strokeWidth="1.15" opacity="0.55" />
        <circle r="24.5" fill="url(#hero-coin-inner)" />
        <text
          textAnchor="middle"
          y="10"
          fontSize="28"
          fontWeight="700"
          fill="#7a4a08"
          fontFamily="Outfit, 'Noto Sans HK', sans-serif"
        >
          $
        </text>
        <ellipse cx="-9" cy="-10" rx="8" ry="5" fill="#fff" opacity="0.28" />
      </g>
    </svg>
  );
}

function MiniStamp({
  x,
  y,
  rotate,
  paper,
  ink,
  label,
  maskId,
}: {
  x: number;
  y: number;
  rotate: number;
  paper: string;
  ink: string;
  label: string;
  maskId: string;
}) {
  const holes: { cx: number; cy: number }[] = [];
  for (let i = 0; i < 8; i += 1) {
    const cx = 3.4 + i * 6.6;
    holes.push({ cx, cy: 0 }, { cx, cy: 70 });
  }
  for (let i = 1; i < 10; i += 1) {
    const cy = 3.5 + i * 6.5;
    holes.push({ cx: 0, cy }, { cx: 52, cy });
  }

  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate} 26 35)`} filter="url(#hero-soft)">
      <svg width="52" height="70" overflow="visible">
        <defs>
          <mask id={maskId}>
            <rect width="52" height="70" fill="#fff" />
            {holes.map((hole, i) => (
              <circle key={i} cx={hole.cx} cy={hole.cy} r="2.35" fill="#000" />
            ))}
          </mask>
        </defs>
        <g mask={`url(#${maskId})`}>
          <rect width="52" height="70" fill={paper} />
          <rect width="52" height="70" fill="url(#hero-flap)" opacity="0.18" />
          <rect x="7" y="8" width="38" height="54" rx="1.4" fill="none" stroke={ink} strokeWidth="1.15" opacity="0.55" />
          <g transform="translate(26 26)" fill={ink} opacity="0.78">
            {[0, 72, 144, 216, 288].map((deg) => (
              <ellipse key={deg} cx="0" cy="-5.4" rx="3.1" ry="5.6" transform={`rotate(${deg})`} />
            ))}
            <circle r="2.1" />
          </g>
          <text
            x="26"
            y="58"
            textAnchor="middle"
            fontSize="12.5"
            fontWeight="700"
            fill={ink}
            fontFamily="Outfit, 'Noto Sans HK', sans-serif"
          >
            {label}
          </text>
        </g>
      </svg>
    </g>
  );
}

function GrokMark({ className = "size-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 11.5714" className={className} aria-hidden>
      <path
        fill="currentColor"
        d="M4.63453 7.42767L8.62395 4.46607C8.81953 4.32088 9.09907 4.37752 9.19225 4.60303C9.68274 5.79241 9.46361 7.22172 8.48776 8.20308C7.5119 9.18444 6.15411 9.39966 4.91305 8.9095L3.5573 9.54074C5.50184 10.8774 7.86313 10.5468 9.33868 9.0619C10.5091 7.88488 10.8716 6.28051 10.5326 4.8337L10.5357 4.83679C10.0442 2.71136 10.6565 1.86181 11.9109 0.124601C11.9406 0.0834107 11.9703 0.0422202 12 0L10.3493 1.65998V1.65483L4.6335 7.4287"
      />
      <path
        fill="currentColor"
        d="M3.81125 8.14747C2.41556 6.80672 2.6562 4.73175 3.84709 3.53517C4.72771 2.64958 6.17049 2.28813 7.42999 2.81949L8.78266 2.19133C8.53895 2.01421 8.22664 1.82371 7.86825 1.68984C6.24832 1.01946 4.3089 1.35311 2.99206 2.67635C1.7254 3.95016 1.32708 5.90877 2.01109 7.58007C2.52206 8.82917 1.68444 9.71271 0.840686 10.6045C0.541684 10.9206 0.241659 11.2368 0 11.5714L3.81022 8.1485"
      />
    </svg>
  );
}
