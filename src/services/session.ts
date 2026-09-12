// 会话存储:登录成功后保存 token 与用户名;选区后保存所选分区,进入游戏后
// 保存当前角色。登出或 401 时全部清除。
// 独立于 auth.ts/http.ts,避免模块循环依赖。
// Role 以 import type 引入:类型在编译期擦除,不会产生运行时循环依赖。
import type { Role } from './role'

const TOKEN_KEY = 'lords_hanland_token'
const USERNAME_KEY = 'lords_hanland_username'
const ZONE_KEY = 'lords_hanland_zone'
const ROLE_KEY = 'lords_hanland_role'
const ROLE_VIEW_KEY = 'lords_hanland_role_view'

// SelectedZone 是玩家当前选中的分区(选区页写入,游戏内各处读取)。
export interface SelectedZone {
  id: number
  name: string
  status: string
}

// ActiveRole 是当前进入游戏的角色摘要(游戏内页面读取,避免重复请求)。
export interface ActiveRole {
  id: number
  name: string
  level: number
  className: string
  serverId: number
}

function readJSON<T>(key: string): T | null {
  try {
    const raw = uni.getStorageSync(key)
    if (!raw) return null
    if (typeof raw === 'object') return raw as T
    return JSON.parse(String(raw)) as T
  } catch {
    return null
  }
}

function writeJSON(key: string, value: unknown): void {
  try {
    uni.setStorageSync(key, JSON.stringify(value))
  } catch {
    // 存储失败不应中断进入游戏的流程。
  }
}

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

// getSelectedZone 返回当前选中的分区;未选区时返回 null。
export function getSelectedZone(): SelectedZone | null {
  const zone = readJSON<SelectedZone>(ZONE_KEY)
  return zone && typeof zone.id === 'number' && zone.id > 0 ? zone : null
}

// setSelectedZone 记录选区结果,登录态与所选分区一起构成"进入哪个区"。
export function setSelectedZone(zone: SelectedZone): void {
  writeJSON(ZONE_KEY, zone)
}

export function getActiveRole(): ActiveRole | null {
  const role = readJSON<ActiveRole>(ROLE_KEY)
  return role && typeof role.id === 'number' && role.id > 0 ? role : null
}

export function setActiveRole(role: ActiveRole): void {
  writeJSON(ROLE_KEY, role)
}

// setActiveRoleView 保存进入游戏时的完整角色视图,供游戏页(独立路由)
// 直接渲染完整属性;冷启动时同样可以恢复,不会退化成零值摘要。
export function setActiveRoleView(role: Role): void {
  writeJSON(ROLE_VIEW_KEY, role)
}

export function getActiveRoleView(): Role | null {
  const role = readJSON<Role>(ROLE_VIEW_KEY)
  return role && typeof role.id === 'number' && role.id > 0 ? role : null
}

export function clearActiveRoleView(): void {
  uni.removeStorageSync(ROLE_VIEW_KEY)
}

export function clearActiveRole(): void {
  uni.removeStorageSync(ROLE_KEY)
}

export function clearSession(): void {
  uni.removeStorageSync(TOKEN_KEY)
  uni.removeStorageSync(USERNAME_KEY)
  // 登出后不再保留分区与角色选择:重新登录需要重新选区。
  uni.removeStorageSync(ZONE_KEY)
  uni.removeStorageSync(ROLE_KEY)
  uni.removeStorageSync(ROLE_VIEW_KEY)
}

export function isLoggedIn(): boolean {
  return getToken() !== ''
}
