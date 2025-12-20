import { NestFactory } from '@nestjs/core'
import { Logger } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { ZodValidationPipe, cleanupOpenApiDoc } from 'nestjs-zod'
import { AppModule } from './app.module'
import { AllExceptionsFilter, LoggingInterceptor } from './common'

/**
 * 应用程序启动入口
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const logger = new Logger('Bootstrap')

  // 设置全局路由前缀
  app.setGlobalPrefix('api')

  // 启用 CORS 跨域支持
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })

  // 全局 Zod 验证管道（替代 class-validator）
  app.useGlobalPipes(new ZodValidationPipe())

  // 全局异常过滤器
  app.useGlobalFilters(new AllExceptionsFilter())

  // 全局日志拦截器
  app.useGlobalInterceptors(new LoggingInterceptor())

  // Swagger API 文档配置
  const swaggerConfig = new DocumentBuilder()
    .setTitle('My App API')
    .setDescription('API 接口文档')
    .setVersion('1.0')
    .addBearerAuth()
    .build()
  const document = SwaggerModule.createDocument(app, swaggerConfig)
  // 使用 cleanupOpenApiDoc 处理 Zod Schema 生成的 OpenAPI 文档
  SwaggerModule.setup('api/docs', app, cleanupOpenApiDoc(document))
  logger.log('📚 Swagger 文档: http://localhost:' + (process.env.PORT || 3000) + '/api/docs')

  const port = process.env.PORT || 3000
  await app.listen(port)

  logger.log(`🚀 服务已启动: http://localhost:${port}`)
}

bootstrap()
