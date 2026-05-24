import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'gohan-flow.onrender.com'
    ]
  },
  preview: {
    allowedHosts: [
      'gohan-flow.onrender.com'
    ]
  }
})
