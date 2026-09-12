import { request, ApiError } from './http'

// Role 是后端返回的角色视图（role 表 + 16 项抗性）。server_id 标明角色
// 所属分区：角色名只在分区内唯一，因此列表/建角都必须带 server_id。
export interface Role {
  id: number
  server_id: number
  account_id: number
  name: string
  class: string
  sex: string
  image: string
  title: string
  // cur_location 是后端的当前位置(活动点位名或世界图城市名);未定位时为 null。
  cur_location?: string | null
  level: number
  experience: number
  required_experience: number
  total_experience: number
  available_points: number
  hp_points: number
  sp_points: number
  attack_points: number
  speed_points: number
  current_hp: number
  max_hp: number
  current_sp: number
  max_sp: number
  total_attack: number
  total_speed: number
  gold: number
  silver: number
  created_at: string
}

// MaxRolesPerZone 与后端 role.MaxRolesPerServer 保持一致：每账号每分区 3 个。
export const MaxRolesPerZone = 3

// MaxRoleNameLength 与后端 role.MaxNameLength 保持一致（6 个字符）。
export const MaxRoleNameLength = 6

// listRoles 调用 GET /roles?server_id= 拉取当前账号在指定分区的角色列表。
export async function listRoles(serverId: number): Promise<Role[]> {
  const result = await request<{ roles: Role[] }>(`/roles?server_id=${serverId}`)
  return result.roles || []
}

export interface CreateRoleInput {
  serverId: number
  name: string
  className: string
  sex: string
  image: string
}

// createRole 调用 POST /roles 在指定分区建角。
export async function createRole(input: CreateRoleInput): Promise<Role> {
  return request<Role>('/roles', {
    method: 'POST',
    data: {
      server_id: input.serverId,
      name: input.name,
      class: input.className,
      sex: input.sex,
      image: input.image,
    },
  })
}

// getRole 调用 GET /roles/{id} 拉取角色的完整视图(后端校验归属,不校验
// 分区状态)。游戏主界面每次显示时用它刷新金银/经验/血量/精力等实时数据。
export async function getRole(roleId: number): Promise<Role> {
  return request<Role>(`/roles/${roleId}`)
}

// selectRole 调用 POST /roles/{id}/select 进入指定角色（后端会校验归属与
// 分区状态：分区维护/关闭时返回 409）。
export async function selectRole(roleId: number): Promise<Role> {
  return request<Role>(`/roles/${roleId}/select`, { method: 'POST' })
}

// MoveOption 是当前位置一个方向上可移动到的地名。direction 为
// north/south/west/east；后端按上北、左西、右东、下南的顺序返回。
export interface MoveOption {
  direction: 'north' | 'south' | 'west' | 'east'
  name: string
}

// listMoves 调用 GET /roles/{id}/moves 查询从当前位置可以移动到的地点
// （活动点位用四向邻居，城市用世界图四向城市链接）。未定位时后端返回
// 400，这里转成空列表由界面提示。
export async function listMoves(roleId: number): Promise<MoveOption[]> {
  try {
    return await request<MoveOption[]>(`/roles/${roleId}/moves`)
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 400) return []
    throw error
  }
}

const ROLE_ERRORS: Record<string, string> = {
  'role: name must not be empty': '请输入角色名',
  'role: name must be at most 6 characters': '角色名最多 6 个字',
  'role: unknown class': '未知职业，请重新选择',
  'role: name already taken': '该分区已存在同名角色，请换一个名字',
  'role: account role limit exceeded': `每个分区最多创建 ${MaxRolesPerZone} 个角色`,
  'role: not owned by account': '该角色不属于当前账号',
  'role: role not found': '角色不存在，请刷新后重试',
  'server: server not found': '该分区不存在，请重新选择分区',
  'server: server is not open': '该分区正在维护或已关闭，暂时无法进入',
}

// translateRoleError 把角色相关错误转成玩家可读提示。
export function translateRoleError(message: string): string {
  if (!message) return '操作失败，请稍后再试'
  return ROLE_ERRORS[message] ?? message
}
