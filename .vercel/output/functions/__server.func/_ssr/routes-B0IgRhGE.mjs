import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { _ as Link, y as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as Settings, o as Delete } from "../_libs/lucide-react.mjs";
import { a as cn, c as parseAmountToCents, i as applyAmountKey, l as patchSaved, n as MAX_AMOUNT_LABEL, r as StampFace, s as loadSaved, t as DEFAULT_CENTS, u as solve } from "./stamp-settings-BgEuDH8h.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-B0IgRhGE.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var KEY_ROWS = [
	[
		"7",
		"8",
		"9"
	],
	[
		"4",
		"5",
		"6"
	],
	[
		"1",
		"2",
		"3"
	],
	[
		"C",
		"0",
		"."
	]
];
function StampCalculator() {
	const [hydrated, setHydrated] = (0, import_react.useState)(false);
	const [amount, setAmount] = (0, import_react.useState)("");
	const [enabled, setEnabled] = (0, import_react.useState)([...DEFAULT_CENTS]);
	const [extras, setExtras] = (0, import_react.useState)([]);
	const [toast, setToast] = (0, import_react.useState)("");
	const amountRef = (0, import_react.useRef)(amount);
	const toastTimer = (0, import_react.useRef)(0);
	const lastPress = (0, import_react.useRef)(0);
	amountRef.current = typeof amount === "string" ? amount : "";
	(0, import_react.useEffect)(() => {
		const saved = loadSaved();
		setAmount(saved.amount);
		setEnabled(saved.enabled);
		setExtras(saved.extras);
		setHydrated(true);
	}, []);
	(0, import_react.useEffect)(() => {
		if (!hydrated) return;
		patchSaved({ amount });
	}, [amount, hydrated]);
	(0, import_react.useEffect)(() => {
		function onKey(event) {
			const target = event.target;
			if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
			if (event.key >= "0" && event.key <= "9") {
				event.preventDefault();
				applyInput(event.key);
				return;
			}
			if (event.key === "." || event.key === ",") {
				event.preventDefault();
				applyInput(".");
				return;
			}
			if (event.key === "Backspace") {
				event.preventDefault();
				applyInput("back");
				return;
			}
			if (event.key === "Escape" || event.key === "Delete") {
				event.preventDefault();
				applyInput("clear");
			}
		}
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, []);
	(0, import_react.useEffect)(() => () => window.clearTimeout(toastTimer.current), []);
	const targetCents = parseAmountToCents(amount);
	const pool = (0, import_react.useMemo)(() => {
		return [.../* @__PURE__ */ new Set([...enabled, ...extras])].sort((a, b) => a - b);
	}, [enabled, extras]);
	const missing = (0, import_react.useMemo)(() => DEFAULT_CENTS.filter((cents) => !enabled.includes(cents)), [enabled]);
	const combo = (0, import_react.useMemo)(() => {
		if (targetCents === null || targetCents === 0) return null;
		return solve(targetCents, pool);
	}, [targetCents, pool]);
	function showToast(message) {
		setToast(message);
		window.clearTimeout(toastTimer.current);
		toastTimer.current = window.setTimeout(() => setToast(""), 1800);
	}
	function applyInput(key) {
		const current = typeof amountRef.current === "string" ? amountRef.current : "";
		const result = applyAmountKey(current, key);
		if (result.overLimit) {
			showToast(`上限為 ${MAX_AMOUNT_LABEL}`);
			return;
		}
		amountRef.current = result.value;
		setAmount(result.value);
	}
	function onPadPointerDown(event, key) {
		if (event.pointerType === "mouse" && event.button !== 0) return;
		event.preventDefault();
		lastPress.current = Date.now();
		press(key);
	}
	function onPadClick(key) {
		if (Date.now() - lastPress.current < 400) return;
		press(key);
	}
	function press(key) {
		if (key === "C") {
			applyInput("clear");
			return;
		}
		applyInput(key);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative mx-auto flex h-dvh w-full max-w-lg flex-col gap-3 overflow-hidden px-4 py-3 sm:gap-4 sm:px-6 sm:py-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-2xs font-medium tracking-wide text-primary",
						children: "Postage combination calculator"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
						className: "mt-0.5 flex items-center gap-1.5 text-lg font-semibold tracking-tight text-ink",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
							viewBox: "0 0 24 24",
							className: "size-5 shrink-0 text-primary",
							fill: "none",
							stroke: "currentColor",
							strokeWidth: "2",
							strokeLinecap: "round",
							strokeLinejoin: "round",
							"aria-hidden": true,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
								x: "3",
								y: "4",
								width: "18",
								height: "16",
								rx: "2"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
								x: "6.5",
								y: "7.5",
								width: "11",
								height: "9",
								rx: "1"
							})]
						}), "郵票組合計數機"]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/settings",
					"aria-label": "設定",
					className: "inline-flex size-10 shrink-0 items-center justify-center rounded-md text-ink transition-[background-color] duration-(--motion-quick) ease-(--ease-smooth-out) hover:bg-surface-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "size-5" })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-h-0 flex-1 flex-col gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
						className: "rounded-xl bg-surface p-3 shadow-(--shadow-border) sm:p-4",
						"aria-live": "polite",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ComboStrip, {
							amount,
							targetCents,
							poolEmpty: pool.length === 0,
							combo
						})
					}),
					missing.length > 0 || extras.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/settings",
						"aria-label": "設定郵票面額",
						className: "rounded-xl bg-surface px-3 py-2 shadow-(--shadow-border) sm:px-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StockStrip, {
							missing,
							extras
						})
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "rounded-xl bg-surface p-3 shadow-(--shadow-border) sm:p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 rounded-lg bg-bg px-3 py-2 sm:px-4 sm:py-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs font-medium text-muted",
									children: "郵費"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-0.5 truncate font-display text-3xl font-semibold tabular-nums tracking-tight text-ink",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mr-1 text-subtle",
										children: "$"
									}), typeof amount === "string" && amount ? amount : "0"]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-label": "刪除一位",
								onPointerDown: (event) => onPadPointerDown(event, "back"),
								onClick: () => onPadClick("back"),
								className: "inline-flex size-12 shrink-0 touch-manipulation items-center justify-center rounded-md bg-surface-2 text-ink transition-[background-color] duration-(--motion-quick) ease-(--ease-smooth-out) hover:bg-border",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Delete, { className: "size-6" })
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-2 grid grid-cols-3 gap-2 sm:mt-3",
							children: KEY_ROWS.flat().map((key) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onPointerDown: (event) => onPadPointerDown(event, key),
								onClick: () => onPadClick(key),
								className: cn("inline-flex h-12 touch-manipulation items-center justify-center rounded-md font-display text-2xl tabular-nums transition-[background-color,color] duration-(--motion-quick) ease-(--ease-smooth-out) sm:h-14", key === "C" ? "bg-primary-soft text-stamp-ink hover:bg-primary/15" : "bg-surface-2 text-ink hover:bg-border"),
								children: key
							}, key))
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cn("pointer-events-none fixed inset-x-0 top-4 z-20 flex justify-center px-4 transition-[opacity,transform] duration-(--motion-fast) ease-(--ease-smooth-out) motion-reduce:transition-none", toast ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"),
				"aria-hidden": !toast,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					role: "alert",
					className: "w-full max-w-sm rounded-xl bg-surface px-6 py-4 text-center shadow-(--shadow-border)",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium tracking-wide text-primary",
						children: "提示"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 font-sans text-lg font-semibold text-ink",
						children: toast || "\xA0"
					})]
				})
			})
		]
	});
}
function ComboStrip({ amount, targetCents, poolEmpty, combo }) {
	const frameRef = (0, import_react.useRef)(null);
	const clusterRef = (0, import_react.useRef)(null);
	const [scale, setScale] = (0, import_react.useState)(1);
	const lines = combo?.lines ?? [];
	(0, import_react.useLayoutEffect)(() => {
		const frame = frameRef.current;
		const cluster = clusterRef.current;
		if (!frame || !cluster || lines.length === 0) {
			setScale(1);
			return;
		}
		const fit = () => {
			const next = Math.min(1, frame.clientWidth / cluster.offsetWidth, frame.clientHeight / cluster.offsetHeight);
			const clamped = Number.isFinite(next) && next > 0 ? next : 1;
			setScale((prev) => Math.abs(prev - clamped) < .01 ? prev : clamped);
		};
		fit();
		const observer = new ResizeObserver(fit);
		observer.observe(frame);
		observer.observe(cluster);
		return () => observer.disconnect();
	}, [lines]);
	if (!amount || amount === "0" || amount === "0.") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex h-24 w-full items-center justify-center overflow-hidden sm:h-28",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "px-4 text-center text-sm text-muted",
			children: "請輸入郵費"
		})
	});
	if (targetCents === null) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex h-24 w-full items-center justify-center overflow-hidden sm:h-28",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted",
			children: "繼續輸入金額…"
		})
	});
	if (poolEmpty) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex h-24 w-full items-center justify-center overflow-hidden sm:h-28",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted",
			children: "至少揀一種郵票面額。"
		})
	});
	if (!combo) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex h-24 w-full items-center justify-center overflow-hidden sm:h-28",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "px-4 text-center text-sm text-muted",
			children: "湊唔到剛好呢個金額"
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref: frameRef,
		className: "flex h-24 w-full items-center justify-center overflow-hidden sm:h-28",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref: clusterRef,
			className: "flex w-max items-center justify-center gap-2",
			style: {
				transform: `scale(${scale})`,
				transformOrigin: "center center"
			},
			children: lines.map((line) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StampFace, {
				cents: line.cents,
				count: line.count
			}, line.cents))
		})
	});
}
function StockStrip({ missing, extras }) {
	const frameRef = (0, import_react.useRef)(null);
	const clusterRef = (0, import_react.useRef)(null);
	const [scale, setScale] = (0, import_react.useState)(1);
	(0, import_react.useLayoutEffect)(() => {
		const frame = frameRef.current;
		const cluster = clusterRef.current;
		if (!frame || !cluster) {
			setScale(1);
			return;
		}
		const fit = () => {
			const next = Math.min(1, frame.clientWidth / cluster.offsetWidth);
			const clamped = Number.isFinite(next) && next > 0 ? next : 1;
			setScale((prev) => Math.abs(prev - clamped) < .01 ? prev : clamped);
		};
		fit();
		const observer = new ResizeObserver(fit);
		observer.observe(frame);
		observer.observe(cluster);
		return () => observer.disconnect();
	}, [missing, extras]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref: frameRef,
		className: "flex h-12 w-full items-center overflow-hidden",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			ref: clusterRef,
			className: "flex w-max items-center gap-3",
			style: {
				transform: `scale(${scale})`,
				transformOrigin: "left center"
			},
			children: [missing.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-2xs font-medium tracking-wide text-muted",
					children: "缺貨"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex items-center gap-1.5",
					children: missing.map((cents) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StampFace, {
						cents,
						size: "xs",
						muted: true
					}, cents))
				})]
			}) : null, extras.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-2xs font-medium tracking-wide text-primary",
					children: "自訂"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex items-center gap-1.5",
					children: extras.map((cents) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StampFace, {
						cents,
						size: "xs"
					}, cents))
				})]
			}) : null]
		})
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "h-dvh overflow-hidden bg-bg",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StampCalculator, {})
	});
}
//#endregion
export { Home as component };
