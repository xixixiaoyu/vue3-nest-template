import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthStore } from './auth'
import { api } from '../api'

vi.mock('../api', () => ({
  api: {
    login: vi.fn(),
    register: vi.fn(),
    forgotPassword: vi.fn(),
    resetPassword: vi.fn(),
    getMe: vi.fn(),
    refreshToken: vi.fn(),
    logout: vi.fn(),
  },
}))

describe('auth store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('should clear auth state when refresh token is missing', async () => {
    const store = useAuthStore()
    store.token = 'expired-access-token'
    store.user = {
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
      avatar: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const ok = await store.refreshAccessToken()

    expect(ok).toBe(false)
    expect(store.token).toBeNull()
    expect(store.refreshToken).toBeNull()
    expect(store.user).toBeNull()
  })

  it('should join array error messages on login failure', async () => {
    const store = useAuthStore()
    vi.mocked(api.login).mockRejectedValue({
      response: {
        data: {
          message: ['邮箱格式错误', '密码不能为空'],
        },
      },
    })

    const ok = await store.login({
      email: 'bad-email',
      password: '',
    })

    expect(ok).toBe(false)
    expect(store.error).toBe('邮箱格式错误, 密码不能为空')
  })
})
