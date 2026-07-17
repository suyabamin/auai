import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// base: '/' is correct when using a custom domain (suyab.dev).
// The /ps_react_website/ subpath is only needed when using the
// default github.io subdomain without a custom domain.
export default defineConfig({
  plugins: [react()],
  base: '/',
})
