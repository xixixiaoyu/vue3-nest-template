import { describe, expect, it, vi, beforeEach } from 'vitest'
import type { AuthResponse, User } from '@my-app/shared'
import { AuthController } from './auth.controller'
import type { AuthService } from './auth.service'

const mockAuthService = {
  login: vi.fn(),
  register: vi.fn(),
  refreshToken: vi.fn(),
  requestPasswordReset: vi.fn(),
  resetPassword: vi.fn(),
  logout: vi.fn(),
}

describe('AuthController', () => {
  let controller: AuthController

  beforeEach(() => {
    vi.clearAllMocks()
    controller = new AuthController(mockAuthService as unknown as AuthService)
  })

  it('should delegate login request to auth service', async () => {
    const response: AuthResponse = {
      user: {
        id: 1,
        email: 'alice@example.com',
        name: 'Alice',
        avatar: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    }
    mockAuthService.login.mockResolvedValue(response)

    const result = await controller.login({
      email: 'alice@example.com',
      password: 'password123',
    } as never)

    expect(mockAuthService.login).toHaveBeenCalledWith({
      email: 'alice@example.com',
      password: 'password123',
    })
    expect(result).toEqual(response)
  })

  it('should delegate refresh token request to auth service', async () => {
    const response: AuthResponse = {
      user: {
        id: 2,
        email: 'bob@example.com',
        name: 'Bob',
        avatar: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    }
    mockAuthService.refreshToken.mockResolvedValue(response)

    const result = await controller.refreshToken({
      refreshToken: 'old-refresh-token',
    } as never)

    expect(mockAuthService.refreshToken).toHaveBeenCalledWith('old-refresh-token')
    expect(result).toEqual(response)
  })

  it('should return profile payload directly for current user endpoint', async () => {
    const user: User = {
      id: 3,
      email: 'charlie@example.com',
      name: 'Charlie',
      avatar: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const result = await controller.getProfile(user)

    expect(result).toBe(user)
  })
})
