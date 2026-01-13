
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  experimental: { appManifest: false },
  typescript: {
    strict: true
  },
  compatibilityDate: '2026-01-12',

  generate: {
    routes: ['/index', '/stakeholder',
      '/accounts', '/hauptbuch',
      '/balance', '/test',
      '/fahrtenbucheintrag', '/fbeloeschen']
  },

  ssr: false,

  modules: [
    // '@nuxt/content',
    '@pinia/nuxt',
    // '@nuxt/image-edge',
  ],
  app: {
    baseURL: '/'
  },

  runtimeConfig: {
    public: {
      baseURL: '/',
    },
  },

})
