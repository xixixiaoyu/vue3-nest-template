/**
 * 通用 API 响应格式
 */
export interface ApiResponse<T = unknown> {
  /** 是否成功 */
  success: boolean
  /** 响应数据 */
  data: T
  /** 消息描述 */
  message?: string
  /** 时间戳 */
  timestamp: string
}

/**
 * 分页响应格式
 */
export interface PaginatedResponse<T> {
  /** 数据列表 */
  items: T[]
  /** 总数 */
  total: number
  /** 当前页码 */
  page: number
  /** 每页数量 */
  pageSize: number
  /** 总页数 */
  totalPages: number
}

/**
 * 分页查询参数
 */
export interface PaginationQuery {
  /** 页码 */
  page?: number
  /** 每页数量 */
  pageSize?: number
}
