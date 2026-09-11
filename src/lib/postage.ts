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
export const MAX_CUSTOM_DOLLARS = 50;
export const MAX_CUSTOM_CENTS = dollarsToCents(MAX_CUSTOM_DOLLARS);
export const MAX_CUSTOM_LABEL = "$50";
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

/** Custom stamp face: at most $50, one decimal place. */
export function sanitizeCustomDenom(raw: string): { value: string; overLimit: boolean } {
  const stripped = typeof raw === "string" ? raw.replace(/[$,\s]/g, "") : "";
  if (!stripped) return { value: "", overLimit: false };
  let intPart = "";
  let frac: string | null = null;
  for (const ch of stripped) {
    if (ch === ".") {
      if (frac !== null) continue;
      frac = "";
      continue;
    }
    if (ch < "0" || ch > "9") continue;
    if (frac !== null) {
      if (frac.length >= MAX_FRAC_DIGITS) continue;
      frac += ch;
    } else if (intPart === "0") {
      intPart = ch;
    } else {
      intPart += ch;
    }
  }
  if (!intPart && frac !== null) intPart = "0";
  let value = frac !== null ? `${intPart}.${frac}` : intPart;
  let overLimit = false;
  const numeric = (text: string) => Number(text.endsWith(".") ? text.slice(0, -1) : text);
  while (value && Number.isFinite(numeric(value)) && numeric(value) > MAX_CUSTOM_DOLLARS) {
    overLimit = true;
    value = value.slice(0, -1);
  }
  return { value, overLimit };
}

