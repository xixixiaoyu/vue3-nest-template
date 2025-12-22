import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../prisma/prisma.service'
import * as bcrypt from 'bcryptjs'
import type { LoginInput, User, AuthResponse } from '@my-app/shared'
import { formatUser } from '@my-app/shared'

interface JwtPayload {
  sub: number
  email: string
  type: 'access' | 'refresh'
}

/**
 * 认证服务
 * 处理用户登录、注册和 JWT 令牌生成
 * 支持短期访问令牌 + 长期刷新令牌
 */
@Injectable()
export class AuthService {
  private readonly accessTokenExpiresIn: number // 访问令牌过期时间（秒）
  private readonly refreshTokenExpiresIn: string // 刷新令牌过期时间

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    // 访问令牌默认 15 分钟
    this.accessTokenExpiresIn = this.configService.get<number>('JWT_ACCESS_EXPIRES_IN', 900)
    // 刷新令牌默认 7 天
    this.refreshTokenExpiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d')
  }

  /**
   * 验证用户凭据
   */
  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return null
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return null
    }

    return formatUser(user)
  }

  /**
   * 用户登录
   */
  async login(loginDto: LoginInput): Promise<AuthResponse> {
    const user = await this.validateUser(loginDto.email, loginDto.password)

    if (!user) {
      throw new UnauthorizedException('邮箱或密码错误')
    }

    // 生成访问令牌和刷新令牌
    const accessToken = this.generateAccessToken(user.id, user.email)
    const refreshToken = this.generateRefreshToken(user.id, user.email)

    return {
      accessToken,
      refreshToken,
      expiresIn: this.accessTokenExpiresIn,
      user,
    }
  }

  /**
   * 刷新访问令牌
   */
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      const payload = this.jwtService.verify<JwtPayload>(refreshToken)

      // 验证是否为刷新令牌
      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('无效的刷新令牌')
      }

      const user = await this.getUserById(payload.sub)
      if (!user) {
        throw new UnauthorizedException('用户不存在')
      }

      // 只返回新的访问令牌，不更新刷新令牌
      const newAccessToken = this.generateAccessToken(user.id, user.email)

      return {
        accessToken: newAccessToken,
        expiresIn: this.accessTokenExpiresIn,
        user,
      }
    } catch {
      throw new UnauthorizedException('刷新令牌无效或已过期')
    }
  }

  /**
   * 生成访问令牌（短期）
   */
  private generateAccessToken(userId: number, email: string): string {
    const payload: JwtPayload = { sub: userId, email, type: 'access' }
    return this.jwtService.sign(payload, {
      expiresIn: this.accessTokenExpiresIn,
    })
  }

  /**
   * 生成刷新令牌（长期）
   */
  private generateRefreshToken(userId: number, email: string): string {
    const payload: JwtPayload = { sub: userId, email, type: 'refresh' }
    return this.jwtService.sign(payload, {
      expiresIn: this.refreshTokenExpiresIn,
    })
  }

  /**
   * 根据用户 ID 获取用户信息
   */
  async getUserById(userId: number): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return null
    }

    return formatUser(user)
  }

  /**
   * 哈希密码（用于注册）
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10)
  }
}
