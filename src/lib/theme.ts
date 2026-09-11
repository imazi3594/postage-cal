export const THEME_KEY = "stamp-calc-theme";
export type Theme = "light" | "dark";

const DARK_THEME_COLOR = "#121a16";
const LIGHT_THEME_COLOR = "#009247";
const TYPES_LIGHT_COLOR = "#7c3aed";
const TYPES_DARK_COLOR = "#16111c";
const CRISIS_LIGHT_COLOR = "#8b1e1e";
const CRISIS_DARK_COLOR = "#3a1212";

export function readTheme(): Theme {
  try {
    return localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) return;
  const crisis = root.classList.contains("crisis");
  const types = root.classList.contains("types");
  if (crisis) {
    meta.setAttribute("content", theme === "dark" ? CRISIS_DARK_COLOR : CRISIS_LIGHT_COLOR);
    return;
  }
  if (types) {
    meta.setAttribute("content", theme === "dark" ? TYPES_DARK_COLOR : TYPES_LIGHT_COLOR);
    return;
  }
  meta.setAttribute("content", theme === "dark" ? DARK_THEME_COLOR : LIGHT_THEME_COLOR);
}

export function applyCrisis(on: boolean) {
  document.documentElement.classList.toggle("crisis", on);
  applyTheme(readTheme());
}

export function applySolveMode(mode: "stamps" | "types") {
  document.documentElement.classList.toggle("types", mode === "types");
  applyTheme(readTheme());
}

export function setTheme(theme: Theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    /* ignore quota */
  }
  applyTheme(theme);
}

export function toggleTheme(): Theme {
  const next: Theme = readTheme() === "dark" ? "light" : "dark";
  setTheme(next);
  return next;
}
