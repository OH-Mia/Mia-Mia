// nuxt.config.ts
import { env } from 'node:process'

export default defineNuxtConfig({
  devtools: { enabled: true },
  compatibilityDate: '2025-06-30',
  typescript: {
    typeCheck: false,
  },
  modules: [
    '@element-plus/nuxt',
    '@nuxt/icon',
    ['@pinia/nuxt', { autoImports: ['defineStore', 'acceptHMRUpdate'] }],
  ],
  elementPlus: {
    themes: ['dark'],
    icon: 'ElIcon',
    importStyle: 'css',
  },
  imports: {
    dirs: [
      'stores',
      'composables',
      'components',
    ],
  },
  css: ['~/assets/css/main.css'],
  nitro: {
    devProxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  vite: {
    optimizeDeps: {
      include: ['dayjs'],
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
        },
      },
    },
  },
  app: {
    head: {
      title: 'Mia Mia',
      viewport: 'width=device-width, initial-scale=1',
      charset: 'utf-8',
      htmlAttrs: {
        lang: 'ko',
      },
      link: [
        {
          rel: 'icon',
          type: 'image/png',
          href: '/kkamgo.png',
        },
        {
          rel: 'apple-touch-icon',
          href: '/kkamgo.png',
          sizes: '180x180',
        },
      ],
    },
  },
  runtimeConfig: {
    public: {
      youtubeUrl: env.VUE_APP_YOUTUBE,
    },
  },
})
