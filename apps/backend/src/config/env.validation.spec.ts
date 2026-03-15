import { describe, it, expect } from 'vitest'
import { validateEnv } from './env.validation'

describe('validateEnv', () => {
  it('should coerce numeric and boolean env variables', () => {
    const env = validateEnv({
      JWT_SECRET: 'my-secret',
      PORT: '3001',
      MAIL_SECURE: 'true',
      REDIS_PORT: '6380',
    })

    expect(env.PORT).toBe(3001)
    expect(env.MAIL_SECURE).toBe(true)
    expect(env.REDIS_PORT).toBe(6380)
    expect(env.FRONTEND_URL).toBe('http://localhost:5173')
  })

  it('should throw when JWT_SECRET is missing', () => {
    expect(() =>
      validateEnv({
        NODE_ENV: 'development',
      }),
    ).toThrow('Missing required environment variable JWT_SECRET')
  })

  it('should reject placeholder JWT secret in production', () => {
    expect(() =>
      validateEnv({
        NODE_ENV: 'production',
        JWT_SECRET: 'your-super-secret-jwt-key-change-in-production',
      }),
    ).toThrow('JWT_SECRET must be replaced in production')
  })
})
