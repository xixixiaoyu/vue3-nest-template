import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { AuthService } from '../auth/auth.service'
import type { User, RegisterInput } from '@my-app/shared'
import { formatUser, formatUsers } from '@my-app/shared'

/**
 * 用户服务
 * 处理用户相关的业务逻辑
 */
@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  /**
   * 获取所有用户
   */
  async findAll(): Promise<User[]> {
    const users = await this.prisma.user.findMany()
    return formatUsers(users)
  }

  /**
   * 根据 ID 获取单个用户
   */
  async findOne(id: number): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    })

    if (!user) {
      throw new NotFoundException(`用户 ID ${id} 不存在`)
    }

    return formatUser(user)
  }

  /**
   * 创建新用户
   */
  async create(createUserDto: RegisterInput): Promise<User> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    })

    if (existingUser) {
      throw new ConflictException('邮箱已被注册')
    }

    const hashedPassword = await this.authService.hashPassword(createUserDto.password)

    const user = await this.prisma.user.create({
      data: {
        email: createUserDto.email,
        name: createUserDto.name,
        password: hashedPassword,
      },
    })

    return formatUser(user)
  }
}
