import { Module } from '@nestjs/common'
import { MulterModule } from '@nestjs/platform-express'
import { ConfigService } from '@nestjs/config'
import { StorageService } from './storage.service'
import { UploadController } from './upload.controller'
import { memoryStorage } from 'multer'

/**
 * 文件上传模块
 * 支持本地上传和 S3 云存储
 */
@Module({
  imports: [
    MulterModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        storage: memoryStorage(), // 使用内存存储，后续上传到 S3
        limits: {
          fileSize: config.get('UPLOAD_MAX_SIZE', 10 * 1024 * 1024), // 默认 10MB
          files: config.get('UPLOAD_MAX_FILES', 10), // 最多 10 个文件
        },
        fileFilter: (_req, file, callback) => {
          // 允许的 MIME 类型
          const allowedMimes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          ]

          if (allowedMimes.includes(file.mimetype)) {
            callback(null, true)
          } else {
            callback(new Error(`不支持的文件类型: ${file.mimetype}`), false)
          }
        },
      }),
    }),
  ],
  controllers: [UploadController],
  providers: [StorageService],
  exports: [StorageService],
})
export class UploadModule {}
