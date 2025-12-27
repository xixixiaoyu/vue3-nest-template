import { defineConfig } from 'prisma/config'
import { config } from 'dotenv'
import { resolve } from 'path'

// 加载根目录的 .env 文件
const { error } = config({ path: resolve(__dirname, '../../.env') })

if (error) {
  console.warn('Warning: Failed to load .env file:', error.message)
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
