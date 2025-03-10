import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: 'build',
    sourcemap: false
  },
  base: "/alduindev/",
  plugins: [react()],
  optimizeDeps: {
    include: ['esm-dep > cjs-dep'],
  },
});
