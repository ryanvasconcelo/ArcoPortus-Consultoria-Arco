import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true, // Necessário para expor o servidor no Docker
    port: 5174,
    watch: {
      usePolling: true, // Ajuda na detecção de mudanças de arquivo dentro do Docker
    },
  },
})