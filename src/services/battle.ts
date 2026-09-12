import { request } from './http'
import type { Role } from './role'

// TurnUnit 是回合战场上的一个参战单位快照(服务端 battle.UnitState 投影)。
// skills 仅玩家侧单位携带(供技能按钮列表)。
export interface TurnUnit {
  id: string
  name: string
  side: 'player' | 'monster'
  level: number
  hp: number
  max_hp: number
  speed: number
  captured?: boolean
  skills?: TurnSkill[]
}

// TurnSkill 与后端 battle.Skill 对齐。
export interface TurnSkill {
  id: number
  name: string
  damage_bonus: number
  heal_value: number
}

// TurnAction 是一条玩家指令; kind: attack/skill/defend/flee/capture。
export interface TurnAction {
  unit_id: string
  target_id?: string
  kind: 'attack' | 'skill' | 'defend' | 'flee' | 'capture'
  skill_id?: number
}

// TurnLogEntry 是回合结算流水里的一条动作(与自动战斗流水同构, 另有
// defend / capture / capture_fail 三种回合制专属类型)。
export interface TurnLogEntry {
  round: number
  actor_id: string
  target_id: string
  kind: 'miss' | 'normal' | 'skill' | 'crit' | 'deadly' | 'heal' | 'defend' | 'capture' | 'capture_fail'
  skill_name?: string
  damage: number
  actor_hp: number
  target_hp: number
}

// StartTurnBattleView 是开局快照(服务端 writeStartTurnBattle 投影)。
export interface StartTurnBattleView {
  session_id: number
  group: string
  kind: 'pve' | 'pvp'
  round: number
  units: TurnUnit[]
}

// TurnOutcome 是一个回合的服务端裁决。
export interface TurnOutcome {
  round: number
  log: TurnLogEntry[]
  finished: boolean
  won: boolean
  reason: string
  units: TurnUnit[]
}

// SubmitTurnRoundResult 是提交回合指令的响应; 终局时携带奖励与角色快照。
export interface SubmitTurnRoundResult {
  outcome: TurnOutcome
  exp_reward: number
  gold_drop: number
  silver_drop: number
  role?: Role
}

// startNpcTurnBattle 开启一场对野怪 NPC 群的回合制手动战斗。
export async function startNpcTurnBattle(roleId: number, npcId: number): Promise<StartTurnBattleView> {
  return request<StartTurnBattleView>(`/roles/${roleId}/npcs/${npcId}/battle/turn`, { method: 'POST' })
}

// startPvpTurnBattle 开启一场对其他玩家的回合制战斗(对手由服务器代管出招)。
export async function startPvpTurnBattle(roleId: number, targetRoleId: number): Promise<StartTurnBattleView> {
  return request<StartTurnBattleView>(`/roles/${roleId}/pvp/${targetRoleId}/battle/turn`, { method: 'POST' })
}

// submitTurnRound 提交本回合全部指令, 由服务器结算并返回裁决。
export async function submitTurnRound(roleId: number, sessionId: number, actions: TurnAction[]): Promise<SubmitTurnRoundResult> {
  return request<SubmitTurnRoundResult>(`/roles/${roleId}/battle/turn/${sessionId}`, {
    method: 'POST',
    data: { actions },
  })
}

// BattleSettlement 是传给结算页(win/lost)的数据; 通过内存共享模块传递,
// 避免往 URL 里塞大对象。
export interface BattleSettlement {
  won: boolean
  group: string
  reason: string
  rounds: number
  exp_reward: number
  gold_drop: number
  silver_drop: number
}

let lastSettlement: BattleSettlement | null = null

// setBattleSettlement 在跳转结算页前写入; takeBattleSettlement 在结算页读取。
export function setBattleSettlement(s: BattleSettlement): void {
  lastSettlement = s
}

export function takeBattleSettlement(): BattleSettlement | null {
  const s = lastSettlement
  lastSettlement = null
  return s
}
