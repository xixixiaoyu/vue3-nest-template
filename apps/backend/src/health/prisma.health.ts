import { Injectable } from '@nestjs/common'
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus'
import { PrismaService } from '../prisma/prisma.service'

/**
 * Prisma 数据库健康指示器
 * 用于检测数据库连接状态
 */
@Injectable()
export class PrismaHealthIndicator extends HealthIndicator {
  constructor(private readonly prisma: PrismaService) {
    super()
  }

  /**
   * 检查数据库连接是否正常
   * @param key 健康检查的标识键
   */
  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      await this.prisma.$queryRaw`SELECT 1`
      return this.getStatus(key, true)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      throw new HealthCheckError(
        'Prisma health check failed',
        this.getStatus(key, false, { message }),
      )
    }
  }
}
