<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-12 px-4">
    <div class="max-w-4xl mx-auto">
      <!-- 头部 -->
      <div class="text-center mb-12">
        <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
          <i class="fas fa-ad text-4xl text-blue-600 dark:text-blue-400"></i>
        </div>
        <h1 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
          广告投放合作
        </h1>
        <p class="text-gray-500 dark:text-gray-400 mt-2">
          让您的品牌触达更多用户，精准投放，效果显著
        </p>
      </div>

      <!-- 联系方式 -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8 mb-8">
        <h2 class="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
          <i class="fas fa-phone text-blue-600 dark:text-blue-400"></i>
          联系我们
        </h2>
        <div class="flex justify-center">
          <div class="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl min-w-[200px] justify-center">
            <i class="fab fa-qq text-2xl text-blue-600 dark:text-blue-400"></i>
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">QQ</p>
              <p class="text-gray-900 dark:text-white font-medium">752375969</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 广告位规格 -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8 mb-8">
        <h2 class="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
          <i class="fas fa-image text-blue-600 dark:text-blue-400"></i>
          广告位规格
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- 顶部横幅 -->
          <div class="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-md transition">
            <div class="flex items-center justify-between mb-2">
              <span class="font-semibold text-gray-900 dark:text-white">顶部横幅</span>
              <span class="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">推荐</span>
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-400">比例 7:1</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">推荐尺寸 1400×200</p>
            <p class="text-xs text-gray-400 dark:text-gray-500 mt-2">首页最顶部，视觉冲击力强</p>
          </div>
          <!-- 网格广告 -->
          <div class="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-md transition">
            <div class="flex items-center justify-between mb-2">
              <span class="font-semibold text-gray-900 dark:text-white">网格广告</span>
              <span class="text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full">3个位置</span>
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-400">比例 7:2</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">推荐尺寸 600×172</p>
            <p class="text-xs text-gray-400 dark:text-gray-500 mt-2">三列网格布局，展示效果好</p>
          </div>
          <!-- 文字广告 -->
          <div class="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-md transition">
            <div class="flex items-center justify-between mb-2">
              <span class="font-semibold text-gray-900 dark:text-white">文字广告</span>
              <span class="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full">10个位置</span>
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-400">纯文本展示</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">限 20 字以内</p>
            <p class="text-xs text-gray-400 dark:text-gray-500 mt-2">彩色文字，简洁醒目</p>
          </div>
        </div>
      </div>

      <!-- 投放须知 -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8 mb-8">
        <h2 class="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
          <i class="fas fa-info-circle text-blue-600 dark:text-blue-400"></i>
          投放须知
        </h2>
        <div class="space-y-3 text-sm text-gray-600 dark:text-gray-300">
          <div class="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
            <span class="font-bold text-blue-500 min-w-[24px]">1.</span>
            <span>广告不提供试用，先付款并款到帐后开始投放广告。</span>
          </div>
          <div class="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
            <span class="font-bold text-blue-500 min-w-[24px]">2.</span>
            <span>本站没有给广告刷IP的行为，本站里面的所有网址每个IP访问一天只计1次。</span>
          </div>
          <div class="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
            <span class="font-bold text-blue-500 min-w-[24px]">3.</span>
            <span>广告价格会不定期做适当调整，以上价格仅供参考，具体以咨询客服告知的为准。</span>
          </div>
          <div class="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
            <span class="font-bold text-blue-500 min-w-[24px]">4.</span>
            <span>本站所有位置广告最低1个月起投，多月投放可适当优惠，投放日期最多可以达到永久投放。</span>
          </div>
          <div class="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
            <span class="font-bold text-blue-500 min-w-[24px]">5.</span>
            <span>本站不负责广告图片的制作，请自备图片。如果实在不会，站长也可以代工（过丑请勿嫌弃哈）。</span>
          </div>
          <div class="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
            <span class="font-bold text-blue-500 min-w-[24px]">6.</span>
            <span>如站长在到期之前询问您是否续费的，请尽快回复，48小时内若不回复，我们会在到期时立即关闭广告，请知悉。</span>
          </div>
          <div class="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800/50">
            <span class="font-bold text-red-500 min-w-[24px]">7.</span>
            <span class="text-red-600 dark:text-red-400 font-medium">从广告收款起，中途本站不接受任何理由的退款！广告内容禁止带有【站长推荐】等类似字眼，望理解。</span>
          </div>
        </div>
      </div>

      <!-- 底部操作 -->
      <div class="text-center">
        <a
          href="https://wpa.qq.com/msgrd?v=3&uin=752375969&site=qq&menu=yes"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition shadow-lg hover:shadow-xl"
        >
          <i class="fab fa-qq"></i>
          立即咨询
        </a>
        <a href="/" class="inline-flex items-center gap-2 px-8 py-3 ml-4 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-medium transition">
          <i class="fas fa-arrow-left"></i>
          返回首页
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: false,
})
</script>

<style scoped>
/* 页面独立样式 */
</style>