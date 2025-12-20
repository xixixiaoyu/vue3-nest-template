<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <h1 class="text-4xl font-bold text-gray-900 mb-6">{{ t('home.title') }}</h1>
    <p class="text-lg text-gray-600 mb-8">
      {{ t('home.description') }}
    </p>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-primary-600 mb-3">{{ t('home.frontend') }}</h2>
        <p class="text-gray-600">{{ t('home.frontendDesc') }}</p>
      </div>
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-primary-600 mb-3">{{ t('home.backend') }}</h2>
        <p class="text-gray-600">{{ t('home.backendDesc') }}</p>
      </div>
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-primary-600 mb-3">{{ t('home.shared') }}</h2>
        <p class="text-gray-600">{{ t('home.sharedDesc') }}</p>
      </div>
    </div>
    <div class="mt-8">
      <RouterLink
        to="/users"
        class="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
      >
        {{ t('home.viewUsersDemo') }}
        <svg class="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </RouterLink>
    </div>
  </div>
</template>
