<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getPlatform } from '../../platform'
import { relaunch } from '../../services/navigation'
import {
  MaxRolesPerZone,
  MaxRoleNameLength,
  createRole,
  listRoles,
  selectRole,
  translateRoleError,
  type Role,
} from '../../services/role'
import {
  type ActiveRole,
  clearSession,
  getActiveRole,
  getSelectedZone,
  isLoggedIn,
  setActiveRole,
  setSelectedZone,
} from '../../services/session'
import { listZones, translateZoneError, zoneStatusLabel, type Zone } from '../../services/zone'

type Screen = 'splash' | 'menu' | 'server' | 'characters' | 'create' | 'game'
type ProfessionKey = 'warrior' | 'scholar' | 'stranger'
type GameTab = 'move' | 'person' | 'facility' | 'function'

interface Portrait {
  name: string
  symbol: string
  style: string
}

interface Profession {
  key: ProfessionKey
  // name 同时是后端职业名（武士 / 文人 / 异人），建角时原样提交。
  name: string
  description: string
  portraits: Portrait[]
}

// GameRoleView 是游戏主界面需要的角色字段；进入游戏时来自后端角色视图，
// 冷启动（重新进入页面）时退化为本地保存的角色摘要。
interface GameRoleView {
  id: number
  name: string
  level: number
  className: string
  title: string
  coordinate: string
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

const screen = ref<Screen>('splash')
const platform = getPlatform()

// 选区页：分区来自公开接口 GET /servers。
const zones = ref<Zone[]>([])
const zonesLoading = ref(false)
const zonesError = ref('')
const selectedZoneId = ref(0)
const currentServerPage = ref(1)

// 选角页：角色来自 GET /roles?server_id=。
const roles = ref<Role[]>([])
const rolesLoading = ref(false)
const rolesError = ref('')
const selectedRoleId = ref(0)

// 建角页。
const roleName = ref('')
const creating = ref(false)
const createError = ref('')

// 游戏内角色：本次进入的完整角色视图，或上次进入的角色摘要。
const enteredRole = ref<Role | null>(null)
const storedRole = ref<ActiveRole | null>(null)

const selectedProfession = ref<ProfessionKey>('warrior')
const selectedPortrait = ref(2)
const activeGameTab = ref<GameTab>('move')
const pageSize = 4
const gameTabs: { key: GameTab; label: string }[] = [
  { key: 'person', label: '人物' },
  { key: 'facility', label: '设施' },
  { key: 'move', label: '移动' },
  { key: 'function', label: '功能' },
]

const professions: Profession[] = [
  {
    key: 'warrior',
    name: '武士',
    description: '横行于乱世的强者，拥有精湛的战斗技巧，善于在肉搏战中重创对手。',
    portraits: [
      { name: '女将', symbol: '女', style: 'female-red' },
      { name: '红妆', symbol: '妆', style: 'female-rose' },
      { name: '玄甲', symbol: '将', style: 'male-gold' },
      { name: '猛将', symbol: '猛', style: 'male-red' },
      { name: '战神', symbol: '战', style: 'male-blue' },
      { name: '铁骑', symbol: '骑', style: 'male-purple' },
    ],
  },
  {
    key: 'scholar',
    name: '文人',
    description: '虽然身体孱弱，但拥有超高的智力。善于用计陷对手于混乱，大大削弱对手实力。',
    portraits: [
      { name: '琴姬', symbol: '琴', style: 'female-rose' },
      { name: '书生', symbol: '书', style: 'female-teal' },
      { name: '谋士', symbol: '谋', style: 'female-purple' },
      { name: '策士', symbol: '策', style: 'male-brown' },
      { name: '羽扇', symbol: '扇', style: 'male-blue' },
      { name: '公子', symbol: '公', style: 'male-gold' },
    ],
  },
  {
    key: 'stranger',
    name: '异人',
    description: '云游四方的求道者，拥有强大的法力，善于群体攻击，可以呼风唤雨，蛊毒引雷。',
    portraits: [
      { name: '灵女', symbol: '灵', style: 'female-gold' },
      { name: '巫祝', symbol: '巫', style: 'female-rose' },
      { name: '仙子', symbol: '仙', style: 'female-teal' },
      { name: '狂士', symbol: '狂', style: 'male-red' },
      { name: '道长', symbol: '道', style: 'male-blue' },
      { name: '羽客', symbol: '羽', style: 'male-purple' },
    ],
  },
]

const totalServerPages = computed(() => Math.max(1, Math.ceil(zones.value.length / pageSize)))
const visibleServers = computed(() => {
  const start = (currentServerPage.value - 1) * pageSize
  return zones.value.slice(start, start + pageSize)
})
const activeProfession = computed(() => professions.find((item) => item.key === selectedProfession.value) ?? professions[0])
const selectedPortraitData = computed(() => activeProfession.value.portraits[selectedPortrait.value])

// selectedZone：优先取当前分区列表里的记录，冷启动时退回本地保存的分区。
const selectedZone = computed<Zone | { id: number; name: string; status: string; open: boolean } | null>(() => {
  const fromList = zones.value.find((zone) => zone.id === selectedZoneId.value)
  if (fromList) return fromList
  const remembered = getSelectedZone()
  if (!remembered) return null
  return { ...remembered, open: remembered.status === 'open' }
})

const emptySlots = computed(() => Math.max(0, MaxRolesPerZone - roles.value.length))
const roleNameLength = computed(() => Array.from(roleName.value.trim()).length)

const gameRole = computed<GameRoleView | null>(() => {
  const role = enteredRole.value
  if (role) {
    return {
      id: role.id,
      name: role.name,
      level: role.level,
      className: role.class,
      title: role.title,
      coordinate: role.coordinate,
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
    coordinate: '',
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

onShow(() => {
  // 未登录（token 过期被 401 清理）直接回登录页，避免带着空会话请求角色。
  if (!isLoggedIn()) {
    relaunch('/pages/login/login')
    return
  }
  storedRole.value = getActiveRole()
})

function goTo(nextScreen: Screen) {
  if (nextScreen === 'server') {
    void loadZones()
    screen.value = nextScreen
    return
  }
  if (nextScreen === 'characters') {
    // 没有分区（冷启动/登出后）时先回选区页，避免在空分区上拉角色列表。
    if (!selectedZone.value) {
      void loadZones()
      screen.value = 'server'
      return
    }
    void loadRoles()
    screen.value = nextScreen
    return
  }
  screen.value = nextScreen
}

// --- 选区（GET /servers）--------------------------------------------------

async function loadZones() {
  zonesLoading.value = true
  zonesError.value = ''
  try {
    zones.value = await listZones()
    currentServerPage.value = 1
    const remembered = getSelectedZone()
    const preferred =
      zones.value.find((zone) => zone.id === remembered?.id) ||
      zones.value.find((zone) => zone.open) ||
      zones.value[0]
    selectedZoneId.value = preferred ? preferred.id : 0
    if (zones.value.length === 0) {
      zonesError.value = '当前没有开放的分区，请留意公告'
    }
  } catch (err) {
    zonesError.value = translateZoneError(err instanceof Error ? err.message : '')
  } finally {
    zonesLoading.value = false
  }
}

function chooseServer(index: number) {
  const actualIndex = (currentServerPage.value - 1) * pageSize + index
  const zone = zones.value[actualIndex]
  if (!zone) return
  if (!zone.open) {
    uni.showToast({ title: `该分区${zoneStatusLabel(zone.status)}`, icon: 'none' })
    return
  }
  selectedZoneId.value = zone.id
}

function changeServerPage(step: number) {
  const nextPage = currentServerPage.value + step
  if (nextPage >= 1 && nextPage <= totalServerPages.value) currentServerPage.value = nextPage
}

function enterServer() {
  const zone = selectedZone.value
  if (!zone) {
    uni.showToast({ title: '请选择要进入的分区', icon: 'none' })
    return
  }
  if (!zone.open) {
    uni.showToast({ title: `该分区${zoneStatusLabel(zone.status)}，请稍后再试`, icon: 'none' })
    return
  }
  setSelectedZone({ id: zone.id, name: zone.name, status: zone.status })
  goTo('characters')
}

// --- 选区内的角色（GET /roles?server_id=）--------------------------------

async function loadRoles() {
  const zone = selectedZone.value
  // 没有分区时不发请求：goTo 已经把界面切回选区页了。
  if (!zone) return
  rolesLoading.value = true
  rolesError.value = ''
  try {
    roles.value = await listRoles(zone.id)
    selectedRoleId.value = roles.value[0]?.id ?? 0
  } catch (err) {
    rolesError.value = translateRoleError(err instanceof Error ? err.message : '')
    roles.value = []
    selectedRoleId.value = 0
  } finally {
    rolesLoading.value = false
  }
}

function chooseRole(roleId: number) {
  selectedRoleId.value = roleId
}

function switchZone() {
  enteredRole.value = null
  goTo('server')
}

function openCreateCharacter() {
  if (roles.value.length >= MaxRolesPerZone) {
    uni.showToast({ title: `每个分区最多 ${MaxRolesPerZone} 个角色`, icon: 'none' })
    return
  }
  selectedProfession.value = 'warrior'
  selectedPortrait.value = 2
  roleName.value = ''
  createError.value = ''
  goTo('create')
}

function chooseProfession(key: ProfessionKey) {
  selectedProfession.value = key
  selectedPortrait.value = 2
}

function choosePortrait(index: number) {
  selectedPortrait.value = index
}

// enterExistingCharacter 进入所选角色：POST /roles/{id}/select 由后端校验
// 归属与分区状态，通过后把角色摘要写入本地会话。
async function enterExistingCharacter() {
  if (!selectedRoleId.value) {
    uni.showToast({ title: '请先选择角色', icon: 'none' })
    return
  }
  rolesLoading.value = true
  try {
    const role = await selectRole(selectedRoleId.value)
    enteredRole.value = role
    rememberRole(role)
    openGame()
  } catch (err) {
    const message = translateRoleError(err instanceof Error ? err.message : '')
    rolesError.value = message
    uni.showToast({ title: message, icon: 'none' })
  } finally {
    rolesLoading.value = false
  }
}

// registerCharacter 建角：POST /roles（带 server_id），随后直接进入该角色。
async function registerCharacter() {
  const zone = selectedZone.value
  if (!zone) {
    uni.showToast({ title: '请先选择分区', icon: 'none' })
    goTo('server')
    return
  }
  const name = roleName.value.trim()
  if (!name) {
    createError.value = '请输入角色名'
    return
  }
  if (Array.from(name).length > MaxRoleNameLength) {
    createError.value = `角色名最多 ${MaxRoleNameLength} 个字`
    return
  }
  if (!zone.open) {
    createError.value = `该分区${zoneStatusLabel(zone.status)}，暂时无法创建角色`
    return
  }
  const portrait = selectedPortraitData.value
  creating.value = true
  createError.value = ''
  try {
    const role = await createRole({
      serverId: zone.id,
      name,
      className: activeProfession.value.name,
      sex: portrait.style.startsWith('female') ? '女' : '男',
      image: portrait.style,
    })
    enteredRole.value = role
    rememberRole(role)
    roles.value = [...roles.value, role]
    openGame()
  } catch (err) {
    createError.value = translateRoleError(err instanceof Error ? err.message : '')
  } finally {
    creating.value = false
  }
}

// rememberRole 保存进入游戏的角色摘要，供游戏内其它页面读取。
function rememberRole(role: Role) {
  setActiveRole({
    id: role.id,
    name: role.name,
    level: role.level,
    className: role.class,
    serverId: role.server_id,
  })
  storedRole.value = getActiveRole()
}

function openGame() {
  activeGameTab.value = 'move'
  goTo('game')
}

function selectGameTab(tab: GameTab) {
  activeGameTab.value = tab
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
  relaunch('/pages/login/login')
}
</script>

<template>
  <view class="game-root">
    <view v-if="screen === 'splash'" class="screen splash-screen" @tap="goTo('menu')">
      <view class="splash-art">
        <view class="sun-glow"></view><view class="mountain mountain-back"></view><view class="mountain mountain-front"></view>
        <view class="warrior"><view class="warrior-hair"></view><view class="warrior-face"></view><view class="warrior-armor"></view><view class="warrior-ribbon"></view></view>
        <view class="title-seal"><text>汉</text><text>土</text><text>领</text><text>主</text></view>
        <view class="online-mark">ONLINE</view><view class="free-mark">永久免费</view>
      </view>
      <view class="tap-hint"><view class="tap-hint-line"></view><text>点击进入</text><view class="tap-hint-line"></view></view>
    </view>

    <view v-else-if="screen === 'menu'" class="screen splash-screen menu-screen">
      <view class="splash-art">
        <view class="sun-glow"></view><view class="mountain mountain-back"></view><view class="mountain mountain-front"></view>
        <view class="warrior"><view class="warrior-hair"></view><view class="warrior-face"></view><view class="warrior-armor"></view><view class="warrior-ribbon"></view></view>
        <view class="title-seal"><text>汉</text><text>土</text><text>领</text><text>主</text></view>
        <view class="online-mark">ONLINE</view><view class="free-mark">永久免费</view>
      </view>
      <view class="menu-panel">
        <view class="menu-item enter-item" @tap="goTo('server')"><text class="menu-arrow">➤</text><text>进入游戏</text></view>
        <view class="menu-item exit-item" @tap="exitGame">退出</view>
      </view>
    </view>

    <view v-else-if="screen === 'server'" class="screen select-screen">
      <view class="select-header"><view class="ornament ornament-left"></view><text>选择分区</text><view class="ornament ornament-right"></view></view>
      <view v-if="zonesLoading" class="select-state"><text class="select-state-title">正在读取分区…</text></view>
      <view v-else-if="zonesError" class="select-state">
        <text class="select-state-title">{{ zonesError }}</text>
        <button class="select-retry-button" @tap="loadZones">重新加载</button>
      </view>
      <template v-else>
        <view class="server-list">
          <view v-for="(server, index) in visibleServers" :key="server.id" class="server-item" :class="{ selected: selectedZoneId === server.id, disabled: !server.open }" @tap="chooseServer(index)">
            <view class="server-name">{{ server.name }}</view>
            <view class="server-meta"><text>{{ zoneStatusLabel(server.status) }}</text><text>第 {{ server.id }} 区</text></view>
            <view class="server-light" :class="server.open ? 'online' : 'closed'"></view>
          </view>
        </view>
        <view class="page-switcher">
          <button class="page-button" :disabled="currentServerPage === 1" @tap="changeServerPage(-1)">▲</button>
          <text>第 {{ currentServerPage }} / {{ totalServerPages }} 页</text>
          <button class="page-button" :disabled="currentServerPage === totalServerPages" @tap="changeServerPage(1)">▼</button>
        </view>
      </template>
      <view class="notice-copy"><text>游戏永久免费，游戏内道具自愿购买</text><text>文网游备字（2012）M-RPG002号</text></view>
      <view class="select-footer"><button class="back-button" @tap="goTo('menu')">返回</button><button class="enter-button" @tap="enterServer">进入游戏</button></view>
    </view>

    <view v-else-if="screen === 'characters'" class="screen character-screen">
      <view class="character-header"><view class="header-ornament"></view><text>选择角色</text><view class="header-ornament"></view></view>
      <view v-if="rolesLoading" class="select-state"><text class="select-state-title">正在读取角色…</text></view>
      <template v-else>
        <view v-if="rolesError" class="role-error"><text>{{ rolesError }}</text></view>
        <view class="character-slots">
          <view v-for="role in roles" :key="role.id" class="character-slot occupied" :class="{ selected: selectedRoleId === role.id }" @tap="chooseRole(role.id)">
            <view class="slot-portrait portrait-occupied"><text>{{ role.name.slice(0, 1) }}</text></view>
            <view class="slot-info">
              <view class="slot-name">{{ role.name }}</view>
              <view class="slot-level">{{ role.level }}级{{ role.class }}</view>
              <view class="slot-id">ID:{{ role.id }}</view>
            </view>
          </view>
          <view v-for="slot in emptySlots" :key="'empty-' + slot" class="character-slot empty" @tap="openCreateCharacter">
            <view class="slot-portrait portrait-empty">?</view>
            <view class="empty-info"><view class="empty-name">空</view><button class="new-character-button" @tap.stop="openCreateCharacter">新建角色</button></view>
          </view>
        </view>
      </template>
      <view class="current-server" @tap="switchZone">&lt; {{ selectedZone ? selectedZone.name : '未选择分区' }}{{ selectedZone ? '（' + zoneStatusLabel(selectedZone.status) + '）' : '' }} · 切换 &gt;</view>
      <view class="character-footer"><button class="enter-character-button" :disabled="!selectedRoleId || rolesLoading" @tap="enterExistingCharacter">进入游戏</button><button class="character-back-button" @tap="goTo('server')">返回</button></view>
    </view>

    <view v-else-if="screen === 'game'" class="screen game-screen">
      <view class="game-topbar">
        <view class="game-scene-preview"><view class="scene-roof"></view><view class="scene-water"></view></view>
        <text class="game-location">许昌</text><view class="recharge-badge">首充</view>
      </view>
      <view class="game-workspace">
        <view class="player-panel">
          <view class="player-summary"><view class="player-avatar">{{ gameRole ? gameRole.name.slice(0, 1) : '游' }}</view><view class="player-name-block"><text class="player-name">{{ gameRole ? gameRole.name : '未选择角色' }}</text><text class="player-server">[{{ selectedZone ? selectedZone.name : '未选区' }}:{{ gameRole ? gameRole.id : '—' }}]</text></view></view>
          <view class="status-bar hp"><view class="bar-fill"></view></view><view class="status-bar mp"><view class="bar-fill"></view></view>
          <view class="combat-power"><text>攻击</text><text>{{ gameRole ? gameRole.totalAttack : 0 }}</text></view>
          <view class="general-row"><view v-for="index in 3" :key="index" class="general-slot">将</view></view>
          <view v-if="activeGameTab === 'move'" class="left-map-card"><view class="map-title">{{ gameRole && gameRole.coordinate ? gameRole.coordinate : '许昌' }}</view><view class="map-art"><view class="map-river"></view><view class="map-marker">◆</view></view></view>
          <view v-else class="player-detail-card"><view><text>职业:</text><text>{{ gameRole ? gameRole.className : '—' }}</text></view><view><text>等级:</text><text>{{ gameRole ? gameRole.level : 0 }}级</text></view><view class="experience"><text>经验值:</text><view class="experience-track"><view class="experience-fill" :style="{ width: experiencePercent + '%' }"></view></view></view><view><text>金:</text><text>{{ gameRole ? gameRole.gold : 0 }}</text></view><view><text>银:</text><text>{{ gameRole ? gameRole.silver : 0 }}</text></view><view><text>速度:</text><text>{{ gameRole ? gameRole.totalSpeed : 0 }}</text></view></view>
        </view>
        <view class="game-panel">
          <view v-if="activeGameTab === 'move'" class="panel-content move-content"><view class="move-title"><text class="down-arrow">▼</text><text>许昌郊外</text></view><view class="move-empty"></view><view class="panel-caption">移动</view></view>
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
    </view>    <view v-else class="screen create-screen">
      <view class="character-header"><view class="header-ornament"></view><text>创建角色</text><view class="header-ornament"></view></view>
      <view class="create-title"><view class="gold-line"></view><text>角色名</text><view class="gold-line"></view></view>
      <view class="role-name-field">
        <input
          v-model="roleName"
          class="role-name-input"
          type="text"
          :maxlength="6"
          placeholder="最多 6 个字，分区内唯一"
          placeholder-style="color:#7a735c"
        />
        <text class="role-name-count">{{ roleNameLength }}/6</text>
      </view>
      <view class="create-title"><view class="gold-line"></view><text>选择职业</text><view class="gold-line"></view></view>
      <view class="profession-row">
        <view v-for="profession in professions" :key="profession.key" class="profession-diamond" :class="['profession-' + profession.key, { active: selectedProfession === profession.key }]" @tap="chooseProfession(profession.key)"><text>{{ profession.name }}</text></view>
      </view>
      <view class="create-title portrait-title"><view class="gold-line"></view><text>选择头像</text><view class="gold-line"></view></view>
      <view class="portrait-grid">
        <view v-for="(portrait, index) in activeProfession.portraits" :key="portrait.name" class="portrait-card" :class="{ selected: selectedPortrait === index }" @tap="choosePortrait(index)">
          <view class="portrait-art" :class="portrait.style"><text>{{ portrait.symbol }}</text></view>
          <view class="portrait-name">{{ portrait.name }}</view>
        </view>
      </view>
      <view class="profession-description">{{ activeProfession.description }}</view>
      <text v-if="createError" class="create-error-text">{{ createError }}</text>
      <view class="create-footer"><button class="enter-character-button" :disabled="creating" @tap="registerCharacter">{{ creating ? '创建中…' : '进入游戏' }}</button><button class="character-back-button" @tap="goTo('characters')">返回</button></view>
      <view class="platform-label">{{ platform }} · {{ selectedZone ? selectedZone.name : '' }}</view>
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

.splash-screen {
  background: #191919;
}

.splash-art {
  position: relative;
  width: 100%;
  height: 1180rpx;
  overflow: hidden;
  background:
    radial-gradient(circle at 58% 54%, rgba(255, 241, 110, 0.95) 0 8%, rgba(255, 133, 0, 0.82) 18%, transparent 45%),
    linear-gradient(145deg, #250000 0%, #7a1200 36%, #db3500 66%, #270000 100%);
}

.sun-glow {
  position: absolute;
  top: 280rpx;
  left: 28%;
  width: 620rpx;
  height: 620rpx;
  border-radius: 50%;
  background: radial-gradient(circle, #fffbd0 0 3%, #ffc400 18%, rgba(255, 65, 0, 0.35) 48%, transparent 70%);
  filter: blur(14rpx);
}

.mountain {
  position: absolute;
  bottom: -80rpx;
  width: 780rpx;
  height: 680rpx;
  border-radius: 50% 50% 0 0;
  transform: rotate(-10deg);
}

.mountain-back {
  left: -300rpx;
  background: linear-gradient(145deg, #64230c, #1f0907 72%);
  box-shadow: 220rpx -100rpx 0 #6c2b0d, 460rpx 70rpx 0 #4d1707;
}

.mountain-front {
  right: -300rpx;
  bottom: -180rpx;
  height: 850rpx;
  background: linear-gradient(160deg, #f4a400 0%, #cb3a08 32%, #560a08 75%);
  opacity: 0.94;
}

.warrior {
  position: absolute;
  right: -100rpx;
  bottom: 0;
  width: 680rpx;
  height: 920rpx;
}

.warrior-hair {
  position: absolute;
  top: 75rpx;
  left: 70rpx;
  width: 560rpx;
  height: 400rpx;
  border-radius: 52% 48% 44% 38%;
  transform: rotate(-12deg);
  background: linear-gradient(145deg, #ff4d70 8%, #c2083b 45%, #360005 76%);
  box-shadow: -70rpx 100rpx 0 -14rpx #610018, 160rpx -70rpx 0 -24rpx #ff8295;
}

.warrior-face {
  position: absolute;
  top: 220rpx;
  left: 210rpx;
  width: 280rpx;
  height: 350rpx;
  border-radius: 48% 42% 50% 54%;
  transform: rotate(-17deg);
  background: radial-gradient(circle at 64% 33%, #3b0607 0 4%, transparent 5%), linear-gradient(150deg, #ffe3a0 0%, #f4a173 58%, #9f372d 100%);
  box-shadow: 20rpx 34rpx 0 rgba(255, 201, 143, 0.28);
}

.warrior-armor {
  position: absolute;
  top: 540rpx;
  left: 60rpx;
  width: 560rpx;
  height: 480rpx;
  border-radius: 50% 50% 0 0;
  transform: rotate(-9deg);
  background: linear-gradient(145deg, #ffbb36 0 18%, #b80938 19% 56%, #6d001a 57% 75%, #f1a23e 76%);
  box-shadow: inset 0 22rpx 0 rgba(255, 230, 150, 0.45);
}

.warrior-ribbon {
  position: absolute;
  top: 20rpx;
  right: 0;
  width: 460rpx;
  height: 110rpx;
  transform: rotate(19deg);
  border-radius: 50%;
  background: linear-gradient(90deg, #ff9bad, #de003f 54%, #64001d);
}

.title-seal {
  position: absolute;
  top: 72rpx;
  left: 36rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #ffe500;
  font-size: 92rpx;
  font-weight: 900;
  line-height: 0.96;
  letter-spacing: -12rpx;
  text-shadow: 5rpx 5rpx 0 #fa2c00, 9rpx 9rpx 0 #610000;
  transform: rotate(-4deg);
}

.online-mark {
  position: absolute;
  top: 515rpx;
  left: 48rpx;
  color: #ffdf00;
  font-size: 58rpx;
  font-weight: 900;
  letter-spacing: 2rpx;
  text-shadow: 4rpx 4rpx 0 #fb2900;
}

.free-mark {
  position: absolute;
  right: 28rpx;
  bottom: 42rpx;
  padding: 20rpx 16rpx;
  border: 5rpx solid #ffdf00;
  border-radius: 50%;
  background: #a60212;
  color: #fff4bd;
  font-size: 34rpx;
  font-weight: 800;
  line-height: 1.2;
  writing-mode: vertical-rl;
  transform: rotate(10deg);
}

.tap-hint {
  position: absolute;
  bottom: 110rpx;
  left: 50%;
  display: flex;
  align-items: center;
  gap: 18rpx;
  transform: translateX(-50%);
  color: #ffe86a;
  font-size: 32rpx;
  font-weight: 700;
  text-shadow: 2rpx 2rpx #7c1a00;
  white-space: nowrap;
}

.tap-hint-line {
  width: 76rpx;
  height: 3rpx;
  background: #ffd028;
}

.menu-panel {
  position: absolute;
  top: 940rpx;
  left: 0;
  width: 100%;
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 116rpx;
  border-top: 4rpx solid #ffda00;
  border-bottom: 4rpx solid #8d1200;
  color: #171717;
  font-size: 58rpx;
  font-weight: 900;
  text-shadow: 2rpx 2rpx #fff;
}

.enter-item {
  background: linear-gradient(#ffc51b, #ff9d00);
}

.exit-item {
  background: linear-gradient(#6b0000, #300000);
  color: #111;
  text-shadow: 2rpx 2rpx #a75a5a;
}

.menu-arrow {
  margin-right: 22rpx;
  color: #812000;
  font-size: 52rpx;
}

.select-screen {
  background:
    linear-gradient(rgba(2, 10, 60, 0.92), rgba(4, 5, 60, 0.96)),
    repeating-linear-gradient(135deg, #16302b 0 18rpx, #274a3d 18rpx 26rpx);
}

.select-header {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 170rpx;
  color: #fff7dc;
  font-size: 72rpx;
  font-weight: 900;
  text-shadow: 4rpx 4rpx #8c0000, -2rpx -2rpx #8c0000;
}

.ornament {
  width: 180rpx;
  height: 82rpx;
  margin: 0 18rpx;
  border-radius: 50%;
  background: rgba(245, 245, 230, 0.7);
  transform: skewX(28deg);
}

.server-list {
  padding: 0 28rpx;
}

.server-item {
  position: relative;
  display: flex;
  align-items: center;
  height: 112rpx;
  margin-bottom: 22rpx;
  padding: 0 42rpx;
  border: 8rpx solid #cbd0d5;
  border-radius: 4rpx;
  background: linear-gradient(90deg, #17231c 0 70%, #66765d 100%);
  box-shadow: 0 0 0 4rpx #080808, inset 0 0 0 3rpx #000;
}

.server-item.selected {
  border-color: #fff;
  background: linear-gradient(90deg, #314137 0 70%, #f1b34b 100%);
}

.server-item.disabled {
  color: #a8a8a8;
  filter: grayscale(0.8);
}

.server-name {
  width: 210rpx;
  font-size: 48rpx;
  font-weight: 900;
  text-shadow: 3rpx 3rpx #101010;
}

.server-meta {
  display: flex;
  flex: 1;
  justify-content: space-between;
  color: #e9e9d9;
  font-size: 22rpx;
}

.server-light {
  position: absolute;
  right: 22rpx;
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background: #40ef7c;
  box-shadow: 0 0 12rpx #40ef7c;
}

.server-light.soon {
  background: #9b9b9b;
  box-shadow: none;
}

.server-light.closed {
  background: #9b9b9b;
  box-shadow: none;
}

/* 选区/选角页的加载与错误状态 */
.select-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 28rpx;
  padding: 120rpx 40rpx;
}

.select-state-title {
  color: #f6f0d8;
  font-size: 34rpx;
  line-height: 1.6;
  text-align: center;
}

.select-retry-button {
  margin: 0;
  padding: 0 46rpx;
  border: 5rpx solid #ffd76a;
  border-radius: 10rpx;
  background: linear-gradient(#e79b1c, #b0630d);
  color: #fff7d8;
  font-size: 32rpx;
  font-weight: 900;
}

.select-retry-button::after {
  border: none;
}

.role-error {
  margin: 0 28rpx 16rpx;
  padding: 18rpx 24rpx;
  border: 4rpx solid #ff6a5a;
  border-radius: 8rpx;
  background: rgba(120, 12, 12, .55);
  color: #ffd9d3;
  font-size: 26rpx;
  line-height: 1.5;
  text-align: center;
}

.page-switcher {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 34rpx;
  margin-top: 30rpx;
  color: #f4f4f4;
  font-size: 34rpx;
}

.page-button {
  width: 190rpx;
  height: 86rpx;
  padding: 0;
  border: 4rpx solid #ff3121;
  border-radius: 8rpx;
  background: linear-gradient(#fff31b, #ff9900);
  color: #fff;
  font-size: 52rpx;
  line-height: 1.2;
  text-shadow: 3rpx 3rpx #e32900;
}

.page-button::after,
.enter-button::after,
.back-button::after {
  border: none;
}

.page-button[disabled] {
  opacity: 0.42;
}

.notice-copy {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 42rpx;
  padding: 26rpx 20rpx;
  border-top: 1rpx solid rgba(255, 255, 255, 0.16);
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.16);
  color: #f6f6f6;
  font-size: 27rpx;
  line-height: 1.7;
  text-align: center;
}

.select-footer {
  position: absolute;
  bottom: 52rpx;
  left: 0;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  width: 100%;
  padding: 0 42rpx;
  box-sizing: border-box;
}

.back-button {
  margin: 0;
  padding: 0;
  background: transparent;
  color: #fff;
  font-size: 42rpx;
}

.enter-button {
  width: 360rpx;
  height: 104rpx;
  margin: 0;
  border: 6rpx solid #ff2f20;
  border-radius: 8rpx;
  background: linear-gradient(#fff127, #ff9700);
  color: #fff;
  font-size: 42rpx;
  font-weight: 900;
  text-shadow: 3rpx 3rpx #e32900;
}

.platform-label {
  position: absolute;
  right: 24rpx;
  bottom: 20rpx;
  color: rgba(255, 255, 255, 0.35);
  font-size: 18rpx;
}

@media (min-width: 700px) {
  .game-root {
    max-width: 750rpx;
    margin: 0 auto;
  }
}

.character-screen,
.create-screen {
  background: radial-gradient(circle at 50% 38%, rgba(15, 96, 149, .32), transparent 36%), linear-gradient(#2a3043, #101321 72%);
}

.character-header {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 170rpx;
  color: #fff1c6;
  font-size: 72rpx;
  font-weight: 900;
  letter-spacing: 8rpx;
  text-shadow: 4rpx 4rpx #8c0000, -2rpx -2rpx #8c0000;
}

.header-ornament {
  width: 180rpx;
  height: 82rpx;
  margin: 0 18rpx;
  border-radius: 50%;
  background: rgba(245, 245, 230, .5);
  transform: skewX(28deg);
}

.character-slots {
  padding: 24rpx 28rpx 0;
}

.character-slot {
  display: flex;
  align-items: center;
  height: 190rpx;
  margin-bottom: 30rpx;
  padding: 12rpx;
  border: 8rpx solid #f0df9b;
  background: linear-gradient(90deg, #72031e, #cc0644 58%, #790b25);
  box-shadow: 0 0 0 5rpx #6d260e, inset 0 0 25rpx rgba(255, 34, 94, .65);
}

.character-slot.empty {
  background: linear-gradient(90deg, #50051b, #a80934 60%, #4c071b);
}

/* 当前选中的角色（进入游戏的目标） */
.character-slot.selected {
  border-color: #fff3b0;
  box-shadow: 0 0 0 5rpx #ffd76a, 0 0 32rpx rgba(255, 215, 106, .55);
}

.enter-character-button[disabled] {
  opacity: .55;
}

/* 建角页的角色名输入 */
.role-name-field {
  position: relative;
  width: 640rpx;
  margin: 0 auto;
}

.role-name-input {
  width: 100%;
  height: 92rpx;
  padding: 0 130rpx 0 28rpx;
  border: 6rpx solid #f0df9b;
  border-radius: 10rpx;
  background: #2a0a14;
  color: #fff7d8;
  font-size: 38rpx;
  box-sizing: border-box;
}

.role-name-count {
  position: absolute;
  top: 28rpx;
  right: 28rpx;
  color: #e9c98a;
  font-size: 26rpx;
}

.create-error-text {
  display: block;
  margin: 24rpx 24rpx 0;
  color: #ff8b7d;
  font-size: 28rpx;
  line-height: 1.5;
  text-align: center;
}

.slot-portrait {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 190rpx;
  height: 166rpx;
  border-right: 8rpx solid #d7b466;
  color: #ff1767;
  font-size: 110rpx;
  font-weight: 900;
  text-shadow: 3rpx 3rpx #ffb000;
}

.portrait-occupied {
  background: radial-gradient(circle at 50% 42%, #f3c29d 0 22%, transparent 23%), linear-gradient(135deg, #633314, #d2a64f 40%, #20121d);
  color: #fff;
  font-size: 58rpx;
}

.portrait-empty {
  background: radial-gradient(circle, #72022e, #3b061d);
}

.slot-info,
.empty-info {
  flex: 1;
  padding: 0 32rpx;
}

.slot-name,
.empty-name {
  color: #fff;
  font-size: 48rpx;
  font-weight: 900;
  text-shadow: 3rpx 3rpx #111;
}

.slot-level {
  position: absolute;
  right: 64rpx;
  margin-top: -52rpx;
  color: #ffe4c2;
  font-size: 30rpx;
}

.slot-id {
  margin-top: 16rpx;
  color: #fff;
  font-size: 42rpx;
}

.empty-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.new-character-button {
  margin: 0;
  padding: 0 34rpx;
  border: 5rpx solid #c7faff;
  border-radius: 28rpx;
  background: linear-gradient(#27d9ff, #0085d6);
  color: #fff;
  font-size: 30rpx;
  text-shadow: 2rpx 2rpx #27617e;
}

.current-server {
  margin-top: 110rpx;
  color: #f3d98e;
  font-size: 42rpx;
  text-align: center;
  text-shadow: 3rpx 3rpx #40230b;
}

.character-footer,
.create-footer {
  position: absolute;
  bottom: 48rpx;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0 28rpx;
  box-sizing: border-box;
}

.character-back-button {
  margin: 0;
  padding: 0;
  background: transparent;
  color: #fff;
  font-size: 42rpx;
}

.enter-character-button {
  width: 360rpx;
  height: 104rpx;
  margin: 0;
  border: 6rpx solid #ff2f20;
  border-radius: 8rpx;
  background: linear-gradient(#fff127, #ff9700);
  color: #fff;
  font-size: 42rpx;
  font-weight: 900;
  text-shadow: 3rpx 3rpx #e32900;
}

.new-character-button::after,
.enter-character-button::after,
.character-back-button::after {
  border: none;
}

.create-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  margin: 38rpx 28rpx 20rpx;
  color: #f4dd8d;
  font-size: 42rpx;
  text-shadow: 2rpx 2rpx #513d0b;
}

.gold-line {
  flex: 1;
  height: 2rpx;
  background: linear-gradient(90deg, transparent, #f5dd91);
}

.profession-row {
  display: flex;
  justify-content: space-around;
  padding: 0 70rpx;
}

.profession-diamond {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 168rpx;
  height: 168rpx;
  border: 8rpx solid #c8aa64;
  border-radius: 14rpx;
  transform: rotate(45deg);
  background: linear-gradient(135deg, #460919, #9e0b25);
  box-shadow: inset 0 0 0 5rpx #f9e2a0, 0 0 0 4rpx #4c1a0e;
}

.profession-diamond text {
  color: #ffe9ae;
  font-size: 42rpx;
  font-weight: 900;
  text-shadow: 3rpx 3rpx #a10712;
  transform: rotate(-45deg);
}

.profession-diamond.profession-scholar { background: linear-gradient(135deg, #034e58, #00a4a3); }
.profession-diamond.profession-stranger { background: linear-gradient(135deg, #2a116b, #6d16d7); }
.profession-diamond:not(.active) { opacity: .25; }
.profession-diamond.active { opacity: 1; transform: rotate(45deg) scale(1.06); }

.portrait-title {
  margin-top: 64rpx;
}

.portrait-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 22rpx;
  padding: 0 100rpx;
}

.portrait-card {
  position: relative;
  height: 182rpx;
  overflow: hidden;
  border: 6rpx solid #c0cbd3;
  border-radius: 12rpx;
  background: #5b0b1d;
  box-shadow: inset 0 0 0 4rpx #34000d;
}

.portrait-card.selected {
  border-color: #ffe18d;
  box-shadow: 0 0 0 5rpx #8c5d1c, 0 0 24rpx rgba(255, 207, 60, .75);
}

.portrait-art {
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: linear-gradient(135deg, #9d172c, #260416);
}

.portrait-art::before {
  content: '';
  position: absolute;
  bottom: -32rpx;
  width: 116rpx;
  height: 144rpx;
  border-radius: 50% 50% 38% 38%;
  background: linear-gradient(135deg, #f7c19e, #ad4b43);
  box-shadow: 0 -78rpx 0 -24rpx #26111c;
}

.portrait-art::after {
  content: '';
  position: absolute;
  top: 12rpx;
  width: 112rpx;
  height: 74rpx;
  border-radius: 60% 60% 20% 20%;
  background: #542039;
}

.portrait-art text {
  position: relative;
  z-index: 1;
  margin-bottom: 16rpx;
  color: rgba(255, 239, 202, .9);
  font-size: 38rpx;
  font-weight: 900;
  text-shadow: 2rpx 2rpx #6a041c;
}

.female-rose { background: linear-gradient(135deg, #a52745, #321023); }
.female-teal { background: linear-gradient(135deg, #147e78, #142f3f); }
.female-purple { background: linear-gradient(135deg, #742a9c, #211344); }
.female-gold { background: linear-gradient(135deg, #b46d2d, #3a161c); }
.male-red { background: linear-gradient(135deg, #9b2029, #260812); }
.male-blue { background: linear-gradient(135deg, #315f93, #111d3d); }
.male-purple { background: linear-gradient(135deg, #684086, #1a122d); }
.male-brown { background: linear-gradient(135deg, #764326, #211318); }
.male-gold { background: linear-gradient(135deg, #a56f2c, #251c19); }

.profession-description {
  margin: 38rpx 48rpx 0;
  color: #f5f5f5;
  font-size: 30rpx;
  line-height: 1.65;
  text-align: center;
}

.platform-label {
  position: absolute;
  right: 24rpx;
  bottom: 20rpx;
  color: rgba(255, 255, 255, .35);
  font-size: 18rpx;
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
.move-title {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 32rpx 22rpx;
  border-bottom: 3rpx solid #d4942c;
  font-size: 34rpx;
  font-weight: 900;
}
.down-arrow {
  color: #ffae00;
  font-size: 62rpx;
  text-shadow: 2rpx 2rpx #111;
}
.move-empty {
  height: 365rpx;
  background: radial-gradient(circle at 30% 70%, #ff671b 0 1%, transparent 3%), radial-gradient(circle at 63% 60%, #e5d10b 0 1%, transparent 3%);
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
</style>
