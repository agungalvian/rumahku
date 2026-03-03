import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // Use 'autoUpdate' so the service worker updates silently in the background.
      // The app's custom banner (useRegisterSW) will still prompt on activate.
      registerType: 'prompt',
      injectRegister: 'auto',

      // Workbox config: cache app shell + Tapera API responses
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2}'],
        runtimeCaching: [
          {
            // Cache the Tapera API for 10 minutes (stale-while-revalidate)
            urlPattern: /^\/api\/tapera\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'tapera-api-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 600 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Cache Google Fonts
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },

      // Web App Manifest
      manifest: {
        name: 'rumahku – Rumah Subsidi & KPR Tapera',
        short_name: 'rumahku',
        description: 'Temukan dan ajukan KPR rumah subsidi dengan mudah bersama rumahku.',
        theme_color: '#2563EB',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        lang: 'id',
        icons: [
          { src: '/icons/pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        screenshots: [
          {
            src: '/icons/pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Halaman Utama rumahku',
          },
        ],
      },

      devOptions: {
        enabled: true, // enable SW in dev for testing
      },
    }),
  ],

  server: {
    proxy: {
      '/api/tapera': {
        target: 'https://sikumbang.tapera.go.id',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/tapera/, ''),
      },
    },
  },
})
