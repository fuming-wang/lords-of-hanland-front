<script setup lang="ts">
const mailRows = [
  { label: '未读邮包(0)' },
  { label: '已读邮包(0)' },
  { label: '已发邮包(0)' },
]

function goBack() { uni.navigateBack() }
</script>

<template>
  <view class="mail-screen">
    <view class="header">
      <view class="scene-bg"><view class="scene-roof"></view><view class="scene-water"></view></view>
      <text class="header-title">许昌</text>
    </view>
    <view class="sub">邮件</view>

    <view class="body">
      <view class="banner">三国信使为您提供服务</view>

      <view class="row">
        <text class="row-label">新邮包</text>
      </view>
      <view v-for="(row, index) in mailRows" :key="index" class="row box">
        <text class="row-label">{{ row.label }}</text>
      </view>

      <view class="dragon-decor">
        <view class="dragon-ring ring-outer"></view>
        <view class="dragon-ring ring-inner"></view>
        <view class="dragon-glyph"></view>
      </view>
    </view>

    <view class="footer">
      <button class="back-fab" @tap="goBack">返回</button>
    </view>
  </view>
</template>

<style scoped>
.mail-screen {
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
.banner { padding: 20rpx 24rpx; border-radius: 8rpx; background: linear-gradient(90deg, #5a1a6a, #4a125a); color: #f0e6f6; font-size: 32rpx; }
.row { margin-top: 26rpx; padding: 0 8rpx; }
.row-label { color: #f0e6f6; font-size: 34rpx; }
.row.box { padding: 20rpx 22rpx; border-radius: 8rpx; background: linear-gradient(90deg, #5a1a6a, #4a125a); }

.dragon-decor { position: relative; width: 560rpx; height: 560rpx; margin: 80rpx auto 0; }
.dragon-ring { position: absolute; border: 6rpx solid rgba(90,120,200,.4); border-radius: 50%; }
.ring-outer { inset: 0; }
.ring-inner { inset: 80rpx; border-color: rgba(110,140,210,.32); }
.dragon-glyph { position: absolute; top: 50%; left: 50%; width: 240rpx; height: 270rpx; transform: translate(-50%, -50%); border-radius: 50% 50% 46% 46%; background: radial-gradient(circle at 50% 45%, rgba(90,140,230,.45), rgba(40,80,150,.18) 70%); box-shadow: 0 0 60rpx rgba(60,110,200,.3); }
.dragon-glyph::before { content: ''; position: absolute; inset: 28rpx; border: 10rpx solid rgba(100,150,230,.38); border-radius: 50%; }

.footer { position: fixed; right: 0; bottom: 30rpx; left: 0; display: flex; justify-content: flex-end; padding: 0 30rpx; box-sizing: border-box; }
.back-fab { margin: 0; padding: 14rpx 44rpx; border: 4rpx solid #f0c14a; border-radius: 40rpx; background: linear-gradient(#e79b1c, #b0630d); color: #fff7d8; font-size: 32rpx; font-weight: 900; }
.back-fab::after { border: none; }
@media (min-width: 700px) { .mail-screen { max-width: 750rpx; margin: 0 auto; } }
</style>
