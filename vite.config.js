import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// No proxy by design: the frontend calls the backend directly and the
// backend enables CORS for this origin. The backend URL lives in src/config.js.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
  },
  preview: {
    port: 5173,
    strictPort: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
