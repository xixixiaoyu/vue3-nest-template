/**
 * 用户信息响应 DTO
 */
export interface UserDto {
  /** 用户 ID */
  id: number
  /** 邮箱 */
  email: string
  /** 用户名 */
  name: string
  /** 头像 URL */
  avatar?: string
  /** 创建时间 */
  createdAt: string
  /** 更新时间 */
  updatedAt: string
}

/**
 * 创建用户 DTO
 */
export interface CreateUserDto {
  /** 邮箱 */
  email: string
  /** 用户名 */
  name: string
  /** 密码 */
  password: string
}

/**
 * 更新用户 DTO
 */
export interface UpdateUserDto {
  /** 用户名 */
  name?: string
  /** 头像 URL */
  avatar?: string
}

/**
 * 登录 DTO
 */
export interface LoginDto {
  /** 邮箱 */
  email: string
  /** 密码 */
  password: string
}

/**
 * 认证响应 DTO
 */
export interface AuthResponseDto {
  /** 访问令牌 */
  accessToken: string
  /** 用户信息 */
  user: UserDto
}
