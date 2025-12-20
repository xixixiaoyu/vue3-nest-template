import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'
import { PrismaModule } from './prisma/prisma.module'
import { UsersModule } from './users/users.module'
import { HealthModule } from './health/health.module'
import { AuthModule } from './auth/auth.module'
import { CsrfMiddleware } from './common'

/**
 * 应用程序根模块
 */
@Module({
  imports: [
    // 全局配置模块
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),
    // 速率限制模块（防止暴力破解）
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            name: 'short',
            ttl: config.get('THROTTLE_SHORT_TTL', 1000), // 1秒
            limit: config.get('THROTTLE_SHORT_LIMIT', 3), // 每秒最多3次请求
          },
          {
            name: 'medium',
            ttl: config.get('THROTTLE_MEDIUM_TTL', 10000), // 10秒
            limit: config.get('THROTTLE_MEDIUM_LIMIT', 20), // 每10秒最多20次请求
          },
          {
            name: 'long',
            ttl: config.get('THROTTLE_LONG_TTL', 60000), // 1分钟
            limit: config.get('THROTTLE_LONG_LIMIT', 100), // 每分钟最多100次请求
          },
        ],
      }),
    }),
    PrismaModule, // 数据库模块
    HealthModule, // 健康检查模块
    AuthModule, // 认证模块
    UsersModule, // 用户模块
  ],
  providers: [
    // 全局速率限制守卫
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // 应用 CSRF 保护中间件到所有路由
    consumer.apply(CsrfMiddleware).forRoutes('*')
  }
}
