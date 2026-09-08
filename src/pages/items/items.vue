<script setup lang="ts">
import { ref } from 'vue'

const mainTabs = ['药品', '装备', '矿石', '杂物']
const subTabs = ['天赋石↑', '宝石', '矿石']

const activeMain = ref('矿石')
const activeSub = ref('矿石')
const loadText = ref('您暂时没有天赋石!')

const medicines = [
  { name: '止血药(绑)(500)' },
  { name: '金创药(绑)(62)' },
  { name: '麻沸散(20)' },
  { name: '清泉液(绑)(338)' },
  { name: '菖蒲液(30)' },
]

const equipmentItems = [
  { name: '轻钢甲(绑)(4级)', desc: '防御力+700' },
  { name: '黑铁手环(绑)(4级)', desc: '气血+900' },
  { name: '轻钢甲(绑)(4级)', desc: '防御力+700' },
  { name: '紫金铃坠(绑)(4级)', desc: '' },
]

const miscItems = [
  { name: '路书(1)' },
  { name: '1000银两代金券(2)' },
  { name: '画像残页(2)(1)' },
  { name: '画像残页(5)(1)' },
  { name: '画像残页(6)(1)' },
  { name: '初级易容装(1)' },
  { name: '体力丹(绑)(2)' },
  { name: '将军令(绑)(1)' },
  { name: '初级副将心法(绑)(3)' },
]

function selectMain(tab: string) {
  activeMain.value = tab
  refreshEmpty()
}

function selectSub(tab: string) {
  activeSub.value = tab
  refreshEmpty()
}

function refreshEmpty() {
  const clean = activeMain.value === '矿石' && activeSub.value === '矿石'
    ? '天赋石' // 界面实际显示文案
    : activeSub.value.replace('↑', '')
  loadText.value = `您暂时没有${clean}!`
}

function goBack() {
  uni.navigateBack()
}

function goGear() {
  uni.navigateTo({ url: '/pages/gear/gear' })
}
</script>

<template>
  <view class="items-screen">
    <view class="items-header">
      <view class="scene-bg">
        <view class="scene-roof"></view><view class="scene-water"></view>
      </view>
      <text class="header-title">许昌</text>
      <view class="header-sub">{{ activeMain }}</view>
    </view>

    <view class="items-body">
      <!-- 负重栏 -->
      <view class="load-bar">
        <button class="load-gear" @tap="goGear">我的装备</button>
        <text class="load-value">负重 <text class="load-num">174/260</text></text>
      </view>

      <!-- 主分类 -->
      <view class="main-tabs">
        <button
          v-for="tab in mainTabs"
          :key="tab"
          class="main-tab"
          :class="{ active: activeMain === tab }"
          @tap="selectMain(tab)"
        >{{ tab }}</button>
      </view>

      <!-- 药品分类 -->
      <template v-if="activeMain === '药品'">
        <view class="quick-recover">
          <button class="recover-btn">快速恢复</button>
        </view>
        <view v-for="(med, index) in medicines" :key="index" class="med-row">
          <text class="med-name">{{ med.name }}</text>
          <button class="use-btn">使用</button>
        </view>
      </template>

      <!-- 装备分类 -->
      <template v-else-if="activeMain === '装备'">
        <view class="tab-divider"></view>
        <view v-for="(equip, index) in equipmentItems" :key="index" class="equip-block">
          <view class="med-row equip-row">
            <text class="med-name">{{ equip.name }}</text>
            <button class="use-btn">装备</button>
          </view>
          <view v-if="equip.desc" class="equip-desc">{{ equip.desc }}</view>
        </view>
      </template>

      <!-- 矿石分类 -->
      <template v-else-if="activeMain === '矿石'">
        <view class="tab-divider"></view>
        <view class="sub-tabs">
          <button
            v-for="tab in subTabs"
            :key="tab"
            class="sub-tab"
            :class="{ active: activeSub === tab }"
            @tap="selectSub(tab)"
          >{{ tab }}</button>
        </view>
        <view class="empty-tip">{{ loadText }}</view>
        <view class="dragon-decor">
          <view class="dragon-ring ring-outer"></view>
          <view class="dragon-ring ring-inner"></view>
          <view class="dragon-glyph"></view>
        </view>
      </template>

      <!-- 杂物分类 -->
      <template v-else>
        <view class="tab-divider"></view>
        <view v-for="(misc, index) in miscItems" :key="index" class="med-row">
          <text class="med-name">{{ misc.name }}</text>
          <button class="use-btn">使用</button>
        </view>
      </template>
    </view>

    <view class="items-footer">
      <button class="back-fab" @tap="goBack">返回</button>
    </view>
  </view>
