import { Module, Global, Logger } from '@nestjs/common'
import { CacheModule } from '@nestjs/cache-manager'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { createKeyv } from '@keyv/redis'
import { RedisService } from './redis.service'

/**
 * Redis 配置接口
 */
interface RedisModuleConfig {
  host: string
  port: number
  password?: string
  db?: number
  namespace?: string
  ttl?: number
}

function buildRedisUrl(config: RedisModuleConfig): string {
  const auth = config.password ? `:${encodeURIComponent(config.password)}@` : ''
  const db = config.db ?? 0
  return `redis://${auth}${config.host}:${config.port}/${db}`
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
          namespace: (config.get('REDIS_KEY_PREFIX', 'app') || 'app').replace(/:$/, ''),
          ttl: config.get('REDIS_DEFAULT_TTL', 300) * 1000, // 转换为毫秒
        }

        logger.log(`Connecting to Redis at ${redisConfig.host}:${redisConfig.port}`)

        try {
          const keyv = createKeyv(buildRedisUrl(redisConfig), {
            namespace: redisConfig.namespace,
            throwOnConnectError: true,
            throwOnErrors: true,
          })
          keyv.on('error', (error) => logger.error('Redis runtime error', error))

          // 预热连接，确保启动阶段即可发现配置错误
          await keyv.set('__redis_init__', '1', 1000)
          await keyv.delete('__redis_init__')
          logger.log('Redis connected successfully (Keyv)')

          return {
            stores: [keyv],
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
