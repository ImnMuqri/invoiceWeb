export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  srcDir: '.',
  devtools: { enabled: false },
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@nuxt/icon'
  ],
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      title: 'InvoKita',
      link: [
        { rel: 'icon', type: 'image/png', href: '/InvoKitaLogo.png', sizes: 'any' },
        { rel: 'apple-touch-icon', href: '/InvoKitaLogo.png' }
      ]
    }
  },
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE
    }
  },
  router: {
    options: {
      strict: false
    }
  },
  routeRules: {
    '/dashboard/**': { ssr: false },
    '/invoices/**': { ssr: false },
    '/clients/**': { ssr: false },
    '/settings/**': { ssr: false },
    '/onboarding/**': { ssr: false },
    '/admin/**': { ssr: false }
  }
})
