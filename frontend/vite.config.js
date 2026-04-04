import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // Mặc định 8081 = profile `docker` (application-docker.yml). Tránh proxy nhầm 8080 khi Apache/XAMPP chiếm cổng → 403 trên /api.
  // BE chạy không profile (cổng 8080): đặt VITE_DEV_PROXY_TARGET=http://localhost:8080 trong .env.local
  const backendTarget = env.VITE_DEV_PROXY_TARGET || 'http://localhost:8081'

  const devProxy = {
    '/api': {
      target: backendTarget,
      changeOrigin: true,
    },
    '/ws': {
      target: backendTarget,
      changeOrigin: true,
      ws: true,
    },
  }

  return {
    plugins: [react()],
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@tanstack/react-query',
        'axios',
        '@stomp/stompjs',
        'sockjs-client',
        'zod',
        '@phosphor-icons/react',
      ],
      esbuildOptions: {
        define: {
          global: 'globalThis',
        },
      },
    },
    define: {
      global: 'globalThis',
    },
    server: {
      proxy: devProxy,
    },
    preview: {
      proxy: devProxy,
    },
    build: {
      target: 'es2020',
      sourcemap: mode !== 'production',
      chunkSizeWarningLimit: 500,
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'query-vendor': ['@tanstack/react-query'],
            'stomp-vendor': ['@stomp/stompjs', 'sockjs-client'],
            'icons-vendor': ['@phosphor-icons/react'],
          },
        },
      },
    },
  }
})
