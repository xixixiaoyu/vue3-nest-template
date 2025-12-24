import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets'
import { Logger } from '@nestjs/common'
import { Server, Socket } from 'socket.io'

/**
 * WebSocket 事件网关
 * 处理实时通信，支持房间、广播等功能
 */
@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
    credentials: true,
  },
  namespace: '/events',
})
export class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server

  private readonly logger = new Logger(EventsGateway.name)

  afterInit() {
    this.logger.log('WebSocket 网关已初始化')
  }

  handleConnection(client: Socket) {
    this.logger.log(`客户端连接: ${client.id}`)
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`客户端断开: ${client.id}`)
  }

  /**
   * 处理客户端消息
   */
  @SubscribeMessage('message')
  handleMessage(
    @MessageBody() data: { content: string; room?: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.debug(`收到消息: ${JSON.stringify(data)} from ${client.id}`)

    if (data.room) {
      // 发送到指定房间
      this.server.to(data.room).emit('message', {
        senderId: client.id,
        content: data.content,
        timestamp: new Date().toISOString(),
      })
    } else {
      // 广播给所有客户端（除发送者外）
      client.broadcast.emit('message', {
        senderId: client.id,
        content: data.content,
        timestamp: new Date().toISOString(),
      })
    }

    return { success: true }
  }

  /**
   * 加入房间
   */
  @SubscribeMessage('join')
  handleJoin(@MessageBody() data: { room: string }, @ConnectedSocket() client: Socket) {
    const joinPromise = client.join(data.room)
    if (joinPromise) {
      joinPromise.catch((err: Error) => {
        this.logger.error(`加入房间失败: ${data.room}`, err)
      })
    }
    this.logger.log(`${client.id} 加入房间: ${data.room}`)

    // 通知房间内其他成员
    client.to(data.room).emit('user:joined', {
      userId: client.id,
      room: data.room,
    })

    return { success: true, room: data.room }
  }

  /**
   * 离开房间
   */
  @SubscribeMessage('leave')
  handleLeave(@MessageBody() data: { room: string }, @ConnectedSocket() client: Socket) {
    const leavePromise = client.leave(data.room)
    if (leavePromise) {
      leavePromise.catch((err: Error) => {
        this.logger.error(`离开房间失败: ${data.room}`, err)
      })
    }
    this.logger.log(`${client.id} 离开房间: ${data.room}`)

    // 通知房间内其他成员
    this.server.to(data.room).emit('user:left', {
      userId: client.id,
      room: data.room,
    })

    return { success: true }
  }

  /**
   * 向指定房间广播消息（供其他服务调用）
   */
  broadcastToRoom(room: string, event: string, data: unknown) {
    this.server.to(room).emit(event, data)
  }

  /**
   * 向所有客户端广播消息（供其他服务调用）
   */
  broadcastToAll(event: string, data: unknown) {
    this.server.emit(event, data)
  }
}
