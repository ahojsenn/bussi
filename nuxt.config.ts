
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  typescript: {
    strict: true
  },
  compatibilityDate: '2025-12-14',

  generate: {
    routes: ['/', '/stakeholder', '/accounts', '/hauptbuch', '/balance']
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
