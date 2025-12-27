import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import {
  LoginSchema,
  RegisterSchema,
  RefreshTokenSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
} from '@my-app/shared'

/**
 * 登录请求 DTO
 * 使用 createZodDto 包装 Zod Schema，自动支持 Swagger 文档生成
 */
export class LoginDto extends createZodDto(LoginSchema) {}

/**
 * 注册请求 DTO
 */
export class RegisterDto extends createZodDto(RegisterSchema) {}

/**
 * 刷新令牌请求 DTO
 */
export class RefreshTokenDto extends createZodDto(RefreshTokenSchema) {}

/**
 * 找回密码请求 DTO
 */
export class ForgotPasswordDto extends createZodDto(ForgotPasswordSchema) {}

/**
 * 重置密码 DTO
 */
export class ResetPasswordDto extends createZodDto(ResetPasswordSchema) {}

/**
 * 登出请求 DTO
 */
const LogoutSchema = z.object({
  refreshToken: z.string({ required_error: '刷新令牌不能为空' }).min(1, '刷新令牌不能为空'),
})

export class LogoutDto extends createZodDto(LogoutSchema) {}
