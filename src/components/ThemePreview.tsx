import { useTheme, AppTheme } from "./services/ThemeContext";

// Mapping the simplified theme IDs to simple background classes for the preview box.
// This is now derived from the themes.ts file, which is exposed via the context.
const getPreviewStyle = (theme: AppTheme): string => {
  switch (theme.id) {
    case 'dark':
      return 'bg-slate-900 border-slate-700';
    case 'light':
      return 'bg-white border-slate-300 text-slate-900';
    case 'ocean':
      return 'bg-gradient-to-br from-cyan-700 to-blue-900';
    case 'neon':
      return 'bg-gradient-to-br from-violet-900 to-pink-700';
    default:
      return 'bg-gray-500';
  }
};

export default function ThemePreview() {
  const { theme, setTheme, themes } = useTheme();

  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      {themes.map((t) => (
        <div
          key={t.id}
          onClick={() => setTheme(t.id)}
          className={`h-24 rounded-xl cursor-pointer shadow-lg overflow-hidden relative border transition-all duration-300
            ${getPreviewStyle(t)} ${theme === t.id ? 'ring-4 ring-offset-2 ring-offset-slate-900 ring-amber-400' : ''}`}
        >
          {/* Animated Background Preview (only for animated themes) */}
          {t.gradientClass && (
            <div 
              className={`absolute inset-0 ${t.gradientClass} ${t.animationClass} bg-size-200`}
              style={{ animationDuration: '3s', animationIterationCount: 'infinite' }}
            ></div>
          )}

          {/* Label */}
          <div className={`absolute bottom-0 left-0 right-0 p-2 text-center text-xs font-semibold backdrop-blur-sm 
                         ${t.id === 'light' ? 'bg-slate-900/50 text-slate-100' : 'bg-slate-100/10 text-white'}`}
          >
            {t.label}
          </div>
        </div>
      ))}
    </div>
  );
}