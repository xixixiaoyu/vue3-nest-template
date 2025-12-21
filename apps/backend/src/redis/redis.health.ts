import { Injectable, Inject } from '@nestjs/common'
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import type { Cache } from 'cache-manager'

/**
 * Redis 健康检查指示器
 * 用于检测 Redis 连接状态
 */
@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {
    super()
  }

  /**
   * 检查 Redis 连接是否正常
   * 通过执行一个简单的 set/get 操作来验证
   */
  async isHealthy(key: string = 'redis'): Promise<HealthIndicatorResult> {
    const testKey = '__health_check__'
    const testValue = Date.now().toString()

    try {
      // 尝试写入和读取测试数据
      await this.cache.set(testKey, testValue, 1000) // 1 秒过期
      const result = await this.cache.get<string>(testKey)

      if (result === testValue) {
        return this.getStatus(key, true, { message: 'Redis is healthy' })
      }

      throw new Error('Redis read/write mismatch')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      throw new HealthCheckError(
        'Redis health check failed',
        this.getStatus(key, false, { message: errorMessage }),
      )
    }
  }
}
