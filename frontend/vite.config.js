import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    host: '0.0.0.0',
    // Forward API calls to the Django backend during local development, so the
    // frontend can use the relative VITE_API_BASE_URL=/api/ (same URL shape as
    // production) instead of needing CORS.
    proxy: {
      '/api': {
        target: process.env.VITE_DEV_API_TARGET || 'http://127.0.0.1:9191',
        changeOrigin: true,
      },
    },
  },
})
