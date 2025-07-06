import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,  // listen on 0.0.0.0
    port: 5173,
    hmr: { host: 'localhost', protocol: 'ws', clientPort: 5173 },
    proxy: {
      '/api': { target: 'http://backend:5000', changeOrigin: true },
    },
  },
})