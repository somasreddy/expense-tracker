/*import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const ThemeSwitcher = () => {
  const [theme, setTheme] = useState<"dark" | "light">(
    (localStorage.getItem("theme") as "dark" | "light") || "dark"
  );

  useEffect(() => {
    document.documentElement.classList.remove("dark", "light");
    document.documentElement.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <motion.button
      className="fixed bottom-4 right-4 z-50 button button-secondary shadow-lg"
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
    </motion.button>
  );
};

export default ThemeSwitcher;*/
// src/components/ThemeSwitcher.tsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../services/ThemeContext";

const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme, themes } = useTheme();
  const [open, setOpen] = useState(false);

  const current = themes.find((t) => t.id === theme);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Floating button */}
      <motion.button
        onClick={() => setOpen((o) => !o)}
        className="rounded-full px-4 py-2 text-sm font-medium shadow-lg border border-slate-700/70 bg-slate-900/90 text-amber-300 hover:bg-slate-800 flex items-center gap-2 backdrop-blur"
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-r from-amber-300 to-yellow-400" />
        {current ? current.label : "Theme"}
      </motion.button>

      {/* Theme menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            className="mt-2 w-44 rounded-2xl border border-slate-700/70 bg-slate-900/95 shadow-xl p-2 backdrop-blur-sm"
          >
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setTheme(t.id);
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                  t.id === theme
                    ? "bg-amber-500 text-slate-900"
                    : "text-slate-200 hover:bg-slate-800"
                }`}
              >
                {t.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ThemeSwitcher;
