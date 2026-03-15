import { describe, it, expect, vi, beforeEach } from 'vitest'
import { UnauthorizedException } from '@nestjs/common'
import { AuthService } from './auth.service'
import { PrismaService } from '../prisma/prisma.service'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { MailService } from '../mail/mail.service'
import { RedisService, CachePrefix } from '../redis/redis.service'

const mockPrismaService = {
  user: {
    findUnique: vi.fn(),
  },
}

const mockJwtService = {
  verify: vi.fn(),
  sign: vi.fn(),
}

const mockConfigService = {
  get: vi.fn((key: string, defaultValue?: unknown) => {
    if (key === 'JWT_ACCESS_EXPIRES_IN') return 900
    if (key === 'JWT_REFRESH_EXPIRES_IN') return 604800
    return defaultValue
  }),
}

const mockMailService = {
  sendPasswordReset: vi.fn(),
}

const mockRedisService = {
  has: vi.fn(),
  set: vi.fn(),
}

describe('AuthService', () => {
  let service: AuthService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new AuthService(
      mockPrismaService as unknown as PrismaService,
      mockJwtService as unknown as JwtService,
      mockConfigService as unknown as ConfigService,
      mockMailService as unknown as MailService,
      mockRedisService as unknown as RedisService,
    )
  })

  describe('refreshToken', () => {
    it('should reject blacklisted refresh token', async () => {
      mockRedisService.has.mockResolvedValue(true)

      await expect(service.refreshToken('blacklisted-token')).rejects.toThrow(UnauthorizedException)
      expect(mockJwtService.verify).not.toHaveBeenCalled()
    })

    it('should rotate refresh token and blacklist old token', async () => {
      const nowSeconds = Math.floor(Date.now() / 1000)
      mockRedisService.has.mockResolvedValue(false)
      mockJwtService.verify.mockReturnValue({
        sub: 1,
        email: 'test@example.com',
        type: 'refresh',
        exp: nowSeconds + 3600,
      })
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashed',
        avatar: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      mockJwtService.sign
        .mockImplementationOnce(() => 'new-access-token')
        .mockImplementationOnce(() => {
          return 'new-refresh-token'
        })

      const result = await service.refreshToken('old-refresh-token')

      expect(result.accessToken).toBe('new-access-token')
      expect(result.refreshToken).toBe('new-refresh-token')
      expect(mockRedisService.set).toHaveBeenCalledWith('blacklist:old-refresh-token', '1', {
        prefix: CachePrefix.AUTH,
        ttl: expect.any(Number),
      })
    })
  })

  describe('logout', () => {
    it('should reject token that does not belong to current user', async () => {
      const nowSeconds = Math.floor(Date.now() / 1000)
      mockJwtService.verify.mockReturnValue({
        sub: 2,
        email: 'test@example.com',
        type: 'refresh',
        exp: nowSeconds + 3600,
      })

      await expect(service.logout(1, 'refresh-token')).rejects.toThrow(UnauthorizedException)
      expect(mockRedisService.set).not.toHaveBeenCalled()
    })

    it('should blacklist valid refresh token on logout', async () => {
      const nowSeconds = Math.floor(Date.now() / 1000)
      mockJwtService.verify.mockReturnValue({
        sub: 1,
        email: 'test@example.com',
        type: 'refresh',
        exp: nowSeconds + 3600,
      })

      await service.logout(1, 'refresh-token')

      expect(mockRedisService.set).toHaveBeenCalledWith('blacklist:refresh-token', '1', {
        prefix: CachePrefix.AUTH,
        ttl: expect.any(Number),
      })
    })
  })
})
