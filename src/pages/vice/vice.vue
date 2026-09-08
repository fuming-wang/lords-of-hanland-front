<script setup lang="ts">
const generals = [
  { name: '(8级)打手.武' },
  { name: '(20级)兵长.武' },
  { name: '(14级)军官.武' },
  { name: '(14级)军官.武' },
  { name: '(0级)大乔.异' },
  { name: '(30级)军官.武' },
]

function goBack() { uni.navigateBack() }
</script>

<template>
  <view class="vice-screen">
    <view class="header">
      <view class="scene-bg"><view class="scene-roof"></view><view class="scene-water"></view></view>
      <text class="header-title">许昌</text>
    </view>
    <view class="sub">副将</view>

    <view class="body">
      <view class="action-row">
        <button class="act-btn">名将录</button>
        <button class="act-btn">将魂</button>
        <button class="act-btn">一键奖赏</button>
      </view>

      <text class="combat">当前战斗力:0</text>

      <view v-for="(g, index) in generals" :key="index" class="gen-row">
        <text class="gen-name">{{ g.name }}</text>
        <button class="war-btn">战</button>
      </view>

      <view class="adv-banner">获取能学技能的历史副将</view>
    </view>

    <view class="footer">
      <button class="back-fab" @tap="goBack">返回</button>
    </view>
  </view>
</template>

<style scoped>
.vice-screen {
  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
  background: #05080f;
  color: #f6efd8;
  font-size: 28rpx;
  padding-bottom: 140rpx;
  box-sizing: border-box;
}
.header { position: relative; height: 180rpx; overflow: hidden; background: linear-gradient(180deg, #0a0d16, #0b1220); }
.scene-bg { position: absolute; top: 0; left: 0; width: 100%; height: 120rpx; opacity: .9; background: linear-gradient(#3c86c8 0 30%, #4f8f9a 31% 60%, #17242c 61%); }
.scene-roof { position: absolute; bottom: 6rpx; left: 30rpx; width: 220rpx; height: 40rpx; border-radius: 40% 40% 0 0; background: #7c4a2c; }
.scene-water { position: absolute; bottom: 10rpx; right: 40rpx; width: 260rpx; height: 24rpx; border-radius: 50%; background: #18c2d6; }
.header-title { position: absolute; top: 120rpx; left: 0; width: 100%; color: #fff; font-size: 48rpx; font-weight: 900; text-align: center; text-shadow: 3rpx 3rpx #111; }
.sub { position: absolute; top: 190rpx; left: 0; width: 100%; color: #ff3b2f; font-size: 46rpx; font-weight: 900; text-align: center; text-shadow: 0 0 10rpx rgba(255,59,47,.7); }

.body { position: relative; min-height: 1500rpx; margin: 0 26rpx; margin-top: 280rpx; padding: 30rpx 24rpx; border-radius: 8rpx 8rpx 20rpx 20rpx; background: radial-gradient(circle at 50% 40%, rgba(120,40,140,.35), transparent 55%), linear-gradient(180deg, #3a0848, #1f0530 70%); box-shadow: 0 0 0 4rpx #2b1a2f; }
.action-row { display: flex; justify-content: space-between; }
.act-btn { flex: 1; margin: 0; padding: 14rpx 0; border: 4rpx solid #ff5a7a; border-radius: 10rpx; background: linear-gradient(#c0201c, #7a0d10); color: #ffe27a; font-size: 30rpx; font-weight: 900; }
.act-btn + .act-btn { margin-left: 16rpx; }
.act-btn::after { border: none; }
.combat { display: block; margin: 34rpx 0; color: #f0e6f6; font-size: 34rpx; }
.gen-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14rpx; padding: 22rpx 22rpx; border-radius: 8rpx; background: linear-gradient(90deg, #5a1a6a, #4a125a); }
.gen-name { color: #f0e6f6; font-size: 34rpx; }
.war-btn { margin: 0; padding: 8rpx 30rpx; border: 4rpx solid #e0a8ff; border-radius: 24rpx; background: linear-gradient(#8a2ab0, #5a1a78); color: #fff; font-size: 30rpx; font-weight: 900; }
.war-btn::after { border: none; }
.adv-banner { margin-top: 26rpx; padding: 18rpx 22rpx; border-radius: 8rpx; background: linear-gradient(90deg, #6a1a7a, #7a1f8a); color: #f0e6f6; font-size: 32rpx; }

.footer { position: fixed; right: 0; bottom: 30rpx; left: 0; display: flex; justify-content: flex-end; padding: 0 30rpx; box-sizing: border-box; }
.back-fab { margin: 0; padding: 14rpx 44rpx; border: 4rpx solid #f0c14a; border-radius: 40rpx; background: linear-gradient(#e79b1c, #b0630d); color: #fff7d8; font-size: 32rpx; font-weight: 900; }
.back-fab::after { border: none; }
@media (min-width: 700px) { .vice-screen { max-width: 750rpx; margin: 0 auto; } }
</style>
