import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import type { User } from '@my-app/shared'

/**
 * 当前用户装饰器
 * 用于从请求中获取当前登录的用户信息
 */
export const CurrentUser = createParamDecorator(
  (data: keyof User | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()
    const user = request.user as User

    if (data) {
      return user?.[data]
    }
    return user
  },
)
