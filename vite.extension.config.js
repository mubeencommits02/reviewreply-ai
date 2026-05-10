import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'dist-extension',
    rollupOptions: {
      input: {
        sidepanel: resolve(__dirname, 'extension/sidepanel.html'),
        background: resolve(__dirname, 'src/extension/background.js'),
        contentScript: resolve(__dirname, 'src/extension/contentScript.js'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'background' || chunkInfo.name === 'contentScript') {
            return '[name].js';
          }
          return 'assets/[name]-[hash].js';
        },
      },
    },
  },
});
