import assert from "node:assert/strict";
import { test } from "node:test";
import {
  DEFAULT_CENTS,
  applyAmountKey,
  describeCombo,
  dollarsToCents,
  formatMoney,
  parseAmountToCents,
  parseCustomDenomToCents,
  sanitizeCustomDenom,
  solve,
} from "./postage.ts";

function lineMap(combo: ReturnType<typeof solve>) {
  assert.ok(combo);
  return Object.fromEntries(combo.lines.map((l) => [l.cents, l.count]));
}

test("parse amount", () => {
  assert.equal(parseAmountToCents("14.9"), 1490);
  assert.equal(parseAmountToCents("5.6"), 560);
  assert.equal(parseAmountToCents("$2.2"), 220);
  assert.equal(parseAmountToCents("14."), 1400);
  assert.equal(parseAmountToCents("24."), 2400);
  assert.equal(parseAmountToCents("24.8"), 2480);
  assert.equal(parseAmountToCents("14.99"), null);
  assert.equal(parseAmountToCents("abc"), null);
  assert.equal(parseAmountToCents("-1"), null);
  assert.equal(parseAmountToCents("9999.9"), 999990);
  assert.equal(parseAmountToCents("10000"), null);
});

test("format money strips trailing zeros", () => {
  assert.equal(formatMoney(10), "$0.1");
  assert.equal(formatMoney(400), "$4");
  assert.equal(formatMoney(550), "$5.5");
  assert.equal(formatMoney(1490), "$14.9");
  assert.equal(formatMoney(220), "$2.2");
});

test("keypad typing 14.9", () => {
  let value = "";
  for (const key of ["1", "4", ".", "9"]) value = applyAmountKey(value, key).value;
  assert.equal(value, "14.9");
  assert.deepEqual(applyAmountKey("14.9", "5"), { value: "14.9", overLimit: false });
  assert.equal(applyAmountKey("14.9", "back").value, "14.");
  assert.equal(applyAmountKey("14.", "back").value, "14");
  assert.equal(applyAmountKey("0", "5").value, "5");
  assert.equal(applyAmountKey("", ".").value, "0.");
  assert.equal(applyAmountKey("1.2", ".").value, "1.2");
  assert.equal(applyAmountKey("14.9", "clear").value, "");
});

test("keypad rejects extra digits past $9999.9", () => {
  assert.deepEqual(applyAmountKey("9999", "0"), { value: "9999", overLimit: true });
  assert.deepEqual(applyAmountKey("9999.", "9"), { value: "9999.9", overLimit: false });
  assert.deepEqual(applyAmountKey("9999.9", "1"), { value: "9999.9", overLimit: false });
  assert.equal(applyAmountKey("999", "9").value, "9999");
});

test("custom denom max $50 and one decimal", () => {
  assert.deepEqual(sanitizeCustomDenom("2.4"), { value: "2.4", overLimit: false });
  assert.deepEqual(sanitizeCustomDenom("2.45"), { value: "2.4", overLimit: false });
  assert.deepEqual(sanitizeCustomDenom("50"), { value: "50", overLimit: false });
  assert.deepEqual(sanitizeCustomDenom("50.0"), { value: "50.0", overLimit: false });
  assert.deepEqual(sanitizeCustomDenom("50.1"), { value: "50.", overLimit: true });
  assert.deepEqual(sanitizeCustomDenom("51"), { value: "5", overLimit: true });
  assert.equal(parseCustomDenomToCents("50"), 5000);
  assert.equal(parseCustomDenomToCents("50.1"), null);
  assert.equal(parseCustomDenomToCents("2.45"), null);
  assert.equal(parseCustomDenomToCents("0"), null);
});

test("$14.9 → $5.5 + $5.4 + $4", () => {
  const exact = solve(1490, DEFAULT_CENTS);
  assert.ok(exact);
  assert.equal(exact.stampCount, 3);
  const map = lineMap(exact);
  assert.equal(map[550], 1);
  assert.equal(map[540], 1);
  assert.equal(map[400], 1);
  assert.equal(describeCombo(exact), "$5.5 + $5.4 + $4");
});

test("$5.6 → $2.8 × 2", () => {
  const exact = solve(560, DEFAULT_CENTS);
  assert.ok(exact);
  assert.equal(exact.stampCount, 2);
  assert.equal(exact.lines.length, 1);
  const map = lineMap(exact);
  assert.equal(map[280], 2);
});

