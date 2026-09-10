import { useEffect, useLayoutEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { Link } from "@tanstack/react-router";
import { Delete, Settings } from "lucide-react";
import { StampFace } from "@/components/stamp-face";
import {
  DEFAULT_CENTS,
  MAX_AMOUNT_LABEL,
  applyAmountKey,
  parseAmountToCents,
  solve,
  type Combination,
} from "@/lib/postage";
import { loadSaved, patchSaved } from "@/lib/stamp-settings";
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
  const [toast, setToast] = useState("");
  const amountRef = useRef(amount);
  const toastTimer = useRef<number>(0);
  const lastPress = useRef(0);
  amountRef.current = typeof amount === "string" ? amount : "";

  useEffect(() => {
    const saved = loadSaved();
    setAmount(saved.amount);
    setEnabled(saved.enabled);
    setExtras(saved.extras);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    patchSaved({ amount });
  }, [amount, hydrated]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
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

  const combo = useMemo(() => {
    if (targetCents === null || targetCents === 0) return null;
    return solve(targetCents, pool);
  }, [targetCents, pool]);

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

  function onPadPointerDown(event: PointerEvent<HTMLButtonElement>, key: string) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    event.preventDefault();
    lastPress.current = Date.now();
    press(key);
  }

  function onPadClick(key: string) {
    if (Date.now() - lastPress.current < 400) return;
    press(key);
  }

  function press(key: string) {
    if (key === "C") {
      applyInput("clear");
      return;
    }
    applyInput(key);
  }

  return (
    <div className="relative mx-auto flex w-full max-w-lg flex-col gap-5 px-4 py-8 sm:px-6 sm:py-10">
      <header className="stagger-in flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium tracking-mark text-primary">HONGKONG POST</p>
          <h1 className="mt-2 font-sans text-4xl font-semibold tracking-tight text-ink">
            郵票計數機
          </h1>
          <p className="mt-3 text-muted">用鍵盤輸入郵費，砌出剛好嘅郵票組合。</p>
        </div>
        <Link
          to="/settings"
          aria-label="設定"
          className="mt-1 inline-flex size-11 shrink-0 items-center justify-center rounded-md text-ink transition-[background-color] duration-(--motion-quick) ease-(--ease-smooth-out) hover:bg-surface-2"
        >
          <Settings className="size-5" />
        </Link>
      </header>

      <div className="flex flex-col gap-3">
        <section
          className="stagger-in rounded-xl bg-surface p-4 shadow-(--shadow-border)"
          style={{ animationDelay: "60ms" }}
          aria-live="polite"
        >
          <ComboStrip amount={amount} targetCents={targetCents} poolEmpty={pool.length === 0} combo={combo} />
        </section>

        <section
          className="stagger-in rounded-xl bg-surface p-4 shadow-(--shadow-border) sm:p-5"
          style={{ animationDelay: "100ms" }}
        >
          <div className="flex items-stretch gap-2 rounded-lg bg-bg px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-muted">郵費</p>
              <p className="mt-1 truncate font-display text-4xl font-semibold tabular-nums tracking-tight text-ink">
                <span className="mr-1 text-subtle">$</span>
                {typeof amount === "string" && amount ? amount : "0"}
              </p>
            </div>
            <button
              type="button"
              aria-label="刪除一位"
              onPointerDown={(event) => onPadPointerDown(event, "back")}
              onClick={() => onPadClick("back")}
              className="mt-auto mb-0.5 inline-flex size-11 touch-manipulation items-center justify-center rounded-md text-ink transition-[background-color] duration-(--motion-quick) ease-(--ease-smooth-out) hover:bg-surface-2"
            >
              <Delete className="size-5" />
            </button>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            {KEY_ROWS.flat().map((key) => (
              <button
                key={key}
                type="button"
                onPointerDown={(event) => onPadPointerDown(event, key)}
                onClick={() => onPadClick(key)}
                className={cn(
                  "inline-flex h-14 touch-manipulation items-center justify-center rounded-md font-display text-2xl tabular-nums transition-[background-color,color] duration-(--motion-quick) ease-(--ease-smooth-out)",
                  key === "C"
                    ? "bg-primary-soft text-stamp-ink hover:bg-primary/15"
                    : "bg-surface-2 text-ink hover:bg-border",
                )}
              >
                {key}
              </button>
            ))}
          </div>
        </section>
      </div>

      <div
        className={cn(
          "pointer-events-none fixed inset-x-0 top-4 z-20 flex justify-center px-4 transition-[opacity,transform] duration-(--motion-fast) ease-(--ease-smooth-out) motion-reduce:transition-none",
          toast ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0",
        )}
        aria-hidden={!toast}
      >
        <div role="alert" className="w-full max-w-sm rounded-xl bg-surface px-6 py-4 text-center shadow-(--shadow-border)">
          <p className="text-sm font-medium tracking-wide text-primary">提示</p>
          <p className="mt-1 font-sans text-lg font-semibold text-ink">{toast || "\u00a0"}</p>
        </div>
      </div>
    </div>
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

  if (!amount || amount === "0" || amount === "0.") {
    return (
      <div className="flex h-28 w-full items-center justify-center overflow-hidden">
        <p className="px-4 text-center text-sm text-muted">輸入郵費之後，郵票會出現喺呢度</p>
      </div>
    );
  }

  if (targetCents === null) {
    return (
      <div className="flex h-28 w-full items-center justify-center overflow-hidden">
        <p className="text-sm text-muted">繼續輸入金額…</p>
      </div>
    );
  }

  if (poolEmpty) {
    return (
      <div className="flex h-28 w-full items-center justify-center overflow-hidden">
        <p className="text-sm text-muted">至少揀一種郵票面額。</p>
      </div>
    );
  }

  if (!combo) {
    return (
      <div className="flex h-28 w-full items-center justify-center overflow-hidden">
        <p className="px-4 text-center text-sm text-muted">湊唔到剛好呢個金額</p>
      </div>
    );
  }

  return (
    <div ref={frameRef} className="flex h-28 w-full items-center justify-center overflow-hidden">
      <div
        ref={clusterRef}
        className="flex w-max items-center justify-center gap-2"
        style={{ transform: `scale(${scale})`, transformOrigin: "center center" }}
      >
        {lines.map((line) => (
          <StampFace key={line.cents} cents={line.cents} count={line.count} />
        ))}
      </div>
    </div>
  );
}
