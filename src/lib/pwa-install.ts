export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

declare global {
  interface Window {
    __pwaDeferred?: BeforeInstallPromptEvent | null;
  }
}

export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    ("standalone" in window.navigator && Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone))
  );
}

export function isIos(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

export function registerServiceWorker() {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return Promise.resolve();
  const url = new URL("sw.js", document.baseURI).href;
  return navigator.serviceWorker.register(url).catch(() => undefined);
}

export function waitForInstallPrompt(ms = 2500): Promise<BeforeInstallPromptEvent | null> {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (window.__pwaDeferred) return Promise.resolve(window.__pwaDeferred);
  return new Promise((resolve) => {
    const start = Date.now();
    const tick = window.setInterval(() => {
      if (window.__pwaDeferred) {
        window.clearInterval(tick);
        resolve(window.__pwaDeferred);
        return;
      }
      if (Date.now() - start >= ms) {
        window.clearInterval(tick);
        resolve(null);
      }
    }, 80);
  });
}

export async function promptInstall(): Promise<"accepted" | "dismissed" | "unavailable"> {
  const event = window.__pwaDeferred ?? (await waitForInstallPrompt(document.readyState === "complete" ? 400 : 1800));
  if (!event) return "unavailable";
  await event.prompt();
  const choice = await event.userChoice;
  window.__pwaDeferred = null;
  return choice.outcome;
}
