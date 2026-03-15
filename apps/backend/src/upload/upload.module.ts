import { Module } from '@nestjs/common'
import { StorageService } from './storage.service'
import { UploadController } from './upload.controller'

/**
 * 文件上传模块
 * 支持本地上传和 S3 云存储
 */
@Module({
  controllers: [UploadController],
  providers: [StorageService],
  exports: [StorageService],
})
export class UploadModule {}
