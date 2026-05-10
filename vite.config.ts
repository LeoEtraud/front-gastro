import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

/** Porta do dev server do Vite (use VITE_PORT; PORT costuma ser da API). */
const rawPort = process.env.VITE_PORT ?? "5173";
const port = Number(rawPort);
if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

let basePath = process.env.BASE_PATH ?? "/";
if (basePath !== "/" && !basePath.endsWith("/")) {
  basePath = `${basePath}/`;
}

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      injectRegister: "script",
      registerType: "autoUpdate",
      includeAssets: ["favicon.png", "images/doctor-abstract.png", "images/hero-bg.png"],
      manifest: {
        name: "GastroCentro — Plataforma de cursos médicos",
        short_name: "GastroCentro",
        description:
          "Cursos, materiais e comunidade focada em educação médica de qualidade.",
        lang: "pt-BR",
        dir: "ltr",
        theme_color: "#0f172a",
        background_color: "#f8fafc",
        display: "standalone",
        orientation: "portrait-primary",
        scope: basePath,
        start_url: basePath,
        icons: [
          {
            src: "favicon.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "favicon.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,woff2}"],
        navigateFallbackDenylist: [/^\/api\b/],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith("/api/"),
            handler: "NetworkFirst",
            options: {
              cacheName: "gastrocentro-api",
              networkTimeoutSeconds: 10,
              expiration: { maxEntries: 64, maxAgeSeconds: 60 * 5 },
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
    proxy: {
      "/api": {
        target: process.env.VITE_API_ORIGIN ?? "http://127.0.0.1:8080",
        changeOrigin: true,
      },
    },
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
