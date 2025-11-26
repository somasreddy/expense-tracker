import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";

export default defineConfig({
  plugins: [react()],
  // IMPORTANT: for GitHub Pages + subfolder
  base: "/expense-tracker/",
  css: {
    postcss: {
      plugins: [
        tailwindcss,
        autoprefixer,
      ],
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-is"],
          "vendor-charts": ["recharts"],
          "vendor-firebase": ["firebase/app", "firebase/auth", "firebase/firestore"],
          "vendor-supabase": ["@supabase/supabase-js"],
          "vendor-ui": ["framer-motion", "lucide-react"],
          "vendor-capacitor": ["@capacitor/core", "@capacitor/app"],
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Increase warning limit to 1MB
  },
});
