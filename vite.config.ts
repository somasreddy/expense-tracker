import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/expense-tracker/",
  //base: "/",  // FIX for local dev
});
