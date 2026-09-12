<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { relaunch } from '../../services/navigation'
import { getRole, listMoves } from '../../services/role'
import type { MoveOption, Role } from '../../services/role'
import {
  clearSession,
  getActiveRole,
  getActiveRoleView,
  getSelectedZone,
  isLoggedIn,
  setActiveRole,
  setActiveRoleView,
  type ActiveRole,
  type SelectedZone,
} from '../../services/session'

type GameTab = 'move' | 'person' | 'facility' | 'function'

// GameRoleView 是游戏主界面需要的角色字段;角色进入游戏时以完整视图保存
// 在本地会话(pages/role 写入),冷启动时退化为本地保存的角色摘要。
interface GameRoleView {
  id: number
  name: string
  level: number
  className: string
  title: string
  cur_location: string | null
  gold: number
  silver: number
  experience: number
  requiredExperience: number
  currentHp: number
  maxHp: number
  currentSp: number
  maxSp: number
  totalAttack: number
  totalSpeed: number
}

const roleView = ref<Role | null>(null)
const storedRole = ref<ActiveRole | null>(null)
const activeGameTab = ref<GameTab>('move')
// moves 是从当前位置可以移动到的地点(后端按上北、左西、右东、下南返回)。
const moves = ref<MoveOption[]>([])
// moveArrows 把方向映射成指示箭头:上北下南、左西右东。
const moveArrows: Record<MoveOption['direction'], string> = {
  north: '↑',
  south: '↓',
  west: '←',
  east: '→',
}
const gameTabs: { key: GameTab; label: string }[] = [
  { key: 'person', label: '人物' },
  { key: 'facility', label: '设施' },
  { key: 'move', label: '移动' },
  { key: 'function', label: '功能' },
]

const selectedZone = computed<SelectedZone | null>(() => getSelectedZone())

const gameRole = computed<GameRoleView | null>(() => {
  const role = roleView.value
  if (role) {
    return {
      id: role.id,
      name: role.name,
      level: role.level,
      className: role.class,
      title: role.title,
      cur_location: role.cur_location ?? null,
      gold: role.gold,
      silver: role.silver,
      experience: role.experience,
      requiredExperience: role.required_experience,
      currentHp: role.current_hp,
      maxHp: role.max_hp,
      currentSp: role.current_sp,
      maxSp: role.max_sp,
      totalAttack: role.total_attack,
      totalSpeed: role.total_speed,
    }
  }
  const stored = storedRole.value
  if (!stored) return null
  return {
    id: stored.id,
    name: stored.name,
    level: stored.level,
    className: stored.className,
    title: '',
    cur_location: null,
    gold: 0,
    silver: 0,
    experience: 0,
    requiredExperience: 0,
    currentHp: 0,
    maxHp: 0,
    currentSp: 0,
    maxSp: 0,
    totalAttack: 0,
    totalSpeed: 0,
  }
})
const experiencePercent = computed(() => {
  const role = gameRole.value
  if (!role || role.requiredExperience <= 0) return 0
  return Math.min(100, Math.max(0, (role.experience / role.requiredExperience) * 100))
})

// locationName 是顶栏/地图卡的地址:后端的当前位置。
const locationName = computed(() => {
  const role = gameRole.value
  if (!role) return '未知之地'
  return role.cur_location || '未知之地'
})
const hpPercent = computed(() => {
  const role = gameRole.value
  if (!role || role.maxHp <= 0) return 0
  return Math.min(100, Math.max(0, (role.currentHp / role.maxHp) * 100))
})
const spPercent = computed(() => {
  const role = gameRole.value
  if (!role || role.maxSp <= 0) return 0
  return Math.min(100, Math.max(0, (role.currentSp / role.maxSp) * 100))
})

onShow(() => {
  // 未登录（token 过期被 401 清理）直接回登录页，避免带着空会话渲染。
  if (!isLoggedIn()) {
    relaunch('/pages/login')
    return
  }
  // 先用本地缓存的角色视图渲染,再从后端拉取最新数据覆盖,保证金银、
  // 经验、血量/精力、地址等在每次回到主界面时都是实时的。
  roleView.value = getActiveRoleView()
  storedRole.value = getActiveRole()
  void refreshRole()
  void refreshMoves()
})

