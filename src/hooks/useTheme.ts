import { useCallback, useState } from "react";
import type { Theme } from "@/components/ui/apple-liquid-glass-switcher";

const STORAGE_KEY = "am-theme";
const THEME_COLORS: Record<Theme, string> = { light: "#f5f5f7", dark: "#000000" };

function readTheme(): Theme {
  const t = document.documentElement.dataset.theme;
  return t === "dark" ? "dark" : "light";
}

/** Theme is applied to <html> before first paint by the script in index.html. */
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(readTheme);

  const setTheme = useCallback((next: Theme) => {
    const el = document.documentElement;
    el.dataset.theme = next;
    el.classList.toggle("dark", next === "dark");
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLORS[next]);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage can be unavailable (private mode); the theme still applies for this visit.
    }
    setThemeState(next);
  }, []);

  return { theme, setTheme };
}
