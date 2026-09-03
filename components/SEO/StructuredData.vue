<template>

  <Head>
    <script v-if="structuredData" type="application/ld+json" :key="structuredDataKey">
      {{ JSON.stringify(structuredData) }}
    </script>
  </Head>
</template>

<script setup>

const props = defineProps({
  type: {
    type: String,
    default: 'WebPage'
  },
  title: {
    type: String,
    default: undefined
  },
  description: {
    type: String,
    default: undefined
  },
  url: {
    type: String,
    default: undefined
  },
  image: {
    type: String,
    default: undefined
  },
  author: {
    type: String,
    default: undefined
  },
  datePublished: {
    type: String,
    default: undefined
  },
  dateModified: {
    type: String,
    default: undefined
  },
  keywords: {
    type: Array,
    default: undefined
  }
})

const structuredDataKey = computed(() => `structured-data-${props.type}-${Date.now()}`)

const structuredData = computed(() => {
  const baseData = {
    "@context": "https://schema.org",
    "@type": props.type,
    "name": props.title,
    "description": props.description,
    "url": props.url || "https://sjdh898.top"
  }

  if (props.type === 'WebSite') {
    return {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "米搜",
      "alternateName": "米搜 - 一站式资源聚合平台",
      "url": "https://sjdh898.top",
      "description": "米搜是一站式资源聚合平台，集网盘搜索、在线音乐、每日电影推荐、TV直播、TVBox、休闲游戏和直播电台于一体。",
      "image": "https://sjdh898.top/default-og-image.png",
      "potentialAction": [
        {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": "https://sjdh898.top/search?keyword={search_term_string}"
          },
          "query-input": "required name=search_term_string"
        }
      ],
      "publisher": {
        "@type": "Organization",
        "name": "米搜",
        "url": "https://sjdh898.top",
        "logo": "https://sjdh898.top/favicon.ico"
      },
      "sameAs": [
        "https://github.com/unilei/aipan-netdisk-search"
      ]
    }
  }

  if (props.type === 'Article') {
    return {
      ...baseData,
      "@type": "Article",
      "headline": props.title,
      "image": props.image,
      "author": {
        "@type": "Person",
        "name": props.author || "米搜"
      },
      "publisher": {
        "@type": "Organization",
        "name": "米搜",
        "url": "https://sjdh898.top",
        "logo": {
          "@type": "ImageObject",
          "url": "https://sjdh898.top/favicon.ico"
        }
      },
      "datePublished": props.datePublished,
      "dateModified": props.dateModified,
      "keywords": props.keywords?.join(', ')
    }
  }

  return baseData
})
</script>
