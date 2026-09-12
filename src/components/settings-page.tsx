import { useEffect, useRef, useState, type PointerEvent } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, CircleAlert, Delete, Minus, Plus, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StampFace } from "@/components/stamp-face";
import {
  DEFAULT_CENTS,
  MAX_CUSTOM_LABEL,
  applyCustomKey,
  formatMoney,
  parseCustomDenomToCents,
} from "@/lib/postage";
import { loadSaved, patchSaved } from "@/lib/stamp-settings";
import { applyCrisis, applySolveMode } from "@/lib/theme";
import { createTapTracker, pulsePress, setPressDown } from "@/lib/tap";
import { cn } from "@/lib/utils";

const CUSTOM_KEYS = [
  ["7", "8", "9"],
  ["4", "5", "6"],
  ["1", "2", "3"],
  ["C", "0", "."],
] as const;

export function SettingsPage() {
  const [hydrated, setHydrated] = useState(false);
  const [enabled, setEnabled] = useState<number[]>([...DEFAULT_CENTS]);
  const [extras, setExtras] = useState<number[]>([]);
  const [custom, setCustom] = useState("");
  const [toast, setToast] = useState("");
  const toastTimer = useRef<number>(0);
  const tap = useRef(createTapTracker()).current;

  useEffect(() => {
    const saved = loadSaved();
    setEnabled(saved.enabled);
    setExtras(saved.extras);
    applySolveMode(saved.mode);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    patchSaved({ enabled, extras });
  }, [enabled, extras, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    applyCrisis(enabled.length === 0 && extras.length === 0);
  }, [enabled, extras, hydrated]);

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  function showToast(message: string) {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 1800);
  }

  function stampHandlers(action: () => void) {
    return {
      onPointerDown: (event: PointerEvent<HTMLButtonElement>) => {
        tap.onPointerDown(event);
        setPressDown(event.currentTarget, true);
      },
      onPointerUp: (event: PointerEvent<HTMLButtonElement>) => {
        setPressDown(event.currentTarget, false);
        tap.onPointerUp(event, () => {
          pulsePress(event.currentTarget);
          action();
        });
      },
      onPointerCancel: (event: PointerEvent<HTMLButtonElement>) => {
        setPressDown(event.currentTarget, false);
        tap.onPointerCancel();
      },
      onClick: (event: { currentTarget: EventTarget }) =>
        tap.onClick(() => {
          pulsePress(event.currentTarget);
          action();
        }),
    };
  }

  function toggleDenom(cents: number) {
    setEnabled((prev) =>
      prev.includes(cents) ? prev.filter((c) => c !== cents) : [...prev, cents].sort((a, b) => a - b),
    );
  }

  function pressCustom(key: string) {
    const mapped = key === "C" ? "clear" : key;
    const result = applyCustomKey(custom, mapped);
    if (result.overLimit) showToast(`上限為 ${MAX_CUSTOM_LABEL}`);
    setCustom(result.value);
  }

  function addCustom() {
    const cents = parseCustomDenomToCents(custom);
    if (cents === null) {
      showToast("請輸入有效面值，例如 2.4");
      return;
    }
    if (DEFAULT_CENTS.includes(cents) || extras.includes(cents)) {
      showToast("此面值已存在");
      if (!enabled.includes(cents) && DEFAULT_CENTS.includes(cents)) {
        setEnabled((prev) => [...prev, cents].sort((a, b) => a - b));
      }
      return;
    }
    setExtras((prev) => [...prev, cents].sort((a, b) => a - b));
    setCustom("");
  }

  return (
    <div className="relative mx-auto flex w-full max-w-lg flex-col gap-4 px-4 py-4 sm:px-6 sm:py-6">
      <header className="flex items-center gap-1">
        <Link
          to="/"
          aria-label="返回計數機"
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-md text-ink transition-[background-color] duration-(--motion-quick) ease-(--ease-smooth-out) hover:bg-surface-2"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <h1 className="text-lg font-semibold tracking-tight text-ink">設定</h1>
      </header>

      <section className="stagger-in rounded-xl bg-surface p-5 shadow-(--shadow-border)" style={{ animationDelay: "80ms" }}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="font-sans text-xl font-semibold">通用郵票庫存</h2>
            <p className="mt-1 text-sm text-muted">點擊以切換庫存狀態</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0 border border-border"
            onClick={() => setEnabled([...DEFAULT_CENTS])}
          >
            <RotateCcw className="size-4" />
            重設
          </Button>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-2">
          {DEFAULT_CENTS.map((cents) => {
            const on = enabled.includes(cents);
            return (
              <button
                key={cents}
                type="button"
                aria-pressed={on}
                aria-label={on ? formatMoney(cents) : `${formatMoney(cents)} 缺貨`}
                {...stampHandlers(() => toggleDenom(cents))}
                className="tap-press relative overflow-visible touch-manipulation rounded-sm hover:opacity-90"
              >
                <StampFace cents={cents} size="sm" muted={!on} />
              </button>
            );
          })}
        </div>
      </section>

      <section className="stagger-in rounded-xl bg-surface p-5 shadow-(--shadow-border)" style={{ animationDelay: "140ms" }}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="font-sans text-xl font-semibold">自訂面值</h2>
            <p className="mt-1 text-sm text-muted">加入自訂面值郵票或特別郵票</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0 border border-border"
            onClick={() => setExtras([])}
          >
            <RotateCcw className="size-4" />
            重設
          </Button>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <div className="flex min-h-11 min-w-0 flex-1 items-center rounded-md bg-bg px-3">
            <span className="mr-1 text-subtle">$</span>
            <span className="font-display text-2xl font-semibold tabular-nums tracking-tight text-ink">
              {custom || "0"}
            </span>
          </div>
          <button
            type="button"
            aria-label="刪除一位"
            {...stampHandlers(() => pressCustom("back"))}
            className="tap-press inline-flex size-11 shrink-0 touch-manipulation items-center justify-center rounded-md bg-bg text-ink hover:bg-border"
          >
            <Delete className="size-5" />
          </button>
          <Button type="button" variant="secondary" className="h-11 shrink-0 px-3" {...stampHandlers(addCustom)}>
            <Plus className="size-4" />
            加入
          </Button>
        </div>

        <div className="mt-2 grid grid-cols-3 gap-2">
          {CUSTOM_KEYS.flat().map((key) => (
            <button
              key={key}
              type="button"
              {...stampHandlers(() => pressCustom(key))}
              className={cn(
                "tap-press inline-flex h-11 touch-manipulation items-center justify-center rounded-md font-display text-xl tabular-nums",
                key === "C" ? "key-clear" : "bg-bg text-ink hover:bg-border",
              )}
            >
              {key}
            </button>
          ))}
        </div>

        {extras.length > 0 ? (
          <div className="mt-4 grid grid-cols-4 gap-3 overflow-visible">
            {extras.map((cents) => (
              <button
                key={cents}
                type="button"
                aria-label={`移除 ${formatMoney(cents)}`}
                {...stampHandlers(() => setExtras((prev) => prev.filter((c) => c !== cents)))}
                className="tap-press relative overflow-visible touch-manipulation rounded-sm"
                title="移除自訂面值"
              >
                <StampFace cents={cents} size="sm" />
                <span className="absolute -top-2 -right-2 z-10 flex size-5 items-center justify-center rounded-full bg-red-600 text-white shadow-sm ring-2 ring-surface">
                  <Minus className="size-3" strokeWidth={3} />
                </span>
              </button>
            ))}
          </div>
        ) : null}
      </section>

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
