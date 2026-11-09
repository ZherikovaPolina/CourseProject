import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      external: [
        'electron',
        'electron-squirrel-startup',
        'node:sqlite',
        'node:path',
        'node:fs'
      ]
    }
  }
});