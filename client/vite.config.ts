import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/items": "https://stellan-erp-api.onrender.com",
      "/reports": "https://stellan-erp-api.onrender.com",
      "/suppliers": "https://stellan-erp-api.onrender.com",
      "/purchases": "https://stellan-erp-api.onrender.com",
      "/stock": "https://stellan-erp-api.onrender.com",
      "/settings": "https://stellan-erp-api.onrender.com",
    },
  },
});