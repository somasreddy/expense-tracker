import { useTheme } from "../services/ThemeContext";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const themes = [
  "light",
  "dark",
  "amber",
  "neon",
  "amoled",
  "pastel",
  "glass",
  "gaming",
  "midnight",
  "emerald",
  "sunset",
];

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="p-3 rounded-full shadow-lg"
        style={{ backgroundColor: "var(--accent)" }}
      >
        🎨
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 5 }}
            exit={{ opacity: 0, y: 15 }}
            transition={{ duration: 0.2 }}
            className="mt-2 p-4 rounded-xl shadow-xl card-surface border border-white/10 backdrop-blur-xl"
          >
            <h3 className="font-bold mb-2 text-sm">Select Theme</h3>

            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto custom-scrollbar">
              {themes.map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setTheme(t);
                    setOpen(false);
                  }}
                  className={`px-3 py-2 rounded-lg text-left text-sm shadow 
                    ${theme === t ? "font-bold" : ""}`}
                  style={{
                    background:
                      theme === t ? "var(--accent)" : "var(--card)",
                    color: theme === t ? "#000" : "var(--text)",
                  }}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
