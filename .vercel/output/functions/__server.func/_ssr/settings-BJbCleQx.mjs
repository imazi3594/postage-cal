import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { _ as Link, y as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Minus, i as Plus, r as RotateCcw, s as ChevronLeft } from "../_libs/lucide-react.mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { a as cn, c as parseAmountToCents, l as patchSaved, o as formatMoney, r as StampFace, s as loadSaved, t as DEFAULT_CENTS } from "./stamp-settings-BAklc8aY.mjs";
import { t as Slot } from "../_libs/radix-ui__react-slot.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/settings-BJbCleQx.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-[background-color,color,box-shadow,transform,opacity] duration-(--motion-quick) ease-(--ease-smooth-out) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:not-disabled:scale-(--scale-press)", {
	variants: {
		variant: {
			default: "bg-primary text-primary-fg shadow-sm hover:bg-stamp-ink",
			secondary: "bg-surface-2 text-ink hover:bg-border",
			outline: "bg-surface text-ink shadow-(--shadow-border) hover:bg-surface-2",
			ghost: "text-ink hover:bg-surface-2",
			soft: "bg-primary-soft text-stamp-ink hover:bg-primary/15"
		},
		size: {
			default: "h-11 px-4 text-sm",
			sm: "h-9 px-3 text-sm",
			lg: "h-12 px-5 text-base",
			icon: "size-11"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
function Button({ className, variant, size, asChild = false, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size
		}), className),
		...props
	});
}
function Input({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		className: cn("flex h-11 w-full rounded-md bg-surface px-3 text-base text-ink shadow-(--shadow-border)", "placeholder:text-subtle", "transition-[box-shadow] duration-(--motion-quick) ease-(--ease-smooth-out)", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35", "disabled:cursor-not-allowed disabled:opacity-50", className),
		...props
	});
}
function SettingsPage() {
	const [hydrated, setHydrated] = (0, import_react.useState)(false);
	const [enabled, setEnabled] = (0, import_react.useState)([...DEFAULT_CENTS]);
	const [extras, setExtras] = (0, import_react.useState)([]);
	const [custom, setCustom] = (0, import_react.useState)("");
	const [toast, setToast] = (0, import_react.useState)("");
	const toastTimer = (0, import_react.useRef)(0);
	const lastTap = (0, import_react.useRef)(0);
	(0, import_react.useEffect)(() => {
		const saved = loadSaved();
		setEnabled(saved.enabled);
		setExtras(saved.extras);
		setHydrated(true);
	}, []);
	(0, import_react.useEffect)(() => {
		if (!hydrated) return;
		patchSaved({
			enabled,
			extras
		});
	}, [
		enabled,
		extras,
		hydrated
	]);
	(0, import_react.useEffect)(() => () => window.clearTimeout(toastTimer.current), []);
	function showToast(message) {
		setToast(message);
		window.clearTimeout(toastTimer.current);
		toastTimer.current = window.setTimeout(() => setToast(""), 1800);
	}
	function tap(action) {
		lastTap.current = Date.now();
		action();
	}
	function onStampPointerDown(event, action) {
		if (event.pointerType === "mouse" && event.button !== 0) return;
		event.preventDefault();
		tap(action);
	}
	function onStampClick(action) {
		if (Date.now() - lastTap.current < 400) return;
		tap(action);
	}
	function toggleDenom(cents) {
		setEnabled((prev) => prev.includes(cents) ? prev.filter((c) => c !== cents) : [...prev, cents].sort((a, b) => a - b));
	}
	function addCustom() {
		const cents = parseAmountToCents(custom);
		if (cents === null || cents === 0) {
			showToast("請輸入有效面額，例如 2.4");
			return;
		}
		if (DEFAULT_CENTS.includes(cents) || extras.includes(cents)) {
			showToast("呢個面額已經有");
			if (!enabled.includes(cents) && DEFAULT_CENTS.includes(cents)) setEnabled((prev) => [...prev, cents].sort((a, b) => a - b));
			return;
		}
		setExtras((prev) => [...prev, cents].sort((a, b) => a - b));
		setCustom("");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative mx-auto flex w-full max-w-lg flex-col gap-5 px-4 py-8 sm:px-6 sm:py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "stagger-in flex items-start gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					"aria-label": "返回計數機",
					className: "mt-1 inline-flex size-11 shrink-0 items-center justify-center rounded-md text-ink transition-[background-color] duration-(--motion-quick) ease-(--ease-smooth-out) hover:bg-surface-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-5" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 pt-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium tracking-mark text-primary",
							children: "HONGKONG POST"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-2 font-sans text-4xl font-semibold tracking-tight text-ink",
							children: "設定"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-muted",
							children: "揀計數機用邊啲郵票面額。"
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "stagger-in rounded-xl bg-surface p-5 shadow-(--shadow-border)",
				style: { animationDelay: "80ms" },
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-sans text-xl font-semibold",
							children: "可用面額"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted",
							children: "熄咗嘅面額唔會用。只計剛好湊齊嘅組合。"
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "outline",
								size: "sm",
								onClick: () => setEnabled([...DEFAULT_CENTS]),
								children: "全選預設"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								type: "button",
								variant: "ghost",
								size: "sm",
								onClick: () => {
									setEnabled([...DEFAULT_CENTS]);
									setExtras([]);
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, {}), "重設"]
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 grid grid-cols-4 gap-2",
						children: DEFAULT_CENTS.map((cents) => {
							const on = enabled.includes(cents);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-pressed": on,
								"aria-label": formatMoney(cents),
								onPointerDown: (event) => onStampPointerDown(event, () => toggleDenom(cents)),
								onClick: () => onStampClick(() => toggleDenom(cents)),
								className: "touch-manipulation rounded-sm transition-[opacity,filter] duration-(--motion-quick) ease-(--ease-smooth-out) hover:opacity-90",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StampFace, {
									cents,
									size: "sm",
									muted: !on
								})
							}, cents);
						})
					}),
					extras.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 grid grid-cols-4 gap-2",
						children: extras.map((cents) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							"aria-label": `移除 ${formatMoney(cents)}`,
							onPointerDown: (event) => onStampPointerDown(event, () => setExtras((prev) => prev.filter((c) => c !== cents))),
							onClick: () => onStampClick(() => setExtras((prev) => prev.filter((c) => c !== cents))),
							className: "relative touch-manipulation rounded-sm",
							title: "移除自訂面額",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StampFace, {
								cents,
								size: "sm"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "absolute -top-2 -right-2 z-10 flex size-7 items-center justify-center rounded-full bg-primary text-primary-fg",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, { className: "size-3.5" })
							})]
						}, cents))
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "mt-4 flex flex-col gap-2 sm:flex-row",
						onSubmit: (event) => {
							event.preventDefault();
							addCustom();
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: custom,
							onChange: (event) => setCustom(event.target.value),
							placeholder: "自訂面額，例如 2.4",
							inputMode: "decimal",
							"aria-label": "自訂郵票面額",
							className: "sm:max-w-56"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "submit",
							variant: "secondary",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {}), "加入面額"]
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
function Settings() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "min-h-dvh bg-bg",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsPage, {})
	});
}
//#endregion
export { Settings as component };
