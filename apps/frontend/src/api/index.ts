import axios from 'axios'
import type { UserDto, ApiResponse } from '@my-app/shared'

const httpClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
httpClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem('token')
    }
    return Promise.reject(error)
  }
)

export const api = {
  // Users
  async getUsers(): Promise<ApiResponse<UserDto[]>> {
    const { data } = await httpClient.get<ApiResponse<UserDto[]>>('/users')
    return data
  },

  async getUser(id: number): Promise<ApiResponse<UserDto>> {
    const { data } = await httpClient.get<ApiResponse<UserDto>>(`/users/${id}`)
    return data
  },

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
