<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

type TopTab = 'player' | 'guild' | 'vice' | 'resist'

const topTabs: { key: TopTab; label: string }[] = [
  { key: 'player', label: '玩家' },
  { key: 'guild', label: '帮派' },
  { key: 'vice', label: '副将' },
  { key: 'resist', label: '抗性' },
]

const activeTop = ref<TopTab>('player')
const activeSub = ref('高手')

interface Row {
  rank: number
  name: string
  sub: string
  ext: string
  v: string
}

const lists: Record<TopTab, Row[]> = {
  player: [
    { rank: 1, name: '音乐虾', sub: '85级异人', ext: '', v: 'v6' },
    { rank: 2, name: '梦里听风', sub: '85级武士', ext: '', v: 'v5' },
    { rank: 3, name: '人生几何', sub: '84级武士', ext: '', v: 'v5' },
    { rank: 4, name: '养奶龙的', sub: '83级文人', ext: '', v: 'v9' },
    { rank: 5, name: '花海', sub: '83级文人', ext: '', v: 'v5' },
    { rank: 6, name: '鹿依', sub: '82级文人', ext: '', v: 'v6' },
    { rank: 7, name: '一陌初晨', sub: '82级文人', ext: '', v: 'v8' },
    { rank: 8, name: '她说她爱过', sub: '81级武士', ext: '', v: 'v9' },
    { rank: 9, name: '半盏清茶', sub: '81级武士', ext: '', v: 'v5' },
  ],
  guild: [
    { rank: 1, name: '剑宗', sub: '声望:120', ext: '帮主wdca999, 不定时发红包在群', v: '' },
    { rank: 2, name: '长安阁', sub: '声望:100', ext: 'V加Dhuahai77邀请', v: '' },
    { rank: 3, name: '拾光会', sub: '声望:70', ext: '裙:alovo0214', v: '' },
    { rank: 4, name: '双王会', sub: '声望:67', ext: '定区三转, 进君羊wang497069', v: '' },
    { rank: 5, name: '公子阁', sub: '声望:67', ext: '在不在帮都可领体进群+: HXSGGZZ6', v: '' },
    { rank: 6, name: '明月阁', sub: '声望:66', ext: '有兴趣的进群V: 15067123040', v: '' },
    { rank: 7, name: '归雁楼', sub: '声望:59', ext: '定区养老, 进君羊+mcr20040427', v: '' },
    { rank: 8, name: '几何楼', sub: '声望:55', ext: '进帮+15252435750', v: '' },
    { rank: 9, name: '鬼鬼楼', sub: '声望:39', ext: '故人陆续凋零, ,', v: '' },
  ],
  vice: [
    { rank: 1, name: '(真)曹操', sub: '93级文人', ext: '主公:音乐虾', v: '' },
    { rank: 2, name: '项羽', sub: '90级武士', ext: '主公:鹿依', v: '' },
    { rank: 3, name: '(真)赵云', sub: '90级异人', ext: '主公:花海', v: '' },
    { rank: 4, name: '刘邦', sub: '90级武士', ext: '主公:养奶龙的', v: '' },
    { rank: 5, name: '貂蝉', sub: '90级文人', ext: '主公:她说她爱过', v: '' },
    { rank: 6, name: '曹操', sub: '90级武士', ext: '主公:梦里听风', v: '' },
    { rank: 7, name: '(真)荀彧', sub: '86级异人', ext: '主公:七爷', v: '' },
    { rank: 8, name: '刘邦', sub: '82级文人', ext: '主公:花间一壶酒', v: '' },
    { rank: 9, name: '黄月英', sub: '81级异人', ext: '主公:梦描韵影', v: '' },
  ],
  resist: [
    { rank: 1, name: '空白', sub: '78级武士', ext: '[抗物理100]', v: 'v5' },
    { rank: 2, name: '七爷', sub: '78级武士', ext: '[抗物理100]', v: 'v5' },
    { rank: 3, name: 'Joker', sub: '77级异人', ext: '[抗物理100]', v: 'v5' },
    { rank: 4, name: '风笑天', sub: '77级武士', ext: '[抗物理100]', v: '' },
    { rank: 5, name: '梦描韵影', sub: '76级武士', ext: '[抗物理100]', v: 'v4' },
    { rank: 6, name: '十三妹儿', sub: '75级武士', ext: '[抗物理100]', v: 'v5' },
    { rank: 7, name: '陈子杨', sub: '74级武士', ext: '[抗物理100]', v: 'v4' },
    { rank: 8, name: '橘子', sub: '73级武士', ext: '[抗物理100]', v: 'v4' },
    { rank: 9, name: '笙歌绝', sub: '72级武士', ext: '[抗物理100]', v: 'v5' },
  ],
}

