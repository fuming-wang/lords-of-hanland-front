<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getPlatform } from '../platform'
import { relaunch } from '../services/navigation'
import {
  MaxRolesPerZone,
  MaxRoleNameLength,
  createRole,
  listRoles,
  selectRole,
  translateRoleError,
  type Role,
} from '../services/role'
import {
  getSelectedZone,
  isLoggedIn,
  setActiveRole,
  setActiveRoleView,
  type SelectedZone,
} from '../services/session'
import { zoneStatusLabel } from '../services/zone'

type Screen = 'characters' | 'create'
type ProfessionKey = 'warrior' | 'scholar' | 'stranger'

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

const screen = ref<Screen>('characters')
const platform = getPlatform()

// 选角页：角色来自 GET /roles?server_id=，分区来自选区页写入的本地会话。
const roles = ref<Role[]>([])
const rolesLoading = ref(false)
const rolesError = ref('')
const selectedRoleId = ref(0)

// 建角页。
const roleName = ref('')
const creating = ref(false)
const createError = ref('')

const selectedProfession = ref<ProfessionKey>('warrior')
const selectedPortrait = ref(2)

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

const activeProfession = computed(() => professions.find((item) => item.key === selectedProfession.value) ?? professions[0])
const selectedPortraitData = computed(() => activeProfession.value.portraits[selectedPortrait.value])
const emptySlots = computed(() => Math.max(0, MaxRolesPerZone - roles.value.length))
const roleNameLength = computed(() => Array.from(roleName.value.trim()).length)

// selectedZone 来自选区页写入的本地会话;没有分区时回选区页重新选择。
const selectedZone = computed<SelectedZone | null>(() => getSelectedZone())

onShow(() => {
  // 未登录（token 过期被 401 清理）直接回登录页。
  if (!isLoggedIn()) {
    relaunch('/pages/login')
    return
  }
  // 没有分区（直接刷新本页/登出后）时先回选区页，避免在空分区上拉角色列表。
  if (!selectedZone.value) {
    relaunch('/pages/server')
    return
  }
  void loadRoles()
})

// --- 选区内的角色（GET /roles?server_id=）--------------------------------

async function loadRoles() {
  const zone = selectedZone.value
  // 没有分区时不发请求:onShow 已经把界面切回选区页了。
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

function backToServer() {
  if (getCurrentPages().length > 1) {
    uni.navigateBack()
    return
  }
  relaunch('/pages/server')
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
  screen.value = 'create'
}

function backToCharacters() {
  createError.value = ''
  screen.value = 'characters'
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
    openGame(role)
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
    relaunch('/pages/server')
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
  if (zone.status !== 'open') {
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
    openGame(role)
  } catch (err) {
    createError.value = translateRoleError(err instanceof Error ? err.message : '')
  } finally {
    creating.value = false
  }
}

// rememberRole 保存进入游戏的角色摘要与完整视图,供游戏页读取。
function rememberRole(role: Role) {
  setActiveRole({
    id: role.id,
    name: role.name,
    level: role.level,
    className: role.class,
    serverId: role.server_id,
  })
  setActiveRoleView(role)
}

// openGame 记录角色并进入游戏页。
function openGame(role: Role) {
  rememberRole(role)
  uni.navigateTo({ url: '/pages/index/index' })
}
</script>

<template>
  <view class="game-root">
    <view v-if="screen === 'characters'" class="screen character-screen">
      <view class="character-header"><view class="header-ornament"></view><text>选择角色</text><view class="header-ornament"></view></view>
      <view v-if="rolesLoading" class="select-state"><text class="select-state-title">正在读取角色…</text></view>
      <template v-else>
        <view v-if="rolesError" class="role-error"><text>{{ rolesError }}</text></view>
        <view class="character-slots">
          <!-- 该分区还没有角色：整个空列表可点击，直接去建角页。 -->
          <view v-if="roles.length === 0 && !rolesError" class="character-slot empty empty-list" @tap="openCreateCharacter">
            <view class="slot-portrait portrait-empty">?</view>
            <view class="empty-info">
              <view class="empty-name">暂无角色</view>
              <view class="empty-hint">点击创建角色</view>
            </view>
          </view>
          <template v-else-if="!rolesError">
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
          </template>
        </view>
      </template>
      <view class="current-server" @tap="backToServer">&lt; {{ selectedZone ? selectedZone.name : '未选择分区' }}{{ selectedZone ? '（' + zoneStatusLabel(selectedZone.status) + '）' : '' }} · 切换 &gt;</view>
      <view class="character-footer"><button class="enter-character-button" :disabled="!selectedRoleId || rolesLoading" @tap="enterExistingCharacter">进入游戏</button><button class="character-back-button" @tap="backToServer">返回</button></view>
    </view>

    <view v-else class="screen create-screen">
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
      <view class="create-footer"><button class="enter-character-button" :disabled="creating" @tap="registerCharacter">{{ creating ? '创建中…' : '进入游戏' }}</button><button class="character-back-button" @tap="backToCharacters">返回</button></view>
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
  position: relative;
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

/* 选角页的加载状态 */
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

/* 空列表占位：没有角色时整卡可点，提示玩家去建角 */
.empty-list .empty-info {
  flex-direction: column;
  align-items: flex-start;
  gap: 14rpx;
}

.empty-hint {
  color: #bfe9ff;
  font-size: 28rpx;
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

.portrait-name {
  position: absolute;
  bottom: 6rpx;
  width: 100%;
  color: #ffe9ae;
  font-size: 24rpx;
  text-align: center;
  text-shadow: 2rpx 2rpx #4c071b;
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

@media (min-width: 700px) {
  .game-root {
    max-width: 750rpx;
    margin: 0 auto;
  }
}
</style>
