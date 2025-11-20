import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useMemo,
} from "react";
// 🛑 Import theme types and utilities from the new file
import { ThemeId, AppTheme, AVAILABLE_THEMES, THEME_STORAGE_KEY, getThemeById, defaultThemeId } from "./themes";

// Ensure this file exports the necessary theme types if other files depend on it
export type { ThemeId, AppTheme };

interface ThemeContextValue {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
  themes: AppTheme[];
  currentTheme: AppTheme; // 🛑 Exposes the full theme object
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
  const [themeId, setThemeId] = useState<ThemeId>(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeId | null;
    // Check if the saved theme ID is one of the available themes
    return saved && AVAILABLE_THEMES.some((t) => t.id === saved)
      ? saved
      : defaultThemeId;
  });

  // Calculate the current theme object based on the stored ID
  const currentTheme = useMemo(() => getThemeById(themeId), [themeId]);

  const setTheme = (next: ThemeId) => {
    setThemeId(next);
    localStorage.setItem(THEME_STORAGE_KEY, next);
  };

  // Set the data-theme attribute on the root HTML element
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", currentTheme.id);
  }, [currentTheme.id]);

  return (
    <ThemeContext.Provider
      value={{ theme: themeId, setTheme, themes: AVAILABLE_THEMES, currentTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
};