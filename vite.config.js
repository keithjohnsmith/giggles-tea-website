import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
    
    // Serve static files from the project root and parent directories
    fs: {
      allow: [
        // Allow serving files from the project root
        __dirname,
        // Allow serving files from the server directory
        path.join(__dirname, 'server'),
        // Allow serving files from parent directories (with caution)
        path.join(__dirname, '..')
      ],
      strict: false
    },
    
    // Configure static file serving
    appType: 'spa',
    publicDir: 'public',
    
    // Custom middleware to serve files from the Tea Catalogue directory
    middleware: (req, res, next) => {
      // Handle requests to /Tea%20Catalogue/... or /Tea Catalogue/...
      if (req.url.startsWith('/Tea%20Catalogue/') || req.url.startsWith('/Tea Catalogue/')) {
        // Normalize the URL path
        const normalizedUrl = req.url.replace(/^\/Tea(%20| )Catalogue\//, '').replace(/%20/g, ' ');
        
        // Convert URL to filesystem path
        const filePath = path.join(
          __dirname,
          'server',
          'Tea Catalogue',
          normalizedUrl
        );
        
        // Check if file exists and serve it
        try {
          if (fs.existsSync(filePath)) {
            const file = fs.readFileSync(filePath);
            const ext = path.extname(filePath).toLowerCase().substring(1);
            const mimeTypes = {
              jpg: 'image/jpeg',
              jpeg: 'image/jpeg',
              png: 'image/png',
              gif: 'image/gif',
              webp: 'image/webp',
              svg: 'image/svg+xml'
            };
            
            // Set CORS headers
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET');
            res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
            res.end(file);
            return;
          } else {
            console.warn(`File not found: ${filePath}`);
            res.statusCode = 404;
            res.end('File not found');
            return;
          }
        } catch (error) {
          console.error(`Error serving file ${filePath}:`, error);
          res.statusCode = 500;
          res.end('Internal server error');
          return;
        }
      }
      next();
    },
    
    // Proxy configuration for API
    proxy: {
      // API proxy - handle API requests to the PHP backend
      '/api': {
        target: 'http://localhost:80',  // Changed from 8000 to 80 for XAMPP
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
      
      // Serve PHP files from the server directory via XAMPP
      '^/server': {
        target: 'http://localhost:80',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/server/, '/giggles-tea/server')
      },
      
      // Handle Tea Catalogue images
      '^/Tea%20Catalogue/': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/Tea%20Catalogue\//, '/Tea Catalogue/')
      },
      
      '^/Tea Catalogue/': {
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
