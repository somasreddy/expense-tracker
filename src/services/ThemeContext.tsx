// src/services/ThemeContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

export type ThemeId = "dark" | "light" | "ocean" | "neon";

interface ThemeConfig {
  id: ThemeId;
  label: string;
}

const AVAILABLE_THEMES: ThemeConfig[] = [
  { id: "dark", label: "Neo Dark" },
  { id: "light", label: "Soft Light" },
  { id: "ocean", label: "Ocean Blue" },
  { id: "neon", label: "Purple Neon" },
];

const THEME_STORAGE_KEY = "expenseTracker_theme";

interface ThemeContextValue {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
  themes: ThemeConfig[];
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const useTheme = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<ThemeId>(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeId | null;
    return saved && AVAILABLE_THEMES.some((t) => t.id === saved)
      ? saved
      : "dark";
  });

  const setTheme = (next: ThemeId) => {
    setThemeState(next);
    localStorage.setItem(THEME_STORAGE_KEY, next);
  };

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{ theme, setTheme, themes: AVAILABLE_THEMES }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
