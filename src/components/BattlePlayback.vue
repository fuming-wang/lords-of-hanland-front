<template>
  <view class="bp-mask" @tap="tapScreen">
    <view class="bp-header">
      <text class="bp-group">{{ battle.group }}</text>
      <text class="bp-round" v-if="!finished">第 {{ currentRound }} 回合</text>
    </view>

    <!-- 战场: 左侧怪物, 右侧主将+副将 -->
    <view class="bp-field">
      <view class="bp-side">
        <view
          v-for="unit in monsterUnits"
          :key="unit.id"
          class="bp-unit"
          :class="{ dead: unit.hp <= 0, acting: actingId === unit.id, hit: hitId === unit.id }"
        >
          <text class="bp-unit-name">{{ unit.name }}</text>
          <text class="bp-unit-level">Lv.{{ unit.level }}</text>
          <view class="bp-hpbar"><view class="bp-hpfill monster" :style="{ width: hpPct(unit) }"></view></view>
          <text class="bp-unit-hp">{{ unit.hp }}/{{ unit.maxHp }}</text>
          <text class="bp-float" v-if="floatId === unit.id" :class="floatKind">{{ floatText }}</text>
        </view>
      </view>
      <view class="bp-vs"><text class="bp-vs-text">对</text></view>
      <view class="bp-side">
        <view
          v-for="unit in playerUnits"
          :key="unit.id"
          class="bp-unit"
          :class="{ dead: unit.hp <= 0, acting: actingId === unit.id, hit: hitId === unit.id }"
        >
          <text class="bp-unit-name">{{ unit.name }}</text>
          <text class="bp-unit-level">Lv.{{ unit.level }}</text>
          <view class="bp-hpbar"><view class="bp-hpfill player" :style="{ width: hpPct(unit) }"></view></view>
          <text class="bp-unit-hp">{{ unit.hp }}/{{ unit.maxHp }}</text>
          <text class="bp-float" v-if="floatId === unit.id" :class="floatKind">{{ floatText }}</text>
        </view>
      </view>
    </view>

    <!-- 动作结算牌 -->
    <view class="bp-stage">
      <view class="bp-card" v-if="cardVisible">
        <text class="bp-card-kind">{{ KIND_TEXT[cardKind] ?? cardKind }}</text>
        <text class="bp-card-line" v-if="cardSkill">【{{ cardSkill }}】</text>
        <text class="bp-card-line">{{ cardActorName }} → {{ cardTargetName }}</text>
        <text class="bp-card-value" :class="cardKind">{{ cardText }}</text>
      </view>
      <view class="bp-log" v-if="logLines.length">
        <text class="bp-log-line" v-for="(line, i) in logLines" :key="i">{{ line }}</text>
      </view>
    </view>

    <!-- 控制: 加速 / 跳过 -->
    <view class="bp-controls" v-if="!finished">
      <button class="bp-btn" @tap.stop="toggleSpeed">{{ speed > 1 ? `加速中 ×${speed}` : '加速' }}</button>
      <button class="bp-btn" @tap.stop="skip">跳过</button>
    </view>

    <!-- 终局结算 -->
    <view class="bp-summary" v-if="finished">
      <text class="bp-summary-title" :class="battle.won ? 'win' : 'lose'">{{ battle.won ? '胜利' : '战败' }}</text>
      <text class="bp-summary-line">{{ summaryText }}</text>
      <text class="bp-summary-hint">点击屏幕返回</text>
    </view>
  </view>
</template>

<script setup lang="ts">
// BattlePlayback 逐条回放服务端下发的战斗流水: 按回合分组推进,
// 每条动作演出「行动者高亮 → 结算牌 → 目标飘字/血条扣减」。
// 支持加速与跳过; 播完后由父组件接管结算。
import { computed, onBeforeUnmount, ref } from 'vue'
import type { BattleFighterView, BattleRoundLog, NpcBattleResult } from '../services/role'

const props = defineProps<{ battle: NpcBattleResult }>()
const emit = defineEmits<{ (e: 'finish'): void }>()

// PlayUnit 是回放中的单位血量状态, 从名册初始化, 随流水推进。
interface PlayUnit {
  id: string
  name: string
  side: string
  level: number
  hp: number
  maxHp: number
}

const units = ref<PlayUnit[]>(
  props.battle.roster.map((f: BattleFighterView) => ({
    id: f.id, name: f.name, side: f.side, level: f.level, hp: f.max_hp, maxHp: f.max_hp,
  })),
)
const nameOf = (id: string) => units.value.find((u) => u.id === id)?.name ?? id
const monsterUnits = computed(() => units.value.filter((u) => u.side === 'monster'))
const playerUnits = computed(() => units.value.filter((u) => u.side === 'player'))

