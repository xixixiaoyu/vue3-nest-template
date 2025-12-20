import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { Throttle, SkipThrottle } from '@nestjs/throttler'
import { AuthService } from './auth.service'
import { JwtAuthGuard } from './jwt-auth.guard'
import { CurrentUser } from './current-user.decorator'
import { LoginDto, RefreshTokenDto } from './auth.dto'
import type { User, AuthResponse } from '@my-app/shared'

/**
 * 认证控制器
 */
@ApiTags('认证')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * 用户登录
   * 限制: 每分钟最多 5 次尝试（防止暴力破解）
   */
  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 登录接口更严格的限制
  @ApiOperation({ summary: '用户登录' })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponse> {
    return this.authService.login(loginDto)
  }

  /**
   * 刷新访问令牌
   */
  @Post('refresh')
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 刷新令牌限制
  @ApiOperation({ summary: '刷新访问令牌' })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto): Promise<AuthResponse> {
    return this.authService.refreshToken(refreshTokenDto.refreshToken)
  }

  /**
   * 获取当前用户信息
   */
  @Get('me')
  @SkipThrottle() // 已认证用户跳过限制
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取当前用户信息' })
  async getProfile(@CurrentUser() user: User): Promise<User> {
    return user
  }
}
