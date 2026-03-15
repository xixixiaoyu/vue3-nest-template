import { describe, it, expect, vi } from 'vitest'
import { ForbiddenException } from '@nestjs/common'
import { CsrfMiddleware } from './csrf.middleware'

describe('CsrfMiddleware', () => {
  const middleware = new CsrfMiddleware()

  function createResponseMock() {
    return {
      setCookie: vi.fn(),
    }
  }

  it('should skip validation for safe methods', () => {
    const req = {
      method: 'GET',
      url: '/api/users',
      cookies: {},
      headers: {},
    }
    const res = createResponseMock()
    const next = vi.fn()

    middleware.use(req as never, res as never, next)

    expect(next).toHaveBeenCalled()
  })

  it('should throw ForbiddenException when csrf token length mismatches', () => {
    const req = {
      method: 'POST',
      url: '/api/users',
      cookies: { 'XSRF-TOKEN': 'abc' },
      headers: { 'x-xsrf-token': 'abcd' },
    }
    const res = createResponseMock()
    const next = vi.fn()

    expect(() => middleware.use(req as never, res as never, next)).toThrow(ForbiddenException)
    expect(next).not.toHaveBeenCalled()
  })

  it('should allow request when csrf cookie and header match', () => {
    const token = 'a'.repeat(64)
    const req = {
      method: 'POST',
      url: '/api/users',
      cookies: { 'XSRF-TOKEN': token },
      headers: { 'x-xsrf-token': token },
    }
    const res = createResponseMock()
    const next = vi.fn()

    middleware.use(req as never, res as never, next)

    expect(next).toHaveBeenCalled()
  })

  it('should skip csrf validation for refresh endpoint', () => {
    const req = {
      method: 'POST',
      url: '/api/auth/refresh',
      cookies: {},
      headers: {},
    }
    const res = createResponseMock()
    const next = vi.fn()

    middleware.use(req as never, res as never, next)

    expect(next).toHaveBeenCalled()
  })
})
