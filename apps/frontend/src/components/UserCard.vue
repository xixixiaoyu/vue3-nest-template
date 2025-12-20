<script setup lang="ts">
import type { UserDto } from '@my-app/shared'

defineProps<{
  user: UserDto
}>()

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
</script>

<template>
  <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
    <div class="flex items-center space-x-4">
      <div class="flex-shrink-0">
        <img
          v-if="user.avatar"
          :src="user.avatar"
          :alt="user.name"
          class="h-12 w-12 rounded-full object-cover"
        />
        <div v-else class="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
          <span class="text-primary-600 font-semibold text-lg">
            {{ user.name.charAt(0).toUpperCase() }}
          </span>
        </div>
      </div>
      <div class="flex-1 min-w-0">
        <h3 class="text-lg font-semibold text-gray-900 truncate">
          {{ user.name }}
        </h3>
        <p class="text-gray-500 truncate">
          {{ user.email }}
        </p>
      </div>
    </div>
    <div class="mt-4 pt-4 border-t border-gray-100">
      <p class="text-sm text-gray-400">Joined {{ formatDate(user.createdAt) }}</p>
    </div>
  </div>
</template>
