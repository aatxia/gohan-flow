import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
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
