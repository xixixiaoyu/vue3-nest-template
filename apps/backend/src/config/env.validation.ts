type EnvInput = Record<string, unknown>

function asString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined
}

function asOptionalString(value: unknown): string | undefined {
  const str = asString(value)?.trim()
  return str ? str : undefined
}

function toNumber(key: string, value: unknown, defaultValue: number): number {
  if (value === undefined || value === null || value === '') {
    return defaultValue
  }

  const num = Number(value)
  if (!Number.isFinite(num)) {
    throw new Error(`Invalid environment variable ${key}: expected a number`)
  }

  return num
}

function toBoolean(key: string, value: unknown, defaultValue: boolean): boolean {
  if (value === undefined || value === null || value === '') {
    return defaultValue
  }

  if (typeof value === 'boolean') {
    return value
  }

  const normalized = String(value).trim().toLowerCase()
  if (['true', '1', 'yes', 'on'].includes(normalized)) {
    return true
  }
  if (['false', '0', 'no', 'off'].includes(normalized)) {
    return false
  }

  throw new Error(`Invalid environment variable ${key}: expected a boolean`)
}

export function validateEnv(env: EnvInput): EnvInput {
  const nodeEnv = asString(env.NODE_ENV) || 'development'
  const jwtSecret = asOptionalString(env.JWT_SECRET)

  if (!jwtSecret) {
    throw new Error('Missing required environment variable JWT_SECRET')
  }

  if (nodeEnv === 'production' && jwtSecret.includes('change-in-production')) {
    throw new Error('JWT_SECRET must be replaced in production')
  }

  return {
    ...env,
    NODE_ENV: nodeEnv,
    PORT: toNumber('PORT', env.PORT, 3000),
    FRONTEND_URL: asOptionalString(env.FRONTEND_URL) || 'http://localhost:5173',
    JWT_SECRET: jwtSecret,
    JWT_ACCESS_EXPIRES_IN: toNumber('JWT_ACCESS_EXPIRES_IN', env.JWT_ACCESS_EXPIRES_IN, 900),
    JWT_REFRESH_EXPIRES_IN: toNumber('JWT_REFRESH_EXPIRES_IN', env.JWT_REFRESH_EXPIRES_IN, 604800),
    RESET_PASSWORD_EXPIRES_IN: toNumber(
      'RESET_PASSWORD_EXPIRES_IN',
      env.RESET_PASSWORD_EXPIRES_IN,
      3600,
    ),
    REDIS_PORT: toNumber('REDIS_PORT', env.REDIS_PORT, 6379),
    REDIS_DB: toNumber('REDIS_DB', env.REDIS_DB, 0),
    REDIS_DEFAULT_TTL: toNumber('REDIS_DEFAULT_TTL', env.REDIS_DEFAULT_TTL, 300),
    THROTTLE_SHORT_TTL: toNumber('THROTTLE_SHORT_TTL', env.THROTTLE_SHORT_TTL, 1000),
    THROTTLE_SHORT_LIMIT: toNumber('THROTTLE_SHORT_LIMIT', env.THROTTLE_SHORT_LIMIT, 3),
    THROTTLE_MEDIUM_TTL: toNumber('THROTTLE_MEDIUM_TTL', env.THROTTLE_MEDIUM_TTL, 10000),
    THROTTLE_MEDIUM_LIMIT: toNumber('THROTTLE_MEDIUM_LIMIT', env.THROTTLE_MEDIUM_LIMIT, 20),
    THROTTLE_LONG_TTL: toNumber('THROTTLE_LONG_TTL', env.THROTTLE_LONG_TTL, 60000),
    THROTTLE_LONG_LIMIT: toNumber('THROTTLE_LONG_LIMIT', env.THROTTLE_LONG_LIMIT, 100),
    MAIL_PORT: toNumber('MAIL_PORT', env.MAIL_PORT, 587),
    MAIL_SECURE: toBoolean('MAIL_SECURE', env.MAIL_SECURE, false),
    UPLOAD_MAX_SIZE: toNumber('UPLOAD_MAX_SIZE', env.UPLOAD_MAX_SIZE, 10485760),
    UPLOAD_MAX_FILES: toNumber('UPLOAD_MAX_FILES', env.UPLOAD_MAX_FILES, 10),
  }
}
