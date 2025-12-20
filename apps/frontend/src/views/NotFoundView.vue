<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="min-h-[60vh] flex flex-col items-center justify-center">
    <h1 class="text-9xl font-bold text-gray-200">404</h1>
    <h2 class="text-2xl font-semibold text-gray-700 mt-4">页面未找到</h2>
    <p class="text-gray-500 mt-2 mb-8">抱歉，您访问的页面不存在</p>
    <RouterLink
      to="/"
      class="px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
    >
      返回首页
    </RouterLink>
  </div>
</template>
