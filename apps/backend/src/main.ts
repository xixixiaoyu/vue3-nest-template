import { NestFactory } from '@nestjs/core'
import { ValidationPipe, Logger } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
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

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // 自动剥离非白名单属性
      transform: true, // 自动转换类型
      forbidNonWhitelisted: true, // 禁止非白名单属性
    }),
  )

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
  SwaggerModule.setup('api/docs', app, document)
  logger.log('📚 Swagger 文档: http://localhost:' + (process.env.PORT || 3000) + '/api/docs')

  const port = process.env.PORT || 3000
  await app.listen(port)

  logger.log(`🚀 服务已启动: http://localhost:${port}`)
}

bootstrap()
