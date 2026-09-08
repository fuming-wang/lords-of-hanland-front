<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app'
import { ref } from 'vue'

type CharTab = 'info' | 'attr' | 'gear' | 'power' | 'life'

const charTabs: { key: CharTab; label: string }[] = [
  { key: 'info', label: '信息' },
  { key: 'attr', label: '属性' },
  { key: 'gear', label: '装备' },
  { key: 'power', label: '战力' },
  { key: 'life', label: '生平' },
]

const activeTab = ref<CharTab>('info')

// 五边形雷达：技能/力量/智力/体质/敏捷
const radar = [
  { label: '技能', value: '2' },
  { label: '力量', value: '105' },
  { label: '智力', value: '21' },
  { label: '体质', value: '21' },
  { label: '敏捷', value: '21' },
]

const infoRows = [
  { label: '体力值', value: '0' },
  { label: '活力值', value: '45' },
]

const idRows = [
  { key: '职位', value: '无' },
  { key: '居住地', value: '许昌' },
  { key: '房产', value: '无' },
  { key: '帮派', value: '无' },
  { key: '阶层', value: '无' },
  { key: '配偶', value: '无' },
  { key: '师傅', value: '无' },
]

const statRows = [
  { label: '气血', value: '1792/1792', pair: '防御', pairValue: '442' },
  { label: '精力', value: '654/654', pair: '', pairValue: '' },
  { label: '攻击', value: '1963', pair: '负重', pairValue: '174/260' },
  { label: '速度', value: '31', pair: '', pairValue: '' },
]

const attrRows = [
  { label: '气血', value: '1792', pair: '防御', pairValue: '442', editable: false },
  { label: '体质', value: '21', pair: '', pairValue: '', editable: true },
  { label: '精力', value: '654', pair: '', pairValue: '', editable: false },
  { label: '智力', value: '21', pair: '', pairValue: '', editable: true },
  { label: '攻击', value: '1963', pair: '负重', pairValue: '260', editable: false },
  { label: '力量', value: '105', pair: '', pairValue: '', editable: true },
  { label: '速度', value: '31', pair: '', pairValue: '', editable: false },
  { label: '敏捷', value: '21', pair: '', pairValue: '', editable: true },
]

// 装备槽位（围绕人物剪影排布）
const gearSlots = [
  { name: '镔铁盔(绑)', icon: 'helmet', action: '卸下', pos: 'head', empty: false },
  { name: '', icon: 'mount', action: '[骑乘]', pos: 'mount', empty: true },
  { name: '', icon: '', action: '装备', pos: 'right-top', empty: true },
  { name: '赤铜甲(绑)', icon: 'armor', action: '卸下', pos: 'body', empty: false },
  { name: '斑竹手环(绑)', icon: 'bracelet', action: '卸下', pos: 'left', empty: false },
  { name: '宣化斧(绑)', icon: 'axe', action: '卸下', pos: 'right', empty: false },
  { name: '', icon: '', action: '装备', pos: 'feet', empty: true },
]

const powerRows: { left: string; right: string }[] = [
  { left: '命中率: 85%', right: '暴击率: 15%' },
  { left: '反击率: 15%', right: '致命率: 5%' },
  { left: '法爆率: 0%', right: '反震率: 0%' },
  { left: '躲避率: 5%', right: '抗物理: 21%+神0%' },
  { left: '抗玄击: 5%', right: '抗封锁: 0%' },
  { left: '抗骚扰: 0%', right: '抗围攻: 0%' },
  { left: '抗风沙: 0%', right: '抗妖火: 0%' },
  { left: '抗毒术: 0%', right: '抗落雷: 0%' },
  { left: '暴击力: 0%', right: '穿透率: 0%' },
  { left: '爆伤力: 0%', right: '法伤力: 0%' },
  { left: '连击率: 15%', right: '连击数: 2~3' },
  { left: '法穿率: 0%', right: '' },
]

const lifeEvents = [
  { title: '在许昌定居', date: '2026年08月30日' },
  { title: '进入三国游戏', date: '2026年08月22日' },
  { title: '在许昌定居', date: '2026年08月30日' },
  { title: '进入三国游戏', date: '2026年08月22日' },
]

