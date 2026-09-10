import { useEffect, useRef, useState, type PointerEvent } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, Minus, Plus, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StampFace } from "@/components/stamp-face";
import { DEFAULT_CENTS, formatMoney, parseAmountToCents } from "@/lib/postage";
import { loadSaved, patchSaved } from "@/lib/stamp-settings";
import { cn } from "@/lib/utils";

export function SettingsPage() {
  const [hydrated, setHydrated] = useState(false);
  const [enabled, setEnabled] = useState<number[]>([...DEFAULT_CENTS]);
  const [extras, setExtras] = useState<number[]>([]);
  const [custom, setCustom] = useState("");
  const [toast, setToast] = useState("");
  const toastTimer = useRef<number>(0);
  const lastTap = useRef(0);

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

  function tap(action: () => void) {
    lastTap.current = Date.now();
    action();
  }

  function onStampPointerDown(event: PointerEvent<HTMLButtonElement>, action: () => void) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    event.preventDefault();
    tap(action);
  }

  function onStampClick(action: () => void) {
    if (Date.now() - lastTap.current < 400) return;
    tap(action);
  }

  function toggleDenom(cents: number) {
    setEnabled((prev) =>
      prev.includes(cents) ? prev.filter((c) => c !== cents) : [...prev, cents].sort((a, b) => a - b),
    );
  }

  function addCustom() {
    const cents = parseAmountToCents(custom);
    if (cents === null || cents === 0) {
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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-sans text-xl font-semibold">可用面額</h2>
            <p className="mt-1 text-sm text-muted">熄咗嘅面額唔會用。只計剛好湊齊嘅組合。</p>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setEnabled([...DEFAULT_CENTS])}>
              全選預設
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setEnabled([...DEFAULT_CENTS]);
                setExtras([]);
              }}
            >
              <RotateCcw />
              重設
            </Button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-2">
          {DEFAULT_CENTS.map((cents) => {
            const on = enabled.includes(cents);
            return (
              <button
                key={cents}
                type="button"
                aria-pressed={on}
                aria-label={formatMoney(cents)}
                onPointerDown={(event) => onStampPointerDown(event, () => toggleDenom(cents))}
                onClick={() => onStampClick(() => toggleDenom(cents))}
                className="touch-manipulation rounded-sm transition-[opacity,filter] duration-(--motion-quick) ease-(--ease-smooth-out) hover:opacity-90"
              >
                <StampFace cents={cents} size="sm" muted={!on} />
              </button>
            );
          })}
        </div>

        {extras.length > 0 ? (
          <div className="mt-4 grid grid-cols-4 gap-2">
            {extras.map((cents) => (
              <button
                key={cents}
                type="button"
                aria-label={`移除 ${formatMoney(cents)}`}
                onPointerDown={(event) =>
                  onStampPointerDown(event, () => setExtras((prev) => prev.filter((c) => c !== cents)))
                }
                onClick={() => onStampClick(() => setExtras((prev) => prev.filter((c) => c !== cents)))}
                className="relative touch-manipulation rounded-sm"
                title="移除自訂面額"
              >
                <StampFace cents={cents} size="sm" />
                <span className="absolute -top-2 -right-2 z-10 flex size-7 items-center justify-center rounded-full bg-primary text-primary-fg">
                  <Minus className="size-3.5" />
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
            onChange={(event) => setCustom(event.target.value)}
            placeholder="自訂面額，例如 2.4"
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
        <div role="alert" className="w-full max-w-sm rounded-xl bg-surface px-6 py-4 text-center shadow-(--shadow-border)">
          <p className="text-sm font-medium tracking-wide text-primary">提示</p>
          <p className="mt-1 font-sans text-lg font-semibold text-ink">{toast || "\u00a0"}</p>
        </div>
      </div>
    </div>
  );
}
