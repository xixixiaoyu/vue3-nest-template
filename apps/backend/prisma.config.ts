import { defineConfig } from 'prisma/config'
import { config } from 'dotenv'
import { resolve } from 'path'
import { existsSync } from 'fs'

// 加载根目录的 .env 文件（可选）
const envPath = resolve(__dirname, '../../.env')

if (existsSync(envPath)) {
  const { error } = config({ path: envPath })
  if (error) {
    console.warn('Warning: Failed to load .env file:', error.message)
  }
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url:
      process.env.DATABASE_URL ||
      'postgresql://postgres:postgres@localhost:5432/myapp?schema=public',
  },
  migrations: {
    path: 'prisma/migrations',
  },
})
