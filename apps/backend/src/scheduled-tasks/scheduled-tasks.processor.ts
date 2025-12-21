import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq'
import { Logger } from '@nestjs/common'
import { Job } from 'bullmq'
import { SCHEDULED_TASKS_QUEUE } from './constants'

interface ScheduledJobData {
  type: string
  [key: string]: unknown
}

/**
 * 定时任务处理器
 * 处理 BullMQ 队列中的定时任务
 */
@Processor(SCHEDULED_TASKS_QUEUE)
export class ScheduledTasksProcessor extends WorkerHost {
  private readonly logger = new Logger(ScheduledTasksProcessor.name)

  async process(job: Job<ScheduledJobData>): Promise<void> {
    const { type } = job.data

    switch (type) {
      case 'health-check':
        await this.handleHealthCheck(job)
        break
      case 'cleanup-expired':
        await this.handleCleanupExpired(job)
        break
      case 'daily-stats':
        await this.handleDailyStats(job)
        break
      default:
        this.logger.warn(`未知的任务类型: ${type}`)
    }
  }

  /**
   * 健康检查任务
   */
  private async handleHealthCheck(job: Job): Promise<void> {
    this.logger.debug(`[${job.id}] 执行健康检查...`)
    // 在这里添加健康检查逻辑
    // 例如：检查数据库连接、Redis 连接、外部 API 等
  }

  /**
   * 清理过期数据任务
   */
  private async handleCleanupExpired(job: Job): Promise<void> {
    this.logger.log(`[${job.id}] 执行过期数据清理...`)
    // 在这里添加清理逻辑
    // 例如：删除过期的 session、清理临时文件等
  }

  /**
   * 每日统计任务
   */
  private async handleDailyStats(job: Job): Promise<void> {
    this.logger.log(`[${job.id}] 执行每日数据统计...`)
    // 在这里添加统计逻辑
    // 例如：生成每日报表、发送统计邮件等
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.debug(`任务完成: ${job.name} [${job.id}]`)
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(`任务失败: ${job.name} [${job.id}] - ${error.message}`)
  }
}
