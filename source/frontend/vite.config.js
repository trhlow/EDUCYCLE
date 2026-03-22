import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // Default 8080 = `mvn spring-boot:run` không profile. Profile docker (8081): .env.local → VITE_DEV_PROXY_TARGET
  const backendTarget = env.VITE_DEV_PROXY_TARGET || 'http://localhost:8080'

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
    // `vite preview` has no proxy by default — /api would 404 without this.
    preview: {
      proxy: devProxy,
    },
  }
})
