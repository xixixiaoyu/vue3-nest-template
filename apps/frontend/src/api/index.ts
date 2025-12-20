import axios from 'axios'
import type { User, ApiResponse } from '@my-app/shared'

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
 * 从 cookie 中获取指定名称的值
 */
function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`))
  return match ? decodeURIComponent(match[2]) : null
}

// 请求拦截器
httpClient.interceptors.request.use(
  (config) => {
    // 如果存在 token，添加到请求头
    const token = localStorage.getItem('token')
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

// 响应拦截器
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // 处理通用错误
    if (error.response?.status === 401) {
      // 未授权，清除 token
      localStorage.removeItem('token')
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
}

export { httpClient }