export function parseCustomDenomToCents(input: string): number | null {
  const cents = parseAmountToCents(input);
  if (cents === null || cents === 0 || cents > MAX_CUSTOM_CENTS) return null;
  return cents;
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

function comboFromLines(amount: number, parts: StampLine[]): Combination {
  const lines = parts.filter((line) => line.count > 0).sort((a, b) => b.cents - a.cents);
  return {
    lines,
    stampCount: lines.reduce((n, line) => n + line.count, 0),
    totalCents: amount,
  };
}

function wholeCount(combo: Combination): number {
  return combo.lines.reduce((n, line) => n + (line.cents % 100 === 0 ? line.count : 0), 0);
}

function betterTypesCombo(a: Combination, b: Combination): boolean {
  if (a.lines.length !== b.lines.length) return a.lines.length < b.lines.length;
  if (a.stampCount !== b.stampCount) return a.stampCount < b.stampCount;
  const wa = wholeCount(a);
  const wb = wholeCount(b);
  if (wa !== wb) return wa > wb;
  for (let i = 0; i < a.lines.length; i++) {
    const left = a.lines[i]!;
    const right = b.lines[i]!;
    if (left.cents !== right.cents) return left.cents > right.cents;
    if (left.count !== right.count) return left.count > right.count;
  }
  return false;
}

/** Fewest types; stamp count may grow by one multiple per type saved vs the min-stamp combo. */
function typesStampCap(minStamps: number, defaultTypes: number, comboTypes: number): number {
  const saved = defaultTypes - comboTypes;
  if (saved < 0) return 0;
  return minStamps * (1 + saved);
}

function solveTypes(
  target: number,
  denoms: number[],
  minStamps: number,
  defaultTypes: number,
): Combination | null {
  let best: Combination | null = null;
  const take = (parts: StampLine[]) => {
    const combo = comboFromLines(target, parts);
    const cap = typesStampCap(minStamps, defaultTypes, combo.lines.length);
    if (combo.stampCount < 1 || combo.stampCount > cap) return;
    if (!best || betterTypesCombo(combo, best)) best = combo;
  };

  const cap1 = typesStampCap(minStamps, defaultTypes, 1);
  if (cap1 >= 1) {
    for (const denom of denoms) {
      if (target % denom !== 0) continue;
      take([{ cents: denom, count: target / denom }]);
    }
    if (best) return best;
  }

  const cap2 = typesStampCap(minStamps, defaultTypes, 2);
  if (cap2 >= 2) {
    for (let i = 0; i < denoms.length; i++) {
      const a = denoms[i]!;
      for (let j = i + 1; j < denoms.length; j++) {
        const b = denoms[j]!;
        const maxX = Math.min(cap2 - 1, Math.floor(target / a));
        for (let x = 1; x <= maxX; x++) {
          const rest = target - x * a;
          if (rest % b !== 0) continue;
          const y = rest / b;
          if (y < 1 || x + y > cap2) continue;
          take([
            { cents: a, count: x },
            { cents: b, count: y },
          ]);
        }
      }
    }
    if (best) return best;
  }

  const cap3 = typesStampCap(minStamps, defaultTypes, 3);
  if (cap3 >= 3) {
    for (let i = 0; i < denoms.length; i++) {
      const a = denoms[i]!;
      for (let j = i + 1; j < denoms.length; j++) {
        const b = denoms[j]!;
        for (let k = j + 1; k < denoms.length; k++) {
          const c = denoms[k]!;
          const maxX = Math.min(cap3 - 2, Math.floor(target / a));
          for (let x = 1; x <= maxX; x++) {
            const rem = target - x * a;
            const maxY = Math.min(cap3 - 1 - x, Math.floor(rem / b));
            for (let y = 1; y <= maxY; y++) {
              const rest = rem - y * b;
              if (rest <= 0 || rest % c !== 0) continue;
              const z = rest / c;
              if (z < 1 || x + y + z > cap3) continue;
              take([
                { cents: a, count: x },
                { cents: b, count: y },
                { cents: c, count: z },
              ]);
            }
          }
        }
      }
    }
  }
  return best;
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

export type SolveMode = "stamps" | "types";

/** Fewest stamps, or fewer types with stamp count growing one multiple per type saved. */
export function solve(
  targetCents: number,
  denomCents: number[],
  mode: SolveMode = "stamps",
): Combination | null {
  const denoms = [...new Set(denomCents.filter((d) => Number.isInteger(d) && d > 0))].sort(
    (a, b) => b - a,
  );
  if (targetCents <= 0 || denoms.length === 0) return null;

  const bits = denoms.map((_, i) => (i < 31 ? 1 << i : 0));
  const dp = new Int32Array(targetCents + 1);
  dp.fill(INF);
  dp[0] = 0;

  for (let amount = 0; amount <= targetCents; amount++) {
    const current = dp[amount]!;
    if (current === INF) continue;
    for (let i = 0; i < denoms.length; i++) {
      const next = amount + denoms[i]!;
      if (next > targetCents) continue;
      const candidate = current + 1;
      if (candidate < dp[next]!) dp[next] = candidate;
    }
  }

  if (dp[targetCents] === INF) return null;

  const minStamps = dp[targetCents]!;
  const minCombo = reconstructMin(targetCents, denoms, bits, dp, minStamps);
  if (mode === "stamps") return minCombo;
  const typed = solveTypes(targetCents, denoms, minCombo.stampCount, minCombo.lines.length);
  if (typed && typed.lines.length < minCombo.lines.length) return typed;
  return minCombo;
}

function reconstructMin(
  targetCents: number,
  denoms: number[],
  bits: number[],
  dp: Int32Array,
  minStamps: number,
): Combination {
  const stamps = new Int32Array(targetCents + 1);
  const kinds = new Int32Array(targetCents + 1);
  const wholes = new Int32Array(targetCents + 1);
  const parent = new Int32Array(targetCents + 1);
  const used = new Int32Array(targetCents + 1);
  const mask = new Uint32Array(targetCents + 1);
  stamps.fill(INF);
  kinds.fill(INF);
  stamps[0] = 0;
  kinds[0] = 0;

  for (let amount = 0; amount <= targetCents; amount++) {
    if (kinds[amount] === INF) continue;
    const currentStamps = stamps[amount]!;
    if (currentStamps >= minStamps) continue;
    const currentMask = mask[amount]!;
    const currentWholes = wholes[amount]!;
    for (let i = 0; i < denoms.length; i++) {
      const denom = denoms[i]!;
      const next = amount + denom;
      if (next > targetCents) continue;
      const nextStamps = currentStamps + 1;
      if (nextStamps > minStamps) continue;
      if (dp[next] !== nextStamps) continue;
      const nextMask = currentMask | bits[i]!;
      const nextKinds = bitCount(nextMask);
      const nextWholes = currentWholes + (denom % 100 === 0 ? 1 : 0);
      const better =
        nextKinds < kinds[next]! ||
        (nextKinds === kinds[next]! && nextStamps < stamps[next]!) ||
        (nextKinds === kinds[next]! && nextStamps === stamps[next]! && nextWholes > wholes[next]!) ||
        (nextKinds === kinds[next]! &&
          nextStamps === stamps[next]! &&
          nextWholes === wholes[next]! &&
          denom > used[next]!);
      if (!better) continue;
      kinds[next] = nextKinds;
      stamps[next] = nextStamps;
      wholes[next] = nextWholes;
      parent[next] = amount;
      used[next] = denom;
      mask[next] = nextMask;
    }
  }

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
    `共 ${combo.stampCount} 枚`,
  ].join("\n");
}
