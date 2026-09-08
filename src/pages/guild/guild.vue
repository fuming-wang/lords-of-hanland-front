<script setup lang="ts">
import { ref } from 'vue'

type CatTab = 'player' | 'guild' | 'vice' | 'resist'
type SortTab = 'fame' | 'vitality' | 'people'

const catTabs: { key: CatTab; label: string }[] = [
  { key: 'player', label: '玩家' },
  { key: 'guild', label: '帮派' },
  { key: 'vice', label: '副将' },
  { key: 'resist', label: '抗性' },
]
const sortTabs: { key: SortTab; label: string }[] = [
  { key: 'fame', label: '声望' },
  { key: 'vitality', label: '活力' },
  { key: 'people', label: '人数' },
]

const activeCat = ref<CatTab>('guild')
const activeSort = ref<SortTab>('fame')

const boards = [
  { rank: 1, name: '剑宗', value: '120', desc: '帮主wdca999, 不定时发红包在群', color: 'gold' },
  { rank: 2, name: '长安阁', value: '100', desc: 'V加Dhuahai77邀请', color: 'purple' },
  { rank: 3, name: '拾光会', value: '70', desc: '裙:alovo0214', color: 'green' },
  { rank: 4, name: '双王会', value: '67', desc: '定区三转, 进君羊wang497069', color: 'plain' },
  { rank: 5, name: '公子阁', value: '67', desc: '在不在帮都可领体进群+: HXSGGZZ6', color: 'plain' },
  { rank: 6, name: '明月阁', value: '66', desc: '有兴趣的进群V: 15067123040', color: 'plain' },
  { rank: 7, name: '归雁楼', value: '59', desc: '定区养老, 进君羊+mcr20040427', color: 'plain' },
  { rank: 8, name: '几何楼', value: '55', desc: '进帮+15252435750', color: 'plain' },
]

function goBack() { uni.navigateBack() }
function pickCat(k: CatTab) { activeCat.value = k }
function pickSort(k: SortTab) { activeSort.value = k }
</script>

<template>
  <view class="board-screen">
    <view class="board-header">
      <view class="banner-area">
        <view class="guild-banner banner-left">
          <text class="banner-char">长</text>
          <text class="banner-tag">长安阁</text>
          <view class="banner-stand"></view>
        </view>
        <view class="guild-banner banner-mid">
          <text class="banner-char">剑</text>
          <text class="banner-tag">剑宗</text>
          <view class="banner-stand"></view>
        </view>
        <view class="guild-banner banner-mid2">
          <text class="banner-char">剑</text>
          <text class="banner-tag">剑宗</text>
          <view class="banner-stand"></view>
        </view>
        <view class="guild-banner banner-right">
          <text class="banner-char">拾</text>
          <text class="banner-tag">拾光会</text>
          <view class="banner-stand"></view>
        </view>
      </view>
      <text class="board-title">排行榜</text>
    </view>

    <view class="cat-tabs">
      <button
        v-for="tab in catTabs"
        :key="tab.key"
        class="cat-tab"
        :class="{ active: activeCat === tab.key }"
        @tap="pickCat(tab.key)"
      >{{ tab.label }}</button>
      <view class="search-icon">🔍</view>
    </view>

    <view class="sort-tabs">
      <button
        v-for="tab in sortTabs"
        :key="tab.key"
        class="sort-tab"
        :class="{ active: activeSort === tab.key }"
        @tap="pickSort(tab.key)"
      >{{ tab.label }}</button>
    </view>

    <view class="board-list">
      <view v-for="item in boards" :key="item.rank" class="board-row" :class="item.color">
        <view class="rank-badge" :class="'rank-' + item.rank">{{ item.rank }}</view>
        <view class="row-info">
          <view class="row-top">
            <text class="row-name">{{ item.name }}</text>
            <text class="row-value">{{ activeSort === 'fame' ? '声望:' : activeSort === 'vitality' ? '活力:' : '人数:' }}{{ activeSort === 'fame' ? item.value : item.value }}</text>
          </view>
          <text class="row-desc">{{ item.desc }}</text>
        </view>
        <button class="join-btn">+</button>
      </view>
      <view class="board-tip">您还未加入帮派, 选择一个申请加入吧!</view>
    </view>

    <view class="board-footer">
      <button class="back-fab" @tap="goBack">返回</button>
    </view>
  </view>
</template>

