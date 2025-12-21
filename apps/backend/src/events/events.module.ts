import { Module } from '@nestjs/common'
import { EventsGateway } from './events.gateway'

/**
 * WebSocket 事件模块
 * 提供实时通信能力
 */
@Module({
  providers: [EventsGateway],
  exports: [EventsGateway],
})
export class EventsModule {}
