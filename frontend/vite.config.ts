import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Base URL for deployment (adjust for your hosting)
  base: './',
  
  // Build configuration
  build: {
    target: 'es2015',
    outDir: 'dist',
    sourcemap: true,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  
  // Development server configuration
  server: {
    allowedHosts: ['79a17094f2f7.ngrok-free.app'],
    port: 5173,
    host: true, // Allow external connections
    strictPort: true,
    cors: true,
    headers: {
      // Security headers for development
      'X-Frame-Options': 'SAMEORIGIN',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
    // allow host 79a17094f2f7.ngrok-free.app
  },
  
  // Preview server configuration (for production builds)
  preview: {
    port: 4173,
    host: true,
    strictPort: true,
    cors: true,
    headers: {
      'X-Frame-Options': 'SAMEORIGIN',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
  },
  
  // Define global constants
  define: {
    __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
  },
  
  // CSS configuration
  css: {
    devSourcemap: true,
  },
  
  // Esbuild configuration
  esbuild: {
    target: 'es2015',
    format: 'esm',
  },
  
  // Additional plugins
  plugins: [
    react(),
    // Custom plugin to add manifest.json
    {
      name: 'add-manifest',
      generateBundle() {
        this.emitFile({
          type: 'asset',
          fileName: 'manifest.json',
          source: JSON.stringify({
            name: 'Biometric Security',
            short_name: 'Biometric',
            description: 'Secure biometric authentication for Telegram',
            start_url: './',
            display: 'standalone',
            theme_color: '#007AFF',
            background_color: '#ffffff',
            icons: [
              {
                src: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect width="192" height="192" rx="40" fill="%23007AFF"/><path d="M96 164s60-30 60-74V44L96 22 36 44v46c0 44 60 74 60 74z" fill="white"/></svg>',
                sizes: '192x192',
                type: 'image/svg+xml',
                purpose: 'any maskable'
              },
              {
                src: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="96" fill="%23007AFF"/><path d="M256 440s160-80 160-200V120L256 60 96 120v120c0 120 160 200 160 200z" fill="white"/></svg>',
                sizes: '512x512',
                type: 'image/svg+xml',
                purpose: 'any maskable'
              }
            ]
          }, null, 2)
        });
      }
    }
  ],
  
  // Optimization
  optimizeDeps: {
    include: [],
  },
});