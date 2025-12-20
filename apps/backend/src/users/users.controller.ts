import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import type { UserDto, CreateUserDto, ApiResponse } from "@my-app/shared";

/**
 * 用户控制器
 * 处理用户相关的 HTTP 请求
 */
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * 获取所有用户
   */
  @Get()
  async findAll(): Promise<ApiResponse<UserDto[]>> {
    const users = await this.usersService.findAll();
    return {
      success: true,
      data: users,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 根据 ID 获取单个用户
   */
  @Get(":id")
  async findOne(
    @Param("id", ParseIntPipe) id: number
  ): Promise<ApiResponse<UserDto>> {
    const user = await this.usersService.findOne(id);
    return {
      success: true,
      data: user,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 创建新用户
   */
  @Post()
  async create(
    @Body() createUserDto: CreateUserDto
  ): Promise<ApiResponse<UserDto>> {
    const user = await this.usersService.create(createUserDto);
    return {
      success: true,
      data: user,
      message: "用户创建成功",
      timestamp: new Date().toISOString(),
    };
  }
}
