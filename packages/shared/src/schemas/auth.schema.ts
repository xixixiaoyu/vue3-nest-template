import { z } from 'zod'

/**
 * 共享的邮箱验证规则
 */
export const emailSchema = z
  .string({ required_error: '邮箱不能为空' })
  .min(1, '邮箱不能为空')
  .email('请输入有效的邮箱地址')
  .toLowerCase()
  .trim()

/**
 * 共享的密码基础验证规则
 */
export const passwordSchema = z
  .string({ required_error: '密码不能为空' })
  .min(6, '密码至少需要 6 个字符')
  .max(100, '密码不能超过 100 个字符')

/**
 * 登录表单验证 Schema
 */
export const LoginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})

/**
 * 注册表单验证 Schema
 */
export const RegisterSchema = z.object({
  email: emailSchema,
  name: z
    .string({ required_error: '用户名不能为空' })
    .min(2, '用户名至少需要 2 个字符')
    .max(50, '用户名不能超过 50 个字符')
    .trim(),
  password: passwordSchema
    .regex(/[A-Za-z]/, '密码必须包含至少一个字母')
    .regex(/[0-9]/, '密码必须包含至少一个数字'),
})

/**
 * 更新用户信息 Schema
 */
export const UpdateUserSchema = z.object({
  name: z
    .string()
    .min(2, '用户名至少需要 2 个字符')
    .max(50, '用户名不能超过 50 个字符')
    .trim()
    .optional(),
  avatar: z.string().url('请输入有效的 URL 地址').optional().nullable(),
})

/**
 * 用户信息 Schema
 */
export const UserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string(),
  avatar: z.string().url().optional().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

/**
 * 认证响应 Schema
 * 支持短期访问令牌 + 长期刷新令牌
 */
export const AuthResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string().optional(), // 刷新令牌（可选，仅登录时返回）
  expiresIn: z.number().optional(), // 访问令牌过期时间（秒）
  user: UserSchema,
})

/**
 * 刷新令牌请求 Schema
 */
export const RefreshTokenSchema = z.object({
  refreshToken: z.string({ required_error: '刷新令牌不能为空' }).min(1, '刷新令牌不能为空'),
})

/**
 * 找回密码请求 Schema
 */
export const ForgotPasswordSchema = z.object({
  email: emailSchema,
})

/**
 * 重置密码 Schema
 */
export const ResetPasswordSchema = z.object({
  token: z.string({ required_error: '重置令牌不能为空' }).min(1, '重置令牌不能为空'),
  password: passwordSchema
    .regex(/[A-Za-z]/, '密码必须包含至少一个字母')
    .regex(/[0-9]/, '密码必须包含至少一个数字'),
})

// 从 Zod Schema 推断 TypeScript 类型
export type LoginInput = z.infer<typeof LoginSchema>
export type RegisterInput = z.infer<typeof RegisterSchema>
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>
export type User = z.infer<typeof UserSchema>
export type AuthResponse = z.infer<typeof AuthResponseSchema>
export type RefreshTokenInput = z.infer<typeof RefreshTokenSchema>
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>
