import { Module, Global, Logger } from '@nestjs/common'
import { CacheModule } from '@nestjs/cache-manager'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { redisStore } from 'cache-manager-ioredis-yet'
import { RedisService } from './redis.service'

/**
 * Redis 配置接口
 */
interface RedisModuleConfig {
  host: string
  port: number
  password?: string
  db?: number
  keyPrefix?: string
  ttl?: number
}

/**
 * 全局 Redis 缓存模块
 * 提供 Redis 缓存功能，支持：
 * - 自动配置 Redis 连接
 * - 全局可用的 RedisService
 * - 可配置的 TTL 和键前缀
 */
@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const logger = new Logger('RedisModule')
        const redisConfig: RedisModuleConfig = {
          host: config.get('REDIS_HOST', 'localhost'),
          port: config.get('REDIS_PORT', 6379),
          password: config.get('REDIS_PASSWORD') || undefined,
          db: config.get('REDIS_DB', 0),
          keyPrefix: config.get('REDIS_KEY_PREFIX', 'app:'),
          ttl: config.get('REDIS_DEFAULT_TTL', 300) * 1000, // 转换为毫秒
        }

        logger.log(`Connecting to Redis at ${redisConfig.host}:${redisConfig.port}`)

        try {
          const store = await redisStore({
            host: redisConfig.host,
            port: redisConfig.port,
            password: redisConfig.password,
            db: redisConfig.db,
            keyPrefix: redisConfig.keyPrefix,
            // 连接配置
            lazyConnect: false,
            enableReadyCheck: true,
            maxRetriesPerRequest: 3,
            retryStrategy: (times: number) => {
              if (times > 10) {
                logger.error('Redis connection failed after 10 retries')
                return null // 停止重试
              }
              const delay = Math.min(times * 100, 3000)
              logger.warn(`Redis connection retry #${times}, waiting ${delay}ms`)
              return delay
            },
          })

          logger.log('Redis connected successfully')

          return {
            store,
            ttl: redisConfig.ttl,
          }
        } catch (error) {
          logger.error('Failed to connect to Redis', error)
          throw error
        }
      },
    }),
  ],
  providers: [RedisService],
  exports: [CacheModule, RedisService],
})
export class RedisModule {}
