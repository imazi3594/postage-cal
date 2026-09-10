/** Default Hong Kong stamp denominations, stored as cents. */
export const DEFAULT_DOLLARS = [
  0.1, 0.2, 0.5, 1, 2, 2.2, 2.8, 3.7, 4, 5, 5.4, 5.5, 10, 15.5, 20, 50,
] as const;

export const DEFAULT_CENTS: number[] = DEFAULT_DOLLARS.map(dollarsToCents);

export type StampLine = { cents: number; count: number };

export type Combination = {
  lines: StampLine[];
  stampCount: number;
  totalCents: number;
};

const INF = 0x3f3f3f3f;
export const MAX_AMOUNT_DOLLARS = 9999.9;
export const MAX_TARGET_CENTS = dollarsToCents(MAX_AMOUNT_DOLLARS);
export const MAX_AMOUNT_LABEL = "$9999.9";
const MAX_INT_DIGITS = 4;
const MAX_FRAC_DIGITS = 1;

export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}

export function centsToDollars(cents: number): number {
  return cents / 100;
}

/** $5.5, $4, $0.1 — strip trailing zeros to match how postage is spoken. */
export function formatMoney(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  const value = (Math.abs(cents) / 100).toFixed(2).replace(/\.?0+$/, "");
  return `${sign}$${value}`;
}

export function parseAmountToCents(input: string): number | null {
  const cleaned = input.replace(/[$,\s]/g, "").trim();
  if (!cleaned) return null;
  const normalized = cleaned.endsWith(".") ? cleaned.slice(0, -1) : cleaned;
  if (!normalized) return null;
  if (!/^\d+(\.\d)?$/.test(normalized)) return null;
  const n = Number(normalized);
  if (!Number.isFinite(n) || n < 0) return null;
  const cents = dollarsToCents(n);
  if (cents > MAX_TARGET_CENTS) return null;
  return cents;
}

export function applyAmountKey(
  current: string,
  key: string,
): { value: string; overLimit: boolean } {
  const value = typeof current === "string" ? current : "";
  if (key === "clear") return { value: "", overLimit: false };
  if (key === "back") return { value: value.slice(0, -1), overLimit: false };
  if (key === ".") {
    if (!value) return { value: "0.", overLimit: false };
    if (value.includes(".")) return { value, overLimit: false };
    return { value: `${value}.`, overLimit: false };
  }
  if (!/^\d$/.test(key)) return { value, overLimit: false };
  if (!value || value === "0") return { value: key, overLimit: false };
  if (value.includes(".")) {
    const fraction = value.split(".")[1] ?? "";
    if (fraction.length >= MAX_FRAC_DIGITS) return { value, overLimit: false };
    const next = value + key;
    if (Number(next) > MAX_AMOUNT_DOLLARS) return { value, overLimit: true };
    return { value: next, overLimit: false };
  }
  if (value.length >= MAX_INT_DIGITS) return { value, overLimit: true };
  return { value: value + key, overLimit: false };
}

function toCombo(amount: number, parent: Int32Array, used: Int32Array): Combination {
  const counts = new Map<number, number>();
  let cursor = amount;
  let stampCount = 0;
  while (cursor > 0) {
    const denom = used[cursor]!;
    counts.set(denom, (counts.get(denom) ?? 0) + 1);
    stampCount += 1;
    cursor = parent[cursor]!;
  }
  const lines = [...counts.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([cents, count]) => ({ cents, count }));
  return { lines, stampCount, totalCents: amount };
}

function bitCount(n: number): number {
  let bits = n >>> 0;
  let count = 0;
  while (bits) {
    bits &= bits - 1;
    count += 1;
  }
  return count;
}

/** Fewest stamps; then fewest faces; then as many whole-dollar stamps as possible. */
export function solve(targetCents: number, denomCents: number[]): Combination | null {
  const denoms = [...new Set(denomCents.filter((d) => Number.isInteger(d) && d > 0))].sort(
    (a, b) => b - a,
  );
  if (targetCents <= 0 || denoms.length === 0) return null;

  const bits = denoms.map((_, i) => (i < 31 ? 1 << i : 0));
  const dp = new Int32Array(targetCents + 1);
  const kinds = new Int32Array(targetCents + 1);
  const wholes = new Int32Array(targetCents + 1);
  const parent = new Int32Array(targetCents + 1);
  const used = new Int32Array(targetCents + 1);
  const mask = new Uint32Array(targetCents + 1);
  dp.fill(INF);
  kinds.fill(INF);
  dp[0] = 0;
  kinds[0] = 0;

  for (let amount = 0; amount <= targetCents; amount++) {
    const current = dp[amount]!;
    if (current === INF) continue;
    const currentMask = mask[amount]!;
    const currentWholes = wholes[amount]!;
    for (let i = 0; i < denoms.length; i++) {
      const denom = denoms[i]!;
      const next = amount + denom;
      if (next > targetCents) continue;
      const candidate = current + 1;
      const existing = dp[next]!;
      const nextMask = currentMask | bits[i]!;
      const nextKinds = bitCount(nextMask);
      const nextWholes = currentWholes + (denom % 100 === 0 ? 1 : 0);
      const existingKinds = kinds[next]!;
      const existingWholes = wholes[next]!;
      const better =
        candidate < existing ||
        (candidate === existing && nextKinds < existingKinds) ||
        (candidate === existing && nextKinds === existingKinds && nextWholes > existingWholes) ||
        (candidate === existing &&
          nextKinds === existingKinds &&
          nextWholes === existingWholes &&
          denom > used[next]!);
      if (!better) continue;
      dp[next] = candidate;
      kinds[next] = nextKinds;
      wholes[next] = nextWholes;
      parent[next] = amount;
      used[next] = denom;
      mask[next] = nextMask;
    }
  }

  if (dp[targetCents] === INF) return null;
  return toCombo(targetCents, parent, used);
}

/** e.g. $5.5 + $5.4 + $4 */
export function describeCombo(combo: Combination): string {
  const parts: string[] = [];
  for (const line of combo.lines) {
    for (let i = 0; i < line.count; i++) {
      parts.push(formatMoney(line.cents));
    }
  }
  return parts.join(" + ");
}

export function copyText(targetCents: number, combo: Combination): string {
  return [
    `郵費 ${formatMoney(targetCents)}`,
    describeCombo(combo),
    `共 ${combo.stampCount} 張`,
  ].join("\n");
}
