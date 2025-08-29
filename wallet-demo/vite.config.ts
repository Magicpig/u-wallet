import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  server: {
    host: '0.0.0.0',
    port: 5175,
    allowedHosts: [
      'tx.mdogs.me',  // 添加你的域名
      'localhost',     // 保留本地访问
      '.mdogs.me'      // 或者允许所有 mdogs.me 子域名
    ]
  },
  define: {
    global: 'globalThis',
    'process.env': {}
  },
  resolve: {
    alias: {
      buffer: 'buffer',
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      process: 'process/browser'  // 添加这行
    },
  },
  optimizeDeps: {
    include: ['buffer','process'],
  },
})