// refreshMoves 查询当前位置可以移动到的地点;失败时保留已有列表,不阻塞渲染。
async function refreshMoves() {
  const active = storedRole.value
  if (!active) return
  try {
    moves.value = await listMoves(active.id)
  } catch {
    // 网络抖动等沿用上次结果;未定位/未知位置时后端返回 400,listMoves 已转为空列表。
  }
}

// refreshRole 从后端拉取当前角色的完整视图,并同步回本地会话缓存;
// 请求失败时保留缓存数据,不阻塞主界面渲染。
async function refreshRole() {
  const active = storedRole.value
  if (!active) return
  try {
    const role = await getRole(active.id)
    roleView.value = role
    storedRole.value = {
      id: role.id,
      name: role.name,
      level: role.level,
      className: role.class,
      serverId: role.server_id,
    }
    setActiveRole(storedRole.value)
    setActiveRoleView(role)
  } catch {
    // 401 已由 http 层清理会话并跳转;其余错误(网络抖动等)沿用缓存数据。
  }
}

function selectGameTab(tab: GameTab) {
  activeGameTab.value = tab
  // 每次切回移动页时重新查询,保证列表跟随角色当前位置。
  if (tab === 'move') void refreshMoves()
}

function openFunctionItem(item: string) {
  const routes: Record<string, string> = {
    '状态': '/pages/character/character',
    '物品': '/pages/items/items',
    '装备': '/pages/character/character?tab=gear',
    '帮派': '/pages/rank/rank?tab=guild',
    '会员': '/pages/member/member',
    '公告': '/pages/announce/announce',
    '任务': '/pages/task/task',
    '好友': '/pages/friend/friend',
    '擂台': '/pages/arena/arena',
    '宝库': '/pages/shop/shop',
    '副将': '/pages/vice/vice',
    '排行': '/pages/rank/rank',
    '邮件': '/pages/mail/mail',
  }
  if (routes[item]) {
    uni.navigateTo({ url: routes[item] })
    return
  }
  if (item === '登出') {
    exitGame()
    return
  }
  uni.showToast({ title: item + ' 尚未开放', icon: 'none' })
}

// exitGame 登出：清除会话（含所选分区与角色）并回到登录页。
function exitGame() {
  // #ifdef APP-PLUS
  const appRuntime = (globalThis as typeof globalThis & {
    plus?: { runtime?: { quit?: () => void } }
  }).plus?.runtime
  if (appRuntime?.quit) {
    appRuntime.quit()
    return
  }
  // #endif
  clearSession()
  relaunch('/pages/login')
}
</script>

