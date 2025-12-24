import { Controller, Get, Post, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { UsersService } from './users.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RegisterDto } from '../auth/auth.dto'
import type { User } from '@my-app/shared'

/**
 * 用户控制器
 * 处理用户相关的 HTTP 请求
 */
@ApiTags('用户')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * 获取所有用户（需要认证）
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取所有用户' })
  async findAll(): Promise<User[]> {
    return this.usersService.findAll()
  }

  /**
   * 根据 ID 获取单个用户（需要认证）
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取单个用户' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.usersService.findOne(id)
  }

  /**
   * 创建新用户（注册）
   */
  @Post()
  @ApiOperation({ summary: '创建新用户' })
  async create(@Body() createUserDto: RegisterDto): Promise<User> {
    return this.usersService.create(createUserDto)
  }
}