function goBack() {
  uni.navigateBack()
}

onLoad((query) => {
  const tab = (query as Record<string, string> | undefined)?.tab
  if (tab === 'gear') activeTab.value = 'gear'
  else if (tab === 'attr') activeTab.value = 'attr'
  else if (tab === 'power') activeTab.value = 'power'
  else if (tab === 'life') activeTab.value = 'life'
})

function selectTab(tab: CharTab) {
  activeTab.value = tab
}
</script>

<template>
  <view class="char-screen">
    <view class="char-header">
      <view class="char-title">{{ '哈基米' }}</view>
      <view class="char-sub">芒砀山 (10081)</view>
      <view class="portrait">
        <view class="p-hair"></view>
        <view class="p-face"></view>
        <view class="p-armor"></view>
        <view class="p-helmet"></view>
        <view class="p-ribbon"></view>
      </view>
      <view class="radar">
        <view class="radar-pentagon">
          <view class="radar-dot radar-center"><text>技</text></view>
        </view>
        <view
          v-for="(item, index) in radar"
          :key="item.label"
          class="radar-label"
          :class="'radar-' + index"
        >
          <text class="radar-key">{{ item.label }}</text>
          <text class="radar-val">{{ item.value }}</text>
        </view>
      </view>
    </view>

    <view class="tab-bar">
      <button
        v-for="tab in charTabs"
        :key="tab.key"
        class="tab-item"
        :class="{ active: activeTab === tab.key }"
        @tap="selectTab(tab.key)"
      >{{ tab.label }}</button>
    </view>

    <!-- 信息 -->
    <view v-if="activeTab === 'info'" class="content info-content">
      <view class="resource-row">
        <view v-for="res in infoRows" :key="res.label" class="resource-item">
          <text class="res-label">{{ res.label }}</text>
          <text class="res-value">{{ res.value }}</text>
        </view>
      </view>

      <view class="info-line">
        <text class="line-label">个人信息</text>
        <text class="line-muted">(已关闭)</text>
        <button class="line-action">开启</button>
      </view>

      <view class="info-line rank-line">
        <text class="line-label">排位赛: <text class="em">S21赛季</text></text>
        <text class="line-label">段位: <text class="em">青铜一星</text></text>
      </view>

      <view class="section-divider"></view>

      <view class="info-grid">
        <view v-for="row in idRows" :key="row.key" class="info-cell">
          <text class="cell-label">{{ row.key }}:</text>
          <text class="cell-value">{{ row.value }}</text>
        </view>
      </view>

      <view class="section-divider"></view>

      <view class="xp-line">
        <text class="line-label">升级:</text>
        <view class="xp-track"><view class="xp-fill"></view></view>
        <text class="xp-hint">还需9883经验</text>
      </view>
      <view class="info-line">
        <text class="line-label">升级效率:</text>
        <text class="em">204.0%</text>
      </view>

      <view class="stat-block">
        <view v-for="row in statRows" :key="row.label" class="stat-line">
          <text class="line-label">{{ row.label }}</text>
          <text class="stat-value">{{ row.value }}</text>
          <text v-if="row.pair" class="line-label stat-pair-label">{{ row.pair }}</text>
          <text v-if="row.pair" class="stat-value">{{ row.pairValue }}</text>
        </view>
      </view>

      <view class="sub-section">
        <view class="sub-title">技能 <button class="sub-help">?</button></view>
        <view class="skill-row">
          <view class="skill-item">
            <view class="skill-icon icon-slash"></view>
            <text class="skill-name">(1级) 力劈华山</text>
          </view>
          <view class="skill-item">
            <view class="skill-icon icon-sacrifice"></view>
            <text class="skill-name">(1级) 舍命一击</text>
          </view>
        </view>
      </view>

      <view class="sub-section">
        <view class="sub-title">副将 <button class="sub-manage">管理</button></view>
        <view class="empty-copy">暂无副将</view>
      </view>

      <view class="sub-section">
        <view class="sub-title">天赋 <button class="sub-help">?</button></view>
        <view class="empty-copy">当前不可装备(40级以上或转职可装备1-4个天赋石)</view>
      </view>
    </view>

    <!-- 属性 -->
    <view v-else-if="activeTab === 'attr'" class="content attr-content">
      <view class="attr-left-slot">目前剩余点数: 0</view>
      <view v-for="row in attrRows" :key="row.label" class="attr-line">
        <text class="line-label">{{ row.label }}</text>
        <text class="stat-value">{{ row.value }}</text>
        <template v-if="row.pair">
          <text class="line-label stat-pair-label">{{ row.pair }}</text>
          <text class="stat-value">{{ row.pairValue }}</text>
        </template>
        <template v-if="row.editable">
          <button class="plus-minus">−</button>
          <text class="spend">0</text>
          <button class="plus-minus">+</button>
        </template>
      </view>
    </view>

    <!-- 装备 -->
    <view v-else-if="activeTab === 'gear'" class="content gear-content">
      <view class="gear-body">
        <view
          v-for="slot in gearSlots"
          :key="slot.pos"
          class="gear-slot"
          :class="['gear-' + slot.pos, { empty: slot.empty }]"
        >
          <text class="gear-name">{{ slot.name }}</text>
          <view v-if="slot.icon" class="gear-box" :class="'box-' + slot.icon">
            <view v-if="slot.icon !== 'mount'" class="gear-glyph"></view>
          </view>
          <view v-else class="gear-box" :class="{ empty: slot.empty }"></view>
          <text class="gear-action" :class="{ empty: slot.empty }">{{ slot.action }}</text>
        </view>
      </view>
    </view>

    <!-- 战力 -->
    <view v-else-if="activeTab === 'power'" class="content power-content">
      <view class="power-title-row">
        <text class="power-title">战力说明</text>
        <button class="sub-help">?</button>
      </view>
      <view class="power-grid">
        <view v-for="(row, index) in powerRows" :key="index" class="power-line">
          <text class="power-item">{{ row.left }}</text>
          <text class="power-item">{{ row.right }}</text>
        </view>
      </view>
    </view>

    <!-- 生平 -->
    <view v-else class="content life-content">
      <view v-for="(ev, index) in lifeEvents" :key="index" class="life-card">
        <text class="life-title">{{ ev.title }}</text>
        <text class="life-date">{{ ev.date }}</text>
      </view>
    </view>

    <view class="char-footer">
      <button class="back-fab" @tap="goBack">返回</button>
    </view>
  </view>
