<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getGameSummary, type GameSummary } from '../../services/game'
import { getPlatform } from '../../platform'

const loading = ref(true)
const summary = ref<GameSummary>()
const platform = getPlatform()

onMounted(async () => {
  try {
    summary.value = await getGameSummary()
  } finally {
    loading.value = false
  }
})

function startGame() {
  uni.showToast({
    title: '主城正在准备中',
    icon: 'none',
  })
}
</script>

<template>
  <view class="page-shell">
    <view class="hero-card">
      <view class="eyebrow">LORDS OF HANLAND</view>
      <view class="title">汉土领主</view>
      <view class="subtitle">在乱世之中，经营你的城池，结盟或征服四方。</view>

      <view class="hero-actions">
        <button class="primary-button" @click="startGame">进入主城</button>
        <view class="platform-badge">{{ platform }}</view>
      </view>
    </view>

    <view class="section-title">领地概览</view>
    <view v-if="loading" class="loading-card">正在读取领地信息…</view>
    <view v-else class="stats-grid">
      <view class="stat-card">
        <view class="stat-value">{{ summary?.season }}</view>
        <view class="stat-label">当前纪年</view>
      </view>
      <view class="stat-card">
        <view class="stat-value">{{ summary?.territoryCount }}</view>
        <view class="stat-label">控制领地</view>
      </view>
      <view class="stat-card">
        <view class="stat-value">{{ summary?.resourceCount }}</view>
        <view class="stat-label">库存资源</view>
      </view>
    </view>

    <view class="notice-card">
      <view class="notice-title">跨端基座已就绪</view>
      <view class="notice-text">接下来可以接入登录、地图、战斗和实时通信模块。</view>
    </view>
  </view>
</template>

<style scoped>
.page-shell {
  min-height: 100vh;
  padding: 48rpx;
  box-sizing: border-box;
  background: var(--color-bg);
  color: var(--color-text);
}

.hero-card {
  padding: 64rpx 48rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.12);
  border-radius: 32rpx;
  background: linear-gradient(135deg, #1e293b, #172554 60%, #312e81);
  box-shadow: 0 24rpx 60rpx rgba(0, 0, 0, 0.24);
}

.eyebrow {
  color: #93c5fd;
  font-size: 22rpx;
  letter-spacing: 4rpx;
}

.title {
  margin-top: 20rpx;
  color: #f8fafc;
  font-size: 72rpx;
  font-weight: 800;
  letter-spacing: 8rpx;
}

.subtitle {
  max-width: 620rpx;
  margin-top: 24rpx;
  color: #cbd5e1;
  font-size: 28rpx;
  line-height: 1.7;
}

.hero-actions {
  display: flex;
  align-items: center;
  gap: 24rpx;
  margin-top: 48rpx;
}

.primary-button {
  margin: 0;
  padding: 0 40rpx;
  border-radius: 999rpx;
  background: var(--color-accent);
  color: #fff;
  font-size: 28rpx;
  font-weight: 700;
}

.primary-button::after {
  border: none;
}

.platform-badge {
  color: #bfdbfe;
  font-size: 24rpx;
}

.section-title {
  margin: 56rpx 0 24rpx;
  color: #e2e8f0;
  font-size: 34rpx;
  font-weight: 700;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20rpx;
}

.stat-card,
.loading-card,
.notice-card {
  padding: 28rpx;
  border: 1rpx solid var(--color-border);
  border-radius: 24rpx;
  background: var(--color-card);
}

.stat-value {
  overflow: hidden;
  color: #f8fafc;
  font-size: 30rpx;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stat-label,
.loading-card,
.notice-text {
  margin-top: 12rpx;
  color: var(--color-muted);
  font-size: 24rpx;
}

.notice-card {
  margin-top: 24rpx;
}

.notice-title {
  color: #c4b5fd;
  font-size: 28rpx;
  font-weight: 700;
}

@media (max-width: 520px) {
  .page-shell {
    padding: 28rpx;
  }

  .hero-card {
    padding: 48rpx 32rpx;
  }

  .title {
    font-size: 58rpx;
  }
}
</style>
