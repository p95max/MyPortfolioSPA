export type Theme = "dark" | "light";

const STORAGE_KEY = "portfolio-theme";

export function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "dark";

  const savedTheme = window.localStorage.getItem(STORAGE_KEY);
  if (savedTheme === "dark" || savedTheme === "light") return savedTheme;

  return window.matchMedia?.("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

export function applyTheme(theme: Theme, persist = true): void {
  if (typeof document === "undefined") return;

  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;

  if (persist) window.localStorage.setItem(STORAGE_KEY, theme);
}

export function initializeTheme(): Theme {
  const theme = getInitialTheme();
  applyTheme(theme, false);
  return theme;
}
