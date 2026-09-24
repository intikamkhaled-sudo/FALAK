import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

import packageJson from "./package.json" with { type: "json" };

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      registerType: "autoUpdate",

      includeAssets: [
        "aqsa.png",
        "favicon.ico",
        "falak-192.png",
        "falak-512.png",
      ],

      manifest: {
        name: "Falak",
        short_name: "Falak",

        description:
          "Astronomy-based Islamic prayer times, Hijri calendar, crescent visibility and Qibla companion.",

        theme_color: "#08101f",
        background_color: "#08101f",

        display: "standalone",

        orientation: "portrait-primary",

        start_url: "/",

        scope: "/",

        icons: [
          {
            src: "/falak-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/falak-512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/falak-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },

      workbox: {
        cleanupOutdatedCaches: true,

        globPatterns: ["**/*.{js,css,html,png,svg,ico,woff2}"],
      },

      devOptions: {
        enabled: false,
      },
    }),
  ],

  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
  },
});
