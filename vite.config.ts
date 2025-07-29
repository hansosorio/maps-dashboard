import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/postcss'
import autoprefixer from 'autoprefixer'

export default defineConfig({
  plugins: [vue(), vueDevTools()],
  optimizeDeps: {
    include: ['@fawmi/vue-google-maps'],
  },
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer],
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
  },
})
