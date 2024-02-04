import dotenv from 'dotenv'
dotenv.config()
import {defineConfig} from 'astro/config'
import tailwind from '@astrojs/tailwind'
import react from '@astrojs/react'

const PUBLIC_SITE_URL = process.env.PUBLIC_SITE_URL
const PUBLIC_BASE_PATH = process.env.PUBLIC_BASE_PATH

export default defineConfig({
  site: PUBLIC_SITE_URL,
  base: PUBLIC_BASE_PATH,
  build: {
    inlineStylesheets: 'auto'
  },
  output: 'static',
  devToolbar: {
    enabled: false
  },
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
