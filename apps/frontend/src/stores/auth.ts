import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { httpClient } from '../api'
import type { UserDto, LoginDto, AuthResponseDto } from '@my-app/shared'

/**
 * 认证状态管理
 * 使用 pinia-plugin-persistedstate 持久化 token
 */
export const useAuthStore = defineStore(
  'auth',
  () => {
    // 状态
    const token = ref<string | null>(null)
    const user = ref<UserDto | null>(null)
    const loading = ref(false)
    const error = ref<string | null>(null)

    // 计算属性
    const isAuthenticated = computed(() => !!token.value)

    /**
     * 登录
     */
    async function login(credentials: LoginDto): Promise<boolean> {
      loading.value = true
      error.value = null

      try {
        const { data } = await httpClient.post<AuthResponseDto>('/auth/login', credentials)
        token.value = data.accessToken
        user.value = data.user
        return true
      } catch (e: unknown) {
        const err = e as { response?: { data?: { message?: string } } }
        error.value = err.response?.data?.message || '登录失败'
        return false
      } finally {
        loading.value = false
      }
    }

    /**
     * 获取当前用户信息
     */
    async function fetchCurrentUser(): Promise<void> {
      if (!token.value) return

      try {
        const { data } = await httpClient.get<UserDto>('/auth/me', {
          headers: { Authorization: `Bearer ${token.value}` },
        })
        user.value = data
      } catch {
        // Token 可能已失效
        logout()
      }
    }

    /**
     * 登出
     */
    function logout(): void {
      token.value = null
      user.value = null
      error.value = null
    }

    /**
     * 清除错误
     */
    function clearError(): void {
      error.value = null
    }

    return {
      // 状态
      token,
      user,
      loading,
      error,
      // 计算属性
      isAuthenticated,
      // 方法
      login,
      logout,
      fetchCurrentUser,
      clearError,
    }
  },
  {
    persist: {
      paths: ['token'], // 只持久化 token
    },
  },
)