</template>

<style scoped>
.char-screen {
  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
  background: radial-gradient(circle at 50% 30%, #123a4e 0, #0a1d2e 48%, #06121c 100%);
  color: #f6efd8;
  font-size: 28rpx;
  padding-bottom: 140rpx;
  box-sizing: border-box;
}

/* ---------- header ---------- */
.char-header {
  position: relative;
  height: 620rpx;
  overflow: hidden;
  background: linear-gradient(180deg, #2a0f12 0, #173a4b 72%, #0c2233 100%);
}
.char-title {
  position: absolute;
  top: 70rpx;
  left: 42rpx;
  color: #f6d13c;
  font-size: 60rpx;
  font-weight: 900;
  letter-spacing: 4rpx;
  text-shadow: 3rpx 3rpx #6f0d10;
  z-index: 3;
}
.char-sub {
  position: absolute;
  top: 142rpx;
  left: 46rpx;
  color: #f0e4c2;
  font-size: 30rpx;
  z-index: 3;
}

/* portrait art */
.portrait {
  position: absolute;
  top: 0;
  right: -40rpx;
  width: 620rpx;
  height: 620rpx;
  z-index: 1;
}
.p-hair {
  position: absolute;
  top: 60rpx;
  left: 90rpx;
  width: 470rpx;
  height: 360rpx;
  border-radius: 52% 48% 44% 40%;
  transform: rotate(-6deg);
  background: linear-gradient(145deg, #f3e6ee 6%, #d8c3ce 34%, #6d6f76 62%, #3a3f4d 88%);
}
.p-face {
  position: absolute;
  top: 250rpx;
  left: 250rpx;
  width: 210rpx;
  height: 260rpx;
  border-radius: 46% 42% 50% 52%;
  transform: rotate(-8deg);
  background: radial-gradient(circle at 64% 32%, #1d0f12 0 4%, transparent 5%), linear-gradient(150deg, #eecba0 0%, #d69a72 58%, #8a4034 100%);
  box-shadow: 16rpx 26rpx 0 rgba(255, 201, 143, .22);
}
.p-helmet {
  position: absolute;
  top: 92rpx;
  left: 200rpx;
  width: 330rpx;
  height: 220rpx;
  border-radius: 50% 50% 20% 20%;
  background: linear-gradient(150deg, #d43a2c 0 30%, #9c0a1a 31% 60%, #5c0011 61%);
  box-shadow: 0 -30rpx 0 -16rpx #ffe08a, inset 0 -60rpx 0 -20rpx #7c0014;
}
.p-armor {
  position: absolute;
  top: 470rpx;
  left: 90rpx;
  width: 520rpx;
  height: 300rpx;
  border-radius: 50% 50% 0 0;
  transform: rotate(-10deg);
  background: linear-gradient(145deg, #ffcf3c 0 16%, #c81739 17% 54%, #7a0018 55% 76%, #f2a63c 77%);
  box-shadow: inset 0 30rpx 0 rgba(255, 230, 150, .5), 22rpx 30rpx 0 -10rpx rgba(0, 0, 0, .35);
}
.p-ribbon {
  position: absolute;
  top: 20rpx;
  right: 0;
  width: 300rpx;
  height: 80rpx;
  border-radius: 50%;
  transform: rotate(30deg);
  background: linear-gradient(90deg, #e9d9dc, #9a8f97 55%, #4a4f5b);
}

/* radar */
.radar {
  position: absolute;
  top: 360rpx;
  left: 26rpx;
  width: 300rpx;
  height: 280rpx;
  z-index: 4;
}
.radar-pentagon {
  position: absolute;
  top: 30rpx;
  left: 40rpx;
  width: 220rpx;
  height: 200rpx;
  clip-path: polygon(50% 0%, 100% 38%, 81% 100%, 19% 100%, 0% 38%);
  background: rgba(20, 120, 160, .35);
  border: 2rpx solid #3cbfe0;
}
.radar-dot {
  position: absolute;
  top: 76rpx;
  left: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background: #ffd233;
  color: #5a2600;
  font-size: 22rpx;
  font-weight: 900;
}
.radar-label {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #bfe9ff;
  font-size: 22rpx;
  line-height: 1.5;
}
.radar-0 { top: 0; left: 96rpx; }          /* 技能 top */
.radar-1 { top: 96rpx; left: 0; }          /* 力量 left */
.radar-2 { top: 96rpx; left: 196rpx; }     /* 智力 right */
.radar-3 { top: 220rpx; left: 40rpx; }     /* 体质 bottom-left */
.radar-4 { top: 220rpx; left: 168rpx; }    /* 敏捷 bottom-right */
.radar-key { color: #9fd4ec; }
.radar-val { color: #fff; font-size: 24rpx; font-weight: 900; }

/* ---------- tab bar ---------- */
.tab-bar {
  display: flex;
  gap: 12rpx;
  padding: 20rpx 28rpx;
  background: transparent;
}
.tab-item {
  flex: 1;
  margin: 0;
  padding: 20rpx 0;
  border: 4rpx solid #1d0d4a;
  border-radius: 10rpx;
  background: linear-gradient(180deg, #3a1546, #241040);
  color: #e9d8ff;
  font-size: 30rpx;
  font-weight: 900;
}
.tab-item.active {
  border-color: #63c7ff;
  background: linear-gradient(180deg, #1f8fd0, #0d5a9c);
  color: #fff;
  box-shadow: 0 0 18rpx rgba(60, 190, 230, .5);
}
.tab-item::after { border: none; }

/* ---------- content common ---------- */
.content {
  margin: 0 22rpx;
  border-radius: 16rpx;
  background: linear-gradient(180deg, rgba(28, 62, 86, .96), rgba(14, 38, 58, .96));
  box-shadow: inset 0 0 0 4rpx rgba(90, 160, 190, .25);
}
.line-label { color: #9fe0f2; }
.stat-value { color: #fff; font-weight: 900; }
.em { color: #ffe27a; }
.line-action {
  margin: 0;
  padding: 8rpx 26rpx;
  border: 3rpx solid #e8b84b;
  border-radius: 14rpx;
  background: #0b86c8;
  color: #fff;
  font-size: 24rpx;
}
.line-action::after { border: none; }

/* ---------- info ---------- */
.info-content { padding: 24rpx 26rpx 40rpx; }
.resource-row { display: flex; margin-bottom: 16rpx; }
.resource-item { flex: 1; display: flex; align-items: center; justify-content: space-between; padding: 14rpx 20rpx; background: rgba(0, 30, 60, .5); }
.resource-item + .resource-item { margin-left: 14rpx; }
.res-label { color: #9fe0f2; font-size: 26rpx; }
.res-value { color: #fff; font-size: 30rpx; font-weight: 900; }
.info-line { display: flex; align-items: center; gap: 12rpx; min-height: 64rpx; padding: 6rpx 0; }
.line-muted { color: #c8cede; font-size: 24rpx; }
.rank-line { justify-content: space-between; }
.rank-line .line-label { flex: 1; }
.rank-line .line-label:last-child { text-align: right; }
.section-divider { height: 2rpx; margin: 14rpx 0; background: linear-gradient(90deg, transparent, rgba(120, 190, 220, .6), transparent); }
.info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14rpx 10rpx; }
.info-cell { display: flex; justify-content: space-between; font-size: 26rpx; }
.cell-label { color: #9fe0f2; }
.cell-value { color: #fff; }
.xp-line { display: flex; align-items: center; gap: 12rpx; }
.xp-track { flex: 1; height: 18rpx; border: 3rpx solid #d8a44a; border-radius: 10rpx; background: #243444; }
.xp-fill { width: 42%; height: 100%; border-radius: 8rpx; background: linear-gradient(90deg, #38e07a, #1fbf60); }
.xp-hint { color: #ffd76a; font-size: 22rpx; white-space: nowrap; }
.stat-block { margin-top: 8rpx; }
.stat-line { display: flex; align-items: center; min-height: 60rpx; }
.stat-line .line-label { width: 130rpx; }
.stat-line .stat-value { width: 190rpx; }
.stat-pair-label { text-align: right; }
.sub-section { margin-top: 24rpx; }
.sub-title { display: flex; align-items: center; gap: 10rpx; color: #ffe789; font-size: 32rpx; font-weight: 900; }
.sub-help { margin: 0; padding: 0; width: 44rpx; height: 44rpx; border: 3rpx solid #cdd4dc; border-radius: 50%; background: transparent; color: #cdd4dc; font-size: 26rpx; line-height: 1; }
.sub-help::after { border: none; }
.sub-manage { margin: 0; padding: 6rpx 22rpx; border: 3rpx solid #5ad2ff; border-radius: 14rpx; background: #0f6b9e; color: #fff; font-size: 24rpx; }
.sub-manage::after { border: none; }
.skill-row { display: flex; gap: 30rpx; margin-top: 20rpx; }
.skill-item { display: flex; flex-direction: column; align-items: center; width: 200rpx; }
.skill-icon { width: 150rpx; height: 150rpx; border-radius: 50%; border: 6rpx solid #3c3c4c; background: radial-gradient(circle, #5a2030, #200a12); position: relative; overflow: hidden; }
.icon-slash::after { content: ''; position: absolute; top: 30rpx; left: 26rpx; width: 100rpx; height: 90rpx; background: linear-gradient(120deg, transparent 40%, #e33a2f 41% 55%, transparent 56%); transform: rotate(-24deg); }
.icon-sacrifice::after { content: ''; position: absolute; inset: 40rpx; border-radius: 50%; background: radial-gradient(circle, #ff5a2a, #7c0d0d); box-shadow: 0 0 20rpx #ff5a2a; }
.skill-name { margin-top: 12rpx; color: #d5e6ef; font-size: 24rpx; }
.empty-copy { margin-top: 18rpx; color: #c3cfda; font-size: 26rpx; }

/* ---------- attr ---------- */
.attr-content { padding: 24rpx 26rpx 40rpx; }
.attr-left-slot { margin-bottom: 20rpx; color: #ffe27a; font-size: 32rpx; font-weight: 900; }
.attr-line { display: flex; align-items: center; min-height: 76rpx; border-bottom: 2rpx solid rgba(90, 150, 180, .25); }
.attr-line .line-label { width: 130rpx; }
.attr-line .stat-value { width: 180rpx; }
.plus-minus { margin: 0; padding: 0; width: 56rpx; height: 44rpx; border: 3rpx solid #c9f05a; border-radius: 10rpx; background: linear-gradient(#a5d92c, #6f9e16); color: #173a12; font-size: 30rpx; font-weight: 900; line-height: 1; }
.plus-minus::after { border: none; }
.spend { width: 50rpx; color: #5be3ff; font-size: 30rpx; text-align: center; }

/* ---------- gear ---------- */
.gear-content {
  position: relative;
  min-height: 1200rpx;
  padding: 30rpx 22rpx;
  overflow: hidden;
}
.gear-body {
  position: relative;
  width: 100%;
  height: 1140rpx;
  background: radial-gradient(circle at 50% 60%, rgba(60, 90, 80, .5), transparent 60%);
}
.gear-slot {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #fff;
}
.gear-name { font-size: 26rpx; color: #f3eeda; margin-bottom: 8rpx; white-space: nowrap; }
.gear-box {
  width: 150rpx;
  height: 150rpx;
  border: 6rpx solid #b8863c;
  border-radius: 12rpx;
  background: linear-gradient(180deg, #0c2230, #102c3c);
  box-shadow: inset 0 0 0 4rpx #6d4a1c;
  position: relative;
  overflow: hidden;
}
.gear-slot.empty .gear-box { border-color: #5a6b74; box-shadow: inset 0 0 0 4rpx #2f3a42; }
.gear-glyph {
  position: absolute;
  inset: 30rpx;
  border-radius: 40%;
  background: linear-gradient(140deg, #9aa3ad, #4a525c);
}
.box-mount .gear-glyph { border-radius: 50%; background: radial-gradient(circle, #c9b7a2, #6d5642); }
.gear-action { margin-top: 10rpx; font-size: 26rpx; color: #e8c86a; }
.gear-action.empty { color: #9fb0ba; }

.gear-head { top: 0; left: 50%; transform: translateX(-50%); }
.gear-mount { top: 60rpx; left: 0; }
.gear-right-top { top: 60rpx; right: 0; }
.gear-body-slot { top: 420rpx; left: 50%; transform: translateX(-50%); }
.gear-left { top: 460rpx; left: 0; }
.gear-right { top: 460rpx; right: 0; }
.gear-feet { top: 830rpx; left: 50%; transform: translateX(-50%); }

/* ---------- power ---------- */
.power-content { padding: 24rpx 26rpx 40rpx; }
.power-title-row { display: flex; align-items: center; justify-content: center; gap: 14rpx; margin-bottom: 24rpx; }
.power-title { color: #ffe789; font-size: 40rpx; font-weight: 900; }
.power-grid { padding: 0 8rpx; }
.power-line { display: flex; justify-content: space-between; padding: 14rpx 0; border-bottom: 2rpx solid rgba(90, 150, 180, .22); }
.power-item { color: #eaf3f8; font-size: 30rpx; }
.power-item:last-child { width: 50%; text-align: right; }

/* ---------- life ---------- */
.life-content { padding: 24rpx 26rpx 40rpx; }
.life-card {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  padding: 26rpx 24rpx;
  margin-bottom: 18rpx;
  border: 4rpx solid #3f8fb0;
  border-radius: 14rpx;
  background: linear-gradient(180deg, rgba(30, 84, 108, .8), rgba(18, 52, 74, .8));
}
.life-title { color: #f6efd8; font-size: 32rpx; }
.life-date { color: #bcd2de; font-size: 28rpx; }

/* ---------- footer ---------- */
.char-footer {
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
  padding: 14rpx 40rpx;
  border: 4rpx solid #d8c67c;
  border-radius: 40rpx;
  background: linear-gradient(#b0652a, #7c3d12);
  color: #fff7d8;
  font-size: 30rpx;
  font-weight: 900;
}
.back-fab::after { border: none; }

@media (min-width: 700px) {
  .char-screen { max-width: 750rpx; margin: 0 auto; }
}
</style>
