import { defineConfig } from 'vite';

export default defineConfig({
  root: 'src',
  publicDir: '../public',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: 'index.html',
        dashboard: 'pages/dashboard.html',
        login: 'pages/login.html',
        signup: 'pages/signup.html',
      },
    },
  },
});