</template>

<style scoped>
.items-screen {
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

/* ---------- header ---------- */
.items-header {
  position: relative;
  height: 300rpx;
  overflow: hidden;
  background: linear-gradient(180deg, #0a0d16, #0b1220 70%);
}
.scene-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 150rpx;
  opacity: .9;
  background: linear-gradient(#3c86c8 0 30%, #4f8f9a 31% 55%, #2a3a3e 56% 70%, #17242c 71%);
}
.scene-roof {
  position: absolute;
  bottom: 8rpx;
  left: 30rpx;
  width: 220rpx;
  height: 46rpx;
  border-radius: 40% 40% 0 0;
  background: #7c4a2c;
}
.scene-water {
  position: absolute;
  bottom: 12rpx;
  right: 40rpx;
  width: 260rpx;
  height: 28rpx;
  border-radius: 50%;
  background: #18c2d6;
}
.header-title {
  position: absolute;
  top: 150rpx;
  left: 0;
  width: 100%;
  color: #fff;
  font-size: 48rpx;
  font-weight: 900;
  text-align: center;
  text-shadow: 3rpx 3rpx #111;
}
.header-sub {
  position: absolute;
  top: 214rpx;
  left: 0;
  width: 100%;
  color: #ff3b2f;
  font-size: 42rpx;
  font-weight: 900;
  text-align: center;
  text-shadow: 0 0 8rpx rgba(255, 59, 47, .6);
}

/* ---------- body ---------- */
.items-body {
  position: relative;
  min-height: 1350rpx;
  margin: 0 34rpx;
  padding: 30rpx 26rpx;
  border-radius: 8rpx 8rpx 20rpx 20rpx;
  background: linear-gradient(180deg, #0d1226, #08101f 60%, #060b16);
  box-shadow: 0 0 0 4rpx #2b2f3a, inset 0 0 40rpx rgba(30, 60, 120, .25);
}

/* load bar */
.load-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 18rpx;
  border-radius: 8rpx;
  background: linear-gradient(90deg, #7a1f7a, #4a1457);
}
.load-gear {
  margin: 0;
  padding: 10rpx 26rpx;
  border: 4rpx solid #d8a93c;
  border-radius: 14rpx;
  background: linear-gradient(#8e2a8e, #5c1a5c);
  color: #fff;
  font-size: 28rpx;
  font-weight: 900;
}
.load-gear::after { border: none; }
.load-value { color: #ffd84a; font-size: 30rpx; font-weight: 900; }
.load-num { color: #ffe789; }

/* main tabs */
.main-tabs {
  display: flex;
  gap: 18rpx;
  margin-top: 26rpx;
}
.main-tab {
  flex: 1;
  margin: 0;
  padding: 12rpx 0;
  border: 4rpx solid #caa23a;
  border-radius: 10rpx;
  background: linear-gradient(#c6a53a, #a9842c);
  color: #3d2a08;
  font-size: 30rpx;
  font-weight: 900;
}
.main-tab.active {
  border-color: #ffe27a;
  background: linear-gradient(#ffd447, #e7a51f);
  color: #402a03;
  box-shadow: 0 0 16rpx rgba(255, 210, 80, .5);
}
.main-tab::after { border: none; }

.tab-divider {
  height: 12rpx;
  margin: 26rpx 0;
  border-radius: 6rpx;
  background: linear-gradient(90deg, #5c3a8e, #8a4fb0 50%, #5c3a8e);
}

/* sub tabs */
.sub-tabs {
  display: flex;
  gap: 18rpx;
}
.sub-tab {
  flex: 1;
  margin: 0;
  padding: 12rpx 0;
  border: 4rpx solid #b8762a;
  border-radius: 10rpx;
  background: linear-gradient(#ce6a1e, #a54e12);
  color: #3a1702;
  font-size: 30rpx;
  font-weight: 900;
}
.sub-tab.active {
  background: linear-gradient(#e07a22, #b4510c);
  color: #3a1702;
  box-shadow: 0 0 16rpx rgba(240, 130, 40, .5);
}
.sub-tab::after { border: none; }

/* empty tip */
.empty-tip {
  margin-top: 30rpx;
  padding: 18rpx 22rpx;
  border-radius: 8rpx;
  background: linear-gradient(90deg, #6a1a7a, #7a1f8a);
  color: #ffe789;
  font-size: 34rpx;
  font-weight: 900;
}

/* quick recover */
.quick-recover { margin-top: 26rpx; }
.recover-btn {
  margin: 0;
  padding: 14rpx 34rpx;
  border: 4rpx solid #ff8a5a;
  border-radius: 10rpx;
  background: linear-gradient(#c0201c, #7a0d10);
  color: #ffe27a;
  font-size: 32rpx;
  font-weight: 900;
}
.recover-btn::after { border: none; }

/* medicine rows */
.med-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16rpx;
  padding: 22rpx 22rpx;
  border-radius: 8rpx;
  background: linear-gradient(90deg, #5a1a6a, #4a125a);
}
.med-name { color: #f0e6f6; font-size: 34rpx; }
.use-btn {
  margin: 0;
  padding: 10rpx 30rpx;
  border: 4rpx solid #e0a8ff;
  border-radius: 8rpx;
  background: linear-gradient(#8a2ab0, #5a1a78);
  color: #fff;
  font-size: 28rpx;
  font-weight: 900;
}
.use-btn::after { border: none; }
.equip-block { margin-bottom: 4rpx; }
.equip-row { margin-top: 16rpx; }
.equip-desc { margin-top: 8rpx; padding: 18rpx 22rpx; border-radius: 8rpx; background: linear-gradient(90deg, #5a1a6a, #4a125a); color: #ffe27a; font-size: 32rpx; }

/* dragon decor */
.dragon-decor {
  position: relative;
  width: 620rpx;
  height: 620rpx;
  margin: 90rpx auto 0;
}
.dragon-ring {
  position: absolute;
  border: 6rpx solid rgba(60, 110, 180, .45);
  border-radius: 50%;
}
.ring-outer { inset: 0; }
.ring-inner { inset: 90rpx; border-color: rgba(80, 130, 200, .35); }
.dragon-glyph {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 260rpx;
  height: 300rpx;
  transform: translate(-50%, -50%);
  border-radius: 50% 50% 46% 46%;
  background: radial-gradient(circle at 50% 45%, rgba(70, 130, 210, .5), rgba(30, 70, 130, .2) 70%);
  box-shadow: 0 0 60rpx rgba(40, 100, 190, .35);
}
.dragon-glyph::before {
  content: '';
  position: absolute;
  inset: 30rpx;
  border: 10rpx solid rgba(80, 140, 220, .4);
  border-radius: 50%;
}

/* footer */
.items-footer {
  position: fixed;
  right: 0;
  bottom: 30rpx;
  left: 0;
  display: flex;
  justify-content: flex-end;
  padding: 0 30rpx;
  box-sizing: border-box;
}
.back-fab {
  margin: 0;
  padding: 14rpx 44rpx;
  border: 4rpx solid #f0c14a;
  border-radius: 40rpx;
  background: linear-gradient(#e79b1c, #b0630d);
  color: #fff7d8;
  font-size: 32rpx;
  font-weight: 900;
}
.back-fab::after { border: none; }

@media (min-width: 700px) {
  .items-screen { max-width: 750rpx; margin: 0 auto; }
}
</style>
