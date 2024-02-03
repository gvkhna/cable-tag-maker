import dotenv from 'dotenv'
dotenv.config()
import {defineConfig} from 'astro/config'
import tailwind from '@astrojs/tailwind'
import react from '@astrojs/react'
import node from '@astrojs/node'

export default defineConfig({
  build: {
    inlineStylesheets: 'auto'
  },
  output: 'static',
  devToolbar: {
    enabled: false
  },
  // adapter: node({
  //   mode: 'standalone'
  // }),
  srcDir: './src/',
  publicDir: './public/',
  compressHTML: true,
  prefetch: true,
  integrations: [tailwind(), react()],
  vite: {
    css: {
      devSourcemap: true
    }
  }
})
