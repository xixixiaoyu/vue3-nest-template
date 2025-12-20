import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from '../prisma/prisma.service'
import * as bcrypt from 'bcrypt'
import type { LoginDto, UserDto, AuthResponseDto } from '@my-app/shared'

/**
 * 认证服务
 * 处理用户登录、注册和 JWT 令牌生成
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * 验证用户凭据
   */
  async validateUser(email: string, password: string): Promise<UserDto | null> {
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
   * 用户登录
   */
  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.validateUser(loginDto.email, loginDto.password)

    if (!user) {
      throw new UnauthorizedException('邮箱或密码错误')
    }

    const payload = { sub: user.id, email: user.email }
    const accessToken = this.jwtService.sign(payload)

    return {
      accessToken,
      user,
    }
  }

  /**
   * 根据用户 ID 获取用户信息
   */
  async getUserById(userId: number): Promise<UserDto | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      return null
    }

    return {
      ...user,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    }
  }

  /**
   * 哈希密码（用于注册）
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10)
  }
}
