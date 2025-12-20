import { Controller, Get } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'

/**
 * 健康检查控制器
 * 用于检测服务运行状态
 */
@ApiTags('健康检查')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: '健康检查' })
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    }
  }
}
