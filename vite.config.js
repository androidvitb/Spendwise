import { defineConfig } from 'vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: 'src',
  publicDir: '../public',
  appType: 'mpa',
  plugins: [
    {
      name: 'mpa-route-rewrites',
      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          const url = req.url || '';
          try {
            const { pathname } = new URL(url, 'http://localhost');
            if (pathname === '/dashboard' || pathname === '/dashboard/') {
              req.url = '/dashboard/index.html';
            } else if (pathname === '/login' || pathname === '/login/') {
              req.url = '/login/index.html';
            } else if (pathname === '/signup' || pathname === '/signup/') {
              req.url = '/signup/index.html';
            }
          } catch {}
          next();
        });
      },
      configurePreviewServer(server) {
        server.middlewares.use((req, _res, next) => {
          const url = req.url || '';
          try {
            const { pathname } = new URL(url, 'http://localhost');
            if (pathname === '/dashboard' || pathname === '/dashboard/') {
              req.url = '/dashboard/index.html';
            } else if (pathname === '/login' || pathname === '/login/') {
              req.url = '/login/index.html';
            } else if (pathname === '/signup' || pathname === '/signup/') {
              req.url = '/signup/index.html';
            }
          } catch {}
          next();
        });
      }
    }
  ],
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html'),
        dashboard: resolve(__dirname, 'src/pages/dashboard.html'),
        login: resolve(__dirname, 'src/pages/login.html'),
        signup: resolve(__dirname, 'src/pages/signup.html'),
      },
    },
  },
});
