// 会话存储:登录成功后保存 token 与用户名,登出或 401 时清除。
// 独立于 auth.ts/http.ts,避免模块循环依赖。
const TOKEN_KEY = 'lords_hanland_token'
const USERNAME_KEY = 'lords_hanland_username'

export function getToken(): string {
  try {
    const token = uni.getStorageSync(TOKEN_KEY)
    return typeof token === 'string' ? token : ''
  } catch {
    return ''
  }
}

export function getUsername(): string {
  try {
    const name = uni.getStorageSync(USERNAME_KEY)
    return typeof name === 'string' ? name : ''
  } catch {
    return ''
  }
}

export function setSession(token: string, username: string): void {
  uni.setStorageSync(TOKEN_KEY, token)
  uni.setStorageSync(USERNAME_KEY, username)
}

export function clearSession(): void {
  uni.removeStorageSync(TOKEN_KEY)
  uni.removeStorageSync(USERNAME_KEY)
}

export function isLoggedIn(): boolean {
  return getToken() !== ''
}
