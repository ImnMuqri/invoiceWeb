export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  srcDir: '.',
  devtools: { enabled: false },
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@nuxt/icon'
  ],
  // Landing components resolve by filename (KirimPhone, not LandingKirimPhone).
  // The default '~/components' entry is kept so the rest of the app is
  // unaffected and still gets path-prefixed names.
  components: [
    { path: '~/components/landing', pathPrefix: false },
    '~/components'
  ],
  // design-tokens.css must load before anything that consumes the tokens.
  css: [
    '~/assets/css/design-tokens.css',
    '~/assets/css/main.css',
    '~/assets/css/landing.css'
  ],
  // Inlines each component's scoped CSS into the SSR payload, so the landing
  // page's critical CSS arrives with the HTML instead of in a blocking request.
  features: {
    inlineStyles: true
  },
  app: {
    head: {
      title: 'InvoKita',
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', type: 'image/png', href: '/InvoKitaLogo.png', sizes: 'any' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/site.webmanifest' }
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
  nitro: {
    routeRules: {
      '/**': {
        headers: {
          'Permissions-Policy': 'unload=()'
        }
      }
    }
  }
})
