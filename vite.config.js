import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: 'public/index.html',
        dashboard: 'public/dashboard.html',
      },
    },
  },
});