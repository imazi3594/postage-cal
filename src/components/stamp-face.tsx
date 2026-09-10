import type { CSSProperties } from "react";
import { DEFAULT_CENTS, formatMoney } from "@/lib/postage";
import { cn } from "@/lib/utils";

function stampTone(cents: number): number {
  const known = DEFAULT_CENTS.indexOf(cents);
  return known >= 0 ? known : 0;
}

function customHue(cents: number): number {
  return (Math.imul(cents, 137) >>> 0) % 360;
}

export function StampFace({
  cents,
  count = 1,
  size = "md",
  muted = false,
  className,
  style,
}: {
  cents: number;
  count?: number;
  size?: "md" | "sm" | "xs";
  muted?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const label = formatMoney(cents);
  const custom = !DEFAULT_CENTS.includes(cents);

  return (
    <div
      className={cn(
        "relative",
        size === "sm" ? "w-full" : size === "xs" ? "w-14" : "w-20",
        className,
      )}
      style={style}
    >
      <div
        className="stamp-face"
        data-tone={stampTone(cents)}
        data-size={size}
        data-off={muted ? "true" : undefined}
        data-custom={custom ? "true" : undefined}
        style={custom ? ({ "--stamp-hue": String(customHue(cents)) } as CSSProperties) : undefined}
      >
        <span
          className={cn(
            "relative z-10 font-display font-semibold tabular-nums leading-none tracking-tight",
            size === "xs" ? "text-sm" : size === "sm" ? "text-lg" : "text-xl",
          )}
        >
          {label}
        </span>
      </div>
      {muted ? (
        <span className={cn("oos-tag", size === "xs" && "oos-tag-xs")} aria-hidden="true">
          缺貨
        </span>
      ) : null}
      {count > 1 ? (
        <span className="absolute top-0 right-0 z-10 flex h-7 min-w-7 items-center justify-center rounded-full bg-primary px-1.5 font-semibold text-xs tabular-nums text-primary-fg">
          ×{count}
        </span>
      ) : null}
    </div>
  );
}
