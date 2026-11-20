import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // "@/..." apunta a "src/..." (evita los ../../../ entre carpetas)
      '@': path.resolve(import.meta.dirname, 'src'),
    },
  },
})