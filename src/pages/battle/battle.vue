<template>
  <view class="bt-screen">
    <!-- 顶栏: 左敌(蓝) - 中出招倒计时 - 右我(红), P1 同构 -->
    <view class="bt-topbar">
      <text class="bt-top-side enemy">{{ enemyName }}</text>
      <text class="bt-top-mid">{{ playerName }}-出招({{ countdown }})</text>
      <text class="bt-top-side player">{{ playerName }}</text>
    </view>
    <view class="bt-round-banner" v-if="battle && !playing">第{{ round }}回合</view>
    <view class="bt-round-banner" v-else-if="playing">结算中</view>

    <!-- 战场: 左侧敌方(可能多于4), 右侧我方(最多4), 火柴人站位 -->
    <view class="bt-field">
      <view class="bt-column">
        <view
          v-for="unit in enemyUnits"
          :key="unit.id"
          class="bt-unit"
          :class="unitClass(unit)"
          @tap="onUnitTap(unit)"
        >
          <view class="stickman enemy">
            <view class="sm-head"></view>
            <view class="sm-body"></view>
            <view class="sm-arm left"></view>
            <view class="sm-arm right"></view>
            <view class="sm-leg left"></view>
            <view class="sm-leg right"></view>
          </view>
          <view class="bt-hpbar"><view class="bt-hpfill enemy" :style="{ width: hpPct(unit) }"></view></view>
          <text class="bt-unit-hp">{{ unit.hp }}/{{ unit.max_hp }}</text>
          <text class="bt-order" v-if="orderText(unit.id)">{{ orderText(unit.id) }}</text>
          <text class="bt-float" v-if="floatId === unit.id" :class="floatKind">{{ floatText }}</text>
        </view>
      </view>
      <view class="bt-column right">
        <view
          v-for="unit in playerUnits"
          :key="unit.id"
          class="bt-unit"
          :class="unitClass(unit)"
          @tap="onUnitTap(unit)"
        >
          <view class="stickman player" :class="{ glow: actingUnit?.id === unit.id && mode === 'menu' }">
            <view class="sm-head"></view>
            <view class="sm-body"></view>
            <view class="sm-arm left"></view>
            <view class="sm-arm right"></view>
            <view class="sm-leg left"></view>
            <view class="sm-leg right"></view>
          </view>
          <view class="bt-hpbar"><view class="bt-hpfill player" :style="{ width: hpPct(unit) }"></view></view>
          <text class="bt-unit-hp">{{ unit.hp }}/{{ unit.max_hp }}</text>
          <text class="bt-order" v-if="orderText(unit.id)">{{ orderText(unit.id) }}</text>
          <text class="bt-float" v-if="floatId === unit.id" :class="floatKind">{{ floatText }}</text>
        </view>
      </view>

      <!-- 指令菜单: 叠加在战场中央, 交错菱形布局(P1 同构) -->
      <view class="bt-menu" v-if="mode === 'menu' && actingUnit && !playing">
        <view class="bt-menu-col">
          <view class="bt-diamond" @tap="chooseAttack"><text>攻击</text></view>
          <view class="bt-diamond" v-if="battle?.kind === 'pve'" @tap="chooseCapture"><text>招降</text></view>
          <view class="bt-diamond" @tap="chooseFlee"><text>逃跑</text></view>
        </view>
        <view class="bt-menu-col offset">
          <view class="bt-diamond" @tap="openSkills"><text>技能</text></view>
          <view class="bt-diamond" @tap="chooseDefend"><text>防御</text></view>
        </view>
      </view>
      <view class="bt-menu" v-else-if="mode === 'skill'">
        <view class="bt-menu-col">
          <view class="bt-diamond" v-for="sk in actingUnit?.skills ?? []" :key="sk.id" @tap="pickSkill(sk)">
            <text class="small">{{ sk.name }}</text>
          </view>
          <view class="bt-diamond dim" @tap="backToMenu"><text>返回</text></view>
        </view>
      </view>
      <view class="bt-card" v-else-if="playing || mode === 'pick-target'">
        <text class="bt-card-text" v-if="playing">{{ cardText }}</text>
        <text class="bt-card-text picking" v-else>点击选择目标</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
