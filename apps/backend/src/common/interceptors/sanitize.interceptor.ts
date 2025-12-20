import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common'
import { Observable } from 'rxjs'
import sanitizeHtml from 'sanitize-html'

/**
 * XSS 清理拦截器
 * 自动清理请求体中的 HTML/XSS 内容
 */
@Injectable()
export class SanitizeInterceptor implements NestInterceptor {
  private sanitizeOptions: sanitizeHtml.IOptions = {
    allowedTags: [], // 不允许任何 HTML 标签
    allowedAttributes: {},
    disallowedTagsMode: 'recursiveEscape',
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest()

    // 清理请求体
    if (request.body) {
      request.body = this.sanitizeObject(request.body)
    }

    // 清理查询参数
    if (request.query) {
      request.query = this.sanitizeObject(request.query)
    }

    // 清理路径参数
    if (request.params) {
      request.params = this.sanitizeObject(request.params)
    }

    return next.handle()
  }

  /**
   * 递归清理对象中的字符串值
   */
  private sanitizeObject(obj: unknown): unknown {
    if (typeof obj === 'string') {
      return sanitizeHtml(obj, this.sanitizeOptions)
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitizeObject(item))
    }

    if (obj !== null && typeof obj === 'object') {
      const sanitized: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = this.sanitizeObject(value)
      }
      return sanitized
    }

    return obj
  }
}
