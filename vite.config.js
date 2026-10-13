import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    basicSsl(),
  ],
  server: {
    host: true, // Exposes server on local Wi-Fi IP so mobile devices can access it
  },
})
