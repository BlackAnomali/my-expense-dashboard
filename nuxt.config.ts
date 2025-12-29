import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  // Menonaktifkan SSR agar data Google Sheets diproses di browser (mengatasi Error 500)
  ssr: false,

  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  css: ["~/assets/css/tailwind.css"],
  
  vite: {
    plugins: [tailwindcss()],
  },

  modules: ["shadcn-nuxt", "@pinia/nuxt", "@vite-pwa/nuxt"],

  shadcn: {
    prefix: "",
    componentDir: "@/components/ui",
  },

  pwa: {
    registerType: "autoUpdate",
    includeManifestIcons: false, 
    manifest: {
      name: "Expense Tracker",
      short_name: "ExpenseApp",
      description: "Personal expense tracking application with insights and analytics",
      theme_color: "#3B82F6",
      background_color: "#ffffff",
      display: "standalone",
      orientation: "portrait",
      scope: "/",
      start_url: "/",
      id: "expense-tracker-pwa",
      icons: [
        {
          src: "/icon-192x192.png",
          sizes: "192x192",
          type: "image/png",
          purpose: "any maskable",
        },
        {
          src: "/icon-512x512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any maskable",
        },
      ],
      categories: ["finance", "productivity", "utilities"],
    },
    workbox: {
      globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
      navigateFallback: "/",
      navigateFallbackDenylist: [/^\/api\//],
      cleanupOutdatedCaches: true,
    },
    devOptions: {
      enabled: true,
      suppressWarnings: true,
      type: "module",
    },
  },

  runtimeConfig: {
    public: {
      // Fallback string kosong mencegah error 'undefined'
      googleSheetId: process.env.GOOGLE_SHEET_ID || '',
      googleApiKey: process.env.GOOGLE_API_KEY || '',
    },
  },

  app: {
    head: {
      viewport: "width=device-width, initial-scale=1, viewport-fit=cover",
      charset: "utf-8",
      meta: [
        { name: "format-detection", content: "telephone=no" },
        { name: "msapplication-TileColor", content: "#3B82F6" },
        { name: "apple-mobile-web-app-capable", content: "yes" },
        { name: "apple-mobile-web-app-status-bar-style", content: "default" },
      ],
      link: [
        { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
        // Manifest ditangani otomatis oleh @vite-pwa/nuxt
      ],
    },
  },
});