test("$11 → $5.5 × 2", () => {
  const exact = solve(1100, DEFAULT_CENTS);
  assert.ok(exact);
  assert.equal(exact.stampCount, 2);
  assert.equal(exact.lines.length, 1);
  assert.equal(exact.lines[0]?.cents, 550);
  assert.equal(exact.lines[0]?.count, 2);
});

test("$8 → $4 × 2", () => {
  const exact = solve(800, DEFAULT_CENTS);
  assert.ok(exact);
  assert.equal(exact.stampCount, 2);
  assert.equal(exact.lines.length, 1);
  assert.equal(exact.lines[0]?.cents, 400);
  assert.equal(exact.lines[0]?.count, 2);
});

test("$8.4 → $2.8 × 3", () => {
  const exact = solve(840, DEFAULT_CENTS);
  assert.ok(exact);
  assert.equal(exact.stampCount, 3);
  assert.equal(exact.lines.length, 1);
  assert.equal(exact.lines[0]?.cents, 280);
  assert.equal(exact.lines[0]?.count, 3);
});

test("$8.2 → $5.4 + $2.8", () => {
  const exact = solve(820, DEFAULT_CENTS);
  assert.ok(exact);
  assert.equal(exact.stampCount, 2);
  const map = lineMap(exact);
  assert.equal(map[540], 1);
  assert.equal(map[280], 1);
});

test("$3 → $2 + $1, not $2.8 + $0.2", () => {
  const exact = solve(300, DEFAULT_CENTS);
  assert.ok(exact);
  assert.equal(exact.stampCount, 2);
  assert.equal(describeCombo(exact), "$2 + $1");
});

test("$6 → $5 + $1", () => {
  const exact = solve(600, DEFAULT_CENTS);
  assert.ok(exact);
  assert.equal(exact.stampCount, 2);
  assert.equal(describeCombo(exact), "$5 + $1");
});

test("$9 → $5 + $4", () => {
  const exact = solve(900, DEFAULT_CENTS);
  assert.ok(exact);
  assert.equal(exact.stampCount, 2);
  assert.equal(describeCombo(exact), "$5 + $4");
});

test("$2.4 → $2.2 + $0.2", () => {
  const exact = solve(240, DEFAULT_CENTS);
  assert.ok(exact);
  assert.equal(exact.stampCount, 2);
  const map = lineMap(exact);
  assert.equal(map[220], 1);
  assert.equal(map[20], 1);
});

test("single matching denomination is one stamp", () => {
  const exact = solve(220, DEFAULT_CENTS);
  assert.ok(exact);
  assert.equal(exact.stampCount, 1);
  assert.equal(exact.lines[0]?.cents, 220);
  assert.equal(describeCombo(exact), "$2.2");
});

test("exact-only: no solution when small stamps disabled", () => {
  const denoms = DEFAULT_CENTS.filter((c) => c !== 10 && c !== 20);
  assert.equal(solve(240, denoms), null);
});

test("empty denoms or zero target", () => {
  assert.equal(solve(100, []), null);
  assert.equal(solve(0, DEFAULT_CENTS), null);
});

test("fewest stamps beats greedy $5+$2+$1 for $8", () => {
  const exact = solve(800, DEFAULT_CENTS);
  assert.ok(exact);
  assert.equal(exact.stampCount, 2);
  assert.equal(describeCombo(exact), "$4 + $4");
});

test("fewest stamps beats greedy for $4.4 and $9.9", () => {
  const a = solve(440, DEFAULT_CENTS);
  assert.ok(a);
  assert.equal(a.stampCount, 2);
  assert.equal(describeCombo(a), "$2.2 + $2.2");
  const b = solve(990, DEFAULT_CENTS);
  assert.ok(b);
  assert.equal(b.stampCount, 3);
  assert.equal(b.lines.reduce((n, l) => n + l.count, 0), 3);
});

test("every amount up to $40 uses the true minimum stamp count", () => {
  const INF = 1e9;
  function minStamps(target: number) {
    const dp = new Int32Array(target + 1);
    dp.fill(INF);
    dp[0] = 0;
    for (let amount = 0; amount <= target; amount++) {
      if (dp[amount] === INF) continue;
      for (const denom of DEFAULT_CENTS) {
        const next = amount + denom;
        if (next <= target && dp[amount] + 1 < dp[next]!) dp[next] = dp[amount] + 1;
      }
    }
    return dp[target] === INF ? null : dp[target];
  }
  for (let cents = 10; cents <= 4000; cents += 10) {
    const got = solve(cents, DEFAULT_CENTS);
    const min = minStamps(cents);
    assert.equal(got?.stampCount ?? null, min, `$${cents / 100}`);
  }
});

