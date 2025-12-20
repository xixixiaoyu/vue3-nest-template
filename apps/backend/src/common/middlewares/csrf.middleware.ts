import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'
import * as crypto from 'crypto'

/**
 * CSRF 保护中间件
 * 使用双重提交 Cookie 模式（适用于 SPA 应用）
 *
 * 工作原理：
 * 1. 服务器生成 CSRF token 并设置到 cookie 中
 * 2. 客户端从 cookie 读取 token 并放入请求头
 * 3. 服务器验证 cookie 中的 token 与请求头中的 token 是否一致
 */
@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  private readonly cookieName = 'XSRF-TOKEN'
  private readonly headerName = 'X-XSRF-TOKEN'
  private readonly tokenLength = 32

  // 需要跳过 CSRF 验证的路径
  private readonly skipPaths = [
    '/api/health',
    '/api/docs',
    '/api/auth/login', // 登录接口通过速率限制保护
    '/api/auth/refresh',
  ]

  // 安全方法（不需要 CSRF 验证）
  private readonly safeMethods = ['GET', 'HEAD', 'OPTIONS']

  use(req: Request, res: Response, next: NextFunction) {
    // 确保每个响应都设置 CSRF token cookie
    this.ensureCsrfToken(req, res)

    // 安全方法跳过验证
    if (this.safeMethods.includes(req.method)) {
      return next()
    }

    // 跳过特定路径
    if (this.skipPaths.some((path) => req.path.startsWith(path))) {
      return next()
    }

    // 验证 CSRF token
    if (!this.validateCsrfToken(req)) {
      throw new ForbiddenException('CSRF token 验证失败')
    }

    next()
  }

  /**
   * 确保响应中包含 CSRF token cookie
   */
  private ensureCsrfToken(req: Request, res: Response): void {
    const existingToken = req.cookies?.[this.cookieName]

    if (!existingToken) {
      const token = this.generateToken()
      res.cookie(this.cookieName, token, {
        httpOnly: false, // 允许 JavaScript 读取
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 24 * 60 * 60 * 1000, // 24 小时
      })
    }
  }

  /**
   * 验证 CSRF token
   */
  private validateCsrfToken(req: Request): boolean {
    const cookieToken = req.cookies?.[this.cookieName]
    const headerToken = req.headers[this.headerName.toLowerCase()] as string

    if (!cookieToken || !headerToken) {
      return false
    }

    // 使用时间安全的比较防止时序攻击
    return crypto.timingSafeEqual(Buffer.from(cookieToken), Buffer.from(headerToken))
  }

  /**
   * 生成随机 CSRF token
   */
  private generateToken(): string {
    return crypto.randomBytes(this.tokenLength).toString('hex')
  }
}
