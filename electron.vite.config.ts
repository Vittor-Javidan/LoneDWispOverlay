import react from '@vitejs/plugin-react'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import { resolve } from 'node:path'

const root = process.cwd()

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: { index: resolve(root, 'electron/main.ts') },
      },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: { index: resolve(root, 'electron/preload.ts') },
      },
    },
  },
  renderer: {
    root: resolve(root, 'src'),
    plugins: [react()],
    build: {
      rollupOptions: {
        input: resolve(root, 'src/index.html'),
      },
    },
  },
})