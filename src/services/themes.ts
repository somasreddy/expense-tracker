// src/services/themes.ts

export type ThemeId = "dark" | "light" | "ocean" | "neon";

export interface ThemeConfig {
  id: ThemeId;
  label: string;
  gradientClass: string;   // Body background
  animationClass: string;  // Animation speed/type
  textColor: string;       // Switcher button text
  highlightClass: string;  // Dropdown active item
  accentClass: string;     // New: For the H1 Title Gradient
}

export const THEME_STORAGE_KEY = "expenseTracker_theme";
export const defaultThemeId: ThemeId = "dark";

export const AVAILABLE_THEMES: ThemeConfig[] = [
  { 
    id: "dark", 
    label: "Neo Dark",
    gradientClass: "bg-slate-950",
    animationClass: "",
    textColor: "text-amber-300",
    highlightClass: "bg-amber-500 text-slate-900",
    accentClass: "from-amber-200 via-yellow-400 to-orange-500",
  },
  { 
    id: "light", 
    label: "Soft Light",
    gradientClass: "bg-slate-50",
    animationClass: "",
    textColor: "text-blue-600",
    highlightClass: "bg-blue-500 text-white",
    accentClass: "from-blue-600 via-cyan-500 to-teal-500", // Darker gradient for white bg
  },
  { 
    id: "ocean", 
    label: "Ocean Blue",
    gradientClass: "animate-gradient-deep-ocean", 
    animationClass: "animate-shift bg-size-200",
    textColor: "text-cyan-400",
    highlightClass: "bg-cyan-500 text-slate-900",
    accentClass: "from-cyan-300 via-blue-400 to-indigo-400",
  },
  { 
    id: "neon", 
    label: "Purple Neon",
    gradientClass: "animate-gradient-northern-lights", 
    animationClass: "animate-shift bg-size-200",
    textColor: "text-purple-300",
    highlightClass: "bg-purple-500 text-white",
    accentClass: "from-fuchsia-400 via-purple-400 to-violet-500",
  },
];

export type AppTheme = ThemeConfig;

export const getThemeById = (id: ThemeId): ThemeConfig => {
  return AVAILABLE_THEMES.find((t) => t.id === id) || AVAILABLE_THEMES[0];
};