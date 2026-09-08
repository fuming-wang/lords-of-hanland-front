<script setup lang="ts">
const tasks = [
  { text: '(主)逐虎驱狼', type: 'main' },
  { text: '称号任务', type: 'plain' },
  { text: '小乔流水', type: 'plain' },
  { text: '赏金猎人', type: 'plain' },
  { text: '奉迎夫人', type: 'plain' },
  { text: '图穷匕见', type: 'plain' },
  { text: '成就任务', type: 'plain' },
]

function goBack() { uni.navigateBack() }
</script>

<template>
  <view class="task-screen">
    <view class="task-header">
      <view class="scene-bg"><view class="scene-roof"></view><view class="scene-water"></view></view>
      <text class="header-title">许昌</text>
    </view>
    <view class="task-sub">剧情任务</view>

    <view class="task-body">
      <view v-for="(task, index) in tasks" :key="index" class="task-row" :class="{ main: task.type === 'main' }">
        <text class="task-text">{{ task.text }}</text>
      </view>
    </view>

    <view class="task-footer">
      <button class="back-fab" @tap="goBack">返回</button>
    </view>
  </view>
</template>

<style scoped>
.task-screen {
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
.task-header { position: relative; height: 180rpx; overflow: hidden; background: linear-gradient(180deg, #0a0d16, #0b1220); }
.scene-bg { position: absolute; top: 0; left: 0; width: 100%; height: 120rpx; opacity: .9; background: linear-gradient(#3c86c8 0 30%, #4f8f9a 31% 60%, #17242c 61%); }
.scene-roof { position: absolute; bottom: 6rpx; left: 30rpx; width: 220rpx; height: 40rpx; border-radius: 40% 40% 0 0; background: #7c4a2c; }
.scene-water { position: absolute; bottom: 10rpx; right: 40rpx; width: 260rpx; height: 24rpx; border-radius: 50%; background: #18c2d6; }
.header-title { position: absolute; top: 120rpx; left: 0; width: 100%; color: #fff; font-size: 48rpx; font-weight: 900; text-align: center; text-shadow: 3rpx 3rpx #111; }
.task-sub { position: absolute; top: 190rpx; left: 0; width: 100%; color: #ff3b2f; font-size: 46rpx; font-weight: 900; text-align: center; text-shadow: 0 0 10rpx rgba(255,59,47,.7); }

.task-body { position: relative; min-height: 1500rpx; margin: 0 30rpx; margin-top: 280rpx; padding: 40rpx 30rpx; border-radius: 8rpx 8rpx 20rpx 20rpx; background: radial-gradient(circle at 50% 40%, rgba(120,40,140,.35), transparent 55%), linear-gradient(180deg, #3a0848, #1f0530 70%); box-shadow: 0 0 0 4rpx #2b1a2f; }
.task-row { margin-bottom: 16rpx; padding: 26rpx 26rpx; border-radius: 8rpx; background: linear-gradient(90deg, #5a1f7a, #6a2a8a); }
.task-row.main { background: linear-gradient(90deg, #5a1a6a, #4a125a); }
.task-text { color: #f0e6f6; font-size: 34rpx; }

.task-footer { position: fixed; right: 0; bottom: 30rpx; left: 0; display: flex; justify-content: flex-end; padding: 0 30rpx; box-sizing: border-box; }
.back-fab { margin: 0; padding: 14rpx 44rpx; border: 4rpx solid #f0c14a; border-radius: 40rpx; background: linear-gradient(#e79b1c, #b0630d); color: #fff7d8; font-size: 32rpx; font-weight: 900; }
.back-fab::after { border: none; }
@media (min-width: 700px) { .task-screen { max-width: 750rpx; margin: 0 auto; } }
</style>
