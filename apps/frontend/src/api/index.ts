import axios from 'axios'
import type { User, ApiResponse, AuthResponse, RegisterInput, LoginInput } from '@my-app/shared'
import { useAuthStore } from '../stores/auth'

/**
 * HTTP 客户端实例
 */
const httpClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * 初始化 CSRF Token
 * 在首次请求前发起一个 GET 请求获取 CSRF token cookie
 */
let csrfInitialized = false

async function initCsrfToken(): Promise<void> {
  if (csrfInitialized) return

  try {
    // 发起一个 GET 请求到健康检查端点，后端会设置 CSRF token cookie
    await httpClient.get('/health', { timeout: 5000 })
    csrfInitialized = true
  } catch {
    // 静默失败，不影响后续请求
    csrfInitialized = true
  }
}

/**
 * 从 cookie 中获取指定名称的值
 */
function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`))
  return match ? decodeURIComponent(match[2]) : null
}

/**
 * 从 localStorage 获取 token（兼容 pinia 持久化）
 */
function getToken(): string | null {
  // 尝试从 localStorage 获取（pinia-plugin-persistedstate 默认存储位置）
  const authData = localStorage.getItem('auth')
  if (authData) {
    try {
      const parsed = JSON.parse(authData)
      return parsed.token || null
    } catch {
      return null
    }
  }
  return null
}

// 请求拦截器
httpClient.interceptors.request.use(
  async (config) => {
    // 首次请求前初始化 CSRF token
    if (!csrfInitialized) {
      await initCsrfToken()
    }

    // 如果存在 token，添加到请求头
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // 非 GET 请求添加 CSRF token
    if (config.method && !['get', 'head', 'options'].includes(config.method.toLowerCase())) {
      const csrfToken = getCookie('XSRF-TOKEN')
      if (csrfToken) {
        config.headers['X-XSRF-TOKEN'] = csrfToken
      }
    }

    return config
  },
  (error) => Promise.reject(error),
)

// 防止并发刷新请求
let isRefreshing = false
let refreshSubscribers: Array<(token: string) => void> = []

/**
 * 订阅刷新令牌完成事件
 */
function subscribeTokenRefresh(callback: (token: string) => void) {
  refreshSubscribers.push(callback)
}

/**
 * 刷新令牌完成后通知所有订阅者
 */
function onRefreshed(token: string) {
  refreshSubscribers.forEach((callback) => callback(token))
  refreshSubscribers = []
}

// 响应拦截器
httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // 处理 401 错误
    if (error.response?.status === 401 && !originalRequest._retry) {
      // 如果正在刷新，将请求加入队列
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            resolve(httpClient(originalRequest))
          })
        }).catch(() => {
          return Promise.reject(error)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const authStore = useAuthStore()
        const success = await authStore.refreshAccessToken()

        if (success && authStore.token) {
          const newToken = authStore.token
          onRefreshed(newToken)
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          return httpClient(originalRequest)
        }
      } catch {
        // 刷新失败，清除认证状态
        localStorage.removeItem('auth')
        // 触发登出事件，让组件决定是否跳转
        window.dispatchEvent(new CustomEvent('auth:logout'))
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)

/**
 * API 接口集合
 */
export const api = {
  /**
   * 获取用户列表
   */
  async getUsers(): Promise<ApiResponse<User[]>> {
    const { data } = await httpClient.get<ApiResponse<User[]>>('/users')
    return data
  },

  /**
   * 获取单个用户
   */
  async getUser(id: number): Promise<ApiResponse<User>> {
    const { data } = await httpClient.get<ApiResponse<User>>(`/users/${id}`)
    return data
  },

  /**
   * 创建用户
   */
  async createUser(userData: {
    email: string
    name: string
    password: string
  }): Promise<ApiResponse<User>> {
    const { data } = await httpClient.post<ApiResponse<User>>('/users', userData)
    return data
  },

  /**
   * 获取当前用户信息
   */
  async getMe(): Promise<ApiResponse<User>> {
    const { data } = await httpClient.get<ApiResponse<User>>('/auth/me')
    return data
  },

  /**
   * 用户登录
   */
  async login(credentials: LoginInput): Promise<ApiResponse<AuthResponse>> {
    const { data } = await httpClient.post<ApiResponse<AuthResponse>>('/auth/login', credentials)
    return data
  },

  /**
   * 用户注册
   */
  async register(userData: RegisterInput): Promise<ApiResponse<AuthResponse>> {
    const { data } = await httpClient.post<ApiResponse<AuthResponse>>('/auth/register', userData)
    return data
  },

  /**
   * 请求密码重置
   */
  async forgotPassword(email: string): Promise<ApiResponse<{ message: string }>> {
    const { data } = await httpClient.post<ApiResponse<{ message: string }>>(
      '/auth/forgot-password',
      {
        email,
      },
    )
    return data
  },

  /**
   * 重置密码
   */
  async resetPassword(token: string, password: string): Promise<ApiResponse<{ message: string }>> {
    const { data } = await httpClient.post<ApiResponse<{ message: string }>>(
      '/auth/reset-password',
      {
        token,
        password,
      },
    )
    return data
  },

  /**
   * 刷新访问令牌
   */
  async refreshToken(refreshToken: string): Promise<ApiResponse<AuthResponse>> {
    const { data } = await httpClient.post<ApiResponse<AuthResponse>>('/auth/refresh', {
      refreshToken,
    })
    return data
  },

  /**
   * 用户登出
   */
  async logout(refreshToken: string): Promise<ApiResponse<{ message: string }>> {
    const { data } = await httpClient.post<ApiResponse<{ message: string }>>('/auth/logout', {
      refreshToken,
    })
    return data
  },
}

export { httpClient, initCsrfToken }
