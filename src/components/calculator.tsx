import { useEffect, useLayoutEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { Link } from "@tanstack/react-router";
import { CircleAlert, CircleHelp, Delete, Hand, Settings, Share, X } from "lucide-react";
import { StampFace } from "@/components/stamp-face";
import { ThemeToggle } from "@/components/theme-toggle";
import { InstallAppButton } from "@/components/install-app-button";
import {
  DEFAULT_CENTS,
  MAX_AMOUNT_LABEL,
  applyAmountKey,
  formatMoney,
  parseAmountToCents,
  solve,
  type Combination,
  type SolveMode,
} from "@/lib/postage";
import { loadSaved, patchSaved } from "@/lib/stamp-settings";
import { applyCrisis, applySolveMode } from "@/lib/theme";
import { createTapTracker, pulsePress, setPressDown } from "@/lib/tap";
import { cn } from "@/lib/utils";

const KEY_ROWS = [
  ["7", "8", "9"],
  ["4", "5", "6"],
  ["1", "2", "3"],
  ["C", "0", "."],
] as const;

export function StampCalculator() {
  const [hydrated, setHydrated] = useState(false);
  const [amount, setAmount] = useState("");
  const [enabled, setEnabled] = useState<number[]>([...DEFAULT_CENTS]);
  const [extras, setExtras] = useState<number[]>([]);
  const [mode, setMode] = useState<SolveMode>("stamps");
  const [toast, setToast] = useState("");
  const amountRef = useRef(amount);
  const toastTimer = useRef<number>(0);
  const tap = useRef(createTapTracker()).current;
  const closedRef = useRef(false);
  const markRef = useRef<HTMLParagraphElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  amountRef.current = typeof amount === "string" ? amount : "";

  useEffect(() => {
    const saved = loadSaved();
    setAmount(saved.amount);
    setEnabled(saved.enabled);
    setExtras(saved.extras);
    setMode(saved.mode);
    setHydrated(true);
  }, []);

  useLayoutEffect(() => {
    const mark = markRef.current;
    const title = titleRef.current;
    if (!mark || !title) return;

    function titleWidth() {
      const pack = title.querySelector("span");
      const packW = pack instanceof HTMLElement ? pack.getBoundingClientRect().width : 0;
      const gap = Number.parseFloat(getComputedStyle(title).gap) || 0;
      const textNode = [...title.childNodes].find((node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim());
      let hanW = 0;
      if (textNode) {
        const range = document.createRange();
        range.selectNodeContents(textNode);
        hanW = range.getBoundingClientRect().width;
      }
      const packFallback = packW > 1 ? packW : parseFloat(getComputedStyle(pack ?? title).fontSize) * 1.2;
      return Math.max(title.getBoundingClientRect().width, packFallback + gap + hanW);
    }

    function fit() {
      if (!mark || !title) return;
      mark.style.letterSpacing = "0px";
      const gaps = Math.max((mark.textContent ?? "").length - 1, 1);
      const extra = titleWidth() - mark.getBoundingClientRect().width;
      mark.style.letterSpacing = `${Math.max(0, extra / gaps)}px`;
    }

    fit();
    const raf = requestAnimationFrame(() => requestAnimationFrame(fit));
    void document.fonts?.ready.then(fit);
    const timer = window.setTimeout(fit, 300);
    const ro = new ResizeObserver(fit);
    ro.observe(title);
    const pack = title.querySelector("span");
    if (pack) ro.observe(pack);
    window.addEventListener("load", fit);
    window.addEventListener("resize", fit);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
      ro.disconnect();
      window.removeEventListener("load", fit);
      window.removeEventListener("resize", fit);
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    patchSaved({ amount, mode });
  }, [amount, mode, hydrated]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (closedRef.current) return;
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
      if (event.key >= "0" && event.key <= "9") {
        event.preventDefault();
        applyInput(event.key);
        return;
      }
      if (event.key === "." || event.key === ",") {
        event.preventDefault();
        applyInput(".");
        return;
      }
      if (event.key === "Backspace") {
        event.preventDefault();
        applyInput("back");
        return;
      }
      if (event.key === "Escape" || event.key === "Delete") {
        event.preventDefault();
        applyInput("clear");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  const targetCents = parseAmountToCents(amount);
  const pool = useMemo(() => {
    const set = new Set<number>([...enabled, ...extras]);
    return [...set].sort((a, b) => a - b);
  }, [enabled, extras]);

  const missing = useMemo(
    () => DEFAULT_CENTS.filter((cents) => !enabled.includes(cents)),
    [enabled],
  );

  const combo = useMemo(() => {
    if (targetCents === null || targetCents === 0) return null;
    return solve(targetCents, pool, mode);
  }, [targetCents, pool, mode]);

  const closed = pool.length === 0;
  closedRef.current = closed;

  useEffect(() => {
    applyCrisis(closed);
    applySolveMode(mode);
  }, [closed, mode]);

  function showToast(message: string) {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 1800);
  }

  function applyInput(key: string) {
    const current = typeof amountRef.current === "string" ? amountRef.current : "";
    const result = applyAmountKey(current, key);
    if (result.overLimit) {
      showToast(`上限為 ${MAX_AMOUNT_LABEL}`);
      return;
    }
    amountRef.current = result.value;
    setAmount(result.value);
  }

  async function shareApp() {
    const url = `${window.location.origin}${window.location.pathname}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "郵票組合計數機", text: "香港郵票組合計數機", url });
        return;
      }
      await navigator.clipboard.writeText(url);
    } catch {
      /* user cancelled */
    }
  }

  function press(key: string) {
    if (closedRef.current) return;
    if (key === "C") {
      applyInput("clear");
      return;
    }
    applyInput(key);
  }

  function modeHandlers(next: SolveMode) {
    return {
      onPointerDown: tap.onPointerDown,
      onPointerUp: (event: PointerEvent<HTMLButtonElement>) => tap.onPointerUp(event, () => setMode(next)),
      onPointerCancel: tap.onPointerCancel,
      onClick: () => tap.onClick(() => setMode(next)),
    };
  }

  function padHandlers(key: string) {
    return {
      onPointerDown: (event: PointerEvent<HTMLButtonElement>) => {
        tap.onPointerDown(event);
        setPressDown(event.currentTarget, true);
      },
      onPointerUp: (event: PointerEvent<HTMLButtonElement>) => {
        setPressDown(event.currentTarget, false);
        tap.onPointerUp(event, () => {
          pulsePress(event.currentTarget);
          press(key);
        });
      },
      onPointerCancel: (event: PointerEvent<HTMLButtonElement>) => {
        setPressDown(event.currentTarget, false);
        tap.onPointerCancel();
      },
      onClick: (event: { currentTarget: EventTarget }) =>
        tap.onClick(() => {
          pulsePress(event.currentTarget);
          press(key);
        }),
    };
  }

  return (
    <div className="relative mx-auto flex h-dvh max-h-svh w-full max-w-lg flex-col gap-2 overflow-hidden px-4 py-3 sm:gap-4 sm:px-6 sm:py-5">
      <header className="flex shrink-0 items-center justify-between gap-3">
        <div className="w-fit min-w-0 max-w-full">
          <p ref={markRef} className="w-max whitespace-nowrap font-display text-2xs font-medium text-primary">
            Stamp combination calculator
          </p>
          <h1 ref={titleRef} className="mt-0.5 flex w-max items-center gap-1.5 text-lg font-semibold tracking-tight text-ink">
            <span className="text-[1.15rem] leading-none" aria-hidden>
              📦
            </span>
            郵票組合計數機
          </h1>
        </div>
        <nav className="flex shrink-0 items-center" aria-label="頁面">
          <ThemeToggle />
          <button
            type="button"
            aria-label="分享程式"
            onClick={() => void shareApp()}
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-md text-ink transition-[background-color] duration-(--motion-quick) ease-(--ease-smooth-out) hover:bg-surface-2"
          >
            <Share className="size-5" />
          </button>
          <Link
            to="/about"
            aria-label="關於"
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-md text-ink transition-[background-color] duration-(--motion-quick) ease-(--ease-smooth-out) hover:bg-surface-2"
          >
            <CircleHelp className="size-5" />
          </Link>
          <Link
            to="/settings"
            aria-label="設定"
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-md text-ink transition-[background-color] duration-(--motion-quick) ease-(--ease-smooth-out) hover:bg-surface-2"
          >
            <Settings className="size-5" />
          </Link>
        </nav>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-2 sm:gap-3">
        <div className="shrink-0">
          <section className="rounded-xl bg-surface p-3 shadow-(--shadow-border) sm:p-4" aria-live="polite">
            <div
              className="mb-2 flex isolate rounded-lg bg-bg p-0.5 [forced-color-adjust:none]"
              role="group"
              aria-label={mode === "stamps" ? "組合邏輯，現正最少郵票" : "組合邏輯，現正減少種類"}
            >
              <button
                type="button"
                {...modeHandlers("stamps")}
                className={cn(
                  "h-7 flex-1 appearance-none touch-manipulation rounded-md text-xs whitespace-nowrap transition-[background-color,color,opacity] duration-(--motion-quick) ease-(--ease-smooth-out)",
                  mode === "stamps"
                    ? "bg-primary-soft font-bold text-stamp-ink opacity-100"
                    : "bg-transparent font-medium text-subtle opacity-40",
                )}
              >
                最少郵票
              </button>
              <button
                type="button"
                {...modeHandlers("types")}
                className={cn(
                  "h-7 flex-1 appearance-none touch-manipulation rounded-md text-xs whitespace-nowrap transition-[background-color,color,opacity] duration-(--motion-quick) ease-(--ease-smooth-out)",
                  mode === "types"
                    ? "bg-primary-soft font-bold text-stamp-ink opacity-100"
                    : "bg-transparent font-medium text-subtle opacity-40",
                )}
              >
                減少種類
              </button>
            </div>
            <ComboStrip amount={amount} targetCents={targetCents} poolEmpty={pool.length === 0} combo={combo} />
            <p className="mt-1 min-h-4 px-1 text-left text-xs text-muted">
              {combo && amount && amount !== "0" && amount !== "0."
                ? `郵票${combo.stampCount}枚\u3000面值${combo.lines.length}種`
                : "\u00a0"}
            </p>
          </section>
        </div>

        {missing.length > 0 || extras.length > 0 ? (
          <Link
            to="/settings"
            aria-label="設定郵票面值"
            className="min-w-0 shrink-0 overflow-x-hidden rounded-xl bg-surface px-3 py-2 shadow-(--shadow-border) sm:px-4"
          >
            <StockStrip missing={missing} extras={extras} />
          </Link>
        ) : null}

        <section className="flex min-h-0 flex-1 flex-col rounded-xl bg-surface p-3 shadow-(--shadow-border) sm:p-4">
          {closed ? (
            <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-1 px-4 py-3 text-center">
              <Hand className="size-16 text-primary" strokeWidth={2} aria-hidden="true" />
              <p className="text-lg font-bold text-primary">鍵盤已停用</p>
              <p className="text-xs text-muted">請到設定檢查庫存</p>
              <Link
                to="/settings"
                className="mt-2 inline-flex h-11 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-fg transition-[background-color,opacity] duration-(--motion-quick) ease-(--ease-smooth-out) hover:opacity-90"
              >
                前往設定
              </Link>
            </div>
          ) : (
            <>
              <div className="flex shrink-0 items-center gap-2 rounded-lg bg-bg px-3 py-2 sm:px-4 sm:py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-muted">郵費</p>
                  <p className="mt-0.5 truncate font-display text-3xl font-semibold tabular-nums tracking-tight text-ink">
                    <span className="mr-1 text-subtle">$</span>
                    {typeof amount === "string" && amount ? amount : "0"}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="刪除一位"
                  {...padHandlers("back")}
                  className="tap-press inline-flex size-12 shrink-0 touch-manipulation items-center justify-center rounded-md bg-surface-2 text-ink hover:bg-border"
                >
                  <Delete className="size-6" />
                </button>
              </div>

              <div className="mt-2 grid min-h-0 flex-1 grid-cols-3 grid-rows-4 gap-2 sm:mt-3">
                {KEY_ROWS.flat().map((key) => (
                  <button
                    key={key}
                    type="button"
                    {...padHandlers(key)}
                    className={cn(
                      "tap-press inline-flex min-h-0 touch-manipulation items-center justify-center rounded-md font-display text-2xl tabular-nums",
                      key === "C" ? "key-clear" : "bg-surface-2 text-ink hover:bg-border",
                    )}
                  >
                    {key}
                  </button>
                ))}
              </div>
            </>
          )}
        </section>
      </div>

      <InstallAppButton />

      <footer className="flex shrink-0 items-center justify-center gap-1.5 pb-0.5">
        <a
          href="https://grok.com"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-2xs tracking-wide text-subtle no-underline transition-[color] duration-(--motion-quick) ease-(--ease-smooth-out) hover:text-muted"
        >
          <span className="tracking-[0.08em]">Built with</span>
          <GrokMark />
          <span className="font-display font-semibold tracking-normal text-muted">Grok</span>
          <span className="font-display font-semibold tracking-wide text-primary">AI</span>
        </a>
      </footer>

      <div
        className={cn(
          "pointer-events-none fixed inset-x-0 top-4 z-20 flex justify-center px-4 transition-[opacity,transform] duration-(--motion-fast) ease-(--ease-smooth-out) motion-reduce:transition-none",
          toast ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0",
        )}
        aria-hidden={!toast}
      >
        <div role="alert" className="flex w-full max-w-sm items-center gap-3 rounded-xl bg-red-300 px-5 py-3.5 text-red-900 shadow-(--shadow-border)">
          <CircleAlert className="size-6 shrink-0" aria-hidden="true" />
          <p className="font-sans text-lg font-semibold">{toast || "\u00a0"}</p>
        </div>
      </div>
    </div>
  );
}

function GrokMark() {
  return (
    <svg viewBox="0 0 12 11.5714" className="size-3 text-muted" aria-hidden>
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

function ComboStrip({
  amount,
  targetCents,
  poolEmpty,
  combo,
}: {
  amount: string;
  targetCents: number | null;
  poolEmpty: boolean;
  combo: Combination | null;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const clusterRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const lines = combo?.lines ?? [];

  useLayoutEffect(() => {
    const frame = frameRef.current;
    const cluster = clusterRef.current;
    if (!frame || !cluster || lines.length === 0) {
      setScale(1);
      return;
    }

    const fit = () => {
      const next = Math.min(1, frame.clientWidth / cluster.offsetWidth, frame.clientHeight / cluster.offsetHeight);
      const clamped = Number.isFinite(next) && next > 0 ? next : 1;
      setScale((prev) => (Math.abs(prev - clamped) < 0.01 ? prev : clamped));
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(frame);
    observer.observe(cluster);
    return () => observer.disconnect();
  }, [lines]);

  if (poolEmpty) {
    return (
      <div className="flex h-24 w-full flex-col items-center justify-center gap-0.5 overflow-hidden text-primary sm:h-28">
        <X className="size-10" strokeWidth={2.5} aria-hidden="true" />
        <p className="text-sm font-bold leading-tight">缺貨嚴重</p>
        <p className="text-xs font-semibold leading-tight">郵政局已關閉</p>
      </div>
    );
  }

  if (!amount || amount === "0" || amount === "0.") {
    return (
      <div className="flex h-24 w-full items-center justify-center overflow-hidden sm:h-28">
        <p className="px-4 text-center text-sm text-muted">請輸入郵費</p>
      </div>
    );
  }

  if (targetCents === null) {
    return (
      <div className="flex h-24 w-full items-center justify-center overflow-hidden sm:h-28">
        <p className="text-sm text-muted">繼續輸入金額…</p>
      </div>
    );
  }

  if (!combo) {
    return (
      <div className="flex h-24 w-full flex-col items-center justify-center gap-0.5 overflow-hidden sm:h-28">
        <p className="text-sm text-muted">無法組成此金額</p>
        <p className="text-xs text-subtle">請檢查庫存狀況</p>
        <Link
          to="/settings"
          className="mt-1 inline-flex h-7 items-center justify-center rounded-full bg-primary px-3.5 text-xs font-semibold text-primary-fg transition-[opacity] duration-(--motion-quick) ease-(--ease-smooth-out) hover:opacity-90"
        >
          進入設定
        </Link>
      </div>
    );
  }

  return (
    <div ref={frameRef} className="flex h-24 w-full isolate items-center justify-start overflow-hidden sm:h-28">
      <div
        ref={clusterRef}
        className="flex w-max shrink-0 items-center justify-start gap-1 px-1 pt-1"
        style={{ transform: `scale(${scale})`, transformOrigin: "left center" }}
      >
        {lines.map((line) => (
          <StampFace key={line.cents} cents={line.cents} count={line.count} className="pt-3.5 pr-3.5" />
        ))}
      </div>
    </div>
  );
}

function StockRow({
  label,
  amounts,
  className,
}: {
  label: string;
  amounts: string;
  className: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = useState(false);
  const [duration, setDuration] = useState(12);

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    const inner = innerRef.current;
    if (!wrap || !inner) return;

    const measure = () => {
      const probe = inner.querySelector("[data-probe]") as HTMLElement | null;
      const width = probe ? probe.scrollWidth : inner.scrollWidth;
      const need = width > wrap.clientWidth + 1;
      setOverflow(need);
      setDuration(Math.max(8, width / 36));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(wrap);
    return () => observer.disconnect();
  }, [amounts]);

  return (
    <div className={cn("flex h-5 min-w-0 shrink-0 items-center overflow-hidden text-sm font-medium", className)}>
      <span className="shrink-0">{label}：</span>
      <div ref={wrapRef} className="stock-marquee min-w-0 flex-1">
        <div
          ref={innerRef}
          className={cn("stock-marquee-inner", overflow && "marquee-track")}
          style={overflow ? { animationDuration: `${duration}s` } : undefined}
        >
          <span data-probe>{overflow ? `${amounts}、` : amounts}</span>
          {overflow ? <span aria-hidden="true">{`${amounts}、`}</span> : null}
        </div>
      </div>
    </div>
  );
}

function StockStrip({ missing, extras }: { missing: number[]; extras: number[] }) {
  return (
    <div className="flex w-full min-w-0 flex-col gap-0.5 py-0.5">
      {missing.length > 0 ? (
        <StockRow className="stock-oos" label="缺貨" amounts={missing.map(formatMoney).join("、")} />
      ) : null}
      {extras.length > 0 ? (
        <StockRow className="stock-custom" label="自訂" amounts={extras.map(formatMoney).join("、")} />
      ) : null}
    </div>
  );
}
