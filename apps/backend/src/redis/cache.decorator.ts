import { SetMetadata, applyDecorators, UseInterceptors } from '@nestjs/common'
import { CacheInterceptor, CacheTTL, CacheKey } from '@nestjs/cache-manager'

/**
 * 缓存元数据键
 */
export const CACHE_OPTIONS_KEY = 'cache:options'

/**
 * 缓存配置选项
 */
export interface CacheDecoratorOptions {
  /** 缓存键（支持占位符，如 'user:${id}'） */
  key?: string
  /** 过期时间（毫秒） */
  ttl?: number
  /** 是否使用请求参数生成键 */
  useParams?: boolean
  /** 是否使用查询参数生成键 */
  useQuery?: boolean
}

/**
 * 缓存方法装饰器
 * 自动缓存方法返回值
 *
 * @example
 * // 基础用法 - 使用默认 TTL
 * @Cacheable()
 * findAll() { ... }
 *
 * @example
 * // 自定义 TTL（5分钟）
 * @Cacheable({ ttl: 300000 })
 * findAll() { ... }
 *
 * @example
 * // 自定义缓存键
 * @Cacheable({ key: 'users:list' })
 * findAll() { ... }
 */
export function Cacheable(options: CacheDecoratorOptions = {}) {
  const decorators: MethodDecorator[] = [UseInterceptors(CacheInterceptor)]

  if (options.key) {
    decorators.push(CacheKey(options.key))
  }

  if (options.ttl) {
    decorators.push(CacheTTL(options.ttl))
  }

  if (options.key || options.ttl) {
    decorators.push(SetMetadata(CACHE_OPTIONS_KEY, options))
  }

  return applyDecorators(...decorators)
}

/**
 * 禁用缓存装饰器
 * 用于标记某个方法不使用缓存
 */
export function NoCache() {
  return SetMetadata('cache:disabled', true)
}

/**
 * 缓存 TTL 常量（毫秒）
 * 用于 @Cacheable 装饰器
 */
export const CacheableTTL = {
  /** 30 秒 */
  THIRTY_SECONDS: 30 * 1000,
  /** 1 分钟 */
  ONE_MINUTE: 60 * 1000,
  /** 5 分钟 */
  FIVE_MINUTES: 5 * 60 * 1000,
  /** 15 分钟 */
  FIFTEEN_MINUTES: 15 * 60 * 1000,
  /** 30 分钟 */
  HALF_HOUR: 30 * 60 * 1000,
  /** 1 小时 */
  ONE_HOUR: 60 * 60 * 1000,
  /** 1 天 */
  ONE_DAY: 24 * 60 * 60 * 1000,
} as const
