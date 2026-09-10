import { DEFAULT_CENTS, MAX_CUSTOM_CENTS, applyAmountKey } from "@/lib/postage";

export const STORAGE_KEY = "stamp-calc-v2";

export type Saved = {
  amount: string;
  enabled: number[];
  extras: number[];
};

function clampSavedAmount(raw: string): string {
  let value = "";
  for (const ch of raw) {
    if (ch >= "0" && ch <= "9") {
      const next = applyAmountKey(value, ch);
      if (next.overLimit) return next.value;
      value = next.value;
    } else if (ch === ".") {
      value = applyAmountKey(value, ".").value;
    }
  }
  return value;
}

export function defaultSaved(): Saved {
  return { amount: "", enabled: [...DEFAULT_CENTS], extras: [] };
}

export function loadSaved(): Saved {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) throw new Error("empty");
    const parsed = JSON.parse(raw) as Saved;
    return {
      amount: typeof parsed.amount === "string" ? clampSavedAmount(parsed.amount) : "",
      enabled: Array.isArray(parsed.enabled) ? parsed.enabled.filter((n) => Number.isInteger(n)) : [...DEFAULT_CENTS],
      extras: Array.isArray(parsed.extras)
        ? parsed.extras.filter((n) => Number.isInteger(n) && n > 0 && n <= MAX_CUSTOM_CENTS)
        : [],
    };
  } catch {
    return defaultSaved();
  }
}

export function saveSettings(saved: Saved) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saved satisfies Saved));
}

export function patchSaved(partial: Partial<Saved>): Saved {
  const next = { ...loadSaved(), ...partial };
  saveSettings(next);
  return next;
}