<style scoped>
.board-screen {
  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
  background: #0a1122;
  color: #f6efd8;
  font-size: 28rpx;
  padding-bottom: 140rpx;
  box-sizing: border-box;
}
.board-header {
  position: relative;
  height: 520rpx;
  overflow: hidden;
  background: radial-gradient(circle at 50% 30%, #5a3a1e, #2a1a0c 60%, #120a05);
}
.board-title {
  position: absolute;
  top: 20rpx;
  left: 0;
  width: 100%;
  color: #ffe27a;
  font-size: 60rpx;
  font-weight: 900;
  letter-spacing: 10rpx;
  text-align: center;
  text-shadow: 3rpx 3rpx #6f2f00;
}
.banner-area { position: absolute; top: 90rpx; left: 0; width: 100%; height: 380rpx; }
.guild-banner { position: absolute; text-align: center; filter: drop-shadow(0 12rpx 12rpx rgba(0,0,0,.5)); }
.banner-char { display: block; color: #fff; font-size: 80rpx; font-weight: 900; }
.banner-tag { display: inline-block; padding: 6rpx 14rpx; margin-top: 10rpx; background: rgba(0,0,0,.4); color: #ffe27a; font-size: 24rpx; transform: rotate(-90deg); }
.banner-stand { width: 200rpx; height: 20rpx; margin: 20rpx auto 0; background: radial-gradient(circle, #d8a53c, #6f4a12); border-radius: 50%; }
.banner-left { left: 20rpx; width: 240rpx; transform: rotate(-6deg); }
.banner-mid { left: 50%; width: 280rpx; transform: translateX(-50%) scale(1.2); }
.banner-mid2 { left: 40%; width: 260rpx; transform: translateX(-50%) scale(1.1); }
.banner-right { right: 20rpx; width: 240rpx; transform: rotate(6deg); }

.cat-tabs { display: flex; align-items: center; gap: 8rpx; padding: 18rpx 22rpx; background: linear-gradient(180deg, #23324a, #16222f); }
.cat-tab { flex: 1; margin: 0; padding: 20rpx 0; border: 4rpx solid #3c5a7e; border-radius: 10rpx; background: linear-gradient(180deg, #7d3340, #4c1a28); color: #f0e6cf; font-size: 32rpx; font-weight: 900; }
.cat-tab.active { border-color: #63c7ff; background: linear-gradient(180deg, #1f8fd0, #0d5a9c); color: #fff; }
.cat-tab::after { border: none; }
.search-icon { font-size: 40rpx; color: #ffd84a; }

.sort-tabs { display: flex; gap: 8rpx; padding: 14rpx 60rpx; background: linear-gradient(90deg, #3a2416, #5a3a1e 50%, #3a2416); border-bottom: 4rpx solid #6f4a12; }
.sort-tab { flex: 1; margin: 0; padding: 16rpx 0; border-radius: 18rpx; background: linear-gradient(#7a4a1a, #5c2e0a); color: #ffe27a; font-size: 32rpx; font-weight: 900; }
.sort-tab.active { background: linear-gradient(#a85a12, #6f2f00); color: #fff; box-shadow: 0 0 14rpx rgba(255,160,50,.5); }
.sort-tab::after { border: none; }

.board-list { margin: 10rpx 16rpx; padding: 16rpx 0; }
.board-row { display: flex; align-items: center; margin-bottom: 16rpx; padding: 18rpx 20rpx; }
.board-row.gold { background: linear-gradient(90deg, #6a4a8e, #4a2f66); }
.board-row.purple { background: linear-gradient(90deg, #8e2a4a, #5c1a30); }
.board-row.green { background: linear-gradient(90deg, #2a7a5c, #175c42); }
.board-row.plain { background: linear-gradient(90deg, #2a3a52, #1d2a3e); }
.rank-badge { display: flex; align-items: center; justify-content: center; width: 58rpx; height: 72rpx; color: #ffe27a; font-size: 40rpx; font-weight: 900; text-shadow: 2rpx 2rpx #5a2600; }
.rank-badge.rank-1 { color: #ffd633; }
.rank-badge.rank-2 { color: #d8d8d8; }
.rank-badge.rank-3 { color: #e08a3a; }
.row-info { flex: 1; padding: 0 20rpx; }
.row-top { display: flex; justify-content: space-between; }
.row-name { color: #fff; font-size: 34rpx; font-weight: 900; }
.row-value { color: #7ce0ff; font-size: 30rpx; }
.row-desc { display: block; margin-top: 8rpx; color: #cfe0ea; font-size: 26rpx; }
.join-btn { margin: 0; width: 60rpx; height: 60rpx; border: 5rpx solid #f0c14a; border-radius: 50%; background: linear-gradient(#ffe4a0, #e7a51f); color: #6f2f00; font-size: 44rpx; font-weight: 900; }
.join-btn::after { border: none; }
.board-tip { margin-top: 20rpx; padding: 26rpx 20rpx; border-radius: 8rpx; background: linear-gradient(90deg, #4c1a80, #7a2a9c); color: #fff; font-size: 30rpx; text-align: center; }

.board-footer { position: fixed; right: 0; bottom: 30rpx; left: 0; display: flex; justify-content: flex-end; padding: 0 30rpx; box-sizing: border-box; }
.back-fab { margin: 0; padding: 14rpx 44rpx; border: 4rpx solid #f0c14a; border-radius: 40rpx; background: linear-gradient(#e79b1c, #b0630d); color: #fff7d8; font-size: 32rpx; font-weight: 900; }
.back-fab::after { border: none; }
@media (min-width: 700px) { .board-screen { max-width: 750rpx; margin: 0 auto; } }
</style>
