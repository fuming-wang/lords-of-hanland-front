import { clearSession, getToken } from './session'
import { relaunch } from './navigation'

const baseUrl = import.meta.env.VITE_API_BASE_URL || ''

// ApiError 携带 HTTP 状态码与后端返回的错误信息。
export class ApiError extends Error {
  statusCode: number

  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
  }
}

function errorMessage(data: unknown, statusCode: number): string {
  if (data && typeof data === 'object' && 'error' in data) {
    const message = (data as { error?: unknown }).error
    if (typeof message === 'string' && message) return message
  }
  return `请求失败(${statusCode})`
}

// request 是所有后端请求的统一入口:自动附带 Bearer token,并把非 2xx
// 响应转换为携带后端错误信息的 ApiError。遇到 401 时清除会话并回到登录页。
export async function request<T>(path: string, options: Omit<UniApp.RequestOptions, 'url'> = {}): Promise<T> {
  const token = getToken()
  const header: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.header as Record<string, string> | undefined),
  }
  if (token) {
    header.Authorization = `Bearer ${token}`
  }

  const response = await uni.request({
    ...options,
    url: baseUrl + path,
    header,
  })

  if (response.statusCode < 200 || response.statusCode >= 300) {
    if (response.statusCode === 401 && token) {
      // 已登录但 token 失效(过期或账号被封禁):清除会话并回登录页。
      clearSession()
      relaunch('/pages/login/login')
    }
    throw new ApiError(errorMessage(response.data, response.statusCode), response.statusCode)
  }

  return response.data as T
}
