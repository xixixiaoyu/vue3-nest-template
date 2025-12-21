import { Controller, Get } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import {
  HealthCheck,
  HealthCheckService,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus'
import { PrismaHealthIndicator } from './prisma.health'
import { RedisHealthIndicator } from '../redis'

/**
 * 健康检查控制器
 * 使用 @nestjs/terminus 提供全面的健康检查
 */
@ApiTags('健康检查')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prismaHealth: PrismaHealthIndicator,
    private redisHealth: RedisHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
  ) {}

  /**
   * 综合健康检查端点
   * 检查数据库、内存和磁盘状态
   */
  @Get()
  @HealthCheck()
  @ApiOperation({ summary: '综合健康检查' })
  check() {
    return this.health.check([
      // 数据库健康检查
      () => this.prismaHealth.isHealthy('database'),
      // Redis 健康检查
      () => this.redisHealth.isHealthy('redis'),
      // 内存堆使用检查（阈值 200MB）
      () => this.memory.checkHeap('memory_heap', 200 * 1024 * 1024),
      // 内存 RSS 检查（阈值 300MB）
      () => this.memory.checkRSS('memory_rss', 300 * 1024 * 1024),
      // 磁盘存储检查（阈值 90% 已用）
      () =>
        this.disk.checkStorage('disk', {
          path: '/',
          thresholdPercent: 0.9,
        }),
    ])
  }

  /**
   * 简单存活探针
   * 用于 Kubernetes liveness probe
   */
  @Get('liveness')
  @ApiOperation({ summary: '存活探针' })
  liveness() {
    return { status: 'ok', timestamp: new Date().toISOString() }
  }

  /**
   * 就绪探针
   * 用于 Kubernetes readiness probe，检查关键依赖
   */
  @Get('readiness')
  @HealthCheck()
  @ApiOperation({ summary: '就绪探针' })
  readiness() {
    return this.health.check([
      () => this.prismaHealth.isHealthy('database'),
      () => this.redisHealth.isHealthy('redis'),
    ])
  }
}
