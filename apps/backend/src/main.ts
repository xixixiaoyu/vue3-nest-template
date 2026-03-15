import 'dotenv/config'
import { NestFactory } from '@nestjs/core'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { ZodValidationPipe, cleanupOpenApiDoc } from 'nestjs-zod'
import { Logger } from 'nestjs-pino'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import compression from 'compression'
import { AppModule } from './app.module'
import { AllExceptionsFilter, SanitizeInterceptor, TransformInterceptor } from './common'

function parseCorsOrigins(): string[] {
  const rawOrigins = process.env.CORS_ORIGIN
  if (!rawOrigins) {
    return ['http://localhost:5173']
  }

  const origins = rawOrigins
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)

  return origins.length > 0 ? origins : ['http://localhost:5173']
}

/**
 * 应用程序启动入口
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true })
  // 使用 Pino 作为全局日志器
  const logger = app.get(Logger)
  app.useLogger(logger)
  app.flushLogs()

  // 设置全局路由前缀
  app.setGlobalPrefix('api')

  // Helmet 安全头（防止 XSS、点击劫持等）
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
      crossOriginEmbedderPolicy: false, // 允许跨域嵌入
    }),
  )

  // Cookie 解析器（CSRF 保护需要）
  app.use(cookieParser())

  // 响应压缩中间件（提升传输效率）
  app.use(
    compression({
      threshold: 1024, // 只压缩大于 1KB 的响应
      level: 6, // 压缩级别（1-9），6 为平衡性能与压缩率
      filter: (req, res) => {
        // 不压缩 SSE 和 WebSocket 响应
        if (req.headers['accept'] === 'text/event-stream') {
          return false
        }
        return compression.filter(req, res)
      },
    }),
  )

  // 启用 CORS（通过代理访问）
  app.enableCors({
    origin: parseCorsOrigins(),
    credentials: true, // 允许携带凭证
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-XSRF-TOKEN', 'X-Requested-With'],
  })

  // 全局 Zod 验证管道（替代 class-validator）
  app.useGlobalPipes(new ZodValidationPipe())

  // 全局异常过滤器
  app.useGlobalFilters(new AllExceptionsFilter())

  // 全局响应转换拦截器（统一 API 响应格式）
  app.useGlobalInterceptors(new TransformInterceptor())

  // 全局 XSS 清理拦截器（输入数据清理）
  app.useGlobalInterceptors(new SanitizeInterceptor())

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
  logger.log('🔒 安全中间件已启用: Helmet, 速率限制, XSS 防护, Gzip 压缩', 'Bootstrap')
  logger.log(`📚 Swagger 文档: http://localhost:${process.env.PORT || 3000}/api/docs`, 'Bootstrap')

  const port = process.env.PORT || 3000
  await app.listen(port)

  logger.log(`🚀 服务已启动: http://localhost:${port}`, 'Bootstrap')
}

bootstrap().catch((err) => {
  console.error('应用启动失败:', err)
  process.exit(1)
})
