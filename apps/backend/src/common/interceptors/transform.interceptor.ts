import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

/**
 * 响应转换接口
 */
interface TransformedResponse<T> {
  success: boolean
  data: T
  timestamp: string
}

/**
 * 全局响应转换拦截器
 * 将所有成功响应统一包装为标准格式
 */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, TransformedResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<TransformedResponse<T>> {
    return next.handle().pipe(
      map((data) => ({
        success: true,
        data,
        timestamp: new Date().toISOString(),
      })),
    )
  }
}
