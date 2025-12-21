import type { User } from '../schemas/auth.schema'

/**
 * Prisma 用户记录类型（数据库原始格式）
 */
interface PrismaUser {
  id: number
  email: string
  name: string
  avatar: string | null
  createdAt: Date
  updatedAt: Date
}

/**
 * 格式化单个用户数据
 * 将 Prisma 的 Date 类型转换为 ISO 字符串
 */
export function formatUser(user: PrismaUser): User {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatar: user.avatar,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  }
}

/**
 * 格式化用户列表
 */
export function formatUsers(users: PrismaUser[]): User[] {
  return users.map(formatUser)
}