// pages/battle 回合制手动战斗页(P1 同构):
// 顶栏 左敌-中出招倒计时-右我; 战场左敌右我(火柴人), 指令菜单叠加在
// 战场中央。每回合由玩家给我方单位逐个下达指令(攻击/技能/招降/防御/
// 逃跑), 倒计时结束或全部提交后由服务器结算并回放流水; 战斗结束后进入
// win/lost 结算页。
import { computed, onBeforeUnmount, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getActiveRole } from '../../services/session'
import {
  setBattleSettlement,
  startNpcTurnBattle,
  startPvpTurnBattle,
  submitTurnRound,
} from '../../services/battle'
import type { StartTurnBattleView, TurnAction, TurnLogEntry, TurnSkill, TurnUnit } from '../../services/battle'
import { ApiError } from '../../services/http'

type Mode = 'menu' | 'skill' | 'pick-target'

const ROUND_SECONDS = 60

const battle = ref<StartTurnBattleView | null>(null)
const units = ref<TurnUnit[]>([])
const round = ref(1)
const countdown = ref(ROUND_SECONDS)
const orders = ref<TurnAction[]>([])
const mode = ref<Mode>('menu')
const pendingKind = ref<'attack' | 'skill' | 'capture'>('attack')
const pendingSkill = ref<TurnSkill | null>(null)
const playing = ref(false)

// 回放演出状态(结算牌/飘字)。
const floatId = ref('')
const floatText = ref('')
const floatKind = ref('damage')
const cardText = ref('')
let timer: ReturnType<typeof setTimeout> | null = null
let tick: ReturnType<typeof setInterval> | null = null

const playerName = computed(() => units.value.find((u) => u.side === 'player')?.name ?? '我方')
const enemyName = computed(() => {
  const foes = units.value.filter((u) => u.side === 'monster')
  return foes.length > 1 ? `${foes[0].name}等` : foes[0]?.name ?? '敌方'
})
const enemyUnits = computed(() => units.value.filter((u) => u.side === 'monster'))
const playerUnits = computed(() => units.value.filter((u) => u.side === 'player'))

// actingUnit 是当前轮到下单的存活我方单位(按站位顺序逐个操作)。
const actingUnit = computed(() => {
  for (const u of playerUnits.value) {
    if (u.hp <= 0 || u.captured) continue
    if (!orders.value.some((o) => o.unit_id === u.id)) return u
  }
  return null
})

const hpPct = (u: TurnUnit) => (u.max_hp > 0 ? `${Math.max(0, Math.min(100, (u.hp / u.max_hp) * 100))}%` : '0%')

const unitClass = (u: TurnUnit) => ({
  dead: u.hp <= 0,
  captured: !!u.captured,
  acting: actingUnit.value?.id === u.id && mode.value !== 'menu',
  'pick-target': mode.value === 'pick-target' && isPickable(u),
})

const orderText = (unitId: string) => {
  const o = orders.value.find((x) => x.unit_id === unitId)
  if (!o) return ''
  if (o.kind === 'attack') return '攻击'
  if (o.kind === 'defend') return '防御'
  if (o.kind === 'capture') return '招降'
  if (o.kind === 'skill') return `技·${skillNameOf(o.skill_id)}`
  return ''
}
const skillNameOf = (skillId?: number) => {
  for (const u of playerUnits.value) {
    const sk = u.skills?.find((s) => s.id === skillId)
    if (sk) return sk.name
  }
  return '技能'
}