const activeSubs: Record<Exclude<TopTab, 'vice'>, string[]> = {
  player: ['高手', '富豪', '排位', '幸运', '美女', '战力', '恶人'],
  guild: ['声望', '活力', '人数'],
  resist: ['物', '玄', '围', '乱', '封', '风', '火', '雷', '毒'],
}

const showSubs = computed(() => activeTop.value !== 'vice')
const subOptions = computed(() => (activeTop.value === 'vice' ? [] : activeSubs[activeTop.value]))
const rows = computed(() => lists[activeTop.value])
const podium = computed(() => rows.value.slice(0, 3))

const bottomText = computed(() => {
  if (activeTop.value === 'player') return '您的排名 2149'
  if (activeTop.value === 'resist') return '您的排名 600 您抗物理21%'
  if (activeTop.value === 'vice') return ''
  return '您还未加入帮派, 选择一个申请加入吧!'
})

function pickTop(tab: TopTab) {
  activeTop.value = tab
  activeSub.value = (activeSubs[tab as Exclude<TopTab, 'vice'>] || [])[0] || ''
}

function pickSub(label: string) {
  activeSub.value = label
}

function goBack() { uni.navigateBack() }

onLoad((query) => {
  const tab = (query as Record<string, string> | undefined)?.tab
  if (tab === 'guild') pickTop('guild')
  else if (tab === 'vice') pickTop('vice')
  else if (tab === 'resist') pickTop('resist')
  else pickTop('player')
})
</script>

<template>
  <view class="rank-screen">
    <view class="rank-header">
      <view class="podium-banner"></view>
      <text class="rank-title">排行榜</text>
      <view class="podium-area">
        <view v-for="(p, index) in podium" :key="index" class="podium-item" :class="'podium-' + index">
          <text class="podium-name">{{ p.name }}</text>
          <view class="podium-stand"></view>
        </view>
      </view>
    </view>

    <view class="top-tabs">
      <button
        v-for="tab in topTabs"
        :key="tab.key"
        class="top-tab"
        :class="{ active: activeTop === tab.key }"
        @tap="pickTop(tab.key)"
      >{{ tab.label }}</button>
    </view>

    <view v-if="showSubs" class="sub-tabs">
      <button
        v-for="option in subOptions"
        :key="option"
        class="sub-tab"
        :class="{ active: activeSub === option }"
        @tap="pickSub(option)"
      >{{ option }}</button>
    </view>

    <view v-if="activeTop === 'vice'" class="vice-bar">您主力副将0级【大乔】排名第381</view>

    <view class="rank-list">
      <view v-for="row in rows" :key="row.rank" class="rank-row" :class="'row-' + row.rank">
        <view class="rank-badge" :class="'badge-' + Math.min(row.rank, 3)">{{ row.rank }}</view>
        <view class="row-info">
          <view class="row-name-line">
            <text class="row-name">{{ row.name }}</text>
            <text v-if="row.ext" class="row-ext">{{ row.ext }}</text>
          </view>
          <text class="row-sub">{{ row.sub }}</text>
        </view>
        <view v-if="row.v" class="v-badge">{{ row.v }}</view>
        <button v-if="activeTop === 'guild'" class="join-btn">+</button>
      </view>
    </view>

    <view v-if="activeTop === 'guild'" class="guild-tip">您还未加入帮派, 选择一个申请加入吧!</view>
    <view v-else-if="bottomText" class="bottom-status">{{ bottomText }}</view>

    <view class="rank-footer">
      <button class="back-fab" @tap="goBack">返回</button>
    </view>
  </view>
</template>

