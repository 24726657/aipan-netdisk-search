export default defineNuxtPlugin(() => {
  const route = useRoute()

  useHead({
    link: computed(() => [
      { rel: 'canonical', href: `https://www.sjdh898.top${route.path}` }
    ])
  })
})
