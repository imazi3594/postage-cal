import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { applyTheme, readTheme, toggleTheme, type Theme } from "@/lib/theme";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const current = readTheme();
    setTheme(current);
    applyTheme(current);
  }, []);

  return (
    <button
      type="button"
      aria-label={theme === "dark" ? "切換至淺色" : "切換至深色"}
      onClick={() => setTheme(toggleTheme())}
      className="inline-flex size-10 shrink-0 items-center justify-center rounded-md text-ink transition-[background-color] duration-(--motion-quick) ease-(--ease-smooth-out) hover:bg-surface-2"
    >
      {theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </button>
  );
}
