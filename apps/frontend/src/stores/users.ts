import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { UserDto } from '@my-app/shared'
import { api } from '@/api'

export const useUsersStore = defineStore('users', () => {
  const users = ref<UserDto[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchUsers() {
    loading.value = true
    error.value = null

    try {
      const response = await api.getUsers()
      users.value = response.data
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch users'
      console.error('Failed to fetch users:', e)
    } finally {
      loading.value = false
    }
  }

  return {
    users,
    loading,
    error,
    fetchUsers,
  }
})
