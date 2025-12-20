import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { UsersModule } from "./users/users.module";
import { HealthModule } from "./health/health.module";

/**
 * 应用程序根模块
 */
@Module({
  imports: [
    PrismaModule, // 数据库模块
    HealthModule, // 健康检查模块
    UsersModule, // 用户模块
  ],
})
export class AppModule {}
