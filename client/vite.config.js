import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['img1.png'],
      manifest: {
        name: 'InterviewIQ.AI',
        short_name: 'InterviewIQ',
        description: 'AI-powered mock interview preparation platform',
        theme_color: '#0d9488',
        background_color: '#f8fafc',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          { src: 'img1.png', sizes: '192x192', type: 'image/png' },
          { src: 'img1.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.deepgram\.com\/.*/i,
            handler: 'NetworkOnly',
          },
          {
            urlPattern: /^http:\/\/localhost:8000\/.*/i,
            handler: 'NetworkOnly',
          },
        ],
      },
    }),
  ],
})
