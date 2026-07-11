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
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,woff2}"],
        navigateFallbackDenylist: [/^\/api\b/],
        runtimeCaching: [
          // Mídia same-origin apenas — NÃO interceptar CloudFront/S3 (quebra HLS e MP4 assinado).
          {
            urlPattern: ({ url, sameOrigin }) => {
              if (!sameOrigin) return false;
              const path = url.pathname;
              if (/\/api\/.*\/video(-url)?(\?|$)/.test(path)) return true;
              if (/\.(mp4|webm|m3u8|ts)(\?|$)/i.test(path)) return true;
              return false;
            },
            handler: 'NetworkOnly',
          },
          // Endpoints de API padrão (JSON) — NetworkFirst com cache curto.
          {
            urlPattern: ({ url }) =>
              url.pathname.startsWith('/api/') &&
              !/\/video(-url)?(\?|$)/.test(url.pathname),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'gastrocentro-api',
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
    rollupOptions: {
      output: {
        manualChunks: {
          // React core — raramente muda, fica em cache por muito tempo
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          // Tanstack Query — separado para cachear independente
          "vendor-query": ["@tanstack/react-query"],
          // Radix UI / shadcn — grande, raramente muda
          "vendor-ui": [
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-tooltip",
            "@radix-ui/react-tabs",
            "@radix-ui/react-select",
            "@radix-ui/react-label",
            "@radix-ui/react-slot",
            "@radix-ui/react-progress",
            "@radix-ui/react-avatar",
            "@radix-ui/react-accordion",
            "@radix-ui/react-popover",
          ],
          // Lucide icons — grande, raramente muda
          "vendor-icons": ["lucide-react"],
        },
      },
    },
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
      // Em dev o arquivo não está em public/; a VPS já serve /media/videos/*.mp4
      "/media": {
        target: process.env.VITE_MEDIA_ORIGIN ?? "https://institutogastrocentro.com.br",
        changeOrigin: true,
        secure: true,
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
