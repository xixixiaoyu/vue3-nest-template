import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common'
import { Response } from 'express'

/**
 * 全局异常过滤器
 * 统一处理所有未捕获的异常，返回标准化的错误响应格式
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()

    // 获取 HTTP 状态码
    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR

    // 获取错误信息
    const message = exception instanceof HttpException ? exception.message : '服务器内部错误'

    // 返回标准化错误响应
    response.status(status).json({
      success: false,
      data: null,
      message,
      statusCode: status,
      timestamp: new Date().toISOString(),
    })
  }
}
