import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../services/ThemeContext";

const ThemeSwitcher: React.FC = () => {
  // Destructure properties including currentTheme, which holds all config
  const { theme, setTheme, themes, currentTheme } = useTheme();
  const [open, setOpen] = useState(false);
  
  // Style for animated swatches to ensure they move
  const animationStyle = { 
    animationDuration: '3s', 
    animationIterationCount: 'infinite' 
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Floating button */}
      <motion.button
        onClick={() => setOpen((o) => !o)}
        className={`rounded-full px-4 py-2 text-sm font-medium shadow-lg border border-slate-700/70 bg-slate-900/90 hover:bg-slate-800 flex items-center gap-2 backdrop-blur-sm 
                    ${currentTheme.textColor}
                    `}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Dynamic color swatch */}
        <span 
          className={`inline-block w-2 h-2 rounded-full border-2 border-white/50 
                      ${currentTheme.gradientClass} bg-size-200`} 
          style={currentTheme.animationClass ? animationStyle : {}}
        />
        {currentTheme.label}
      </motion.button>

      {/* Theme menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            className="mt-2 w-48 rounded-2xl border border-slate-700/70 bg-slate-900/95 shadow-xl p-2 backdrop-blur-sm absolute right-0 bottom-full mb-2"
          >
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setTheme(t.id);
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center gap-2 ${
                  t.id === theme
                    ? `${t.highlightClass}` // Use theme's highlight class
                    : "text-slate-200 hover:bg-slate-800"
                }`}
              >
                {/* Theme swatch in the dropdown */}
                <span 
                  // Use theme's gradient and animation classes
                  className={`inline-block w-2 h-2 rounded-full border border-slate-500 
                              ${t.gradientClass} ${t.animationClass} bg-size-200`} 
                  style={{ 
                    // Use a short animation duration for the swatch preview
                    animationDuration: t.animationClass ? '3s' : '0s', 
                    animationIterationCount: 'infinite' 
                  }}
                />
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