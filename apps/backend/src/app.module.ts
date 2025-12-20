import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule } from './prisma/prisma.module'
import { UsersModule } from './users/users.module'
import { HealthModule } from './health/health.module'
import { AuthModule } from './auth/auth.module'

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
    PrismaModule, // 数据库模块
    HealthModule, // 健康检查模块
    AuthModule, // 认证模块
    UsersModule, // 用户模块
  ],
})
export class AppModule {}
