import { defineConfig } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import checker from 'vite-plugin-checker';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), checker({ typescript: true })],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    // face-api.js alone is ~640 kB minified; dynamic import isolates it from the main bundle.
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        // face-api is large; without this Rollup hoists it into the entry chunk because the Webcam
        // async chunk shares other imports with the main bundle.
        manualChunks(id) {
          if (id.includes('node_modules') && id.includes('face-api')) {
            return 'face-api';
          }
        },
      },
    },
  },
});
