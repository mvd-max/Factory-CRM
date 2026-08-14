import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/items": "http://localhost:5000",
      "/reports": "http://localhost:5000",
      "/suppliers": "http://localhost:5000",
      "/purchases": "http://localhost:5000",
      "/stock": "http://localhost:5000",
      "/settings": "http://localhost:5000",
    },
  },
});