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

  app: {
    head: {
      title: 'Alibi — AI Forenzná Platforma',
      link: [
        { rel: 'manifest', href: '/manifest.json' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' }
      ],
      meta: [
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'theme-color', content: '#020617' }
      ]
    }
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    mistralApiKey: process.env.MISTRAL_API_KEY || process.env.NUXT_MISTRAL_API_KEY || '',
    prismaServiceToken: process.env.PRISMA_SERVICE_TOKEN || process.env.NUXT_PRISMA_SERVICE_TOKEN || '',
    base44AgentId: process.env.BASE44_AGENT_ID || '6a82afdc22217ec663d7c4f2',
    base44AgentApiKey: process.env.BASE44_AGENT_API_KEY || '',
    base44ConversationId: process.env.BASE44_CONVERSATION_ID || '6a82afdef0ddf529b3da692d',
    public: {
      base44AppId: process.env.BASE44_APP_ID || '6a81f5e7f4adbf6a9523b9d8'
    }
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

  nitro: {
    preset: 'vercel'
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  icon: {
    serverBundle: {
      collections: ['lucide', 'simple-icons']
    }
  },

  pinia: {
    storesDirs: ['./app/stores/**']
  },
})
