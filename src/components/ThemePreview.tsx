import { useTheme } from "../services/ThemeContext";

const themeStyles: Record<string, string> = {
  dark: "bg-[#0f172a]",
  light: "bg-white border",
  amber: "bg-gradient-to-br from-amber-700 to-amber-400",
  neon: "bg-[#001b44]",
  amoled: "bg-black",
  pastel: "bg-[#e3f2fd]",
  glass: "backdrop-blur-md bg-white/20",
  gaming: "bg-gradient-to-br from-red-800 to-black",
  midnight: "bg-[#18043b]",
  emerald: "bg-[#bbf7d0]",
  sunset: "bg-gradient-to-br from-yellow-300 to-orange-500",
};

export default function ThemePreview() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="grid grid-cols-3 gap-3 p-4">
      {Object.keys(themeStyles).map((t) => (
        <div
          key={t}
          onClick={() => setTheme(t)}
          className={`h-20 rounded-xl cursor-pointer shadow-lg overflow-hidden relative 
            ${themeStyles[t]} ${theme === t ? "ring-4 ring-amber-400" : ""}`}
        >
          <div className="absolute bottom-1 left-1 text-xs text-white font-semibold">
            {t}
          </div>
        </div>
      ))}
    </div>
  );
}
