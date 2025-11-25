import { useTheme, AppTheme } from "../services/ThemeContext";

export default function ThemePreview() {
  const { theme, setTheme, themes } = useTheme();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
      {themes.map((t) => (
        <div
          key={t.id}
          onClick={() => setTheme(t.id)}
          className={`h-24 rounded-xl cursor-pointer shadow-lg overflow-hidden relative border transition-all duration-300 transform hover:scale-105
            ${theme === t.id ? 'ring-4 ring-offset-2 ring-offset-[var(--bg-body)] ring-[var(--text-highlight)]' : 'border-[var(--border-subtle)] hover:border-[var(--text-highlight)]'}
          `}
        >
          {/* Background Preview */}
          <div
            className={`absolute inset-0 ${t.gradientClass} ${t.animationClass} bg-size-200`}
            style={{ animationDuration: '6s', animationIterationCount: 'infinite' }}
          ></div>

          {/* Label Overlay */}
          <div className="absolute inset-0 flex items-end justify-center">
            <div className="w-full p-2 text-center text-xs font-bold backdrop-blur-md bg-black/30 text-white truncate">
              {t.label}
            </div>
          </div>

          {/* Active Indicator Icon */}
          {theme === t.id && (
            <div className="absolute top-2 right-2 bg-[var(--text-highlight)] text-[var(--bg-body)] rounded-full p-1 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}