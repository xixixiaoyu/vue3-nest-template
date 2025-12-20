<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import LanguageSwitcher from './LanguageSwitcher.vue'

const { t } = useI18n()
</script>

<template>
  <header class="bg-white shadow-sm border-b border-gray-200">
    <nav class="container mx-auto px-4 h-16 flex items-center justify-between">
      <RouterLink to="/" class="text-xl font-bold text-primary-600"> My App </RouterLink>
      <div class="flex items-center space-x-6">
        <RouterLink to="/" class="text-gray-600 hover:text-primary-600 transition-colors">
          {{ t('common.home') }}
        </RouterLink>
        <RouterLink to="/users" class="text-gray-600 hover:text-primary-600 transition-colors">
          {{ t('common.users') }}
        </RouterLink>
        <LanguageSwitcher />
      </div>
    </nav>
  </header>
</template>
