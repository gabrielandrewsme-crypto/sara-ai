import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "favicon.jpeg", "apple-touch-icon.png", "icon-192.png", "icon-512.png"],
      workbox: {
        navigateFallbackDenylist: [/^\/~oauth/],
        clientsClaim: true,
        skipWaiting: true,
      },
      manifest: {
        name: "Sara - Assistente Pessoal para TDAH",
        short_name: "Sara",
        description: "Sua assistente pessoal dedicada para pessoas com TDAH",
        start_url: "/",
        display: "standalone",
        background_color: "#f0faf9",
        theme_color: "#3d9b94",
        orientation: "portrait",
        icons: [
          {
            src: "/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