const log = props.battle.log
const cursor = ref(0)
const currentRound = ref(log.length ? log[0].round : 1)
const finished = ref(cursor.value >= log.length)
const speed = ref(1)
let timer: ReturnType<typeof setTimeout> | null = null

const actingId = ref('')
const hitId = ref('')
const floatId = ref('')
const floatText = ref('')
const floatKind = ref('damage')
const cardVisible = ref(false)
const cardKind = ref('normal')
const cardSkill = ref('')
const cardActorName = ref('')
const cardTargetName = ref('')
const cardText = ref('')
const logLines = ref<string[]>([])

const KIND_TEXT: Record<string, string> = {
  normal: '攻击', skill: '技能', crit: '暴击', deadly: '致命一击', miss: '闪避', heal: '恢复',
}

const hpPct = (unit: PlayUnit) =>
  unit.maxHp > 0 ? `${Math.max(0, Math.min(100, (unit.hp / unit.maxHp) * 100))}%` : '0%'

// describe 把一条流水渲染成结算牌文案与战斗日志行。
function describe(entry: BattleRoundLog): { card: string; line: string; kind: string } {
  const actor = nameOf(entry.actor_id)
  const target = nameOf(entry.target_id)
  const skill = entry.skill_name ? `【${entry.skill_name}】` : ''
  switch (entry.kind) {
    case 'miss':
      return { card: '闪避', line: `${actor} 攻击 ${target}，被闪开了`, kind: 'miss' }
    case 'heal':
      return { card: `+${entry.damage}`, line: `${actor}${skill}恢复 ${entry.damage} 气血`, kind: 'heal' }
    default:
      return { card: `-${entry.damage}`, line: `${actor}${skill}攻击 ${target}，造成 ${entry.damage} 点伤害`, kind: entry.kind }
  }
}

function applyEntry(entry: BattleRoundLog) {
  currentRound.value = entry.round
  actingId.value = entry.actor_id
  hitId.value = entry.kind === 'heal' ? entry.actor_id : entry.target_id
  const shown = describe(entry)
  cardKind.value = entry.kind
  cardSkill.value = entry.skill_name ?? ''
  cardActorName.value = nameOf(entry.actor_id)
  cardTargetName.value = nameOf(entry.kind === 'heal' ? entry.actor_id : entry.target_id)
  cardText.value = shown.card
  cardVisible.value = true
  logLines.value = [...logLines.value.slice(-2), shown.line]

  // 结算推进血量: 服务端 log 的 target_hp/actor_hp 是动作后的绝对值。
  const actor = units.value.find((u) => u.id === entry.actor_id)
  const target = units.value.find((u) => u.id === entry.target_id)
  if (entry.kind === 'heal') {
    if (actor) actor.hp = Math.min(entry.actor_hp, actor.maxHp)
    floatId.value = entry.actor_id
    floatText.value = `+${entry.damage}`
    floatKind.value = 'heal'
  } else if (target) {
    target.hp = Math.max(0, Math.min(entry.target_hp, target.maxHp))
    floatId.value = entry.target_id
    floatText.value = entry.kind === 'miss' ? '闪避' : `-${entry.damage}`
    floatKind.value = entry.kind === 'miss' ? 'miss' : 'damage'
  }
}

function step() {
  timer = null
  if (cursor.value >= log.length) {
    finish()
    return
  }
  const entry = log[cursor.value]
  cursor.value += 1
  applyEntry(entry)
  const delay = Math.max(220, 900 / speed.value)
  timer = setTimeout(() => {
    // 本条动作演出完毕, 清掉瞬时反馈再推进下一条。
    floatId.value = ''
    actingId.value = ''
    hitId.value = ''
    step()
  }, delay)
}

const summaryText = computed(() =>
  props.battle.won
    ? `历经 ${props.battle.rounds} 回合\n经验 +${props.battle.exp_reward}　银两 +${props.battle.silver_drop}`
    : props.battle.reason === 'timeout'
      ? `战至 ${props.battle.rounds} 回合未分胜负`
      : `第 ${props.battle.rounds} 回合战败`,
)

function toggleSpeed() {
  speed.value = speed.value >= 4 ? 1 : speed.value * 2
}

// skip 直接快进到终局: 按流水结算完所有剩余血量。
function skip() {
  clearTimer()
  while (cursor.value < log.length) {
    applyEntry(log[cursor.value])
    cursor.value += 1
  }
  cardVisible.value = false
  actingId.value = ''
  hitId.value = ''
  floatId.value = ''
  finish()
}

function finish() {
  clearTimer()
  finished.value = true
}

