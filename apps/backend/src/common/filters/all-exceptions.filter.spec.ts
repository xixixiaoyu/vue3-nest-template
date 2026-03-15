import { describe, it, expect, vi } from 'vitest'
import { BadRequestException, ArgumentsHost } from '@nestjs/common'
import { AllExceptionsFilter } from './all-exceptions.filter'

describe('AllExceptionsFilter', () => {
  const filter = new AllExceptionsFilter()

  function createHost() {
    const json = vi.fn()
    const status = vi.fn(() => ({ json }))

    const host = {
      switchToHttp: () => ({
        getResponse: () => ({ status }),
      }),
    } as unknown as ArgumentsHost

    return { host, status, json }
  }

  it('should extract array message from HttpException response payload', () => {
    const { host, status, json } = createHost()
    const exception = new BadRequestException(['字段 A 无效', '字段 B 必填'])

    filter.catch(exception, host)

    expect(status).toHaveBeenCalledWith(400)
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: '字段 A 无效, 字段 B 必填',
        statusCode: 400,
      }),
    )
  })

  it('should return generic message for unknown errors', () => {
    const { host, status, json } = createHost()

    filter.catch(new Error('boom'), host)

    expect(status).toHaveBeenCalledWith(500)
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: '服务器内部错误',
        statusCode: 500,
      }),
    )
  })
})
