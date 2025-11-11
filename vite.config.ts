import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

const repoName = 'nzxt-pinterest-integration'

export default defineConfig({
  base: `/${repoName}/`,

  plugins: [react()],

  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        config: resolve(__dirname, 'config.html'),
      },
    },
  },
})
