import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { Throttle, SkipThrottle } from '@nestjs/throttler'
import { AuthService } from './auth.service'
import { JwtAuthGuard } from './jwt-auth.guard'
import { CurrentUser } from './current-user.decorator'
import {
  LoginDto,
  RegisterDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  LogoutDto,
} from './auth.dto'
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
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: '用户登录' })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponse> {
    return this.authService.login(loginDto)
  }

  /**
   * 用户注册
   * 限制: 每分钟最多 3 次尝试
   */
  @Post('register')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @ApiOperation({ summary: '用户注册' })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponse> {
    return this.authService.register(registerDto)
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
  @SkipThrottle()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取当前用户信息' })
  async getProfile(@CurrentUser() user: User): Promise<User> {
    return user
  }

  /**
   * 请求密码重置
   * 限制: 每分钟最多 3 次尝试
   */
  @Post('forgot-password')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @ApiOperation({ summary: '请求密码重置' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }> {
    await this.authService.requestPasswordReset(forgotPasswordDto.email)
    return { message: '如果该邮箱已注册，重置链接已发送到您的邮箱' }
  }

  /**
   * 重置密码
   * 限制: 每分钟最多 5 次尝试
   */
  @Post('reset-password')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: '重置密码' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    await this.authService.resetPassword(resetPasswordDto.token, resetPasswordDto.password)
    return { message: '密码重置成功，请使用新密码登录' }
  }

  /**
   * 用户登出
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '用户登出' })
  async logout(
    @CurrentUser() user: User,
    @Body() logoutDto: LogoutDto,
  ): Promise<{ message: string }> {
    await this.authService.logout(user.id, logoutDto.refreshToken)
    return { message: '登出成功' }
  }
}
