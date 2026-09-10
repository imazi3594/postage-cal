import { y as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as clsx } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/stamp-settings-BgEuDH8h.js
var import_jsx_runtime = require_jsx_runtime();
var DEFAULT_CENTS = [
	.1,
	.2,
	.5,
	1,
	2,
	2.2,
	2.8,
	3.7,
	4,
	5,
	5.4,
	5.5,
	10,
	15.5,
	20,
	50
].map(dollarsToCents);
var INF = 1061109567;
var MAX_TARGET_CENTS = dollarsToCents(9999.9);
var MAX_AMOUNT_LABEL = "$9999.9";
var MAX_INT_DIGITS = 4;
var MAX_FRAC_DIGITS = 1;
function dollarsToCents(dollars) {
	return Math.round(dollars * 100);
}
/** $5.5, $4, $0.1 — strip trailing zeros to match how postage is spoken. */
function formatMoney(cents) {
	return `${cents < 0 ? "-" : ""}$${(Math.abs(cents) / 100).toFixed(2).replace(/\.?0+$/, "")}`;
}
function parseAmountToCents(input) {
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
function applyAmountKey(current, key) {
	const value = typeof current === "string" ? current : "";
	if (key === "clear") return {
		value: "",
		overLimit: false
	};
	if (key === "back") return {
		value: value.slice(0, -1),
		overLimit: false
	};
	if (key === ".") {
		if (!value) return {
			value: "0.",
			overLimit: false
		};
		if (value.includes(".")) return {
			value,
			overLimit: false
		};
		return {
			value: `${value}.`,
			overLimit: false
		};
	}
	if (!/^\d$/.test(key)) return {
		value,
		overLimit: false
	};
	if (!value || value === "0") return {
		value: key,
		overLimit: false
	};
	if (value.includes(".")) {
		if ((value.split(".")[1] ?? "").length >= MAX_FRAC_DIGITS) return {
			value,
			overLimit: false
		};
		const next = value + key;
		if (Number(next) > 9999.9) return {
			value,
			overLimit: true
		};
		return {
			value: next,
			overLimit: false
		};
	}
	if (value.length >= MAX_INT_DIGITS) return {
		value,
		overLimit: true
	};
	return {
		value: value + key,
		overLimit: false
	};
}
function toCombo(amount, parent, used) {
	const counts = /* @__PURE__ */ new Map();
	let cursor = amount;
	let stampCount = 0;
	while (cursor > 0) {
		const denom = used[cursor];
		counts.set(denom, (counts.get(denom) ?? 0) + 1);
		stampCount += 1;
		cursor = parent[cursor];
	}
	return {
		lines: [...counts.entries()].sort((a, b) => b[0] - a[0]).map(([cents, count]) => ({
			cents,
			count
		})),
		stampCount,
		totalCents: amount
	};
}
function bitCount(n) {
	let bits = n >>> 0;
	let count = 0;
	while (bits) {
		bits &= bits - 1;
		count += 1;
	}
	return count;
}
/** Fewest stamps; then fewest faces; then as many whole-dollar stamps as possible. */
function solve(targetCents, denomCents) {
	const denoms = [...new Set(denomCents.filter((d) => Number.isInteger(d) && d > 0))].sort((a, b) => b - a);
	if (targetCents <= 0 || denoms.length === 0) return null;
	const bits = denoms.map((_, i) => i < 31 ? 1 << i : 0);
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
		const current = dp[amount];
		if (current === INF) continue;
		const currentMask = mask[amount];
		const currentWholes = wholes[amount];
		for (let i = 0; i < denoms.length; i++) {
			const denom = denoms[i];
			const next = amount + denom;
			if (next > targetCents) continue;
			const candidate = current + 1;
			const existing = dp[next];
			const nextMask = currentMask | bits[i];
			const nextKinds = bitCount(nextMask);
			const nextWholes = currentWholes + (denom % 100 === 0 ? 1 : 0);
			const existingKinds = kinds[next];
			const existingWholes = wholes[next];
			if (!(candidate < existing || candidate === existing && nextKinds < existingKinds || candidate === existing && nextKinds === existingKinds && nextWholes > existingWholes || candidate === existing && nextKinds === existingKinds && nextWholes === existingWholes && denom > used[next])) continue;
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
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function stampTone(cents) {
	const known = DEFAULT_CENTS.indexOf(cents);
	return known >= 0 ? known : 0;
}
function StampFace({ cents, count = 1, size = "md", muted = false, className, style }) {
	const label = formatMoney(cents);
	const custom = !DEFAULT_CENTS.includes(cents);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("relative", size === "sm" ? "w-full" : size === "xs" ? "w-14" : "w-20", className),
		style,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "stamp-face",
			"data-tone": stampTone(cents),
			"data-size": size,
			"data-off": muted ? "true" : void 0,
			"data-custom": custom ? "true" : void 0,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: cn("relative z-10 font-display font-semibold tabular-nums leading-none tracking-tight", size === "xs" ? "text-sm" : size === "sm" ? "text-lg" : "text-xl"),
				children: label
			})
		}), count > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "absolute -top-2 -right-2 z-10 flex h-7 min-w-7 items-center justify-center rounded-full bg-primary px-1.5 font-semibold text-xs tabular-nums text-primary-fg",
			children: ["×", count]
		}) : null]
	});
}
var STORAGE_KEY = "stamp-calc-v2";
function clampSavedAmount(raw) {
	let value = "";
	for (const ch of raw) if (ch >= "0" && ch <= "9") {
		const next = applyAmountKey(value, ch);
		if (next.overLimit) return next.value;
		value = next.value;
	} else if (ch === ".") value = applyAmountKey(value, ".").value;
	return value;
}
function defaultSaved() {
	return {
		amount: "",
		enabled: [...DEFAULT_CENTS],
		extras: []
	};
}
function loadSaved() {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) throw new Error("empty");
		const parsed = JSON.parse(raw);
		return {
			amount: typeof parsed.amount === "string" ? clampSavedAmount(parsed.amount) : "",
			enabled: Array.isArray(parsed.enabled) ? parsed.enabled.filter((n) => Number.isInteger(n)) : [...DEFAULT_CENTS],
			extras: Array.isArray(parsed.extras) ? parsed.extras.filter((n) => Number.isInteger(n) && n > 0) : []
		};
	} catch {
		return defaultSaved();
	}
}
function saveSettings(saved) {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
}
function patchSaved(partial) {
	const next = {
		...loadSaved(),
		...partial
	};
	saveSettings(next);
	return next;
}
//#endregion
export { cn as a, parseAmountToCents as c, applyAmountKey as i, patchSaved as l, MAX_AMOUNT_LABEL as n, formatMoney as o, StampFace as r, loadSaved as s, DEFAULT_CENTS as t, solve as u };
