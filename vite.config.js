import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: 'build',
    sourcemap: false
  },
  base: "/alduin/",
  plugins: [react()],
  optimizeDeps: {
    include: ['three', '@react-three/fiber', '@react-three/drei', 'react', 'react-dom', 'react-router-dom']
  },
  define: {
    'process.env': {
      VITE_GEMINI_API_URL: process.env.VITE_GEMINI_API_URL,
    }
  }
});
