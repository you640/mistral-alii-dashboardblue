// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@vueuse/nuxt',
    '@pinia/nuxt'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      title: 'Alibi — AI Forenzná Platforma',
      link: [
        { rel: 'manifest', href: '/manifest.json' },
        { rel: 'icon', type: 'image/svg+xml', href: '/icon.svg' },
        { rel: 'apple-touch-icon', href: '/icons/icon-192.png' }
      ],
      meta: [
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'theme-color', content: '#020617' }
      ]
    }
  },

  runtimeConfig: {
    mistralApiKey: process.env.MISTRAL_API_KEY || process.env.NUXT_MISTRAL_API_KEY || '',
    public: {
      base44AppId: process.env.BASE44_APP_ID || '6a81f5e7f4adbf6a9523b9d8'
    }
  },

  nitro: {
    preset: 'vercel'
  },

  routeRules: {
    '/api/**': {
      cors: true
    },
    '/icons/**': {
      headers: { 'Cache-Control': 'public, max-age=31536000, immutable' }
    },
    '/icon.svg': {
      headers: { 'Cache-Control': 'public, max-age=31536000, immutable' }
    }
  },

  compatibilityDate: '2026-06-30',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  pinia: {
    autoImports: [
      'defineStore',
      ['defineStore', 'definePiniaStore']
    ]
  }
})
