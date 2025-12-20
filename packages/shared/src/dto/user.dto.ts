export interface UserDto {
  id: number
  email: string
  name: string
  avatar?: string
  createdAt: string
  updatedAt: string
}

export interface CreateUserDto {
  email: string
  name: string
  password: string
}

export interface UpdateUserDto {
  name?: string
  avatar?: string
}

export interface LoginDto {
  email: string
  password: string
}

export interface AuthResponseDto {
  accessToken: string
  user: UserDto
}
