

// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  typescript: {
    strict: true
  },

  generate: {
    routes: [
      '/', 'stakeholder', '/accounts', 'hauptbuch',
      '/balance'
    ]
  },

  ssr: false,
  /*  nitro: {
    preset: 'service-worker'
  },*/
  //  static: 'true',
  //target: 'static',


  modules: [
    // '@nuxt/content',
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
