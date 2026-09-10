import { request } from './http'

// Zone 是后端 server 表里的一个游戏分区（区服）。单库多区：所有分区共用
// 同一套地图与数值配置，玩家进入游戏前必须先选一个分区。
export interface Zone {
  id: number
  name: string
  status: string
  sort_order: number
  open: boolean
  created_at: string
}

interface ZoneListResult {
  servers: Zone[]
}

// listZones 调用公开接口 GET /servers 拉取分区列表（无需登录）。
export async function listZones(): Promise<Zone[]> {
  const result = await request<ZoneListResult>('/servers')
  return (result.servers || []).map((zone) => ({
    ...zone,
    open: typeof zone.open === 'boolean' ? zone.open : zone.status === 'open',
  }))
}

// zoneStatusLabel 把后端状态翻译成玩家可读文案。
export function zoneStatusLabel(status: string): string {
  switch (status) {
    case 'open':
      return '正常开放'
    case 'maintenance':
      return '维护中'
    case 'closed':
      return '已关闭'
    default:
      return status || '未知状态'
  }
}

const ZONE_ERRORS: Record<string, string> = {
  'server: server not found': '该分区不存在，请重新选择',
  'server: server is not open': '该分区正在维护或已关闭，请稍后再试',
}

// translateZoneError 把分区相关错误转成玩家提示。
export function translateZoneError(message: string): string {
  if (!message) return '分区信息加载失败，请稍后再试'
  return ZONE_ERRORS[message] ?? message
}
