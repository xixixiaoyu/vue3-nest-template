<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

const isOpen = ref(false)

const languages = [
  { code: 'zh-CN', label: '中文' },
  { code: 'en-US', label: 'English' },
]

const currentLanguage = computed(
  () => languages.find((lang) => lang.code === locale.value) || languages[0],
)

function switchLocale(code: string) {
  locale.value = code
  localStorage.setItem('locale', code)
  isOpen.value = false
}
</script>

<template>
  <div class="relative">
    <button
      class="flex items-center space-x-1 px-3 py-1.5 text-sm rounded transition-colors text-gray-600 hover:text-primary-600 hover:bg-gray-100"
      @click="isOpen = !isOpen"
    >
      <span>{{ currentLanguage.label }}</span>
      <svg
        :class="['w-4 h-4 transition-transform', isOpen ? 'rotate-180' : '']"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
    <div
      v-if="isOpen"
      class="absolute right-0 mt-1 w-24 bg-white rounded-md shadow-lg border border-gray-200 z-50"
    >
      <button
        v-for="lang in languages"
        :key="lang.code"
        :class="[
          'w-full text-left px-3 py-1.5 text-sm transition-colors',
          locale === lang.code
            ? 'bg-primary-50 text-primary-600'
            : 'text-gray-600 hover:bg-gray-100',
        ]"
        @click="switchLocale(lang.code)"
      >
        {{ lang.label }}
      </button>
    </div>
  </div>
</template>
