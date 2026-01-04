
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  experimental: { appManifest: false },
  typescript: {
    strict: true
  },
  compatibilityDate: '2025-12-14',

  generate: {
    routes: ['/', '/stakeholder', '/accounts', '/hauptbuch', '/balance', '/fahrtenbucheintrag']
  },

  ssr: false,

  modules: [
    // '@nuxt/content',
    '@pinia/nuxt',
    'nuxt-vue3-google-signin',
    // '@nuxt/image-edge',
  ],
  googleSignIn: {
    clientId: '748890902936-tubv0vj0m7jg6m5bhcc7p29q7hkhli8u.apps.googleusercontent.com',
  },
  app: {
    baseURL: '/bussi/'
  },

  runtimeConfig: {
    public: {
      baseURL: '/bussi/',
    },
  },

})