// isPickable 判断某单位当前是否可作为点击目标。
const isPickable = (u: TurnUnit) => {
  if (u.hp <= 0 || u.captured) return false
  if (pendingKind.value === 'skill' && pendingSkill.value && pendingSkill.value.heal_value > 0) {
    return u.side === 'player'
  }
  if (pendingKind.value === 'capture') return u.side === 'monster'
  if (pendingKind.value === 'skill') return u.side === 'monster'
  return u.side === 'monster'
}

async function loadBattle(npcId?: number, targetRoleId?: number) {
  const active = getActiveRole()
  if (!active) {
    uni.reLaunch({ url: '/pages/login' })
    return
  }
  try {
    battle.value = npcId
      ? await startNpcTurnBattle(active.id, npcId)
      : await startPvpTurnBattle(active.id, targetRoleId!)
    units.value = battle.value.units
    round.value = battle.value.round
    startCountdown()
  } catch (e) {
    const msg = e instanceof ApiError ? e.message : '进入战斗失败'
    uni.showToast({ title: msg, icon: 'none' })
    setTimeout(() => uni.navigateBack(), 800)
  }
}

onLoad((query) => {
  const npcId = query?.npc_id ? Number(query.npc_id) : undefined
  const targetId = query?.target_id ? Number(query.target_id) : undefined
  loadBattle(npcId, targetId)
})

// --- 出招倒计时: 仅客户端体验(服务器未限时), 归零自动普攻补齐提交 ---

function startCountdown() {
  stopCountdown()
  countdown.value = ROUND_SECONDS
  tick = setInterval(() => {
    countdown.value -= 1
    if (countdown.value <= 0) {
      stopCountdown()
      if (!playing.value && battle.value) {
        // 归零: 未下单的存活单位自动普攻随机敌人并提交本回合。
        const auto: TurnAction[] = [...orders.value]
        for (const u of playerUnits.value) {
          if (u.hp <= 0 || u.captured) continue
          if (!auto.some((o) => o.unit_id === u.id)) {
            const foes = enemyUnits.value.filter((e) => e.hp > 0 && !e.captured)
            if (!foes.length) break
            auto.push({ unit_id: u.id, kind: 'attack', target_id: foes[Math.floor(Math.random() * foes.length)].id })
          }
        }
        if (auto.length) void submit(auto)
      }
    }
  }, 1000)
}

function stopCountdown() {
  if (tick !== null) {
    clearInterval(tick)
    tick = null
  }
}

// --- 指令菜单 ---

function chooseAttack() {
  pendingKind.value = 'attack'
  mode.value = 'pick-target'
}

function openSkills() {
  if (!actingUnit.value?.skills?.length) {
    uni.showToast({ title: '该角色没有技能', icon: 'none' })
    return
  }
  mode.value = 'skill'
}

function pickSkill(sk: TurnSkill) {
  pendingSkill.value = sk
  pendingKind.value = 'skill'
  mode.value = 'pick-target'
}

function backToMenu() {
  mode.value = 'menu'
}

function chooseCapture() {
  pendingKind.value = 'capture'
  mode.value = 'pick-target'
}

function chooseDefend() {
  enqueue({ unit_id: actingUnit.value!.id, kind: 'defend' })
}

function chooseFlee() {
  // 逃跑是全队指令: 只提交一次逃跑。
  void submit([{ unit_id: actingUnit.value!.id, kind: 'flee' }])
}

// onUnitTap 在目标选择模式下把当前单位登记为指令目标。
function onUnitTap(unit: TurnUnit) {
  if (mode.value !== 'pick-target' || !actingUnit.value || !isPickable(unit)) return
  const actorId = actingUnit.value.id
  if (pendingKind.value === 'attack') {
    enqueue({ unit_id: actorId, kind: 'attack', target_id: unit.id })
  } else if (pendingKind.value === 'capture') {
    enqueue({ unit_id: actorId, kind: 'capture', target_id: unit.id })
  } else if (pendingKind.value === 'skill' && pendingSkill.value) {
    enqueue({ unit_id: actorId, kind: 'skill', target_id: unit.id, skill_id: pendingSkill.value.id })
  }
}

