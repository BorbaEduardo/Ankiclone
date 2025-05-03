import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: '0.0.0.0', // Ensure it listens on all interfaces
    port: 5173,
    strictPort: true, // Optional: Prevent Vite from using another port if 5173 is busy
    hmr: {
      clientPort: 443 // Necessary for HMR through proxy
    },
    allowedHosts: [
      '5173-i90ssdjam22zs6qrwcg9u-99271a7c.manus.computer'
    ]
  }
})

