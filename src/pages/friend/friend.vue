<script setup lang="ts">
import { ref } from 'vue'

type FriendTab = 'recent' | 'friend' | 'family' | 'bond' | 'black' | 'search'
const friendTabs: { key: FriendTab; label: string }[] = [
  { key: 'recent', label: '最近' },
  { key: 'friend', label: '好友' },
  { key: 'family', label: '亲人' },
  { key: 'bond', label: '羁绊' },
  { key: 'black', label: '黑名单' },
  { key: 'search', label: '搜索' },
]
const activeTab = ref<FriendTab>('recent')
const emptyText: Record<FriendTab, string> = {
  recent: '暂无最近联系人',
  friend: '暂无好友',
  family: '暂无亲人',
  bond: '暂无羁绊',
  black: '暂无黑名单',
  search: '请输入玩家名称搜索',
}

function goBack() { uni.navigateBack() }
</script>

<template>
  <view class="friend-screen">
    <view class="friend-header">
      <view class="banner-art">
        <view class="banner-sun"></view>
        <view class="banner-figure"></view>
        <view class="banner-ribbon"></view>
      </view>
      <text class="friend-title">好友</text>
      <view class="cs-card">
        <view class="cs-icon">✉</view>
        <text class="cs-label">联系客服</text>
      </view>
    </view>

    <view class="friend-tabs">
      <button
        v-for="tab in friendTabs"
        :key="tab.key"
        class="friend-tab"
        :class="{ active: activeTab === tab.key }"
        @tap="activeTab = tab.key"
      >{{ tab.label }}</button>
    </view>

    <view class="friend-body">
      <text class="empty-tip">{{ emptyText[activeTab] }}</text>
    </view>

    <view class="friend-footer">
      <button class="back-fab" @tap="goBack">返回</button>
    </view>
  </view>
</template>

<style scoped>
.friend-screen {
  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
  background: linear-gradient(180deg, #1e2a34, #0e1a24 70%);
  color: #f6efd8;
  font-size: 28rpx;
  padding-bottom: 140rpx;
  box-sizing: border-box;
}
.friend-header {
  position: relative;
  height: 560rpx;
  overflow: hidden;
  background: linear-gradient(180deg, #6a5a3a, #2a1f14 75%, #12100c);
}
.banner-art { position: absolute; top: 0; left: 0; width: 100%; height: 520rpx; }
.banner-sun { position: absolute; top: 30rpx; right: 120rpx; width: 300rpx; height: 300rpx; border-radius: 50%; background: radial-gradient(circle, rgba(255,220,140,.9), rgba(255,150,40,.3) 60%, transparent 75%); }
.banner-figure { position: absolute; top: 80rpx; right: 130rpx; width: 340rpx; height: 440rpx; border-radius: 50% 50% 40% 40%; background: linear-gradient(180deg, #c04a4a, #7a2030 60%, #40131c); }
.banner-ribbon { position: absolute; top: 60rpx; right: 90rpx; width: 420rpx; height: 60rpx; background: linear-gradient(90deg, #ffd0e0, #e07a9a); border-radius: 50%; transform: rotate(-10deg); }
.friend-title { position: absolute; top: 30rpx; left: 0; width: 100%; color: #ffe27a; font-size: 60rpx; font-weight: 900; text-align: center; text-shadow: 3rpx 3rpx #6f2f00; }
.cs-card { position: absolute; top: 240rpx; left: 40rpx; display: flex; flex-direction: column; align-items: center; }
.cs-icon { display: flex; align-items: center; justify-content: center; width: 90rpx; height: 90rpx; border-radius: 50%; background: radial-gradient(circle, #ffe27a, #e07a2a); color: #7a4a00; font-size: 44rpx; }
.cs-label { margin-top: 8rpx; color: #ffe27a; font-size: 26rpx; font-weight: 900; text-shadow: 2rpx 2rpx #6f2f00; }

.friend-tabs { display: flex; gap: 8rpx; padding: 16rpx 16rpx; background: linear-gradient(180deg, #2a3a44, #1a2a34); }
.friend-tab { flex: 1; margin: 0; padding: 18rpx 0; border: 4rpx solid #3c5a6e; border-radius: 10rpx; background: linear-gradient(180deg, #2a5a7e, #1a3a54); color: #eaf3f8; font-size: 30rpx; font-weight: 900; }
.friend-tab.active { border-color: #63c7ff; background: linear-gradient(180deg, #1f8fd0, #0d5a9c); color: #fff; }
.friend-tab::after { border: none; }

.friend-body { min-height: 1150rpx; margin: 20rpx 16rpx; border-radius: 12rpx; background: linear-gradient(180deg, #123a4e, #0a2030); box-shadow: inset 0 0 0 4rpx rgba(90,160,190,.25); }
.empty-tip { display: block; padding: 40rpx; color: #7ce0ff; font-size: 36rpx; text-align: center; }

.friend-footer { position: fixed; right: 0; bottom: 30rpx; left: 0; display: flex; justify-content: flex-end; padding: 0 30rpx; box-sizing: border-box; }
.back-fab { margin: 0; padding: 14rpx 44rpx; border: 4rpx solid #f0c14a; border-radius: 40rpx; background: linear-gradient(#e79b1c, #b0630d); color: #fff7d8; font-size: 32rpx; font-weight: 900; }
.back-fab::after { border: none; }
@media (min-width: 700px) { .friend-screen { max-width: 750rpx; margin: 0 auto; } }
</style>
