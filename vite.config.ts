import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: 'localhost',
    hmr: {
      host: 'localhost',
    }
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 5000000 // 5MB
      },
      manifest: {
        name: 'Antigravity E-Commerce',
        short_name: 'Antigravity',
        description: 'Multi-Vendor AI-Powered E-Commerce Platform',
        theme_color: '#000000',
        icons: []
      }
    }),
    tailwindcss()
  ],
})
