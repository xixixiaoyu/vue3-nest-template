import { PipeTransform, ArgumentMetadata, BadRequestException } from '@nestjs/common'
import { ZodSchema, ZodError } from 'zod'

/**
 * Zod 验证管道
 * 用于替代 class-validator，实现前后端统一验证
 */
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown, _metadata: ArgumentMetadata) {
    try {
      return this.schema.parse(value)
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }))
        throw new BadRequestException({
          message: '验证失败',
          errors,
        })
      }
      throw new BadRequestException('验证失败')
    }
  }
}
