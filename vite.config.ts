import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: 'index.html',
        options: 'options.html',
        tooltip: 'tooltip.html',
        content: 'src/content.ts',
        background: 'src/back/background.ts',
      },
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',
      },
    },
  },
});