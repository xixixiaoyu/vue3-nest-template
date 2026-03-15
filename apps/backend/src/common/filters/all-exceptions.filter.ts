import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common'

/**
 * 全局异常过滤器
 * 统一处理所有未捕获的异常，返回标准化的错误响应格式
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<{
      status: (code: number) => {
        json?: (body: unknown) => unknown
        send?: (body: unknown) => unknown
      }
    }>()

    // 获取 HTTP 状态码
    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR

    // 获取错误信息
    const message = this.extractMessage(exception)

    // 返回标准化错误响应
    const payload = {
      success: false,
      data: null,
      message,
      statusCode: status,
      timestamp: new Date().toISOString(),
    }

    const httpResponse = response.status(status)
    if (typeof httpResponse.send === 'function') {
      httpResponse.send(payload)
      return
    }
    httpResponse.json?.(payload)
  }

  private extractMessage(exception: unknown): string {
    if (!(exception instanceof HttpException)) {
      return '服务器内部错误'
    }

    const payload = exception.getResponse()
    if (typeof payload === 'string') {
      return payload
    }

    if (typeof payload === 'object' && payload !== null && 'message' in payload) {
      const message = (payload as { message?: unknown }).message
      if (Array.isArray(message)) {
        return message.join(', ')
      }
      if (typeof message === 'string') {
        return message
      }
    }

    return exception.message || '请求失败'
  }
}
