import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ConfigService } from '@nestjs/config'
import { AuthService } from './auth.service'

interface JwtPayload {
  sub: number
  email: string
}

/**
 * JWT 策略
 * 用于验证 JWT 令牌
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET')
    if (!jwtSecret) {
      throw new Error('JWT_SECRET 未配置')
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    })
  }

  /**
   * 验证 JWT payload
   */
  async validate(payload: JwtPayload) {
    const user = await this.authService.getUserById(payload.sub)

    if (!user) {
      throw new UnauthorizedException('用户不存在')
    }

    return user
  }
}
