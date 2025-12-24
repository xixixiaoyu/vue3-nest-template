import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import { resolve } from 'path'

const isElectron = process.env.ELECTRON === 'true'

// 动态导入 electron 插件，避免在非 electron 环境下加载
const getElectronPlugins = async () => {
  if (!isElectron) return []
  const electron = (await import('vite-plugin-electron')).default
  const renderer = (await import('vite-plugin-electron-renderer')).default
  return [
    electron([
      {
        entry: 'electron/main.ts',
        vite: {
          build: {
            outDir: 'dist-electron',
            minify: false,
            rollupOptions: {
              external: ['electron'],
              output: {
                format: 'es',
                entryFileNames: '[name].mjs',
              },
            },
          },
        },
      },
      {
        entry: 'electron/preload.ts',
        onstart(args) {
          args.reload()
        },
        vite: {
          build: {
            outDir: 'dist-electron',
            minify: false,
            rollupOptions: {
              external: ['electron'],
            },
          },
        },
      },
    ]),
    renderer(),
  ]
}

// 根据环境和构建目标设置 base 路径
const getBase = () => {
  // Electron 模式使用相对路径
  if (isElectron) return './'
  // 生产环境部署到 GitHub Pages
  if (process.env.NODE_ENV === 'production') return '/vue3-nest-template/'
  // Capacitor 需要相对路径
  return './'
}

export default defineConfig(async () => {
  const electronPlugins = isElectron ? await getElectronPlugins() : []

  return {
    base: getBase(),
    plugins: [
      vue(),
      ...electronPlugins,
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'vite.svg', 'apple-touch-icon-180x180.png'],
        manifest: {
          name: 'My App',
          short_name: 'MyApp',
          description: 'A full-stack application built with NestJS and Vue 3',
          theme_color: '#ffffff',
          background_color: '#ffffff',
          display: 'standalone',
          icons: [
            {
              src: 'pwa-64x64.png',
              sizes: '64x64',
              type: 'image/png',
            },
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
            },
            {
              src: 'maskable-icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/api\..*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24, // 1 day
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
    server: {
      port: 5173,
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: process.env.VITE_API_BASE_URL || 'http://localhost:3000',
          changeOrigin: true,
        },
      },
    },
  }
})
