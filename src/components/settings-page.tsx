import { useEffect, useRef, useState, type PointerEvent } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, CircleAlert, Minus, Plus, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StampFace } from "@/components/stamp-face";
import { DEFAULT_CENTS, formatMoney, parseCustomDenomToCents, sanitizeCustomDenom, MAX_CUSTOM_LABEL } from "@/lib/postage";
import { loadSaved, patchSaved } from "@/lib/stamp-settings";
import { createTapTracker } from "@/lib/tap";
import { cn } from "@/lib/utils";

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
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    patchSaved({ enabled, extras });
  }, [enabled, extras, hydrated]);

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  function showToast(message: string) {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 1800);
  }

  function stampHandlers(action: () => void) {
    return {
      onPointerDown: tap.onPointerDown,
      onPointerUp: (event: PointerEvent<HTMLButtonElement>) => tap.onPointerUp(event, action),
      onPointerCancel: tap.onPointerCancel,
      onClick: () => tap.onClick(action),
    };
  }

  function toggleDenom(cents: number) {
    setEnabled((prev) =>
      prev.includes(cents) ? prev.filter((c) => c !== cents) : [...prev, cents].sort((a, b) => a - b),
    );
  }

  function addCustom() {
    const cents = parseCustomDenomToCents(custom);
    if (cents === null) {
      const attempt = sanitizeCustomDenom(custom);
      if (attempt.overLimit || Number(custom) > 50) {
        showToast(`上限為 ${MAX_CUSTOM_LABEL}`);
        return;
      }
      showToast("請輸入有效面額，例如 2.4");
      return;
    }
    if (DEFAULT_CENTS.includes(cents) || extras.includes(cents)) {
      showToast("呢個面額已經有");
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
          <ChevronLeft className="size-5" />
        </Link>
        <div className="min-w-0">
          <p className="font-display text-2xs font-medium tracking-wide text-primary">
            Postage combination calculator
          </p>
          <h1 className="mt-0.5 text-lg font-semibold tracking-tight text-ink">設定</h1>
          <p className="mt-1 text-sm text-muted">揀計數機用邊啲郵票面額。</p>
        </div>
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
            <RotateCcw />
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
                className="relative overflow-visible touch-manipulation rounded-sm transition-[opacity,filter] duration-(--motion-quick) ease-(--ease-smooth-out) hover:opacity-90"
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
            <h2 className="font-sans text-xl font-semibold">自訂面額</h2>
            <p className="mt-1 text-sm text-muted">加入自訂面額郵票或特別郵票</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0 border border-border"
            onClick={() => setExtras([])}
          >
            <RotateCcw />
            重設
          </Button>
        </div>

        {extras.length > 0 ? (
          <div className="mt-4 grid grid-cols-4 gap-3 overflow-visible">
            {extras.map((cents) => (
              <button
                key={cents}
                type="button"
                aria-label={`移除 ${formatMoney(cents)}`}
                {...stampHandlers(() => setExtras((prev) => prev.filter((c) => c !== cents)))}
                className="relative overflow-visible touch-manipulation rounded-sm"
                title="移除自訂面額"
              >
                <StampFace cents={cents} size="sm" />
                <span className="absolute -top-2 -right-2 z-10 flex size-5 items-center justify-center rounded-full bg-red-600 text-white shadow-sm ring-2 ring-surface">
                  <Minus className="size-3" strokeWidth={3} />
                </span>
              </button>
            ))}
          </div>
        ) : null}

        <form
          className="mt-4 flex flex-col gap-2 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            addCustom();
          }}
        >
          <Input
            value={custom}
            onChange={(event) => {
              const result = sanitizeCustomDenom(event.target.value);
              if (result.overLimit) showToast(`上限為 ${MAX_CUSTOM_LABEL}`);
              setCustom(result.value);
            }}
            placeholder="例如 2.4，上限 $50"
            inputMode="decimal"
            aria-label="自訂郵票面額"
            className="sm:max-w-56"
          />
          <Button type="submit" variant="secondary">
            <Plus />
            加入面額
          </Button>
        </form>
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
