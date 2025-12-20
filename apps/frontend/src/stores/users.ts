import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { User } from '@my-app/shared'
import { api } from '@/api'

/**
 * 用户状态管理
 */
export const useUsersStore = defineStore('users', () => {
  /** 用户列表 */
  const users = ref<User[]>([])
  /** 加载状态 */
  const loading = ref(false)
  /** 错误信息 */
  const error = ref<string | null>(null)

  /**
   * 获取用户列表
   */
  async function fetchUsers() {
    loading.value = true
    error.value = null

    try {
      const response = await api.getUsers()
      users.value = response.data
    } catch (e) {
      error.value = e instanceof Error ? e.message : '获取用户列表失败'
      console.error('获取用户列表失败:', e)
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
