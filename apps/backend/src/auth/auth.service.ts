import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../prisma/prisma.service'
import { MailService } from '../mail/mail.service'
import * as bcrypt from 'bcryptjs'
import * as crypto from 'crypto'
import type { LoginInput, RegisterInput, User, AuthResponse } from '@my-app/shared'
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
    private readonly mailService: MailService,
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

      const newAccessToken = this.generateAccessToken(user.id, user.email)
      const newRefreshToken = this.generateRefreshToken(user.id, user.email)

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
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

  /**
   * 用户注册
   */
  async register(registerDto: RegisterInput): Promise<AuthResponse> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    })

    if (existingUser) {
      throw new ConflictException('邮箱已被注册')
    }

    const hashedPassword = await this.hashPassword(registerDto.password)

    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        name: registerDto.name,
        password: hashedPassword,
      },
    })

    const formattedUser = formatUser(user)
    const accessToken = this.generateAccessToken(formattedUser.id, formattedUser.email)
    const refreshToken = this.generateRefreshToken(formattedUser.id, formattedUser.email)

    return {
      accessToken,
      refreshToken,
      expiresIn: this.accessTokenExpiresIn,
      user: formattedUser,
    }
  }

  /**
   * 请求密码重置
   */
  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    })

    // 为防止用户枚举攻击，无论用户是否存在都不抛出错误
    if (!user) {
      return
    }

    const { token, hashedToken } = this.generateResetToken()
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 小时后过期

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: expiresAt,
      },
    })

    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:5173')
    const resetLink = `${frontendUrl}/reset-password?token=${token}`

    await this.mailService.sendPasswordReset(email, resetLink)
  }

  /**
   * 重置密码
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

    const user = await this.prisma.user.findFirst({
      where: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: {
          gt: new Date(),
        },
      },
    })

    if (!user) {
      throw new BadRequestException('重置链接无效或已过期')
    }

    const hashedPassword = await this.hashPassword(newPassword)

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    })
  }

  /**
   * 生成重置令牌
   */
  private generateResetToken(): { token: string; hashedToken: string } {
    const token = crypto.randomBytes(32).toString('hex')
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')
    return { token, hashedToken }
  }
}
