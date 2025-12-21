import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'
import { resolve } from 'path'
import { writeFileSync, mkdirSync, existsSync } from 'fs'

const isElectron = process.env.ELECTRON === 'true'

// 确保 dist-electron 使用 ESM
if (isElectron) {
  if (!existsSync('dist-electron')) {
    mkdirSync('dist-electron', { recursive: true })
  }
  writeFileSync('dist-electron/package.json', JSON.stringify({ type: 'module' }))
}

export default defineConfig({
  // Capacitor 需要相对路径才能在原生应用中正确加载资源
  base: './',
  plugins: [
    vue(),
    // Electron 插件（仅在 electron 模式下启用）
    ...(isElectron
      ? [
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
                      format: 'cjs',
                      entryFileNames: '[name].js',
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
                    output: {
                      format: 'cjs',
                      entryFileNames: '[name].js',
                    },
                  },
                },
              },
            },
          ]),
          renderer(),
        ]
      : []),
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
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
