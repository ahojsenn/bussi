
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  experimental: { appManifest: false },
  typescript: {
    strict: true
  },
  compatibilityDate: '2025-12-14',

  generate: {
    routes: ['/index', '/stakeholder', '/accounts', '/hauptbuch', '/balance', '/test', '/fahrtenbucheintrag']
  },

  ssr: false,

  modules: [
    // '@nuxt/content',
    '@pinia/nuxt',
    // '@nuxt/image-edge',
  ],
  app: {
    baseURL: '/bussi/'
  },

  runtimeConfig: {
    public: {
      baseURL: '/bussi/',
    },
  },

})
