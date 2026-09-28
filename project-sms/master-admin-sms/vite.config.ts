import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Distinct from project-sms/client's default 5173, so both apps can run
    // side by side in local dev without a port clash.
    port: 5174,
  },
})