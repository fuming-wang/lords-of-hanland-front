<template>
  <view class="settle-screen lost" @tap="backHome">
    <view class="settle-banner">
      <text class="settle-banner-text">败 北</text>
    </view>
    <view class="settle-panel">
      <text class="settle-group">{{ settlement?.group ?? '战斗' }}</text>
      <text class="settle-line" v-if="settlement">{{ reasonText }}</text>
    </view>
    <text class="settle-hint">点击任意位置返回主界面</text>
  </view>
</template>

<script setup lang="ts">
// pages/lost 战败结算页: 点击任意位置回到游戏主界面。
import { computed, ref } from 'vue'
import { takeBattleSettlement } from '../../services/battle'
import type { BattleSettlement } from '../../services/battle'

const settlement = ref<BattleSettlement | null>(takeBattleSettlement())

const reasonText = computed(() => {
  if (!settlement.value) return '再接再厉'
  if (settlement.value.reason === 'fled') return '成功脱离了战斗'
  if (settlement.value.reason === 'timeout') return `战至 ${settlement.value.rounds} 回合未分胜负`
  return `第 ${settlement.value.rounds} 回合战败`
})

function backHome() {
  // #ifdef H5
  window.location.hash = '#/pages/index/index'
  window.location.reload()
  // #endif
  // #ifndef H5
  uni.reLaunch({ url: '/pages/index/index' })
  // #endif
}
</script>

<style scoped>
.settle-screen { min-height: 100vh; display: flex; flex-direction: column; align-items: center; padding: 120rpx 60rpx 80rpx; box-sizing: border-box; }
.settle-screen.lost { background: linear-gradient(180deg, #14161f 0%, #1d1620 50%, #241219 100%); }

.settle-banner { border: 4rpx solid #4a4f63; background: linear-gradient(180deg, #101018, #0a0a10); border-radius: 12rpx; padding: 30rpx 100rpx; margin-bottom: 60rpx; }
.settle-banner-text { color: #8e6a6a; font-size: 88rpx; font-weight: 800; letter-spacing: 20rpx; }

.settle-panel { width: 100%; border: 2rpx solid #4a3a3a; border-radius: 12rpx; background: linear-gradient(180deg, #241a1a, #180f0f); padding: 40rpx 40rpx; display: flex; flex-direction: column; gap: 20rpx; }
.settle-group { color: #d8cfc0; font-size: 40rpx; font-weight: 700; }
.settle-line { color: #9a8f8f; font-size: 28rpx; }

.settle-hint { margin-top: 80rpx; color: #6f768a; font-size: 28rpx; }

/* H5 宽屏与其他页面保持一致: 限宽 750rpx 居中。 */
@media (min-width: 700px) {
  .settle-screen { max-width: 750rpx; margin: 0 auto; }
}
</style>
