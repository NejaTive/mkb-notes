// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  ssr: false,
  devtools: { enabled: false },
  modules: ['@pinia/nuxt', '@nuxt/eslint'],
  css: ['~/assets/styles/main.scss'],
  // Каждый компонент лежит в своей папке: components/NoteCard/NoteCard.vue — компоненты приложения,
  // shared/BaseButton/BaseButton.vue — ui-kit. Имя берём из файла, без префикса папок.
  components: [
    { path: '~/shared', pathPrefix: false },
    { path: '~/components', pathPrefix: false },
  ],
  typescript: {
    strict: true,
    typeCheck: false,
  },
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "~/assets/styles/tokens" as *;\n',
        },
      },
    },
  },
  app: {
    head: {
      htmlAttrs: { lang: 'ru' },
      title: 'Стикеры — заметки',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Заметки со списками задач в виде стикеров' },
        { name: 'theme-color', content: '#e9dcc3' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&family=Nunito:wght@400;600;700&display=swap',
        },
      ],
    },
  },
})
