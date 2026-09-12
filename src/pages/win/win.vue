<template>
  <view class="settle-screen win" @tap="backHome">
    <view class="settle-banner">
      <text class="settle-banner-text">胜 利</text>
    </view>
    <view class="settle-panel">
      <text class="settle-group">{{ settlement?.group ?? '战斗' }}</text>
      <text class="settle-line" v-if="settlement">历经 {{ settlement.rounds }} 回合</text>
      <view class="settle-rewards" v-if="settlement">
        <text class="settle-reward" v-if="settlement.exp_reward > 0">经验 +{{ settlement.exp_reward }}</text>
        <text class="settle-reward" v-if="settlement.silver_drop > 0">银两 +{{ settlement.silver_drop }}</text>
        <text class="settle-reward" v-if="settlement.gold_drop > 0">金锭 +{{ settlement.gold_drop }}</text>
      </view>
    </view>
    <text class="settle-hint">点击任意位置返回主界面</text>
  </view>
</template>

<script setup lang="ts">
// pages/win 胜利结算页: 点击任意位置回到游戏主界面。
// 结算数据由战斗页通过 services/battle 的内存快照传入。
import { ref } from 'vue'
import { takeBattleSettlement } from '../../services/battle'
import type { BattleSettlement } from '../../services/battle'

const settlement = ref<BattleSettlement | null>(takeBattleSettlement())

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
.settle-screen.win { background: linear-gradient(180deg, #3a2c14 0%, #6b4a1e 45%, #8a5f26 100%); }

.settle-banner { border: 4rpx solid #e8c56a; background: linear-gradient(180deg, #2a0d0d, #180606); border-radius: 12rpx; padding: 30rpx 100rpx; margin-bottom: 60rpx; }
.settle-banner-text { color: #ff5a2e; font-size: 88rpx; font-weight: 800; letter-spacing: 20rpx; text-shadow: 0 0 24rpx rgba(255, 120, 40, 0.8); }

.settle-panel { width: 100%; border: 2rpx solid #a8763a; border-radius: 12rpx; background: linear-gradient(180deg, #b3341f, #8f2314); padding: 40rpx 40rpx; display: flex; flex-direction: column; gap: 20rpx; }
.settle-group { color: #ffe9b8; font-size: 40rpx; font-weight: 700; }
.settle-line { color: #ffd9a0; font-size: 28rpx; }
.settle-rewards { display: flex; flex-direction: column; gap: 10rpx; margin-top: 12rpx; }
.settle-reward { color: #ffe066; font-size: 32rpx; font-weight: 600; }

.settle-hint { margin-top: 80rpx; color: #ffd9a0; font-size: 28rpx; }

/* H5 宽屏与其他页面保持一致: 限宽 750rpx 居中。 */
@media (min-width: 700px) {
  .settle-screen { max-width: 750rpx; margin: 0 auto; }
}
</style>
