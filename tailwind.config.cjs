/** @type {import('tailwindcss').Config} */

const colors = require('tailwindcss/colors')
const plugin = require('tailwindcss/plugin')
console.log(`project info - tailwind.config.js was run - dirname: ${__dirname} - cwd: ${process.cwd()}`)
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')]
}
