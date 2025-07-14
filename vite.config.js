import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Base configuration
export default defineConfig({
  mode: 'development',
  root: __dirname,
  base: '/',
  
  plugins: [
    react({
      fastRefresh: true,
      jsxRuntime: 'automatic',
      include: '**/*.{jsx,tsx,js}'
    })
  ],
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      'react': path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      'react-router-dom': path.resolve(__dirname, 'node_modules/react-router-dom')
    },
    extensions: ['.js', '.jsx', '.json', '.ts', '.tsx']
  },
  
  server: {
    port: 5174,
    host: '0.0.0.0',
    open: true,
    strictPort: true,
    cors: true,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5174
    },
    
    proxy: {
      // API proxy - handle API requests to the PHP backend
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        // Preserve the /api prefix in the request
        rewrite: (path) => path,
        // Configure proxy to handle all HTTP methods
        configure: (proxy, _options) => {
          // Handle preflight OPTIONS requests
          proxy.on('proxyReq', (proxyReq, req) => {
            if (req.method === 'OPTIONS') {
              proxyReq.method = 'OPTIONS';
              proxyReq.setHeader('Access-Control-Request-Method', 'GET, POST, PATCH, OPTIONS');
              proxyReq.setHeader('Access-Control-Request-Headers', 'content-type, authorization');
            }
            console.log('Proxying request:', req.method, req.url);
          });
          
          proxy.on('error', (err, _req, _res) => {
            console.error('Proxy error:', err);
          });
          
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received response:', {
              statusCode: proxyRes.statusCode,
              statusMessage: proxyRes.statusMessage,
              url: req.url,
              method: req.method,
              headers: proxyRes.headers
            });
          });
        }
      },
      
      // Static files handling
      '^/Tea%20Catalogue/(.*)': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path
      },
      
      '^/Tea Catalogue/(.*)': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/Tea%20Catalogue\//, '')
      },
      
      '^/public/Tea%20Catalogue/(.*)': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/public\//, '')
      },
      
      '^/public/Tea Catalogue/(.*)': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/public\/Tea%20Catalogue\//, '')
      }
    }
  },
  
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    minify: 'esbuild',
    target: 'esnext',
    
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          vendor: ['@headlessui/react', '@heroicons/react']
        }
      }
    }
  },
  
  preview: {
    port: 4173,
    strictPort: true
  },
  
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    exclude: []
  }
});
