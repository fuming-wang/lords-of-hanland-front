<script setup lang="ts">
import { ref } from 'vue'

type ShopTab = 'treasure' | 'book' | 'vice' | 'recruit'
const shopTabs: { key: ShopTab; label: string }[] = [
  { key: 'treasure', label: '宝物' },
  { key: 'book', label: '经验书' },
  { key: 'vice', label: '副将' },
  { key: 'recruit', label: '招贤' },
]
const activeShop = ref<ShopTab>('treasure')

const treasures = [
  '将军令50金砖',
  '大将军令280金砖',
  '护身符280金砖',
  '宝箱钥匙30金砖',
  '高级宝箱钥匙60金砖',
  '特级宝箱钥匙180金砖',
  '体力丹90金砖',
  '易容装980金砖',
  '铁锤60金砖',
  '银锤150金砖',
  '金锤280金砖',
  '诸子百家90金砖',
  '虎符90金砖',
  '短信卡*5888金砖',
]

function goBack() { uni.navigateBack() }
</script>

<template>
  <view class="shop-screen">
    <view class="shop-header">
      <view class="scene-bg"><view class="scene-roof"></view><view class="scene-water"></view></view>
      <text class="header-title">许昌</text>
    </view>
    <view class="shop-sub">购买宝物</view>

    <view class="shop-body">
      <view class="top-actions">
        <button class="gold-btn">获取金砖</button>
        <button class="service-btn">求助客服</button>
      </view>

      <view class="shop-tabs">
        <button
          v-for="tab in shopTabs"
          :key="tab.key"
          class="shop-tab"
          :class="{ active: activeShop === tab.key }"
          @tap="activeShop = tab.key"
        >{{ tab.label }}</button>
      </view>

      <view class="tab-divider"></view>

      <view v-for="(item, index) in treasures" :key="index" class="shop-row">
        <text class="shop-item">{{ item }}</text>
        <button class="buy-btn">购买</button>
      </view>
    </view>

    <view class="shop-footer">
      <button class="back-fab" @tap="goBack">返回</button>
    </view>
  </view>
</template>

<style scoped>
.shop-screen {
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
.shop-header { position: relative; height: 180rpx; overflow: hidden; background: linear-gradient(180deg, #0a0d16, #0b1220); }
.scene-bg { position: absolute; top: 0; left: 0; width: 100%; height: 120rpx; opacity: .9; background: linear-gradient(#3c86c8 0 30%, #4f8f9a 31% 60%, #17242c 61%); }
.scene-roof { position: absolute; bottom: 6rpx; left: 30rpx; width: 220rpx; height: 40rpx; border-radius: 40% 40% 0 0; background: #7c4a2c; }
.scene-water { position: absolute; bottom: 10rpx; right: 40rpx; width: 260rpx; height: 24rpx; border-radius: 50%; background: #18c2d6; }
.header-title { position: absolute; top: 120rpx; left: 0; width: 100%; color: #fff; font-size: 48rpx; font-weight: 900; text-align: center; text-shadow: 3rpx 3rpx #111; }
.shop-sub { position: absolute; top: 190rpx; left: 0; width: 100%; color: #ff3b2f; font-size: 46rpx; font-weight: 900; text-align: center; text-shadow: 0 0 10rpx rgba(255,59,47,.7); }

.shop-body { position: relative; min-height: 1500rpx; margin: 0 26rpx; margin-top: 280rpx; padding: 30rpx 22rpx; border-radius: 8rpx 8rpx 20rpx 20rpx; background: radial-gradient(circle at 50% 40%, rgba(120,40,140,.35), transparent 55%), linear-gradient(180deg, #3a0848, #1f0530 70%); box-shadow: 0 0 0 4rpx #2b1a2f; }

.top-actions { display: flex; gap: 16rpx; margin-bottom: 24rpx; }
.gold-btn { margin: 0; padding: 12rpx 30rpx; border: 4rpx solid #ff8a5a; border-radius: 10rpx; background: linear-gradient(#c0201c, #7a0d10); color: #ffe27a; font-size: 30rpx; font-weight: 900; }
.service-btn { margin: 0; padding: 12rpx 30rpx; border: 4rpx solid #e07aff; border-radius: 10rpx; background: linear-gradient(#8a2ab0, #4c1a66); color: #fff; font-size: 30rpx; font-weight: 900; }
.gold-btn::after, .service-btn::after { border: none; }

.shop-tabs { display: flex; gap: 16rpx; }
.shop-tab { flex: 1; margin: 0; padding: 12rpx 0; border: 4rpx solid #caa23a; border-radius: 10rpx; background: linear-gradient(#c6a53a, #a9842c); color: #3d2a08; font-size: 30rpx; font-weight: 900; }
.shop-tab.active { border-color: #ffe27a; background: linear-gradient(#ffd447, #e7a51f); color: #402a03; box-shadow: 0 0 16rpx rgba(255,210,80,.5); }
.shop-tab::after { border: none; }

.tab-divider { height: 8rpx; margin: 24rpx 0; border-radius: 6rpx; background: linear-gradient(90deg, #5c3a8e, #8a4fb0 50%, #5c3a8e); }

.shop-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14rpx; padding: 22rpx 20rpx; border-radius: 8rpx; background: linear-gradient(90deg, #5a1a6a, #4a125a); }
.shop-item { color: #f0e6f6; font-size: 32rpx; }
.buy-btn { margin: 0; padding: 10rpx 28rpx; border: 4rpx solid #e0a8ff; border-radius: 8rpx; background: linear-gradient(#8a2ab0, #5a1a78); color: #fff; font-size: 28rpx; font-weight: 900; }
.buy-btn::after { border: none; }

.shop-footer { position: fixed; right: 0; bottom: 30rpx; left: 0; display: flex; justify-content: flex-end; padding: 0 30rpx; box-sizing: border-box; }
.back-fab { margin: 0; padding: 14rpx 44rpx; border: 4rpx solid #f0c14a; border-radius: 40rpx; background: linear-gradient(#e79b1c, #b0630d); color: #fff7d8; font-size: 32rpx; font-weight: 900; }
.back-fab::after { border: none; }
@media (min-width: 700px) { .shop-screen { max-width: 750rpx; margin: 0 auto; } }
</style>
