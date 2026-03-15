import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Cache } from 'cache-manager'
import { RedisService, CachePrefix, CacheTTL, type NamespacedCache } from './redis.service'

interface CacheStore {
  disconnect?: () => Promise<void>
}

interface CacheMock {
  get: ReturnType<typeof vi.fn>
  set: ReturnType<typeof vi.fn>
  del: ReturnType<typeof vi.fn>
  clear: ReturnType<typeof vi.fn>
  stores?: CacheStore[]
}

interface RedisLogger {
  log: (message: string) => void
  warn: (message: string, error?: unknown) => void
  error: (message: string, error?: unknown) => void
}

const createCacheMock = (): CacheMock => ({
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
  clear: vi.fn(),
  stores: [],
})

describe('RedisService', () => {
  let cacheMock: CacheMock
  let service: RedisService
  let logger: RedisLogger

  beforeEach(() => {
    vi.clearAllMocks()
    cacheMock = createCacheMock()
    service = new RedisService(cacheMock as unknown as Cache)
    logger = (service as unknown as { logger: RedisLogger }).logger
  })

  describe('onModuleDestroy', () => {
    it('should disconnect all cache stores with disconnect method', async () => {
      const disconnectA = vi.fn().mockResolvedValue(undefined)
      const disconnectB = vi.fn().mockResolvedValue(undefined)
      cacheMock.stores = [{ disconnect: disconnectA }, {}, { disconnect: disconnectB }]
      const logSpy = vi.spyOn(logger, 'log')

      await service.onModuleDestroy()

      expect(disconnectA).toHaveBeenCalledTimes(1)
      expect(disconnectB).toHaveBeenCalledTimes(1)
      expect(logSpy).toHaveBeenCalledWith('Redis connection closed')
    })

    it('should warn when disconnect throws error', async () => {
      const disconnect = vi.fn().mockRejectedValue(new Error('disconnect failed'))
      cacheMock.stores = [{ disconnect }]
      const warnSpy = vi.spyOn(logger, 'warn')

      await service.onModuleDestroy()

      expect(warnSpy).toHaveBeenCalledWith('Failed to close Redis connection', expect.any(Error))
    })

    it('should be no-op when stores are not available', async () => {
      cacheMock.stores = undefined
      const logSpy = vi.spyOn(logger, 'log')

      await service.onModuleDestroy()

      expect(logSpy).not.toHaveBeenCalled()
    })
  })

  describe('get', () => {
    it('should return cached value with prefix', async () => {
      cacheMock.get.mockResolvedValue('alice')

      const result = await service.get('name', { prefix: CachePrefix.USER })

      expect(cacheMock.get).toHaveBeenCalledWith('user:name')
      expect(result).toBe('alice')
    })

    it('should normalize null value to undefined', async () => {
      cacheMock.get.mockResolvedValue(null)

      const result = await service.get('missing')

      expect(result).toBeUndefined()
    })

    it('should return undefined when cache get fails', async () => {
      cacheMock.get.mockRejectedValue(new Error('get failed'))
      const errorSpy = vi.spyOn(logger, 'error')

      const result = await service.get('broken')

      expect(result).toBeUndefined()
      expect(errorSpy).toHaveBeenCalledWith('Cache get error for key: broken', expect.any(Error))
    })
  })

  describe('set and del', () => {
    it('should set value with default TTL in milliseconds', async () => {
      cacheMock.set.mockResolvedValue(undefined)

      await service.set('token', 'abc')

      expect(cacheMock.set).toHaveBeenCalledWith('token', 'abc', CacheTTL.FIVE_MINUTES * 1000)
    })

    it('should set value with prefix and custom TTL', async () => {
      cacheMock.set.mockResolvedValue(undefined)

      await service.set('token', 'abc', { prefix: CachePrefix.AUTH, ttl: 60 })

      expect(cacheMock.set).toHaveBeenCalledWith('auth:token', 'abc', 60 * 1000)
    })

    it('should log set error without throwing', async () => {
      cacheMock.set.mockRejectedValue(new Error('set failed'))
      const errorSpy = vi.spyOn(logger, 'error')

      await expect(service.set('token', 'abc')).resolves.toBeUndefined()
      expect(errorSpy).toHaveBeenCalledWith('Cache set error for key: token', expect.any(Error))
    })

    it('should delete value with prefix', async () => {
      cacheMock.del.mockResolvedValue(undefined)

      await service.del('session-id', { prefix: CachePrefix.SESSION })

      expect(cacheMock.del).toHaveBeenCalledWith('session:session-id')
    })

    it('should log delete error without throwing', async () => {
      cacheMock.del.mockRejectedValue(new Error('del failed'))
      const errorSpy = vi.spyOn(logger, 'error')

      await expect(service.del('k')).resolves.toBeUndefined()
      expect(errorSpy).toHaveBeenCalledWith('Cache del error for key: k', expect.any(Error))
    })
  })

  describe('delMany and reset', () => {
    it('should delete multiple keys with prefix', async () => {
      cacheMock.del.mockResolvedValue(undefined)

      await service.delMany(['a', 'b'], { prefix: CachePrefix.TEMP })

      expect(cacheMock.del).toHaveBeenCalledTimes(2)
      expect(cacheMock.del).toHaveBeenNthCalledWith(1, 'temp:a')
      expect(cacheMock.del).toHaveBeenNthCalledWith(2, 'temp:b')
    })

    it('should log delMany errors', async () => {
      cacheMock.del.mockRejectedValue(new Error('batch failed'))
      const errorSpy = vi.spyOn(logger, 'error')

      await expect(service.delMany(['a', 'b'])).resolves.toBeUndefined()
      expect(errorSpy).toHaveBeenCalledWith('Cache delMany error', expect.any(Error))
    })

    it('should clear all cache', async () => {
      cacheMock.clear.mockResolvedValue(undefined)
      const warnSpy = vi.spyOn(logger, 'warn')

      await service.reset()

      expect(cacheMock.clear).toHaveBeenCalledTimes(1)
      expect(warnSpy).toHaveBeenCalledWith('Cache has been cleared')
    })

    it('should log reset errors', async () => {
      cacheMock.clear.mockRejectedValue(new Error('reset failed'))
      const errorSpy = vi.spyOn(logger, 'error')

      await expect(service.reset()).resolves.toBeUndefined()
      expect(errorSpy).toHaveBeenCalledWith('Cache reset error', expect.any(Error))
    })
  })

  describe('getOrSet / has / refresh', () => {
    it('should return cached value without calling factory', async () => {
      cacheMock.get.mockResolvedValue('cached')
      const factory = vi.fn().mockResolvedValue('new-value')

      const result = await service.getOrSet('profile', factory)

      expect(result).toBe('cached')
      expect(factory).not.toHaveBeenCalled()
    })

    it('should call factory and cache value on miss', async () => {
      cacheMock.get.mockResolvedValue(undefined)
      cacheMock.set.mockResolvedValue(undefined)
      const factory = vi.fn().mockResolvedValue('new-value')

      const result = await service.getOrSet('profile', factory, {
        prefix: CachePrefix.USER,
        ttl: 120,
      })

      expect(result).toBe('new-value')
      expect(factory).toHaveBeenCalledTimes(1)
      expect(cacheMock.set).toHaveBeenCalledWith('user:profile', 'new-value', 120000)
    })

    it('should not cache null factory result', async () => {
      cacheMock.get.mockResolvedValue(undefined)
      const factory = vi.fn().mockResolvedValue(null)

      const result = await service.getOrSet('nullable', factory)

      expect(result).toBeNull()
      expect(cacheMock.set).not.toHaveBeenCalled()
    })

    it('should return has status based on get result', async () => {
      cacheMock.get.mockResolvedValueOnce('exists').mockResolvedValueOnce(undefined)

      await expect(service.has('k1')).resolves.toBe(true)
      await expect(service.has('k2')).resolves.toBe(false)
    })

    it('should refresh cached key and return status', async () => {
      cacheMock.get.mockResolvedValueOnce('exists').mockResolvedValueOnce(undefined)
      cacheMock.set.mockResolvedValue(undefined)

      await expect(service.refresh('k1', { ttl: 10 })).resolves.toBe(true)
      await expect(service.refresh('k2')).resolves.toBe(false)
      expect(cacheMock.set).toHaveBeenCalledWith('k1', 'exists', 10000)
    })
  })

  describe('client and namespace', () => {
    it('should expose underlying cache client', () => {
      expect(service.getClient()).toBe(cacheMock)
    })

    it('should create namespaced cache delegating operations', async () => {
      const ns: NamespacedCache = service.namespace(CachePrefix.AUTH)
      cacheMock.get.mockResolvedValue(undefined)
      cacheMock.set.mockResolvedValue(undefined)
      cacheMock.del.mockResolvedValue(undefined)

      await ns.set('k', 'v', 12)
      await ns.get('k', 12)
      await ns.del('k')
      await ns.getOrSet('m', async () => 'from-factory', 6)
      await ns.has('m')

      expect(cacheMock.set).toHaveBeenCalledWith('auth:k', 'v', 12000)
      expect(cacheMock.get).toHaveBeenCalledWith('auth:k')
      expect(cacheMock.del).toHaveBeenCalledWith('auth:k')
      expect(cacheMock.set).toHaveBeenCalledWith('auth:m', 'from-factory', 6000)
      expect(cacheMock.get).toHaveBeenCalledWith('auth:m')
    })
  })
})
