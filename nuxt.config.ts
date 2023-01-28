

// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  typescript: {
    strict: true
  },
  routeRules: {
    '/': { static: true },
    '/balance': { static: true },
  },
  generate: {
    routes: [
      '/', 'stakeholder', '/accounts', 'hauptbuch',
      '/balance'
    ]
  },

  ssr: false,
  //  static: 'true',
  //target: 'static',


  modules: [
    '@pinia/nuxt',
  ],
  app: {
    baseURL: '/bussi/public/'
  },
  appConfig: {
    theme: {
      primaryColor: '#ff0000'
    },
    GKEY: '1UHH3Nzj6yj3d9FJbgswx-nj4fHTIuWeDzl5aJpgC-8M'
  }

})
