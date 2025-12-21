import { Injectable, Logger } from '@nestjs/common'
import { MailerService } from '@nestjs-modules/mailer'

export interface SendMailOptions {
  to: string | string[]
  subject: string
  text?: string
  html?: string
}

/**
 * 邮件服务
 * 封装邮件发送逻辑，支持文本和 HTML 邮件
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name)

  constructor(private readonly mailerService: MailerService) {}

  /**
   * 发送邮件
   */
  async send(options: SendMailOptions): Promise<boolean> {
    try {
      await this.mailerService.sendMail({
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      })
      this.logger.log(`邮件发送成功: ${options.subject} -> ${options.to}`)
      return true
    } catch (err) {
      const error = err as Error
      this.logger.error(`邮件发送失败: ${error.message}`, error.stack)
      return false
    }
  }

  /**
   * 发送验证码邮件
   */
  async sendVerificationCode(to: string, code: string): Promise<boolean> {
    return this.send({
      to,
      subject: '您的验证码',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>验证码</h2>
          <p>您的验证码是：</p>
          <div style="font-size: 32px; font-weight: bold; color: #4F46E5; padding: 20px; background: #F3F4F6; border-radius: 8px; text-align: center;">
            ${code}
          </div>
          <p style="color: #6B7280; margin-top: 20px;">验证码有效期为 10 分钟，请勿泄露给他人。</p>
        </div>
      `,
    })
  }

  /**
   * 发送密码重置邮件
   */
  async sendPasswordReset(to: string, resetLink: string): Promise<boolean> {
    return this.send({
      to,
      subject: '重置您的密码',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>重置密码</h2>
          <p>您请求重置密码，请点击下方按钮：</p>
          <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            重置密码
          </a>
          <p style="color: #6B7280;">如果您未请求重置密码，请忽略此邮件。</p>
          <p style="color: #6B7280; font-size: 12px;">链接有效期为 1 小时。</p>
        </div>
      `,
    })
  }
}
