import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common'
import { UsersService } from './users.service'
import type { UserDto, CreateUserDto, ApiResponse } from '@my-app/shared'

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(): Promise<ApiResponse<UserDto[]>> {
    const users = await this.usersService.findAll()
    return {
      success: true,
      data: users,
      timestamp: new Date().toISOString(),
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ApiResponse<UserDto>> {
    const user = await this.usersService.findOne(id)
    return {
      success: true,
      data: user,
      timestamp: new Date().toISOString(),
    }
  }

  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<ApiResponse<UserDto>> {
    const user = await this.usersService.create(createUserDto)
    return {
      success: true,
      data: user,
      message: 'User created successfully',
      timestamp: new Date().toISOString(),
    }
  }
}
