import { Injectable, Inject, Logger, OnModuleDestroy } from '@nestjs/common'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'

/**
 * 缓存键前缀枚举
 */
export enum CachePrefix {
  USER = 'user',
  SESSION = 'session',
  AUTH = 'auth',
  RATE_LIMIT = 'rate_limit',
  CONFIG = 'config',
  TEMP = 'temp',
}

/**
 * 缓存配置选项
 */
export interface CacheOptions {
  /** 过期时间（秒） */
  ttl?: number
  /** 缓存键前缀 */
  prefix?: CachePrefix | string
}

/**
 * 默认 TTL 常量（秒）
 */
export const CacheTTL = {
  /** 1 分钟 */
  ONE_MINUTE: 60,
  /** 5 分钟 */
  FIVE_MINUTES: 300,
  /** 15 分钟 */
  FIFTEEN_MINUTES: 900,
  /** 30 分钟 */
  HALF_HOUR: 1800,
  /** 1 小时 */
  ONE_HOUR: 3600,
  /** 1 天 */
  ONE_DAY: 86400,
  /** 1 周 */
  ONE_WEEK: 604800,
} as const

/**
 * Redis 缓存服务
 * 提供统一的缓存操作接口，支持前缀管理、批量操作等
 */
@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name)
  private readonly defaultTTL = CacheTTL.FIVE_MINUTES

  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  async onModuleDestroy() {
    try {
      // cache-manager v7 使用 stores 数组
      const stores = (this.cache as any).stores
      if (stores && Array.isArray(stores)) {
        for (const store of stores) {
          if (store && typeof store.disconnect === 'function') {
            await store.disconnect()
          }
        }
        this.logger.log('Redis connection closed')
      }
    } catch (error) {
      this.logger.warn('Failed to close Redis connection', error)
    }
  }

  /**
   * 构建带前缀的缓存键
   */
  private buildKey(key: string, prefix?: CachePrefix | string): string {
    return prefix ? `${prefix}:${key}` : key
  }

  /**
   * 获取缓存值
   */
  async get<T>(key: string, options?: CacheOptions): Promise<T | undefined> {
    try {
      const fullKey = this.buildKey(key, options?.prefix)
      const value = await this.cache.get<T>(fullKey)
      return value ?? undefined
    } catch (error) {
      this.logger.error(`Cache get error for key: ${key}`, error)
      return undefined
    }
  }

  /**
   * 设置缓存值
   */
  async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    try {
      const fullKey = this.buildKey(key, options?.prefix)
      const ttl = (options?.ttl ?? this.defaultTTL) * 1000 // cache-manager v5+ 使用毫秒
      await this.cache.set(fullKey, value, ttl)
    } catch (error) {
      this.logger.error(`Cache set error for key: ${key}`, error)
    }
  }

  /**
   * 删除缓存
   */
  async del(key: string, options?: CacheOptions): Promise<void> {
    try {
      const fullKey = this.buildKey(key, options?.prefix)
      await this.cache.del(fullKey)
    } catch (error) {
      this.logger.error(`Cache del error for key: ${key}`, error)
    }
  }

  /**
   * 批量删除缓存
   */
  async delMany(keys: string[], options?: CacheOptions): Promise<void> {
    try {
      const fullKeys = keys.map((key) => this.buildKey(key, options?.prefix))
      await Promise.all(fullKeys.map((key) => this.cache.del(key)))
    } catch (error) {
      this.logger.error(`Cache delMany error`, error)
    }
  }

  /**
   * 清空所有缓存（谨慎使用）
   */
  async reset(): Promise<void> {
    try {
      await this.cache.clear()
      this.logger.warn('Cache has been cleared')
    } catch (error) {
      this.logger.error(`Cache reset error`, error)
    }
  }

  /**
   * 获取或设置缓存（缓存穿透保护）
   * 如果缓存不存在，则执行 factory 函数获取数据并缓存
   */
  async getOrSet<T>(key: string, factory: () => Promise<T>, options?: CacheOptions): Promise<T> {
    const cached = await this.get<T>(key, options)
    if (cached !== undefined) {
      return cached
    }

    const value = await factory()
    if (value !== undefined && value !== null) {
      await this.set(key, value, options)
    }
    return value
  }

  /**
   * 检查键是否存在
   */
  async has(key: string, options?: CacheOptions): Promise<boolean> {
    const value = await this.get(key, options)
    return value !== undefined
  }

  /**
   * 刷新缓存 TTL（重新设置过期时间）
   */
  async refresh<T>(key: string, options?: CacheOptions): Promise<boolean> {
    try {
      const value = await this.get<T>(key, options)
      if (value !== undefined) {
        await this.set(key, value, options)
        return true
      }
      return false
    } catch (error) {
      this.logger.error(`Cache refresh error for key: ${key}`, error)
      return false
    }
  }

  /**
   * 获取底层 cache-manager 实例
   * 用于高级操作或直接访问 Redis 命令
   */
  getClient(): Cache {
    return this.cache
  }

  /**
   * 为指定前缀创建一个命名空间缓存服务
   */
  namespace(prefix: CachePrefix | string): NamespacedCache {
    return new NamespacedCache(this, prefix)
  }
}

/**
 * 命名空间缓存（自动添加前缀）
 */
export class NamespacedCache {
  constructor(
    private readonly redis: RedisService,
    private readonly prefix: CachePrefix | string,
  ) {}

  async get<T>(key: string, ttl?: number): Promise<T | undefined> {
    return this.redis.get<T>(key, { prefix: this.prefix, ttl })
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    return this.redis.set(key, value, { prefix: this.prefix, ttl })
  }

  async del(key: string): Promise<void> {
    return this.redis.del(key, { prefix: this.prefix })
  }

  async getOrSet<T>(key: string, factory: () => Promise<T>, ttl?: number): Promise<T> {
    return this.redis.getOrSet(key, factory, { prefix: this.prefix, ttl })
  }

  async has(key: string): Promise<boolean> {
    return this.redis.has(key, { prefix: this.prefix })
  }
}
