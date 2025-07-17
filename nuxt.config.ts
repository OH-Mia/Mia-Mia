// nuxt.config.ts
import { env } from 'node:process'

export default defineNuxtConfig({
  devtools: { enabled: true },
  compatibilityDate: '2025-06-30',
  typescript: {
    typeCheck: false,
  },
  modules: [
    '@unocss/nuxt',
    '@element-plus/nuxt',
    '@nuxt/icon',
    ['@pinia/nuxt', { autoImports: ['defineStore', 'acceptHMRUpdate'] }],
  ],
  elementPlus: {
    themes: ['dark'],
    icon: 'ElIcon',
    importStyle: 'css',
  },
  unocss: {
    // UnoCSS 옵션들을 여기에 추가
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
    // devProxy: {
    //   '/api': {
    //     target: 'http://localhost:3001',
    //     changeOrigin: true,
    //   },
    // },
  },
  vite: {
    optimizeDeps: {
      include: ['dayjs'],
    },
    server: {
      proxy: {
        // '/api': {
        //   target: 'http://localhost:3001',
        //   changeOrigin: true,
        // },
      },
    },
  },
  app: {
    head: {
      title: 'Mia Mia',
      viewport: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover',
      charset: 'utf-8',
      htmlAttrs: {
        lang: 'ko',
      },
      link: [
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&display=swap',
        },
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
    youtubeApiKey: env.YOUTUBE_API_KEY,
    public: {
      youtubeUrl: env.VUE_APP_YOUTUBE,
      vlogPlaylistId: env.VUE_APP_PLAYLIST_ID_VLOG, // 브이로그
      mydayLogPlaylistId: env.VUE_APP_PLAYLIST_ID_MYDAYLOG, // 마이데이 로그
      myBagPlaylistId: env.VUE_APP_PLAYLIST_ID_MYBAG, // 왓츠인마이백
      firebaseProjectId: env.FIREBASE_PROJECT_ID,
      firebaseClientEmail: env.FIREBASE_CLIENT_EMAIL,
      firebasePrivateKey: env.FIREBASE_PRIVATE_KEY,
    },
  },
})
