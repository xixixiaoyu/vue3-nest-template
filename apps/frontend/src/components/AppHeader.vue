<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import LanguageSwitcher from './LanguageSwitcher.vue'
import { useAuthStore } from '@/stores/auth'

const { t } = useI18n()
const authStore = useAuthStore()

function handleLogout() {
  authStore.logout()
}
</script>

<template>
  <header class="bg-warm-bg shadow-sm border-b border-gray-200">
    <nav class="container mx-auto px-4 h-16 flex items-center justify-between">
      <RouterLink to="/" class="text-xl font-bold text-primary-600"> My App </RouterLink>
      <div class="flex items-center space-x-6">
        <template v-if="authStore.isAuthenticated && authStore.user">
          <div class="flex items-center space-x-3">
            <img
              v-if="authStore.user.avatar"
              :src="authStore.user.avatar"
              :alt="authStore.user.name"
              class="w-8 h-8 rounded-full object-cover"
            />
            <div
              v-else
              class="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-medium"
            >
              {{ authStore.user.name.charAt(0).toUpperCase() }}
            </div>
            <span class="text-gray-700">{{ t('common.welcome') }}, {{ authStore.user.name }}</span>
          </div>
          <button
            @click="handleLogout"
            class="text-gray-600 hover:text-primary-600 transition-colors"
          >
            {{ t('common.logout') }}
          </button>
        </template>
        <LanguageSwitcher />
      </div>
    </nav>
  </header>
</template>
