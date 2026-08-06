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
    { path: '~/components/legal', pathPrefix: false },
    { path: '~/components/auth', pathPrefix: false },
    '~/components'
  ],
  // design-tokens.css must load before anything that consumes the tokens.
  css: [
    '~/assets/css/design-tokens.css',
    '~/assets/css/main.css',
    '~/assets/css/landing.css',
    '~/assets/css/app-desk.css',
    // Global, not scoped to a component: the invoice document renders both
    // inside the builder and on /invoices/:id/export, which runs with
    // `layout: false` and is what Puppeteer prints to PDF.
    '~/assets/css/invoice-paper.css'
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
        // SVG first for browsers that take it; PNGs are the fallback ladder.
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16.png' },
        // Full-bleed and square: iOS applies its own rounded mask, so an icon
        // with its own rounded corners gets double-rounded with black infill.
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
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