test("dollarsToCents rounds binary fractions", () => {
  assert.equal(dollarsToCents(2.2), 220);
  assert.equal(dollarsToCents(2.8), 280);
  assert.equal(dollarsToCents(3.7), 370);
  assert.equal(dollarsToCents(5.4), 540);
});

test("$8.8 款式優先 → $2.2 × 4", () => {
  const min = solve(880, DEFAULT_CENTS);
  assert.ok(min);
  assert.equal(min.stampCount, 3);
  assert.equal(min.lines.length, 3);
  const types = solve(880, DEFAULT_CENTS, "types");
  assert.ok(types);
  assert.equal(types.stampCount, 4);
  assert.equal(types.lines.length, 1);
  assert.equal(types.lines[0]?.cents, 220);
  assert.equal(types.lines[0]?.count, 4);
});

test("$3 款式優先 → $1 × 3", () => {
  const min = solve(300, DEFAULT_CENTS);
  assert.ok(min);
  assert.equal(describeCombo(min), "$2 + $1");
  const types = solve(300, DEFAULT_CENTS, "types");
  assert.ok(types);
  assert.equal(types.stampCount, 3);
  assert.equal(types.lines.length, 1);
  assert.equal(types.lines[0]?.cents, 100);
  assert.equal(types.lines[0]?.count, 3);
});

test("$30 款式優先 → $10 × 3", () => {
  const min = solve(3000, DEFAULT_CENTS);
  assert.ok(min);
  assert.equal(describeCombo(min), "$20 + $10");
  const types = solve(3000, DEFAULT_CENTS, "types");
  assert.ok(types);
  assert.equal(types.stampCount, 3);
  assert.equal(types.lines.length, 1);
  assert.equal(types.lines[0]?.cents, 1000);
  assert.equal(types.lines[0]?.count, 3);
});

test("$6 款式優先 → $2 × 3", () => {
  const min = solve(600, DEFAULT_CENTS);
  assert.ok(min);
  assert.equal(describeCombo(min), "$5 + $1");
  const types = solve(600, DEFAULT_CENTS, "types");
  assert.ok(types);
  assert.equal(types.stampCount, 3);
  assert.equal(types.lines.length, 1);
  assert.equal(types.lines[0]?.cents, 200);
  assert.equal(types.lines[0]?.count, 3);
});

test("$28 減少種類 stays within 2× when saving one type, not $4 × 7", () => {
  const min = solve(2800, DEFAULT_CENTS);
  assert.ok(min);
  assert.equal(min.stampCount, 3);
  assert.equal(min.lines.length, 2);
  assert.equal(describeCombo(min), "$20 + $4 + $4");
  const types = solve(2800, DEFAULT_CENTS, "types");
  assert.ok(types);
  assert.equal(types.lines.length, 2);
  assert.equal(describeCombo(types), "$20 + $4 + $4");
});

test("$19.6 減少種類 may use 3× stamps when saving two types → $2.8 × 7", () => {
  const min = solve(1960, DEFAULT_CENTS);
  assert.ok(min);
  assert.equal(min.stampCount, 3);
  assert.equal(min.lines.length, 3);
  const types = solve(1960, DEFAULT_CENTS, "types");
  assert.ok(types);
  assert.equal(types.lines.length, 1);
  assert.equal(types.stampCount, 7);
  assert.equal(types.lines[0]?.cents, 280);
});

test("減少種類 stamp cap grows one multiple per type saved", () => {
  for (let cents = 10; cents <= 4000; cents += 10) {
    const min = solve(cents, DEFAULT_CENTS);
    const types = solve(cents, DEFAULT_CENTS, "types");
    if (!min) {
      assert.equal(types, null, `$${cents / 100}`);
      continue;
    }
    assert.ok(types, `$${cents / 100}`);
    const saved = min.lines.length - types.lines.length;
    assert.ok(saved >= 0, `$${cents / 100} types`);
    assert.ok(types.stampCount <= min.stampCount * (1 + saved), `$${cents / 100}`);
  }
});
