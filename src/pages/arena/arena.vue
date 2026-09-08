<script setup lang="ts">
interface ArenaEvent {
  name: string
  desc: string
  badge: 'red' | 'purple'
}

const events: ArenaEvent[] = [
  { name: '赛季制排位赛', desc: '距结束还有:1小时17分7秒', badge: 'red' },
  { name: '天下第一比武大会', desc: '距结束还有:1小时17分7秒', badge: 'red' },
  { name: '进入派战资格赛', desc: '周一至周五,每天20-21点', badge: 'purple' },
  { name: '进入个人斗将', desc: '每周三、五的21-22点比赛', badge: 'purple' },
  { name: '进入帮派大战', desc: '距出对战表还有:2天23小时47分7秒', badge: 'purple' },
  { name: '进入赤壁大战', desc: '每周一的21-22点比赛', badge: 'purple' },
  { name: '跨区帮派战', desc: '隔月第一天比赛', badge: 'purple' },
  { name: '甲级S16天下第一比武大会', desc: '距开始还有:26天23小时17分7秒', badge: 'purple' },
]

function goBack() { uni.navigateBack() }
</script>

<template>
  <view class="arena-screen">
    <view class="arena-header">
      <view class="scene-bg"><view class="scene-roof"></view><view class="scene-water"></view></view>
      <text class="header-title">许昌</text>
    </view>
    <view class="arena-sub">擂台</view>

    <view class="arena-body">
      <view v-for="(ev, index) in events" :key="index" class="arena-item">
        <view class="arena-badge" :class="'badge-' + ev.badge">{{ ev.name }}</view>
        <text class="arena-desc">{{ ev.desc }}</text>
      </view>
    </view>

    <view class="arena-footer">
      <button class="back-fab" @tap="goBack">返回</button>
    </view>
  </view>
</template>

<style scoped>
.arena-screen {
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
.arena-header { position: relative; height: 180rpx; overflow: hidden; background: linear-gradient(180deg, #0a0d16, #0b1220); }
.scene-bg { position: absolute; top: 0; left: 0; width: 100%; height: 120rpx; opacity: .9; background: linear-gradient(#3c86c8 0 30%, #4f8f9a 31% 60%, #17242c 61%); }
.scene-roof { position: absolute; bottom: 6rpx; left: 30rpx; width: 220rpx; height: 40rpx; border-radius: 40% 40% 0 0; background: #7c4a2c; }
.scene-water { position: absolute; bottom: 10rpx; right: 40rpx; width: 260rpx; height: 24rpx; border-radius: 50%; background: #18c2d6; }
.header-title { position: absolute; top: 120rpx; left: 0; width: 100%; color: #fff; font-size: 48rpx; font-weight: 900; text-align: center; text-shadow: 3rpx 3rpx #111; }
.arena-sub { position: absolute; top: 190rpx; left: 0; width: 100%; color: #ff3b2f; font-size: 46rpx; font-weight: 900; text-align: center; text-shadow: 0 0 10rpx rgba(255,59,47,.7); }

.arena-body { position: relative; min-height: 1500rpx; margin: 0 30rpx; margin-top: 280rpx; padding: 40rpx 30rpx; border-radius: 8rpx 8rpx 20rpx 20rpx; background: radial-gradient(circle at 50% 40%, rgba(120,40,140,.35), transparent 55%), linear-gradient(180deg, #3a0848, #1f0530 70%); box-shadow: 0 0 0 4rpx #2b1a2f; }
.arena-item { margin-bottom: 34rpx; }
.arena-badge { display: inline-block; padding: 14rpx 30rpx; border-radius: 10rpx; color: #fff; font-size: 32rpx; font-weight: 900; }
.badge-red { border: 4rpx solid #ff8a5a; background: linear-gradient(#a81010, #6f0608); }
.badge-purple { border: 4rpx solid #e07aff; background: linear-gradient(#7a1a9c, #4c0f66); }
.arena-desc { display: block; margin-top: 20rpx; color: #f0e6f6; font-size: 34rpx; }

.arena-footer { position: fixed; right: 0; bottom: 30rpx; left: 0; display: flex; justify-content: flex-end; padding: 0 30rpx; box-sizing: border-box; }
.back-fab { margin: 0; padding: 14rpx 44rpx; border: 4rpx solid #f0c14a; border-radius: 40rpx; background: linear-gradient(#e79b1c, #b0630d); color: #fff7d8; font-size: 32rpx; font-weight: 900; }
.back-fab::after { border: none; }
@media (min-width: 700px) { .arena-screen { max-width: 750rpx; margin: 0 auto; } }
</style>
