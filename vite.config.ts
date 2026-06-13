import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
// `base` matches the GitHub Pages project path so assets resolve correctly.
export default defineConfig({
  base: "/triple-tic-tac-toe/",
  plugins: [react(), tailwindcss()],
});
