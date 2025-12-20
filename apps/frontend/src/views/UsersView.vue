<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useUsersStore } from '@/stores/users'
import UserCard from '@/components/UserCard.vue'

const usersStore = useUsersStore()
const { users, loading, error } = storeToRefs(usersStore)

onMounted(() => {
  usersStore.fetchUsers()
})
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Users</h1>
      <button
        :disabled="loading"
        class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
        @click="usersStore.fetchUsers()"
      >
        {{ loading ? 'Loading...' : 'Refresh' }}
      </button>
    </div>

    <!-- Error State -->
    <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <p class="text-red-600">
        {{ error }}
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="loading && users.length === 0" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
      <p class="mt-4 text-gray-600">Loading users...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="users.length === 0" class="text-center py-12 bg-white rounded-lg shadow">
      <svg
        class="mx-auto h-12 w-12 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
        />
      </svg>
      <p class="mt-4 text-gray-600">No users found. Start the backend and create some users!</p>
    </div>

    <!-- Users List -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <UserCard v-for="user in users" :key="user.id" :user="user" />
    </div>
  </div>
</template>
