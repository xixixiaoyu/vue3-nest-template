import { z } from 'zod'

/**
 * 登录表单验证 Schema
 * 作为前后端验证的单一数据源
 */
export const LoginSchema = z.object({
  email: z
    .string({ required_error: '邮箱不能为空' })
    .min(1, '邮箱不能为空')
    .email('请输入有效的邮箱地址'),
  password: z
    .string({ required_error: '密码不能为空' })
    .min(6, '密码至少需要 6 个字符')
    .max(100, '密码不能超过 100 个字符'),
})

/**
 * 注册表单验证 Schema
 */
export const RegisterSchema = z.object({
  email: z
    .string({ required_error: '邮箱不能为空' })
    .min(1, '邮箱不能为空')
    .email('请输入有效的邮箱地址'),
  name: z
    .string({ required_error: '用户名不能为空' })
    .min(2, '用户名至少需要 2 个字符')
    .max(50, '用户名不能超过 50 个字符'),
  password: z
    .string({ required_error: '密码不能为空' })
    .min(6, '密码至少需要 6 个字符')
    .max(100, '密码不能超过 100 个字符'),
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
 */
export const AuthResponseSchema = z.object({
  accessToken: z.string(),
  user: UserSchema,
})

// 从 Zod Schema 推断 TypeScript 类型
export type LoginDto = z.infer<typeof LoginSchema>
export type RegisterDto = z.infer<typeof RegisterSchema>
export type UserDto = z.infer<typeof UserSchema>
export type AuthResponseDto = z.infer<typeof AuthResponseSchema>
