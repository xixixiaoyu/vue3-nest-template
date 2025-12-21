import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { randomUUID } from 'crypto'
import { extname } from 'path'

export interface UploadResult {
  key: string
  url: string
  bucket: string
  size: number
  mimetype: string
}

/**
 * 云存储服务
 * 支持 AWS S3 和兼容 S3 协议的存储服务（如阿里云 OSS、MinIO）
 */
@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name)
  private s3Client!: S3Client
  private bucket!: string
  private region!: string
  private endpoint: string | undefined

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    this.bucket = this.config.get('S3_BUCKET', 'my-app-uploads')
    this.region = this.config.get('S3_REGION', 'us-east-1')
    this.endpoint = this.config.get('S3_ENDPOINT') // 可选，用于 OSS/MinIO

    this.s3Client = new S3Client({
      region: this.region,
      endpoint: this.endpoint,
      credentials: {
        accessKeyId: this.config.get('S3_ACCESS_KEY_ID', ''),
        secretAccessKey: this.config.get('S3_SECRET_ACCESS_KEY', ''),
      },
      forcePathStyle: !!this.endpoint, // OSS/MinIO 需要开启
    })

    this.logger.log(`存储服务已初始化: ${this.bucket} (${this.region})`)
  }

  /**
   * 上传文件到 S3
   */
  async upload(file: Express.Multer.File, folder = 'uploads'): Promise<UploadResult> {
    const ext = extname(file.originalname)
    const key = `${folder}/${randomUUID()}${ext}`

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      // ACL: 'public-read', // 如需公开访问可取消注释
    })

    await this.s3Client.send(command)
    this.logger.log(`文件上传成功: ${key}`)

    return {
      key,
      url: this.getPublicUrl(key),
      bucket: this.bucket,
      size: file.size,
      mimetype: file.mimetype,
    }
  }

  /**
   * 批量上传文件
   */
  async uploadMany(files: Express.Multer.File[], folder = 'uploads'): Promise<UploadResult[]> {
    return Promise.all(files.map((file) => this.upload(file, folder)))
  }

  /**
   * 删除文件
   */
  async delete(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    })

    await this.s3Client.send(command)
    this.logger.log(`文件删除成功: ${key}`)
  }

  /**
   * 获取预签名 URL（用于临时访问私有文件）
   */
  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    })

    return getSignedUrl(this.s3Client, command, { expiresIn })
  }

  /**
   * 获取公开访问 URL
   */
  private getPublicUrl(key: string): string {
    if (this.endpoint) {
      // OSS/MinIO 格式
      return `${this.endpoint}/${this.bucket}/${key}`
    }
    // AWS S3 格式
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`
  }
}