<style scoped>
.rank-screen {
  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
  background: linear-gradient(180deg, #1c1f30, #0e1120 70%);
  color: #f6efd8;
  font-size: 28rpx;
  padding-bottom: 140rpx;
  box-sizing: border-box;
}
.rank-header { position: relative; height: 430rpx; overflow: hidden; background: radial-gradient(circle at 50% 20%, #5a3a1e, #2a1a0c 60%, #120a05); }
.rank-title { position: absolute; top: 20rpx; left: 0; width: 100%; color: #ffe27a; font-size: 60rpx; font-weight: 900; letter-spacing: 10rpx; text-align: center; text-shadow: 3rpx 3rpx #6f2f00; }
.podium-area { position: absolute; top: 110rpx; left: 0; width: 100%; height: 300rpx; }
.podium-item { position: absolute; text-align: center; filter: drop-shadow(0 12rpx 12rpx rgba(0,0,0,.5)); }
.podium-name { display: inline-block; padding: 6rpx 14rpx; background: rgba(0,0,0,.45); color: #ffe27a; font-size: 26rpx; transform: rotate(-90deg); }
.podium-stand { width: 220rpx; height: 26rpx; margin: 60rpx auto 0; background: radial-gradient(circle, #d8a53c, #6f4a12); border-radius: 50%; }
.podium-0 { left: 8%; top: 40rpx; transform: rotate(-3deg); }
.podium-1 { left: 50%; top: 0; transform: translateX(-50%) scale(1.15); }
.podium-2 { right: 8%; top: 40rpx; transform: rotate(3deg); }

.top-tabs { display: flex; align-items: center; gap: 8rpx; padding: 18rpx 22rpx; }
.top-tab { flex: 1; margin: 0; padding: 20rpx 0; border: 4rpx solid #3c5a7e; border-radius: 10rpx; background: linear-gradient(180deg, #7d3340, #4c1a28); color: #f0e6cf; font-size: 32rpx; font-weight: 900; }
.top-tab.active { border-color: #63c7ff; background: linear-gradient(180deg, #1f8fd0, #0d5a9c); color: #fff; }
.top-tab::after { border: none; }

.sub-tabs { display: flex; gap: 8rpx; padding: 12rpx 40rpx; background: linear-gradient(90deg, #3a2416, #5a3a1e 50%, #3a2416); border-bottom: 4rpx solid #6f4a12; }
.sub-tab { flex: 1; margin: 0; padding: 12rpx 0; border-radius: 18rpx; background: linear-gradient(#7a4a1a, #5c2e0a); color: #ffe27a; font-size: 30rpx; font-weight: 900; }
.sub-tab.active { background: linear-gradient(#a85a12, #6f2f00); color: #fff; box-shadow: 0 0 12rpx rgba(255,160,50,.5); }
.sub-tab::after { border: none; }

.vice-bar { margin: 16rpx; padding: 22rpx; border-radius: 10rpx; background: linear-gradient(90deg, #2a3a52, #1d2a3e); color: #7ce0ff; font-size: 32rpx; text-align: center; }

.rank-list { margin: 14rpx 16rpx 0; }
.rank-row { display: flex; align-items: center; margin-bottom: 14rpx; padding: 16rpx 20rpx; }
.rank-row.row-1 { background: linear-gradient(90deg, #4a2a8e, #341d66); }
.rank-row.row-2 { background: linear-gradient(90deg, #8e2a4a, #5c1a30); }
.rank-row.row-3 { background: linear-gradient(90deg, #2a7a5c, #175c42); }
.rank-row:not(.row-1):not(.row-2):not(.row-3) { background: linear-gradient(90deg, #2a3a52, #1d2a3e); }
.rank-badge { display: flex; align-items: center; justify-content: center; width: 52rpx; height: 68rpx; color: #cfe0ea; font-size: 38rpx; font-weight: 900; }
.badge-1 { color: #ffd633; }
.badge-2 { color: #d8d8d8; }
.badge-3 { color: #e08a3a; }
.row-info { flex: 1; padding: 0 18rpx; }
.row-name-line { display: flex; align-items: center; gap: 14rpx; }
.row-name { color: #fff; font-size: 34rpx; font-weight: 900; }
.row-sub { display: block; margin-top: 6rpx; color: #7ce0ff; font-size: 28rpx; }
.row-ext { color: #e88a2a; font-size: 26rpx; }
.v-badge { padding: 2rpx 12rpx; border: 3rpx solid #5ad2ff; border-radius: 12rpx; color: #ffe27a; font-size: 24rpx; }
.join-btn { margin: 0; width: 56rpx; height: 56rpx; border: 5rpx solid #f0c14a; border-radius: 50%; background: linear-gradient(#ffe4a0, #e7a51f); color: #6f2f00; font-size: 40rpx; font-weight: 900; }
.join-btn::after { border: none; }

.guild-tip { margin: 20rpx 16rpx; padding: 24rpx 20rpx; border-radius: 8rpx; background: linear-gradient(90deg, #4c1a80, #7a2a9c); color: #fff; font-size: 30rpx; text-align: center; }
.bottom-status { margin: 20rpx 16rpx; padding: 12rpx 20rpx; color: #7ce0ff; font-size: 30rpx; }

.rank-footer { position: fixed; right: 0; bottom: 30rpx; left: 0; display: flex; justify-content: flex-end; padding: 0 30rpx; box-sizing: border-box; }
.back-fab { margin: 0; padding: 14rpx 44rpx; border: 4rpx solid #f0c14a; border-radius: 40rpx; background: linear-gradient(#e79b1c, #b0630d); color: #fff7d8; font-size: 32rpx; font-weight: 900; }
.back-fab::after { border: none; }
@media (min-width: 700px) { .rank-screen { max-width: 750rpx; margin: 0 auto; } }
</style>
