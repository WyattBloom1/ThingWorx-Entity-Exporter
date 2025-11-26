import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
        '/api': {
          target: "http://localhost:5000",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '/api'),
        },
      },
  },
//   build: {
//     outDir: '../api/static', // Output to a 'dist' folder outside the Vite project, alongside Flask
//     assetsDir: 'assets', // Place assets in a 'static' subfolder within 'dist'
//     emptyOutDir: true, // Clear the output directory before building
//   },
})