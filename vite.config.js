import { defineConfig } from 'vite'

export default defineConfig({
  root: './src',
  publicDir: '../public',
  build: {
    outDir: '../dist',
    rollupOptions: {
      input: {
        main: './src/index.html',
        dashboard: './src/dashboard.html',
        login: './src/auth/login.html',
        signup: './src/auth/signup.html',
        about: './src/about.html',
        reward: './src/reward.html'
      }
    }
  },
  server: {
    port: 5173
  }
});