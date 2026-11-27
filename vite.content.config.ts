import { defineConfig } from 'vite';

/**
 * Chrome runs content scripts as classic scripts, which cannot `import`. The content script is therefore built
 * on its own into one self-contained file, after the main build (which empties dist/ first).
 */
export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    lib: {
      entry: 'src/content.ts',
      formats: ['iife'],
      name: 'AnkiWordFlowContent',
      fileName: () => 'assets/content.js',
    },
  },
});
