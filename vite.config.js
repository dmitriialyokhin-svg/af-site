import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// base: './' works for GitHub Pages with both custom domains and /repo-name/ paths
// If deploying to https://username.github.io/repo-name/, change base to '/repo-name/'
export default defineConfig({
  plugins: [react()],
  base: '/af-site/',
})