function enqueue(action: TurnAction) {
  orders.value = [...orders.value, action]
  mode.value = 'menu'
  pendingSkill.value = null
  // 全部存活我方单位都提交后, 交给服务器结算本回合。
  if (!actingUnit.value) void submit(orders.value)
}

// --- 回合结算与回放 ---

async function submit(actions: TurnAction[]) {
  if (!battle.value) return
  const active = getActiveRole()
  if (!active) return
  playing.value = true
  mode.value = 'menu'
  stopCountdown()
  cardText.value = '结算中…'
  try {
    const result = await submitTurnRound(active.id, battle.value.session_id, actions)
    orders.value = []
    await playback(result.outcome.log)
    if (result.outcome.finished) {
      finishBattle(result)
      return
    }
    units.value = result.outcome.units
    round.value = result.outcome.round + 1
    playing.value = false
    startCountdown()
  } catch (e) {
    playing.value = false
    const msg = e instanceof ApiError ? e.message : '结算失败'
    uni.showToast({ title: msg, icon: 'none' })
    // 会话丢失(404)等不可恢复错误时退回主界面。
    if (e instanceof ApiError && (e.statusCode === 404 || e.statusCode === 409)) {
      setTimeout(() => uni.reLaunch({ url: '/pages/index/index' }), 800)
    }
  }
}

// playback 逐条回放本回合流水: 结算牌 + 飘字 + 血量推进。
function playback(log: TurnLogEntry[]): Promise<void> {
  return new Promise((resolve) => {
    if (!log.length) {
      resolve()
      return
    }
    let i = 0
    const step = () => {
      if (i >= log.length) {
        clearTimer()
        floatId.value = ''
        cardText.value = ''
        resolve()
        return
      }
      const entry = log[i++]
      applyEntry(entry)
      timer = setTimeout(step, 650)
    }
    step()
  })
}

const nameOf = (id: string) => units.value.find((u) => u.id === id)?.name ?? id

function applyEntry(entry: TurnLogEntry) {
  const actor = units.value.find((u) => u.id === entry.actor_id)
  const target = units.value.find((u) => u.id === entry.target_id)
  const skill = entry.skill_name ? `【${entry.skill_name}】` : ''
  switch (entry.kind) {
    case 'defend':
      cardText.value = `${nameOf(entry.actor_id)} 转入防御`
      break
    case 'capture':
      cardText.value = `${nameOf(entry.actor_id)} 招降了 ${nameOf(entry.target_id)}!`
      break
    case 'capture_fail':
      cardText.value = `${nameOf(entry.actor_id)} 招降 ${nameOf(entry.target_id)} 失败`
      break
    case 'miss':
      cardText.value = `${nameOf(entry.actor_id)}${skill}攻击 ${nameOf(entry.target_id)}, 被闪开`
      break
    case 'heal':
      cardText.value = `${nameOf(entry.actor_id)}${skill}恢复 ${entry.damage}`
      break
    default:
      cardText.value = `${nameOf(entry.actor_id)}${skill}→ ${nameOf(entry.target_id)}  -${entry.damage}`
  }
  if (entry.kind === 'heal' && actor) {
    actor.hp = Math.min(entry.target_hp, actor.max_hp)
    showFloat(entry.target_id, `+${entry.damage}`, 'heal')
  } else if (target) {
    target.hp = Math.max(0, Math.min(entry.target_hp, target.max_hp))
    if (entry.kind === 'capture') target.captured = true
    if (entry.kind !== 'defend' && entry.kind !== 'capture_fail') {
      showFloat(entry.target_id, entry.kind === 'miss' ? '闪避' : `-${entry.damage}`, entry.kind === 'miss' ? 'miss' : 'damage')
    }
  }
}

function showFloat(id: string, text: string, kind: string) {
  floatId.value = id
  floatText.value = text
  floatKind.value = kind
}

