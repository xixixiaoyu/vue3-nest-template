import { describe, it, expect, vi } from 'vitest'
import { ForbiddenException } from '@nestjs/common'
import type { Request, Response, NextFunction } from 'express'
import { CsrfMiddleware } from './csrf.middleware'

describe('CsrfMiddleware', () => {
  const middleware = new CsrfMiddleware()

  function createResponseMock() {
    return {
      cookie: vi.fn(),
    } as unknown as Response
  }

  it('should skip validation for safe methods', () => {
    const req = {
      method: 'GET',
      path: '/api/users',
      cookies: {},
      headers: {},
    } as unknown as Request
    const res = createResponseMock()
    const next = vi.fn() as unknown as NextFunction

    middleware.use(req, res, next)

    expect(next).toHaveBeenCalled()
  })

  it('should throw ForbiddenException when csrf token length mismatches', () => {
    const req = {
      method: 'POST',
      path: '/api/users',
      cookies: { 'XSRF-TOKEN': 'abc' },
      headers: { 'x-xsrf-token': 'abcd' },
    } as unknown as Request
    const res = createResponseMock()
    const next = vi.fn() as unknown as NextFunction

    expect(() => middleware.use(req, res, next)).toThrow(ForbiddenException)
    expect(next).not.toHaveBeenCalled()
  })
})
