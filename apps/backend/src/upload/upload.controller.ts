import {
  Controller,
  Post,
  Delete,
  Param,
  BadRequestException,
  UseGuards,
  Req,
} from '@nestjs/common'
import type { MultipartFile } from '@fastify/multipart'
import { ConfigService } from '@nestjs/config'
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiBearerAuth } from '@nestjs/swagger'
import type { FastifyRequest } from 'fastify'
import { JwtAuthGuard } from '../auth'
import { StorageService, UploadFile, UploadResult } from './storage.service'

type MultipartRequest = FastifyRequest & {
  file: () => Promise<MultipartFile | undefined>
  files: () => AsyncIterableIterator<MultipartFile>
}

/**
 * 文件上传控制器
 */
@ApiTags('上传')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('upload')
export class UploadController {
  private readonly allowedMimes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ] as const

  constructor(
    private readonly storageService: StorageService,
    private readonly config: ConfigService,
  ) {}

  /**
   * 上传单个文件
   */
  @Post('single')
  @ApiOperation({ summary: '上传单个文件' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  async uploadSingle(@Req() req: FastifyRequest): Promise<UploadResult> {
    const part = await (req as MultipartRequest).file()
    if (!part) {
      throw new BadRequestException('请选择要上传的文件')
    }
    if (part.fieldname !== 'file') {
      throw new BadRequestException('上传字段必须为 file')
    }
    const file = await this.normalizeUploadFile(part)
    return this.storageService.upload(file)
  }

  /**
   * 上传多个文件
   */
  @Post('multiple')
  @ApiOperation({ summary: '上传多个文件（最多 10 个）' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  async uploadMultiple(@Req() req: FastifyRequest): Promise<UploadResult[]> {
    const maxFiles = this.getMaxFiles()
    const files: UploadFile[] = []
    const parts = (req as MultipartRequest).files()

    for await (const part of parts) {
      if (files.length >= maxFiles) {
        throw new BadRequestException(`最多上传 ${maxFiles} 个文件`)
      }
      if (part.fieldname !== 'files') {
        throw new BadRequestException('上传字段必须为 files')
      }
      files.push(await this.normalizeUploadFile(part))
    }

    if (files.length === 0) {
      throw new BadRequestException('请选择要上传的文件')
    }

    return this.storageService.uploadMany(files)
  }

  /**
   * 删除文件
   */
  @Delete(':key')
  @ApiOperation({ summary: '删除文件' })
  async delete(@Param('key') key: string): Promise<{ success: boolean }> {
    await this.storageService.delete(key)
    return { success: true }
  }

  private getMaxFiles(): number {
    return this.config.get('UPLOAD_MAX_FILES', 10)
  }

  private getMaxFileSize(): number {
    return this.config.get('UPLOAD_MAX_SIZE', 10 * 1024 * 1024)
  }

  private async normalizeUploadFile(part: MultipartFile): Promise<UploadFile> {
    if (!this.allowedMimes.includes(part.mimetype as (typeof this.allowedMimes)[number])) {
      throw new BadRequestException(`不支持的文件类型: ${part.mimetype}`)
    }

    const buffer = await part.toBuffer()
    if (buffer.length > this.getMaxFileSize()) {
      throw new BadRequestException(
        `文件大小超出限制，最大允许 ${(this.getMaxFileSize() / 1024 / 1024).toFixed(0)}MB`,
      )
    }

    return {
      originalname: part.filename,
      mimetype: part.mimetype,
      size: buffer.length,
      buffer,
    }
  }
}
