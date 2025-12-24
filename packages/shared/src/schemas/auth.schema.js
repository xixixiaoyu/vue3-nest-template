"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResetPasswordSchema = exports.ForgotPasswordSchema = exports.RefreshTokenSchema = exports.AuthResponseSchema = exports.UserSchema = exports.UpdateUserSchema = exports.RegisterSchema = exports.LoginSchema = exports.passwordSchema = exports.emailSchema = void 0;
const zod_1 = require("zod");
/**
 * 共享的邮箱验证规则
 */
exports.emailSchema = zod_1.z
    .string({ required_error: '邮箱不能为空' })
    .min(1, '邮箱不能为空')
    .email('请输入有效的邮箱地址')
    .toLowerCase()
    .trim();
/**
 * 共享的密码基础验证规则
 */
exports.passwordSchema = zod_1.z
    .string({ required_error: '密码不能为空' })
    .min(6, '密码至少需要 6 个字符')
    .max(100, '密码不能超过 100 个字符');
/**
 * 登录表单验证 Schema
 */
exports.LoginSchema = zod_1.z.object({
    email: exports.emailSchema,
    password: exports.passwordSchema,
});
/**
 * 注册表单验证 Schema
 */
exports.RegisterSchema = zod_1.z.object({
    email: exports.emailSchema,
    name: zod_1.z
        .string({ required_error: '用户名不能为空' })
        .min(2, '用户名至少需要 2 个字符')
        .max(50, '用户名不能超过 50 个字符')
        .trim(),
    password: exports.passwordSchema
        .regex(/[A-Za-z]/, '密码必须包含至少一个字母')
        .regex(/[0-9]/, '密码必须包含至少一个数字'),
});
/**
 * 更新用户信息 Schema
 */
exports.UpdateUserSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(2, '用户名至少需要 2 个字符')
        .max(50, '用户名不能超过 50 个字符')
        .trim()
        .optional(),
    avatar: zod_1.z.string().url('请输入有效的 URL 地址').optional().nullable(),
});
/**
 * 用户信息 Schema
 */
exports.UserSchema = zod_1.z.object({
    id: zod_1.z.number(),
    email: zod_1.z.string().email(),
    name: zod_1.z.string(),
    avatar: zod_1.z.string().url().optional().nullable(),
    createdAt: zod_1.z.string(),
    updatedAt: zod_1.z.string(),
});
/**
 * 认证响应 Schema
 * 支持短期访问令牌 + 长期刷新令牌
 */
exports.AuthResponseSchema = zod_1.z.object({
    accessToken: zod_1.z.string(),
    refreshToken: zod_1.z.string().optional(), // 刷新令牌（可选，仅登录时返回）
    expiresIn: zod_1.z.number().optional(), // 访问令牌过期时间（秒）
    user: exports.UserSchema,
});
/**
 * 刷新令牌请求 Schema
 */
exports.RefreshTokenSchema = zod_1.z.object({
    refreshToken: zod_1.z.string({ required_error: '刷新令牌不能为空' }).min(1, '刷新令牌不能为空'),
});
/**
 * 找回密码请求 Schema
 */
exports.ForgotPasswordSchema = zod_1.z.object({
    email: exports.emailSchema,
});
/**
 * 重置密码 Schema
 */
exports.ResetPasswordSchema = zod_1.z.object({
    token: zod_1.z.string({ required_error: '重置令牌不能为空' }).min(1, '重置令牌不能为空'),
    password: exports.passwordSchema
        .regex(/[A-Za-z]/, '密码必须包含至少一个字母')
        .regex(/[0-9]/, '密码必须包含至少一个数字'),
});
//# sourceMappingURL=auth.schema.js.map