// finishBattle 落定最终状态并跳到结算页(win/lost)。
function finishBattle(result: Awaited<ReturnType<typeof submitTurnRound>>) {
  const outcome = result.outcome
  units.value = outcome.units
  const flee = outcome.reason === 'fled'
  setBattleSettlement({
    won: outcome.won && !flee,
    group: battle.value?.group ?? '战斗',
    reason: outcome.reason,
    rounds: outcome.round,
    exp_reward: result.exp_reward,
    gold_drop: result.gold_drop,
    silver_drop: result.silver_drop,
  })
  clearAll()
  // #ifdef H5
  window.location.hash = '#' + (outcome.won && !flee ? '/pages/win/win' : '/pages/lost/lost')
  window.location.reload()
  // #endif
  // #ifndef H5
  uni.redirectTo({ url: outcome.won && !flee ? '/pages/win/win' : '/pages/lost/lost' })
  // #endif
}

function clearTimer() {
  if (timer !== null) {
    clearTimeout(timer)
    timer = null
  }
}

function clearAll() {
  clearTimer()
  stopCountdown()
}

onBeforeUnmount(clearAll)
</script>

<style scoped>
.bt-screen { height: 100vh; background: linear-gradient(180deg, #c8945a 0%, #d8a868 45%, #b9834a 100%); display: flex; flex-direction: column; box-sizing: border-box; overflow: hidden; }

/* 顶栏: 左蓝右红夹中间出招信息(P1 同构) */
.bt-topbar { display: flex; align-items: stretch; height: 72rpx; }
.bt-top-side { flex: 1; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 26rpx; }
.bt-top-side.enemy { background: linear-gradient(180deg, #2a6ecb, #174a92); }
.bt-top-side.player { background: linear-gradient(180deg, #b52828, #7d1414); }
.bt-top-mid { flex: 1.4; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 26rpx; background: linear-gradient(180deg, #37507a, #22355c); }

.bt-round-banner { align-self: center; margin-top: 14rpx; color: #5a2d0a; font-size: 34rpx; font-weight: 800; letter-spacing: 6rpx; text-shadow: 0 1rpx 0 rgba(255, 235, 190, 0.8); }

/* 战场占满剩余空间, 菜单叠加其上 */
.bt-field { position: relative; flex: 1; display: flex; justify-content: space-between; padding: 30rpx 20rpx 20rpx; min-height: 0; }
.bt-column { display: flex; flex-direction: column; gap: 24rpx; width: 40%; }
.bt-column.right { align-items: flex-end; }

.bt-unit { position: relative; width: 240rpx; border-radius: 12rpx; padding: 10rpx 12rpx; box-sizing: border-box; transition: transform 0.15s; }
.bt-unit.dead { opacity: 0.3; filter: grayscale(1); }
.bt-unit.captured { opacity: 0.3; }
.bt-unit.acting { transform: scale(1.05); }
.bt-unit.pick-target { transform: scale(1.05); }
.bt-unit.pick-target::after { content: ''; position: absolute; inset: -6rpx; border: 3rpx dashed #8f1f10; border-radius: 14rpx; }
.bt-unit-hp { color: #4a2c10; font-size: 18rpx; display: block; margin-top: 4rpx; }
.bt-hpbar { height: 12rpx; border-radius: 6rpx; background: rgba(40, 20, 5, 0.55); margin-top: 8rpx; overflow: hidden; border: 1rpx solid rgba(60, 30, 8, 0.8); }
.bt-hpbar > .bt-hpfill { height: 100%; border-radius: 5rpx; transition: width 0.3s; }
.bt-hpfill.player { background: linear-gradient(180deg, #ff9a3d, #e0561d); }
.bt-hpfill.enemy { background: linear-gradient(180deg, #ff8f7a, #b5301c); }
.bt-order { position: absolute; top: 4rpx; right: 6rpx; color: #fff; font-size: 20rpx; background: rgba(90, 45, 10, 0.85); border-radius: 8rpx; padding: 2rpx 10rpx; }
.bt-float { position: absolute; top: 30rpx; left: 0; right: 0; text-align: center; font-size: 36rpx; font-weight: 800; animation: bt-float-up 0.8s ease-out forwards; pointer-events: none; }
.bt-float.damage { color: #d81f04; text-shadow: 0 1rpx 2rpx #fff; }
.bt-float.heal { color: #1f8f3c; text-shadow: 0 1rpx 2rpx #fff; }
.bt-float.miss { color: #555; font-size: 26rpx; }
@keyframes bt-float-up { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(-48rpx); } }

/* 火柴人: 无模型时代的占位立绘 */
.stickman { position: relative; height: 110rpx; margin: 6rpx auto 0; width: 80rpx; }
.sm-head { position: absolute; top: 0; left: 26rpx; width: 28rpx; height: 28rpx; border-radius: 50%; border: 4rpx solid #3c2a6a; box-sizing: border-box; }
.sm-body { position: absolute; top: 30rpx; left: 39rpx; width: 4rpx; height: 40rpx; background: #3c2a6a; }
.sm-arm { position: absolute; top: 38rpx; left: 39rpx; width: 30rpx; height: 4rpx; background: #3c2a6a; transform-origin: left center; }
.sm-arm.left { transform: rotate(35deg); }
.sm-arm.right { transform: rotate(-35deg); }
.sm-leg { position: absolute; top: 70rpx; left: 39rpx; width: 4rpx; height: 34rpx; background: #3c2a6a; transform-origin: top center; }
.sm-leg.left { transform: rotate(25deg); }
.sm-leg.right { transform: rotate(-25deg); }
.stickman.enemy .sm-head { border-color: #8f1f10; }
.stickman.enemy .sm-body, .stickman.enemy .sm-arm, .stickman.enemy .sm-leg { background: #8f1f10; }
/* 当前行动单位的光圈(P1 的金圈) */
.stickman.glow::before { content: ''; position: absolute; left: -22rpx; right: -22rpx; top: -14rpx; bottom: -14rpx; border-radius: 50%; background: radial-gradient(ellipse at center, rgba(255, 220, 120, 0.55) 0%, rgba(255, 220, 120, 0.0) 70%); }

/* 指令菜单: 战场中央两列交错菱形(P1 同构) */
.bt-menu { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); display: flex; gap: 16rpx; }
.bt-menu-col { display: flex; flex-direction: column; gap: 26rpx; }
.bt-menu-col.offset { margin-top: 64rpx; }
.bt-diamond { width: 108rpx; height: 108rpx; border: 3rpx solid #1d0f06; background: linear-gradient(160deg, #1f6a68, #0d3a39); transform: rotate(45deg); display: flex; align-items: center; justify-content: center; border-radius: 14rpx; box-shadow: 0 4rpx 10rpx rgba(40, 20, 0, 0.45); }
.bt-diamond text { transform: rotate(-45deg); color: #ffffff; font-size: 28rpx; font-weight: 700; }
.bt-diamond text.small { font-size: 24rpx; }
.bt-diamond.dim { background: #4a4238; }
.bt-diamond.dim text { color: #cfc4b0; }

/* 结算牌/目标提示(P2 的暗红牌) */
.bt-card { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); min-width: 320rpx; max-width: 460rpx; border: 3rpx solid #d5b06a; background: linear-gradient(180deg, #6d1420, #430a12); border-radius: 10rpx; padding: 26rpx 32rpx; text-align: center; }
.bt-card-text { color: #ffe6c8; font-size: 30rpx; line-height: 1.5; }
.bt-card-text.picking { color: #ffd9a0; font-weight: 700; }

/* H5 宽屏与其他页面保持一致: 限宽 750rpx 居中。 */
@media (min-width: 700px) {
  .bt-screen { max-width: 750rpx; margin: 0 auto; }
}
</style>
