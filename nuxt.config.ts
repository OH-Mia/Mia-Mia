// nuxt.config.ts
export default defineNuxtConfig({
  devtools: { enabled: true },
  compatibilityDate: '2025-06-30',
  typescript: {
    typeCheck: false,
  },
  css: ['~/assets/css/main.css'],
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
})
