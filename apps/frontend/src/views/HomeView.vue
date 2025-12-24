<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'

const { t } = useI18n()
const authStore = useAuthStore()
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <div class="bg-warm-card rounded-lg shadow p-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-4">
        {{ t('common.welcome') }}, {{ authStore.user?.name || t('common.user') }}!
      </h1>
      <p class="text-gray-600">
        {{ t('home.welcomeMessage') }}
      </p>
    </div>
  </div>
</template>
