import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// Request ke backend lewat proxy, jadi browser menganggapnya satu origin:
// cookie session Sanctum jalan tanpa perlu setting CORS
const backend = 'http://127.0.0.1:8000'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': backend,
      '/sanctum': backend,
      '/login': { target: backend, bypass: (req) => (req.method === 'GET' ? req.url : undefined) },
      '/logout': backend,
    },
  },
})
