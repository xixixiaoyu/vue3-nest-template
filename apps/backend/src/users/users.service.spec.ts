import { describe, it, expect, vi, beforeEach } from 'vitest'
import { UsersService } from './users.service'
import { NotFoundException, ConflictException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { AuthService } from '../auth/auth.service'

// Mock PrismaService
const mockPrismaService = {
  user: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
  },
}

// Mock AuthService
const mockAuthService = {
  hashPassword: vi.fn().mockResolvedValue('hashed_password'),
}

describe('UsersService', () => {
  let service: UsersService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new UsersService(
      mockPrismaService as unknown as PrismaService,
      mockAuthService as unknown as AuthService,
    )
  })

  describe('findAll', () => {
    it('should return all users', async () => {
      const mockUsers = [
        {
          id: 1,
          email: 'test@example.com',
          name: 'Test User',
          avatar: null,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ]
      mockPrismaService.user.findMany.mockResolvedValue(mockUsers)

      const result = await service.findAll()

      expect(result).toHaveLength(1)
      expect(result[0].email).toBe('test@example.com')
      expect(typeof result[0].createdAt).toBe('string')
    })
  })

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        avatar: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      }
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser)

      const result = await service.findOne(1)

      expect(result.id).toBe(1)
      expect(result.email).toBe('test@example.com')
    })

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null)

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException)
    })
  })

  describe('create', () => {
    it('should create a new user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null)
      mockPrismaService.user.create.mockResolvedValue({
        id: 1,
        email: 'new@example.com',
        name: 'New User',
        avatar: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      })

      const result = await service.create({
        email: 'new@example.com',
        name: 'New User',
        password: 'password123',
      })

      expect(result.email).toBe('new@example.com')
      expect(mockPrismaService.user.create).toHaveBeenCalled()
    })

    it('should throw ConflictException if email exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: 1 })

      await expect(
        service.create({
          email: 'existing@example.com',
          name: 'User',
          password: 'password123',
        }),
      ).rejects.toThrow(ConflictException)
    })
  })
})
