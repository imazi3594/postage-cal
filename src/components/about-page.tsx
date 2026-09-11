import { useEffect, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, X } from "lucide-react";
import { StampFace } from "@/components/stamp-face";
import { loadSaved } from "@/lib/stamp-settings";
import { applyCrisis } from "@/lib/theme";

const FAN = [
  { cents: 10, rotate: "-22deg", left: "4%", top: "1.4rem" },
  { cents: 280, rotate: "-10deg", left: "22%", top: "0.45rem" },
  { cents: 550, rotate: "2deg", left: "40%", top: "0" },
  { cents: 1000, rotate: "12deg", left: "58%", top: "0.5rem" },
  { cents: 5000, rotate: "22deg", left: "76%", top: "1.5rem" },
] as const;

const SECTIONS: { title: string; body: string; illo: ReactNode }[] = [
  {
    title: "呢部計數機做咩",
    body: "寄信最煩唔係寫信封，係企喺櫃台前面數郵票。入個郵費，佢會砌出剛好嘅組合：一毫都唔多，一毫都唔少。",
    illo: (
      <div className="flex items-end justify-center gap-0.5">
        <StampFace cents={550} size="xs" className="w-9 -rotate-8" />
        <StampFace cents={540} size="xs" className="w-9" />
        <StampFace cents={400} size="xs" className="w-9 rotate-8" />
      </div>
    ),
  },
  {
    title: "點樣揀郵票",
    body: "先求最少枚，唔好貼到成幅牆。同枚數就揀最少款式，同款一次過撕。再嚟先用整數面額，$3 會用 $2+$1，唔會用 $2.8+$0.2 咁麻。",
    illo: <StampFace cents={280} count={2} size="xs" className="w-11 pt-2 pr-2" />,
  },
  {
    title: "庫存同特別郵票",
    body: "十六款通用面額可以喺設定標缺貨。紀念郵票、舊票、口袋底嗰隻 $2.4，都可以加做自訂面額，上限 $50。",
    illo: (
      <div className="flex items-end justify-center gap-1">
        <StampFace cents={10} size="xs" muted className="w-9" />
        <StampFace cents={240} size="xs" className="w-9" />
      </div>
    ),
  },
  {
    title: "當 app 用",
    body: "撳「一鍵加到桌面」，之後開出嚟就似普通 app，唔使每次翻瀏覽器。資料存在你部機，唔會上傳。",
    illo: (
      <div className="relative h-16 w-11 rounded-[0.7rem] border-2 border-primary/40 bg-bg shadow-(--shadow-border)">
        <span className="mx-auto mt-1.5 block h-1 w-4 rounded-full bg-border" />
        <StampFace cents={200} size="xs" className="absolute inset-x-1 top-4 !w-auto" />
      </div>
    ),
  },
  {
    title: "如果一隻郵票都冇",
    body: "郵政局會關閉。真係。鍵盤罷工，成個畫面變紅同有啲頹。開返任何一款庫存就恢復正常。建議試一次。",
    illo: (
      <div className="relative w-11">
        <StampFace cents={50} size="xs" muted className="w-11" />
        <X className="absolute inset-0 m-auto size-8 text-primary" strokeWidth={2.5} />
      </div>
    ),
  },
];

export function AboutPage() {
  useEffect(() => {
    const saved = loadSaved();
    applyCrisis(saved.enabled.length === 0 && saved.extras.length === 0);
  }, []);

  return (
    <div className="relative mx-auto flex w-full max-w-lg flex-col gap-4 px-4 py-4 sm:px-6 sm:py-6">
      <header className="flex items-center gap-1">
        <Link
          to="/"
          aria-label="返回計數機"
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-md text-ink transition-[background-color] duration-(--motion-quick) ease-(--ease-smooth-out) hover:bg-surface-2"
        >
          <ChevronLeft className="size-5" />
        </Link>
        <div className="min-w-0">
          <p className="font-display text-2xs font-medium tracking-wide text-primary">
            Postage combination calculator
          </p>
          <h1 className="mt-0.5 text-lg font-semibold tracking-tight text-ink">關於</h1>
          <p className="mt-1 text-sm text-muted">為口袋裡頭嗰堆碎郵票而整。</p>
        </div>
      </header>

      <section
        className="stagger-in rounded-xl bg-surface p-5 shadow-(--shadow-border)"
        style={{ animationDelay: "60ms" }}
      >
        <div className="relative mx-auto h-28 w-full max-w-xs" aria-hidden="true">
          {FAN.map((stamp) => (
            <div
              key={stamp.cents}
              className="absolute w-14"
              style={{
                left: stamp.left,
                top: stamp.top,
                transform: `rotate(${stamp.rotate})`,
              }}
            >
              <StampFace cents={stamp.cents} size="xs" className="w-full" />
            </div>
          ))}
        </div>
        <div className="mt-1 text-center">
          <h2 className="font-sans text-xl font-semibold">郵票組合計數機</h2>
          <p className="mt-0.5 text-sm text-muted">香港郵費 · 剛好湊齊 · 即開即用</p>
        </div>
      </section>

      {SECTIONS.map((section, index) => (
        <section
          key={section.title}
          className="stagger-in flex items-start gap-3 rounded-xl bg-surface p-5 shadow-(--shadow-border)"
          style={{ animationDelay: `${120 + index * 50}ms` }}
        >
          <div className="flex h-16 w-20 shrink-0 items-center justify-center" aria-hidden="true">
            {section.illo}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-sans text-lg font-semibold">{section.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{section.body}</p>
          </div>
        </section>
      ))}

      <section
        className="stagger-in flex items-start gap-3 rounded-xl bg-surface p-5 shadow-(--shadow-border)"
        style={{ animationDelay: "380ms" }}
      >
        <div className="flex h-16 w-20 shrink-0 items-center justify-center text-primary" aria-hidden="true">
          <svg viewBox="0 0 24 24" className="size-10" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 10h16v10H4z" />
            <path d="M4 10V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2" />
            <path d="M12 6V3" />
            <path d="M8 3h8" />
            <path d="M8 15h5" />
            <path d="M17 15h.01" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-sans text-lg font-semibold">聲明</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            呢個唔係香港郵政官方產品，亦唔代表郵局當日一定有票。實際郵費同庫存，以櫃台為準。
          </p>
        </div>
      </section>

      <div className="flex items-end justify-center gap-1 pb-1 opacity-60" aria-hidden="true">
        <StampFace cents={20} size="xs" className="w-8 -rotate-6" />
        <StampFace cents={370} size="xs" className="w-8" />
        <StampFace cents={2000} size="xs" className="w-8 rotate-6" />
      </div>
      <p className="px-1 pb-6 text-center text-xs text-subtle">為咗櫃台前面嗰十秒。</p>
    </div>
  );
}