<template>
  <view class="game-root">
    <view class="screen game-screen">
      <view class="game-topbar">
        <view class="game-scene-preview"><view class="scene-roof"></view><view class="scene-water"></view></view>
        <text class="game-location">{{ locationName }}</text><view class="recharge-badge">首充</view>
      </view>
      <view class="game-workspace">
        <view class="player-panel">
          <view class="player-summary"><view class="player-avatar">{{ gameRole ? gameRole.name.slice(0, 1) : '游' }}</view><view class="player-name-block"><text class="player-name">{{ gameRole ? gameRole.name : '未选择角色' }}</text><text class="player-server">[{{ selectedZone ? selectedZone.name : '未选区' }}:{{ gameRole ? gameRole.id : '—' }}]</text></view></view>
          <view class="status-bar hp"><view class="bar-fill" :style="{ width: hpPercent + '%' }"></view></view><view class="status-bar mp"><view class="bar-fill" :style="{ width: spPercent + '%' }"></view></view>
          <view class="combat-power"><text>攻击</text><text>{{ gameRole ? gameRole.totalAttack : 0 }}</text></view>
          <view class="general-row"><view v-for="index in 3" :key="index" class="general-slot">将</view></view>
          <view v-if="activeGameTab === 'move'" class="left-map-card"><view class="map-title">{{ locationName }}</view><view class="map-art"><view class="map-river"></view><view class="map-marker">◆</view></view></view>
          <view v-else class="player-detail-card"><view><text>职业:</text><text>{{ gameRole ? gameRole.className : '—' }}</text></view><view><text>等级:</text><text>{{ gameRole ? gameRole.level : 0 }}级</text></view><view class="experience"><text>经验值:</text><view class="experience-track"><view class="experience-fill" :style="{ width: experiencePercent + '%' }"></view></view><text class="experience-value">{{ gameRole ? gameRole.experience : 0 }}/{{ gameRole ? gameRole.requiredExperience : 0 }}</text></view><view><text>金:</text><text>{{ gameRole ? gameRole.gold : 0 }}</text></view><view><text>银:</text><text>{{ gameRole ? gameRole.silver : 0 }}</text></view><view><text>血量:</text><text>{{ gameRole ? gameRole.currentHp : 0 }}/{{ gameRole ? gameRole.maxHp : 0 }}</text></view><view><text>精力:</text><text>{{ gameRole ? gameRole.currentSp : 0 }}/{{ gameRole ? gameRole.maxSp : 0 }}</text></view><view><text>速度:</text><text>{{ gameRole ? gameRole.totalSpeed : 0 }}</text></view></view>
        </view>
        <view class="game-panel">
          <view v-if="activeGameTab === 'move'" class="panel-content move-content"><view v-for="move in moves" :key="move.direction + move.name" class="move-option"><text class="move-arrow" :class="move.direction">{{ moveArrows[move.direction] }}</text><text class="move-name">{{ move.name }}</text></view><view v-if="moves.length === 0" class="move-empty"><text class="move-empty-text">当前位置没有可移动的地点</text></view><view class="panel-caption">移动</view></view>
          <view v-else-if="activeGameTab === 'person'" class="panel-content list-content"><view v-for="item in ['称号使者', '导航使者', '战力挑战']" :key="item" class="dialog-row"><text>{{ item }}</text><button>对话</button></view><view class="panel-caption">人物</view></view>
          <view v-else-if="activeGameTab === 'facility'" class="panel-content facility-content"><view v-for="item in ['医馆', '钱庄', '馆驿', '市场', '广场', '官府', '战场', '梨园']" :key="item" class="facility-item"><text class="facility-icon">✦</text><text>{{ item }}</text></view><view class="panel-caption">设施</view></view>
          <view v-else class="panel-content function-content"><view v-for="item in ['状态', '物品', '副将', '装备', '排行', '好友', '邮件', '任务', '擂台', '帮派', '训练', '宝库', '公告', '会员', '登出']" :key="item" class="function-item" @tap="openFunctionItem(item)">{{ item }}</view><view class="panel-caption">功能</view></view>
        </view>
      </view>
      <view class="game-tabs"><button v-for="tab in gameTabs" :key="tab.key" class="game-tab" :class="{ active: activeGameTab === tab.key }" @tap="selectGameTab(tab.key)">{{ tab.label }}</button></view>
      <view class="companion-row"><view v-for="index in 7" :key="index" class="companion">{{ ['月', '花', '琴', '龙', '仙', '仙', '仙'][index - 1] }}</view><text class="more-link">更多(44)</text></view>
      <view class="shortcut-row"><text class="shortcut-label">☷ 快捷键</text><text class="shortcut-item selected">区</text><text class="shortcut-item">派</text><text class="shortcut-item">商</text><text class="shortcut-item">世</text></view>
      <view class="chat-list">
        <view class="chat-message"><view class="chat-avatar warrior-mini">将</view><view><text class="chat-name">竹亭序</text><text> 嗯嗯</text></view></view>
        <view class="chat-message"><view class="chat-avatar blue-mini">龙</view><view><text class="chat-name">龙且</text><text> 你悠着点，不要接触他</text></view></view>
        <view class="chat-message"><view class="chat-avatar warrior-mini">将</view><view><text class="chat-name">竹亭序</text><text> 我看有人给我发有五个神猪惠高兴了一下结果名叫小月月</text></view></view>
        <view class="chat-message"><view class="chat-avatar blue-mini">龙</view><view><text class="chat-name">龙且</text><text> 好</text></view></view>
        <view class="chat-message"><view class="chat-avatar red-mini">又</view><view><text class="chat-name">又欠</text><text> 明天给我备好三个体 🤔</text></view></view>
      </view>
      <view class="chat-input"><button class="chat-plus">＋</button><button class="chat-emoji">●</button><view class="chat-field"></view><button class="send-button">发送</button></view>
    </view>
  </view>
