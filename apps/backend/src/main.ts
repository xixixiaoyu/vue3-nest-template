import 'dotenv/config'
import { NestFactory } from '@nestjs/core'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { ZodValidationPipe, cleanupOpenApiDoc } from 'nestjs-zod'
import { Logger } from 'nestjs-pino'
import fastifyHelmet from '@fastify/helmet'
import fastifyCookie from '@fastify/cookie'
import fastifyCompress from '@fastify/compress'
import fastifyMultipart from '@fastify/multipart'
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
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(), {
    bufferLogs: true,
  })
  // 使用 Pino 作为全局日志器
  const logger = app.get(Logger)
  app.useLogger(logger)
  app.flushLogs()

  // 设置全局路由前缀
  app.setGlobalPrefix('api')

  // Fastify Cookie 插件（认证/会话等场景需要）
  await app.register(fastifyCookie)

  // Fastify Helmet 安全头（防止 XSS、点击劫持等）
  await app.register(fastifyHelmet, {
    global: true,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    crossOriginEmbedderPolicy: false, // 允许跨域嵌入
  })

  // Fastify 响应压缩插件（提升传输效率）
  await app.register(fastifyCompress, {
    global: true,
    threshold: 1024, // 只压缩大于 1KB 的响应
    encodings: ['gzip', 'deflate'],
  })

  // Fastify 多文件上传插件（替代 Multer）
  await app.register(fastifyMultipart, {
    limits: {
      fileSize: Number(process.env.UPLOAD_MAX_SIZE || 10 * 1024 * 1024), // 默认 10MB
      files: Number(process.env.UPLOAD_MAX_FILES || 10), // 最多 10 个文件
    },
  })

  // 启用 CORS（通过代理访问）
  app.enableCors({
    origin: parseCorsOrigins(),
    credentials: true, // 允许携带凭证
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
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

  const port = Number(process.env.PORT) || 3000
  await app.listen(port, '0.0.0.0')

  logger.log(`🚀 服务已启动: http://localhost:${port}`, 'Bootstrap')
}

bootstrap().catch((err) => {
  console.error('应用启动失败:', err)
  process.exit(1)
})
