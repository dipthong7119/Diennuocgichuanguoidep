import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
    proxy: {
      '/auth': 'http://127.0.0.1:8000',
      '/ho-gia-dinh': 'http://127.0.0.1:8000',
      '/dong-ho': 'http://127.0.0.1:8000',
      '/chi-so': 'http://127.0.0.1:8000',
      '/ai-insight': 'http://127.0.0.1:8000',
      '/thong-ke': 'http://127.0.0.1:8000',
    },
  },
})

