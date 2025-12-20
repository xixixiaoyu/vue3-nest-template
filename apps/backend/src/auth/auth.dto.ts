import { createZodDto } from 'nestjs-zod'
import { LoginSchema, RegisterSchema, RefreshTokenSchema } from '@my-app/shared'

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
