import axios from 'axios'
import type { UserDto, ApiResponse } from '@my-app/shared'

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

// 请求拦截器
httpClient.interceptors.request.use(
  (config) => {
    // 如果存在 token，添加到请求头
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
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
  async getUsers(): Promise<ApiResponse<UserDto[]>> {
    const { data } = await httpClient.get<ApiResponse<UserDto[]>>('/users')
    return data
  },

  /**
   * 获取单个用户
   */
  async getUser(id: number): Promise<ApiResponse<UserDto>> {
    const { data } = await httpClient.get<ApiResponse<UserDto>>(`/users/${id}`)
    return data
  },

  /**
   * 创建用户
   */
  async createUser(userData: {
    email: string
    name: string
    password: string
  }): Promise<ApiResponse<UserDto>> {
    const { data } = await httpClient.post<ApiResponse<UserDto>>('/users', userData)
    return data
  },
}

export { httpClient }
