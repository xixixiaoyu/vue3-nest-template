import type { CallHandler, ExecutionContext } from '@nestjs/common'
import { describe, expect, it } from 'vitest'
import { firstValueFrom, of } from 'rxjs'
import { TransformInterceptor } from './transform.interceptor'

describe('TransformInterceptor', () => {
  const interceptor = new TransformInterceptor()
  const context = {} as ExecutionContext

  it('should wrap success response with unified payload', async () => {
    const payload = { id: 1, name: 'Alice' }
    const next: CallHandler = { handle: () => of(payload) }

    const result = await firstValueFrom(interceptor.intercept(context, next))

    expect(result.success).toBe(true)
    expect(result.data).toEqual(payload)
    expect(Number.isNaN(Date.parse(result.timestamp))).toBe(false)
  })

  it('should keep primitive payload as data field', async () => {
    const next: CallHandler = { handle: () => of('ok') }

    const result = await firstValueFrom(interceptor.intercept(context, next))

    expect(result).toEqual(
      expect.objectContaining({
        success: true,
        data: 'ok',
      }),
    )
  })
})
