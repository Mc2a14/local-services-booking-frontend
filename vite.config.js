import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  },
  preview: {
    port: 8080,
    host: true,
    allowedHosts: [
      'local-services-booking-frontend-production.up.railway.app',
      '.up.railway.app', // Allow all Railway subdomains
      'atencio.app',
      'www.atencio.app'
    ]
  }
})


