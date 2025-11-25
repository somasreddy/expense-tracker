// src/services/themes.ts

export type ThemeId =
  | "dark"
  | "light"
  | "ocean"
  | "neon"
  | "sunset"
  | "forest"
  | "midnight"
  | "matrix"
  | "cyberpunk"
  | "vaporwave"
  | "nebula"
  | "solar"
  | "quantum"
  | "aurora"
  | "volcano"
  | "gold";

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
  // --- STANDARD ---
  {
    id: "dark",
    label: "Neo Dark",
    gradientClass: "bg-slate-950",
    animationClass: "",
    textColor: "text-amber-400",
    highlightClass: "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20",
    accentClass: "from-amber-300 via-orange-400 to-red-500",
  },
  {
    id: "light",
    label: "Soft Light",
    gradientClass: "bg-slate-50",
    animationClass: "",
    textColor: "text-blue-600",
    highlightClass: "bg-blue-600 text-white shadow-lg shadow-blue-600/20",
    accentClass: "from-blue-600 via-indigo-500 to-violet-500",
  },
  {
    id: "midnight",
    label: "Midnight OLED",
    gradientClass: "bg-black",
    animationClass: "",
    textColor: "text-white",
    highlightClass: "bg-white text-black shadow-lg shadow-white/10",
    accentClass: "from-white via-slate-300 to-slate-500",
  },

  // --- ANIMATED ---
  {
    id: "ocean",
    label: "Ocean Blue",
    gradientClass: "animate-gradient-deep-ocean",
    animationClass: "animate-shift bg-size-200",
    textColor: "text-cyan-400",
    highlightClass: "bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20",
    accentClass: "from-cyan-300 via-blue-400 to-indigo-500",
  },
  {
    id: "neon",
    label: "Purple Neon",
    gradientClass: "animate-gradient-northern-lights",
    animationClass: "animate-shift bg-size-200",
    textColor: "text-fuchsia-400",
    highlightClass: "bg-fuchsia-500 text-white shadow-lg shadow-fuchsia-500/20",
    accentClass: "from-fuchsia-400 via-purple-500 to-indigo-500",
  },
  {
    id: "sunset",
    label: "Sunset Glow",
    gradientClass: "animate-gradient-sunset",
    animationClass: "animate-shift bg-size-200",
    textColor: "text-orange-400",
    highlightClass: "bg-orange-500 text-white shadow-lg shadow-orange-500/20",
    accentClass: "from-orange-400 via-red-500 to-pink-500",
  },
  {
    id: "forest",
    label: "Deep Forest",
    gradientClass: "animate-gradient-forest",
    animationClass: "animate-shift bg-size-200",
    textColor: "text-emerald-400",
    highlightClass: "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20",
    accentClass: "from-emerald-400 via-green-500 to-teal-500",
  },

  // --- CINEMATIC ---
  {
    id: "matrix",
    label: "The Matrix",
    gradientClass: "animate-gradient-matrix",
    animationClass: "animate-shift bg-size-200",
    textColor: "text-green-500",
    highlightClass: "bg-green-500 text-black shadow-lg shadow-green-500/20",
    accentClass: "from-green-400 via-emerald-500 to-green-600",
  },
  {
    id: "cyberpunk",
    label: "Cyberpunk City",
    gradientClass: "animate-gradient-cyberpunk",
    animationClass: "animate-shift bg-size-200",
    textColor: "text-pink-500",
    highlightClass: "bg-pink-600 text-white shadow-lg shadow-pink-600/20",
    accentClass: "from-pink-500 via-red-500 to-yellow-500",
  },
  {
    id: "vaporwave",
    label: "Vaporwave Retro",
    gradientClass: "animate-gradient-vaporwave",
    animationClass: "animate-shift bg-size-200",
    textColor: "text-cyan-400",
    highlightClass: "bg-cyan-400 text-slate-900 shadow-lg shadow-cyan-400/20",
    accentClass: "from-pink-400 via-purple-400 to-cyan-400",
  },

  // --- SCIENTIFIC / SPACE ---
  {
    id: "nebula",
    label: "Deep Nebula",
    gradientClass: "animate-gradient-nebula",
    animationClass: "animate-shift bg-size-200",
    textColor: "text-violet-400",
    highlightClass: "bg-violet-500 text-white shadow-lg shadow-violet-500/20",
    accentClass: "from-violet-400 via-fuchsia-500 to-indigo-500",
  },
  {
    id: "solar",
    label: "Solar Flare",
    gradientClass: "animate-gradient-solar",
    animationClass: "animate-shift bg-size-200",
    textColor: "text-orange-500",
    highlightClass: "bg-orange-600 text-white shadow-lg shadow-orange-600/20",
    accentClass: "from-yellow-500 via-orange-500 to-red-600",
  },
  {
    id: "quantum",
    label: "Quantum Lab",
    gradientClass: "animate-gradient-quantum",
    animationClass: "animate-shift bg-size-200",
    textColor: "text-sky-600",
    highlightClass: "bg-sky-500 text-white shadow-lg shadow-sky-500/20",
    accentClass: "from-sky-400 via-cyan-500 to-blue-500",
  },

  // --- NATURE ---
  {
    id: "aurora",
    label: "Aurora Borealis",
    gradientClass: "animate-gradient-aurora",
    animationClass: "animate-shift bg-size-200",
    textColor: "text-teal-400",
    highlightClass: "bg-teal-500 text-white shadow-lg shadow-teal-500/20",
    accentClass: "from-teal-400 via-emerald-400 to-cyan-500",
  },
  {
    id: "volcano",
    label: "Volcano Ash",
    gradientClass: "animate-gradient-volcano",
    animationClass: "animate-shift bg-size-200",
    textColor: "text-red-500",
    highlightClass: "bg-red-600 text-white shadow-lg shadow-red-600/20",
    accentClass: "from-red-500 via-orange-600 to-stone-500",
  },

  // --- LUXURY ---
  {
    id: "gold",
    label: "Luxury Gold",
    gradientClass: "animate-gradient-gold",
    animationClass: "animate-shift bg-size-200",
    textColor: "text-amber-500",
    highlightClass: "bg-amber-500 text-black shadow-lg shadow-amber-500/20",
    accentClass: "from-amber-300 via-yellow-500 to-amber-600",
  },
];

export type AppTheme = ThemeConfig;

export const getThemeById = (id: ThemeId): ThemeConfig => {
  return AVAILABLE_THEMES.find((t) => t.id === id) || AVAILABLE_THEMES[0];
};