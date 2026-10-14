import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite"

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.VITE_API_URL || process.env.VITE_API_URL || 'http://localhost:3001'
  const appUrl = env.VITE_APP_URL || process.env.VITE_APP_URL || env.APP_URL || process.env.APP_URL || ''

  return {
    base: process.env.VITE_BASE_PATH || '/',
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'html-transform-og-meta',
        transformIndexHtml(html) {
          if (!appUrl) return html
          const cleanUrl = appUrl.replace(/\/$/, '')
          return html
            .replace(/content="\/og-image\.png"/g, `content="${cleanUrl}/og-image.png"`)
            .replace(/content="\/"/g, `content="${cleanUrl}/"`)
        },
      },
    ],
    optimizeDeps: {
      include: ["@mediapipe/face_mesh", "@tensorflow/tfjs", "@liveness/sdk"],
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    },
  }
})