</template>

<style scoped>
.game-root {
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
  background: #191919;
  color: #fff;
}

.screen {
  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
}

.game-screen {
  min-height: 100vh;
  padding-bottom: 124rpx;
  box-sizing: border-box;
  background: radial-gradient(circle at 50% 32%, #17445d 0, #0a1d2e 45%, #06111c 100%);
  color: #f7f0d5;
  font-size: 28rpx;
}
.game-topbar {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100rpx;
  overflow: hidden;
  border-bottom: 4rpx solid #d4a241;
  background: linear-gradient(90deg, #285b75, #30384e 45%, #285b75);
}
.game-scene-preview {
  position: absolute;
  inset: 0 auto 0 0;
  width: 40%;
  opacity: .8;
  background: linear-gradient(#61b0d5 0 38%, #477f7e 39% 60%, #263a3e 61%);
}
.scene-roof {
  position: absolute;
  bottom: 30rpx;
  left: 30rpx;
  width: 180rpx;
  height: 45rpx;
  border-radius: 50% 50% 0 0;
  background: #9d5232;
}
.scene-water {
  position: absolute;
  right: -40rpx;
  bottom: 8rpx;
  width: 220rpx;
  height: 30rpx;
  border-radius: 50%;
  background: #14c5d4;
}
.game-location {
  font-size: 48rpx;
  font-weight: 900;
  text-shadow: 3rpx 3rpx #111;
}
.recharge-badge {
  position: absolute;
  right: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 76rpx;
  height: 76rpx;
  border: 5rpx solid #e7b74b;
  border-radius: 50%;
  background: radial-gradient(circle, #f64a00, #9f0915);
  color: #ffe88f;
  font-size: 22rpx;
  font-weight: 900;
}
.game-workspace {
  display: flex;
  gap: 8rpx;
  padding: 8rpx 6rpx 0;
}
.player-panel {
  width: 44%;
  flex-shrink: 0;
  padding: 12rpx 8rpx;
  box-sizing: border-box;
  background: linear-gradient(180deg, #5d260f, #3b1d11 60%, #252316);
}
.player-summary {
  display: flex;
  align-items: center;
  gap: 10rpx;
}
.player-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 112rpx;
  height: 112rpx;
  border: 8rpx solid #e6b546;
  border-radius: 50%;
  background: radial-gradient(circle at 50% 38%, #e6be98 0 23%, transparent 24%), linear-gradient(135deg, #6a2f10, #cda147 50%, #2b1c1b);
  color: #fff;
  font-size: 42rpx;
  font-weight: 900;
}
.player-name-block {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}
.player-name {
  font-size: 34rpx;
}
.player-server {
  color: #f5d9aa;
  font-size: 22rpx;
}
.status-bar {
  height: 16rpx;
  margin: 7rpx 0 0 86rpx;
  border: 3rpx solid #f8d8a6;
  border-radius: 12rpx;
  overflow: hidden;
  background: #29120e;
}
.status-bar .bar-fill {
  height: 100%;
  width: 80%;
}
.status-bar.hp .bar-fill { background: #f22219; }
.status-bar.mp .bar-fill { width: 68%; background: #1ca7dd; }
.combat-power {
  display: flex;
  justify-content: space-around;
  margin: 12rpx 0;
  padding: 8rpx;
  background: linear-gradient(90deg, #70230b, #a800a1, #561548);
  color: #ffe400;
  font-size: 28rpx;
  font-weight: 900;
}
.general-row {
  display: flex;
  justify-content: center;
  gap: 8rpx;
  margin-bottom: 12rpx;
}
.general-slot {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 62rpx;
  height: 62rpx;
  border: 6rpx solid #b99547;
  border-radius: 20rpx;
  background: #24140d;
  color: #e7d48f;
  font-size: 30rpx;
}
.left-map-card,
.player-detail-card {
  min-height: 330rpx;
  overflow: hidden;
  border: 5rpx solid #d1a661;
  border-radius: 12rpx;
  background: #eee0b4;
  color: #222;
}
.map-title {
  padding: 8rpx;
  background: #8a0044;
  color: #fff;
  font-size: 32rpx;
  text-align: center;
}
.map-art {
  position: relative;
  height: 274rpx;
  background: linear-gradient(145deg, #91b6a0, #4d8e68 56%, #88ae7e);
}
.map-river {
  position: absolute;
  top: 52rpx;
  left: 40rpx;
  width: 240rpx;
  height: 52rpx;
  border: 14rpx solid #d8dfda;
  border-radius: 50%;
  transform: rotate(-32deg);
}
.map-marker {
  position: absolute;
  top: 50rpx;
  right: 52rpx;
  color: #d00;
  font-size: 44rpx;
}
.player-detail-card {
  padding: 18rpx;
  box-sizing: border-box;
  color: #53340c;
  font-size: 26rpx;
  line-height: 1.75;
}
.player-detail-card > view {
  display: flex;
  justify-content: space-between;
}
.experience {
  align-items: center;
  gap: 8rpx;
}
.experience-track {
  flex: 1;
  height: 16rpx;
  border: 3rpx solid #9a5f0b;
  border-radius: 10rpx;
  background: #6e2f16;
}
.experience-fill {
  width: 28%;
  height: 100%;
  border-radius: 10rpx;
  background: #ffd000;
}
.experience-value {
  color: #53340c;
  font-size: 22rpx;
  white-space: nowrap;
}
.game-panel {
  flex: 1;
  min-width: 0;
}
.panel-content {
  position: relative;
  min-height: 535rpx;
  overflow: hidden;
  border: 5rpx solid #cd9c47;
  border-radius: 8rpx;
  background: repeating-linear-gradient(0deg, rgba(142, 15, 28, .96) 0 76rpx, rgba(102, 8, 23, .96) 78rpx 80rpx);
}
.move-content {
  padding: 14rpx 20rpx 86rpx;
  box-sizing: border-box;
}
.move-option {
  display: flex;
  align-items: center;
  gap: 18rpx;
  min-height: 88rpx;
  border-bottom: 2rpx solid rgba(246, 171, 37, .55);
  font-size: 34rpx;
}
.move-arrow {
  display: inline-block;
  width: 56rpx;
  color: #ffae00;
  font-size: 46rpx;
  font-weight: 900;
  text-align: center;
  text-shadow: 2rpx 2rpx #111;
}
.move-name {
  color: #fff;
}
.move-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300rpx;
}
.move-empty-text {
  color: rgba(255, 255, 255, .75);
  font-size: 30rpx;
}
.panel-caption {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  padding: 22rpx;
  border-top: 5rpx solid #155a7c;
  background: linear-gradient(#0b6b99, #143859);
  color: #f9dc82;
  font-size: 46rpx;
  font-weight: 900;
  text-align: center;
}
.list-content {
  padding: 20rpx 28rpx 86rpx;
  box-sizing: border-box;
}
.dialog-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 94rpx;
  border-bottom: 2rpx solid rgba(246, 171, 37, .55);
  font-size: 34rpx;
}
.dialog-row button {
  margin: 0;
  padding: 8rpx 22rpx;
  border: 4rpx solid #e8ae2e;
  border-radius: 18rpx;
  background: #075cc0;
  color: #fff;
  font-size: 26rpx;
}
.facility-content,
.function-content {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 4rpx;
  padding: 18rpx 20rpx 86rpx;
  box-sizing: border-box;
}
.facility-item,
.function-item {
  display: flex;
  align-items: center;
  gap: 14rpx;
  min-height: 88rpx;
  font-size: 30rpx;
}
.facility-icon {
  color: #ffd347;
  font-size: 42rpx;
}
.function-content {
  grid-template-columns: repeat(3, 1fr);
  gap: 4rpx 10rpx;
}
.function-item {
  justify-content: center;
  border: 3rpx solid #b0803c;
  border-radius: 20rpx;
  background: rgba(86, 20, 30, .75);
  font-size: 26rpx;
}
.game-tabs {
  display: flex;
  gap: 6rpx;
  padding: 8rpx 4rpx 0;
}
.game-tab {
  flex: 1;
  margin: 0;
  padding: 16rpx 0;
  border: 4rpx solid #09d8f0;
  border-radius: 8rpx;
  background: linear-gradient(#157894, #10405b);
  color: #f4e6c0;
  font-size: 28rpx;
  font-weight: 900;
}
.game-tab.active {
  background: linear-gradient(#ec4217, #9d1609);
  border-color: #ffd14e;
}
.game-tab::after,
.chat-input button::after {
  border: none;
}
.companion-row {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 4rpx;
  background: #050505;
}
.companion {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 66rpx;
  height: 66rpx;
  border: 5rpx solid #e9bf67;
  border-radius: 50%;
  background: radial-gradient(circle at 50% 35%, #f6c4aa 0 25%, #743a46 26% 54%, #23131f 55%);
  color: #fff;
  font-size: 22rpx;
}
.more-link {
  margin-left: auto;
  padding-right: 8rpx;
  color: #2619e8;
  font-size: 32rpx;
}
.shortcut-row {
  display: flex;
  align-items: center;
  height: 72rpx;
  background: linear-gradient(90deg, #a17a3e, #3c86a9 45%, #1185a6);
}
.shortcut-label {
  width: 32%;
  color: #fff4d0;
  font-size: 29rpx;
  text-align: center;
}
.shortcut-item {
  flex: 1;
  color: #fff1d0;
  font-size: 32rpx;
  text-align: center;
}
.shortcut-item.selected {
  background: linear-gradient(#ff8d19, #dc2706);
}
.chat-list {
  min-height: 690rpx;
  padding: 20rpx 12rpx 120rpx;
  background: repeating-linear-gradient(135deg, #102a3e 0 8rpx, #0d2334 8rpx 16rpx);
}
.chat-message {
  display: flex;
  align-items: flex-start;
  gap: 10rpx;
  margin-bottom: 16rpx;
  color: #f5f4ef;
  font-size: 27rpx;
  line-height: 1.45;
}
.chat-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 74rpx;
  height: 74rpx;
  border: 4rpx solid #d7bd84;
  border-radius: 8rpx;
  color: #fff;
  font-size: 30rpx;
  font-weight: 900;
}
.warrior-mini { background: #8b2817; }
.blue-mini { background: #1d4f78; }
.red-mini { background: #983d28; }
.chat-message > view:last-child {
  max-width: 82%;
  padding: 12rpx 18rpx;
  border: 2rpx solid #356682;
  border-radius: 12rpx;
  background: rgba(40, 77, 103, .72);
}
.chat-name {
  color: #f3ef00;
  font-size: 30rpx;
}
.chat-input {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 5;
  display: flex;
  align-items: center;
  gap: 8rpx;
  max-width: 750rpx;
  margin: 0 auto;
  padding: 10rpx 6rpx;
  border-top: 4rpx solid #d5a344;
  background: #07111c;
}
.chat-input button {
  margin: 0;
  padding: 0;
  background: transparent;
}
.chat-plus,
.chat-emoji {
  width: 68rpx;
  height: 68rpx;
  border-radius: 50%;
  font-size: 54rpx;
}
.chat-plus { color: #777; background: #e3e3e3 !important; }
.chat-emoji { color: #ddab2a; }
.chat-field {
  flex: 1;
  height: 68rpx;
  border: 4rpx solid #168cb3;
  border-radius: 38rpx;
  background: #142030;
}
.send-button {
  width: 124rpx;
  height: 68rpx;
  border: 4rpx solid #ddc27c !important;
  border-radius: 34rpx;
  background: #087b7a !important;
  color: #ffe3a3 !important;
  font-size: 30rpx;
}

@media (min-width: 700px) {
  .game-root {
    max-width: 750rpx;
    margin: 0 auto;
  }
}
</style>
