import { request } from './http'
import { setSession } from './session'

export interface LoginResult {
  token: string
  expires_at: string
  account_id: number
  username: string
}

export interface RegisterResult {
  id: number
  username: string
}

export interface UsernameCheckResult {
  available: boolean
  message?: string
}

// login 调用 POST /auth/login,成功后将会话写入本地存储。
export async function login(username: string, password: string): Promise<LoginResult> {
  const result = await request<LoginResult>('/auth/login', {
    method: 'POST',
    data: { username, password },
  })
  setSession(result.token, result.username)
  return result
}

// register 调用 POST /accounts 创建账号,不写入会话(由调用方决定是否继续登录)。
export async function register(username: string, password: string): Promise<RegisterResult> {
  return request<RegisterResult>('/accounts', {
    method: 'POST',
    data: { username, password },
  })
}

// checkUsernameAvailable 调用 GET /auth/username-available 查询用户名是否可用。
export async function checkUsernameAvailable(username: string): Promise<boolean> {
  const result = await request<UsernameCheckResult>(
    `/auth/username-available?username=${encodeURIComponent(username)}`,
  )
  return result.available
}

const ERROR_MESSAGES: Record<string, string> = {
  'user: username already taken': '用户名已被占用',
  'user: invalid credentials': '用户名或密码错误',
  'user: username must be 2-32 characters': '用户名需为 2-32 个字符',
  'user: password must be 6-64 characters': '密码需为 6-64 个字符',
  'user: account suspended': '账号已被封禁',
  'Network Error': '网络连接失败,请检查网络或稍后再试',
}

// translateAuthError 把后端错误转换为用户可读的中文提示。
export function translateAuthError(message: string): string {
  if (!message) return '请求失败,请稍后再试'
  return ERROR_MESSAGES[message] ?? message
}
