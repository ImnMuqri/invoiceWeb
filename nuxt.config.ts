export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  srcDir: '.',
  devtools: { enabled: false },
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt'
  ],
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    public: {
      apiBase: process.env.VITE_API_URl || 'http://localhost:3001'
    }
  }
})
