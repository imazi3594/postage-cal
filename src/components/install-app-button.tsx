import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { isIos, isStandalone, promptInstall, registerServiceWorker } from "@/lib/pwa-install";

export function InstallAppButton() {
  const [hidden, setHidden] = useState(true);
  const [busy, setBusy] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    if (isStandalone()) {
      setHidden(true);
      return;
    }
    setHidden(false);
    setIos(isIos());
    void registerServiceWorker();
    const onInstalled = () => setHidden(true);
    window.addEventListener("appinstalled", onInstalled);
    return () => window.removeEventListener("appinstalled", onInstalled);
  }, []);

  if (hidden) return null;

  async function install() {
    if (busy) return;
    if (ios) {
      setSheet(true);
      return;
    }
    setBusy(true);
    const outcome = await promptInstall();
    setBusy(false);
    if (outcome === "accepted") {
      setHidden(true);
      return;
    }
    if (outcome === "unavailable") setSheet(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => void install()}
        disabled={busy}
        className="inline-flex h-8 w-full shrink-0 items-center justify-center gap-1.5 rounded-lg border border-dashed border-border bg-surface text-xs font-medium text-muted transition-[background-color,color] duration-(--motion-quick) ease-(--ease-smooth-out) hover:bg-bg hover:text-ink disabled:opacity-70"
      >
        <Download className="size-4" aria-hidden="true" />
        {busy ? "安裝中…" : "加入主畫面"}
      </button>
      {sheet ? (
        <div className="pointer-events-none fixed inset-x-0 top-4 z-20 flex justify-center px-4">
          <div
            role="dialog"
            aria-label="加入主畫面"
            className="pointer-events-auto relative w-full max-w-sm rounded-xl bg-surface px-5 py-4 text-ink shadow-(--shadow-border)"
          >
            <button
              type="button"
              aria-label="關閉"
              onClick={() => setSheet(false)}
              className="absolute top-2 right-2 inline-flex size-8 items-center justify-center rounded-md text-muted hover:bg-surface-2"
            >
              <X className="size-4" />
            </button>
            {ios ? (
              <>
                <p className="pr-6 font-sans text-base font-semibold">加入 iPhone 主畫面</p>
                <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-muted">
                  <li>點選 Safari 底部的分享按鈕</li>
                  <li>選擇「加入主畫面」</li>
                </ol>
              </>
            ) : (
              <>
                <p className="pr-6 font-sans text-base font-semibold">請以 Chrome 開啟後再試一次</p>
                <p className="mt-2 text-sm text-muted">請以 Chrome 開啟此網址，再點選「加入主畫面」，即可安裝。</p>
              </>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