function tapScreen() {
  if (finished.value) emit('finish')
}

function clearTimer() {
  if (timer !== null) {
    clearTimeout(timer)
    timer = null
  }
}

onBeforeUnmount(clearTimer)
step()
</script>

<style scoped>
.bp-mask { position: fixed; inset: 0; z-index: 999; background: rgba(8, 10, 18, 0.96); display: flex; flex-direction: column; padding: 24rpx 24rpx 40rpx; }
.bp-header { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 16rpx; }
.bp-group { color: #f4e3b1; font-size: 34rpx; font-weight: 600; }
.bp-round { color: #d8c68f; font-size: 30rpx; }

.bp-field { display: flex; align-items: stretch; justify-content: space-between; }
.bp-side { flex: 1; display: flex; flex-direction: column; gap: 16rpx; }
.bp-vs { display: flex; align-items: center; justify-content: center; width: 80rpx; }
.bp-vs-text { color: #8f7a4e; font-size: 36rpx; font-weight: 700; }

.bp-unit { position: relative; border: 1rpx solid #3a3f52; border-radius: 12rpx; background: #141827; padding: 14rpx 16rpx; transition: transform 0.15s, opacity 0.3s; }
.bp-unit.dead { opacity: 0.35; filter: grayscale(1); }
.bp-unit.acting { border-color: #f2d38a; transform: scale(1.04); }
.bp-unit.hit { background: #2a1520; }
.bp-unit-name { color: #eee6cf; font-size: 28rpx; margin-right: 12rpx; }
.bp-unit-level { color: #9aa2b8; font-size: 22rpx; }
.bp-hpbar { height: 12rpx; border-radius: 6rpx; background: #262b3d; margin-top: 10rpx; overflow: hidden; }
.bp-hpfill { height: 100%; border-radius: 6rpx; transition: width 0.35s; }
.bp-hpfill.player { background: #5fae6a; }
.bp-hpfill.monster { background: #b5533f; }
.bp-unit-hp { color: #9aa2b8; font-size: 20rpx; margin-top: 6rpx; display: block; }

.bp-float { position: absolute; right: 16rpx; top: 8rpx; font-size: 34rpx; font-weight: 700; animation: bp-float-up 0.8s ease-out forwards; }
.bp-float.damage { color: #ff6b57; }
.bp-float.heal { color: #6fd087; }
.bp-float.miss { color: #cfd6e6; font-size: 26rpx; }
@keyframes bp-float-up { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(-40rpx); } }

.bp-stage { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20rpx; margin-top: 24rpx; }
.bp-card { min-width: 320rpx; max-width: 600rpx; border: 2rpx solid #7a5a2e; border-radius: 14rpx; background: linear-gradient(180deg, #3a1d22, #241016); padding: 20rpx 32rpx; text-align: center; }
.bp-card-kind { color: #f2d38a; font-size: 28rpx; display: block; }
.bp-card-line { color: #d8cfc0; font-size: 26rpx; display: block; margin-top: 6rpx; }
.bp-card-value { font-size: 44rpx; font-weight: 700; display: block; margin-top: 10rpx; }
.bp-card-value.damage { color: #ff6b57; }
.bp-card-value.crit, .bp-card-value.deadly { color: #ff9d3b; font-size: 52rpx; }
.bp-card-value.miss { color: #cfd6e6; font-size: 34rpx; }
.bp-card-value.heal { color: #6fd087; }
.bp-card-value.normal, .bp-card-value.skill { color: #ff8666; }

.bp-log { display: flex; flex-direction: column; gap: 6rpx; min-height: 120rpx; justify-content: flex-end; }
.bp-log-line { color: #8f96ab; font-size: 22rpx; text-align: center; }

.bp-controls { display: flex; gap: 24rpx; justify-content: center; margin-top: 16rpx; }
.bp-btn { background: #1d2334; color: #d8c68f; border: 1rpx solid #4a4f63; border-radius: 999rpx; font-size: 26rpx; padding: 0 40rpx; line-height: 64rpx; height: 64rpx; }

.bp-summary { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 24rpx; background: rgba(8, 10, 18, 0.88); }
.bp-summary-title { font-size: 96rpx; font-weight: 800; letter-spacing: 12rpx; }
.bp-summary-title.win { color: #f2b13a; text-shadow: 0 0 30rpx rgba(242, 177, 58, 0.6); }
.bp-summary-title.lose { color: #8e6a6a; }
.bp-summary-line { color: #d8cfc0; font-size: 28rpx; text-align: center; white-space: pre-line; }
.bp-summary-hint { color: #6f768a; font-size: 24rpx; margin-top: 30rpx; }
</style>
