<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const footerLinks = [
  { name: 'footer.links.about', path: '/about' },
  { name: 'footer.links.userAgreement', path: '/user-agreement' },
  { name: 'footer.links.privacy', path: '/privacy-policy' },
  { name: 'footer.links.disclaimer', path: '/disclaimer' },
  { name: 'footer.links.copyright', path: '/copyright' },
  { name: 'footer.links.releases', path: '/releases' },
]

const links = ref([])

const fetchLinks = async () => {
  try {
    const res = await $fetch('/api/links')
    links.value = res.data || []
  } catch (e) {
    links.value = []
  }
}

onMounted(() => {
  fetchLinks()
})
</script>

<template>
  <footer class="bg-white-100 dark:bg-slate-900 dark:text-white py-6 space-y-2">
    <!-- 友情链接区域 -->
    <div v-if="links.length > 0" class="max-w-[1240px] mx-auto px-4 pb-4 mb-2 border-b border-gray-200 dark:border-gray-700">
      <div class="flex flex-wrap items-center justify-center gap-1 text-xs">
        <span class="text-gray-500 dark:text-gray-400 font-medium mr-1">友情链接：</span>
        <template v-for="(link, index) in links" :key="link.id">
          <a
            :href="link.url"
            :target="link.target || '_blank'"
            rel="noopener noreferrer"
            class="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
          >
            {{ link.name }}
          </a>
          <span v-if="index < links.length - 1" class="text-gray-300 dark:text-gray-600">|</span>
        </template>
      </div>
    </div>

    <!-- 版权信息 -->
    <p class="text-center text-xs sm:text-sm">
      {{ $t('footer.copyright') }}
    </p>
    <!-- 页脚链接 -->
    <div class="flex items-center justify-center space-x-4 flex-wrap gap-x-2 gap-y-1">
      <template v-for="(link, index) in footerLinks" :key="link.path">
        <nuxt-link :to="link.path" class="text-sm text-gray-600 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 transition-colors duration-300">
          {{ $t(link.name) }}
        </nuxt-link>
        <span v-if="index < footerLinks.length - 1" class="text-gray-300 dark:text-gray-600">|</span>
      </template>
      <span class="text-gray-300 dark:text-gray-600">|</span>
      <nuxt-link to="/submit-link" class="text-sm text-gray-600 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 transition-colors duration-300">
        提交友情链接
      </nuxt-link>
    </div>

    <!-- 声明信息 -->
    <p class="text-center text-xs sm:text-sm px-4 mx-auto text-gray-600 dark:text-gray-400">
      {{ $t('footer.statement') }}
    </p>
  </footer>
</template>

<style scoped></style>