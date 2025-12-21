import { Module, OnModuleInit } from '@nestjs/common'
import { BullModule, InjectQueue } from '@nestjs/bullmq'
import { Queue } from 'bullmq'
import { ScheduledTasksProcessor } from './scheduled-tasks.processor'
import { SCHEDULED_TASKS_QUEUE } from './constants'

export { SCHEDULED_TASKS_QUEUE }

/**
 * 定时任务模块
 * 使用 BullMQ 的 repeat 功能实现定时任务
 * 优势：分布式环境下只执行一次，支持失败重试
 */
@Module({
  imports: [
    BullModule.registerQueue({
      name: SCHEDULED_TASKS_QUEUE,
    }),
  ],
  providers: [ScheduledTasksProcessor],
  exports: [BullModule],
})
export class ScheduledTasksModule implements OnModuleInit {
  constructor(@InjectQueue(SCHEDULED_TASKS_QUEUE) private readonly queue: Queue) {}

  async onModuleInit() {
    // 清理旧的重复任务（确保配置更新生效）
    const repeatableJobs = await this.queue.getRepeatableJobs()
    for (const job of repeatableJobs) {
      await this.queue.removeRepeatableByKey(job.key)
    }

    // 注册定时任务
    await this.registerScheduledJobs()
  }

  private async registerScheduledJobs() {
    // 每分钟执行一次的健康检查任务
    await this.queue.add(
      'health-check',
      { type: 'health-check' },
      {
        repeat: {
          pattern: '* * * * *', // 每分钟
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    )

    // 每小时清理过期数据
    await this.queue.add(
      'cleanup-expired',
      { type: 'cleanup-expired' },
      {
        repeat: {
          pattern: '0 * * * *', // 每小时整点
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    )

    // 每天凌晨 2 点执行数据统计
    await this.queue.add(
      'daily-stats',
      { type: 'daily-stats' },
      {
        repeat: {
          pattern: '0 2 * * *', // 每天 02:00
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    )
  }
}
