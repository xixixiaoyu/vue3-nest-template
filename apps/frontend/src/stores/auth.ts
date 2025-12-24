import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '../api'
import type { User, LoginInput, RegisterInput } from '@my-app/shared'

/**
 * 认证状态管理
 * 使用 pinia-plugin-persistedstate 持久化 token
 */
export const useAuthStore = defineStore(
  'auth',
  () => {
    // 状态
    const token = ref<string | null>(null)
    const refreshToken = ref<string | null>(null)
    const user = ref<User | null>(null)
    const loading = ref(false)
    const error = ref<string | null>(null)

    // 计算属性
    const isAuthenticated = computed(() => !!token.value)

    /**
     * 登录
     */
    async function login(credentials: LoginInput): Promise<boolean> {
      loading.value = true
      error.value = null

      try {
        const response = await api.login(credentials)
        token.value = response.data.accessToken
        refreshToken.value = response.data.refreshToken || null
        user.value = response.data.user
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
     * 注册
     */
    async function register(userData: RegisterInput): Promise<boolean> {
      loading.value = true
      error.value = null

      try {
        const response = await api.register(userData)
        token.value = response.data.accessToken
        refreshToken.value = response.data.refreshToken || null
        user.value = response.data.user
        return true
      } catch (e: unknown) {
        const err = e as { response?: { data?: { message?: string } } }
        error.value = err.response?.data?.message || '注册失败'
        return false
      } finally {
        loading.value = false
      }
    }

    /**
     * 请求密码重置
     */
    async function forgotPassword(email: string): Promise<boolean> {
      loading.value = true
      error.value = null

      try {
        await api.forgotPassword(email)
        return true
      } catch (e: unknown) {
        const err = e as { response?: { data?: { message?: string } } }
        error.value = err.response?.data?.message || '请求失败'
        return false
      } finally {
        loading.value = false
      }
    }

    /**
     * 重置密码
     */
    async function resetPassword(token: string, password: string): Promise<boolean> {
      loading.value = true
      error.value = null

      try {
        await api.resetPassword(token, password)
        return true
      } catch (e: unknown) {
        const err = e as { response?: { data?: { message?: string } } }
        error.value = err.response?.data?.message || '重置密码失败'
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
        const { data } = await api.getUser(user.value?.id || 0)
        user.value = data
      } catch {
        logout()
      }
    }

    /**
     * 刷新访问令牌
     */
    async function refreshAccessToken(): Promise<boolean> {
      if (!refreshToken.value) {
        return false
      }

      try {
        const response = await api.refreshToken(refreshToken.value)
        token.value = response.data.accessToken
        user.value = response.data.user
        return true
      } catch {
        logout()
        return false
      }
    }

    /**
     * 登出
     */
    function logout(): void {
      token.value = null
      refreshToken.value = null
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
      refreshToken,
      user,
      loading,
      error,
      // 计算属性
      isAuthenticated,
      // 方法
      login,
      register,
      forgotPassword,
      resetPassword,
      logout,
      fetchCurrentUser,
      refreshAccessToken,
      clearError,
    }
  },
  {
    persist: {
      key: 'auth',
      storage: localStorage,
      paths: ['token', 'refreshToken', 'user'],
    },
  },
)
