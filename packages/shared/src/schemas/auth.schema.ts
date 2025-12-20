import { z } from 'zod'

/**
 * 登录表单验证 Schema
 * 作为前后端验证的单一数据源
 */
export const LoginSchema = z.object({
  email: z
    .string({ required_error: '邮箱不能为空' })
    .min(1, '邮箱不能为空')
    .email('请输入有效的邮箱地址')
    .toLowerCase() // 自动转换为小写
    .trim(), // 去除前后空格
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
    .email('请输入有效的邮箱地址')
    .toLowerCase()
    .trim(),
  name: z
    .string({ required_error: '用户名不能为空' })
    .min(2, '用户名至少需要 2 个字符')
    .max(50, '用户名不能超过 50 个字符')
    .trim(),
  password: z
    .string({ required_error: '密码不能为空' })
    .min(6, '密码至少需要 6 个字符')
    .max(100, '密码不能超过 100 个字符')
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
 */
export const AuthResponseSchema = z.object({
  accessToken: z.string(),
  user: UserSchema,
})

// 从 Zod Schema 推断 TypeScript 类型
export type LoginInput = z.infer<typeof LoginSchema>
export type RegisterInput = z.infer<typeof RegisterSchema>
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>
export type User = z.infer<typeof UserSchema>
export type AuthResponse = z.infer<typeof AuthResponseSchema>
