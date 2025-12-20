<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

const languages = [
  { code: 'zh-CN', label: '中文' },
  { code: 'en-US', label: 'English' },
]

function switchLocale(code: string) {
  locale.value = code
  localStorage.setItem('locale', code)
}
</script>

<template>
  <div class="relative inline-flex items-center space-x-2">
    <button
      v-for="lang in languages"
      :key="lang.code"
      :class="[
        'px-2 py-1 text-sm rounded transition-colors',
        locale === lang.code
          ? 'bg-primary-600 text-white'
          : 'text-gray-600 hover:text-primary-600 hover:bg-gray-100',
      ]"
      @click="switchLocale(lang.code)"
    >
      {{ lang.label }}
    </button>
  </div>
</template>
