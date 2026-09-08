<script setup lang="ts">
const slots = [
  { label: '头盔', name: '镔铁盔(绑)', action: '卸下', filled: true },
  { label: '顶饰', name: '', action: '装备', filled: false },
  { label: '武器', name: '宣化斧(绑)', action: '卸下', filled: true },
  { label: '护腕', name: '斑竹手环(绑)', action: '卸下', filled: true },
  { label: '铠甲', name: '赤铜甲(绑)', action: '卸下', filled: true },
  { label: '战靴', name: '', action: '装备', filled: false },
]

const stats = [
  { label: '气血', value: '1792/1792' },
  { label: '精力', value: '654/654' },
  { label: '攻击', value: '1963' },
  { label: '速度', value: '31' },
  { label: '防御', value: '442' },
  { label: '负重', value: '174/260' },
]

function goBack() { uni.navigateBack() }
</script>

<template>
  <view class="gear-screen">
    <view class="header">
      <view class="scene-bg"><view class="scene-roof"></view><view class="scene-water"></view></view>
      <text class="header-title">许昌</text>
    </view>
    <view class="sub">装备物品</view>

    <view class="body">
      <text class="my-gear">我的装备(负重174/260)</text>

      <view v-for="(slot, index) in slots" :key="index" class="slot-row">
        <text class="slot-label">{{ slot.label }}:</text>
        <text class="slot-name" :class="{ empty: !slot.filled }">{{ slot.name }}</text>
        <button class="slot-action" :class="{ empty: !slot.filled }">{{ slot.action }}</button>
      </view>

      <view class="dragon-decor">
        <view class="dragon-ring ring-outer"></view>
        <view class="dragon-ring ring-inner"></view>
        <view class="dragon-glyph"></view>
      </view>

      <view v-for="(stat, index) in stats" :key="index" class="stat-row">
        <text class="stat-label">{{ stat.label }}:</text>
        <text class="stat-value">{{ stat.value }}</text>
      </view>
    </view>

    <view class="footer">
      <button class="back-fab" @tap="goBack">返回</button>
    </view>
  </view>
</template>

<style scoped>
.gear-screen {
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

.body { position: relative; min-height: 1500rpx; margin: 0 26rpx; margin-top: 280rpx; padding: 30rpx 30rpx; border-radius: 8rpx 8rpx 20rpx 20rpx; background: radial-gradient(circle at 50% 40%, rgba(120,40,140,.3), transparent 55%), linear-gradient(180deg, #3a0848, #1f0530 70%); box-shadow: 0 0 0 4rpx #2b1a2f; }
.my-gear { display: block; margin-bottom: 30rpx; color: #ffe27a; font-size: 34rpx; font-weight: 900; }
.slot-row { display: flex; align-items: center; margin-bottom: 26rpx; }
.slot-label { width: 110rpx; color: #f0e6f6; font-size: 32rpx; }
.slot-name { flex: 1; color: #ff8fb0; font-size: 32rpx; }
.slot-name.empty { color: #8a6a9a; }
.slot-action { margin: 0; padding: 8rpx 24rpx; border: 4rpx solid #e0a8ff; border-radius: 8rpx; background: linear-gradient(#8a2ab0, #5a1a78); color: #fff; font-size: 28rpx; font-weight: 900; }
.slot-action.empty { background: linear-gradient(#2a3a52, #1d2a3e); border-color: #5a6b74; }
.slot-action::after { border: none; }

.dragon-decor { position: relative; width: 480rpx; height: 480rpx; margin: 40rpx auto; }
.dragon-ring { position: absolute; border: 6rpx solid rgba(90,120,200,.4); border-radius: 50%; }
.ring-outer { inset: 0; }
.ring-inner { inset: 70rpx; border-color: rgba(110,140,210,.32); }
.dragon-glyph { position: absolute; top: 50%; left: 50%; width: 200rpx; height: 230rpx; transform: translate(-50%, -50%); border-radius: 50% 50% 46% 46%; background: radial-gradient(circle at 50% 45%, rgba(90,140,230,.45), rgba(40,80,150,.18) 70%); box-shadow: 0 0 60rpx rgba(60,110,200,.3); }
.dragon-glyph::before { content: ''; position: absolute; inset: 24rpx; border: 10rpx solid rgba(100,150,230,.38); border-radius: 50%; }

.stat-row { margin-bottom: 26rpx; }
.stat-label { color: #7ce0ff; font-size: 32rpx; }
.stat-value { color: #fff; font-size: 32rpx; font-weight: 900; }

.footer { position: fixed; right: 0; bottom: 30rpx; left: 0; display: flex; justify-content: flex-end; padding: 0 30rpx; box-sizing: border-box; }
.back-fab { margin: 0; padding: 14rpx 44rpx; border: 4rpx solid #f0c14a; border-radius: 40rpx; background: linear-gradient(#e79b1c, #b0630d); color: #fff7d8; font-size: 32rpx; font-weight: 900; }
.back-fab::after { border: none; }
@media (min-width: 700px) { .gear-screen { max-width: 750rpx; margin: 0 auto; } }
</style>
