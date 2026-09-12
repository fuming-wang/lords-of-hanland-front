<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import {
  getSelectedZone,
  isLoggedIn,
  setSelectedZone,
} from '../services/session'
import { listZones, translateZoneError, zoneStatusLabel, type Zone } from '../services/zone'
import { relaunch } from '../services/navigation'

const zones = ref<Zone[]>([])
const zonesLoading = ref(false)
const zonesError = ref('')
const selectedZoneId = ref(0)
const currentServerPage = ref(1)
const pageSize = 4

const totalServerPages = computed(() => Math.max(1, Math.ceil(zones.value.length / pageSize)))
const visibleServers = computed(() => {
  const start = (currentServerPage.value - 1) * pageSize
  return zones.value.slice(start, start + pageSize)
})

// selectedZone：优先取当前分区列表里的记录，冷启动时退回本地保存的分区。
const selectedZone = computed<Zone | { id: number; name: string; status: string; open: boolean } | null>(() => {
  const fromList = zones.value.find((zone) => zone.id === selectedZoneId.value)
  if (fromList) return fromList
  const remembered = getSelectedZone()
  if (!remembered) return null
  return { ...remembered, open: remembered.status === 'open' }
})

onShow(() => {
  // 未登录（token 过期被 401 清理）直接回登录页。
  if (!isLoggedIn()) {
    relaunch('/pages/login')
    return
  }
  void loadZones()
})

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

// enterServer 记录所选分区并进入选角页。
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
  uni.navigateTo({ url: '/pages/role' })
}

// goBack 返回启动菜单;直接刷新进入本页时没有上一页,回退到 start。
function goBack() {
  if (getCurrentPages().length > 1) {
    uni.navigateBack()
    return
  }
  relaunch('/pages/start')
}
</script>

<template>
  <view class="game-root">
    <view class="screen select-screen">
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
      <view class="select-footer"><button class="back-button" @tap="goBack">返回</button><button class="enter-button" @tap="enterServer">进入游戏</button></view>
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
  font-size: 50rpx;
  font-weight: 900;
  text-shadow: 4rpx 4rpx #8c0000, -2rpx -2rpx #8c0000;
}

.ornament {
  width: 130rpx;
  height: 60rpx;
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
  height: 96rpx;
  margin-bottom: 22rpx;
  padding: 0 32rpx;
  border: 6rpx solid #cbd0d5;
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
  width: 260rpx;
  font-size: 34rpx;
  font-weight: 900;
  text-shadow: 3rpx 3rpx #101010;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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

.server-light.closed {
  background: #9b9b9b;
  box-shadow: none;
}

/* 选区的加载与错误状态 */
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

.page-switcher {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 34rpx;
  margin-top: 30rpx;
  color: #f4f4f4;
  font-size: 26rpx;
}

.page-button {
  width: 140rpx;
  height: 66rpx;
  padding: 0;
  border: 4rpx solid #ff3121;
  border-radius: 8rpx;
  background: linear-gradient(#fff31b, #ff9900);
  color: #fff;
  font-size: 34rpx;
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
  font-size: 23rpx;
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
  font-size: 32rpx;
}

.enter-button {
  width: 300rpx;
  height: 88rpx;
  margin: 0;
  border: 6rpx solid #ff2f20;
  border-radius: 8rpx;
  background: linear-gradient(#fff127, #ff9700);
  color: #fff;
  font-size: 34rpx;
  font-weight: 900;
  text-shadow: 3rpx 3rpx #e32900;
}

@media (min-width: 700px) {
  .game-root {
    max-width: 750rpx;
    margin: 0 auto;
  }
}
</style>
