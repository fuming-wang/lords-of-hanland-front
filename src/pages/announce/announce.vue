<script setup lang="ts">
import { ref } from 'vue'

type NoteTab = 'announce' | 'guide'
const noteTabs: { key: NoteTab; label: string }[] = [
  { key: 'announce', label: '公告' },
  { key: 'guide', label: '攻略' },
]
const activeNote = ref<NoteTab>('announce')

const notes = [
  { title: '武胜关大汉朝合区公告', isNew: true },
  { title: '9月天一加赛公告', isNew: true },
  { title: '26.9.2更新公告', isNew: true },
  { title: '新区大宋王朝3日开启', isNew: true },
  { title: '新区芒砀山18日开启', isNew: true },
  { title: '★帐号封停处理细则', isNew: true },
  { title: '★严厉打击外挂公告', isNew: true },
  { title: '★严厉打击外挂公告', isNew: true },
  { title: '秋暮中元·遥寄相思', isNew: false },
  { title: '鹊鸣七夕·梦遇三国', isNew: false },
  { title: '娘子关匈奴合区公告', isNew: false },
  { title: '8月11日更新内容', isNew: false },
  { title: '柏梁台定军山合区公告', isNew: false },
]

function goBack() { uni.navigateBack() }
</script>

<template>
  <view class="note-screen">
    <view class="note-header">
      <view class="scene-bg"><view class="scene-roof"></view><view class="scene-water"></view></view>
      <text class="header-title">许昌</text>
    </view>
    <view class="note-sub">公告</view>

    <view class="note-body">
      <view class="note-tabs">
        <button
          v-for="tab in noteTabs"
          :key="tab.key"
          class="note-tab"
          :class="{ active: activeNote === tab.key }"
          @tap="activeNote = tab.key"
        >{{ tab.label }}</button>
      </view>

      <view v-for="(note, index) in notes" :key="index" class="note-row">
        <text v-if="note.isNew" class="new-badge">新</text>
        <text class="note-title">{{ note.title }}</text>
        <button class="view-btn">查看</button>
      </view>
    </view>

    <view class="note-footer">
      <button class="back-fab" @tap="goBack">返回</button>
    </view>
  </view>
</template>

<style scoped>
.note-screen {
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
.note-header { position: relative; height: 180rpx; overflow: hidden; background: linear-gradient(180deg, #0a0d16, #0b1220); }
.scene-bg { position: absolute; top: 0; left: 0; width: 100%; height: 120rpx; opacity: .9; background: linear-gradient(#3c86c8 0 30%, #4f8f9a 31% 60%, #17242c 61%); }
.scene-roof { position: absolute; bottom: 6rpx; left: 30rpx; width: 220rpx; height: 40rpx; border-radius: 40% 40% 0 0; background: #7c4a2c; }
.scene-water { position: absolute; bottom: 10rpx; right: 40rpx; width: 260rpx; height: 24rpx; border-radius: 50%; background: #18c2d6; }
.header-title { position: absolute; top: 120rpx; left: 0; width: 100%; color: #fff; font-size: 48rpx; font-weight: 900; text-align: center; text-shadow: 3rpx 3rpx #111; }
.note-sub { position: absolute; top: 190rpx; left: 0; width: 100%; color: #ff3b2f; font-size: 46rpx; font-weight: 900; text-align: center; text-shadow: 0 0 10rpx rgba(255,59,47,.7); }

.note-body { position: relative; min-height: 1500rpx; margin: 0 26rpx; margin-top: 280rpx; padding: 30rpx 22rpx; border-radius: 8rpx 8rpx 20rpx 20rpx; background: radial-gradient(circle at 50% 40%, rgba(120,40,140,.35), transparent 55%), linear-gradient(180deg, #4a0a5a, #2a0636 70%); box-shadow: 0 0 0 4rpx #2b1a2f; }

.note-tabs { display: flex; gap: 14rpx; margin-bottom: 22rpx; }
.note-tab { margin: 0; padding: 12rpx 30rpx; border: 4rpx solid #a85ad8; border-radius: 10rpx; background: linear-gradient(#7a2a9c, #4c1a66); color: #f0d8ff; font-size: 32rpx; font-weight: 900; }
.note-tab.active { border-color: #ffe27a; background: linear-gradient(#9c3ad0, #5a1a80); color: #fff; }
.note-tab::after { border: none; }

.note-row { display: flex; align-items: center; margin-bottom: 12rpx; padding: 20rpx 18rpx; border-radius: 8rpx; background: linear-gradient(90deg, #5a1a6a, #4a125a); }
.new-badge { margin-right: 14rpx; color: #ff3b2f; font-size: 30rpx; font-weight: 900; }
.note-title { flex: 1; color: #f0e6f6; font-size: 32rpx; }
.view-btn { margin: 0; padding: 10rpx 26rpx; border: 4rpx solid #d8a8ff; border-radius: 8rpx; background: linear-gradient(#8a2ab0, #5a1a78); color: #fff; font-size: 28rpx; font-weight: 900; }
.view-btn::after { border: none; }

.note-footer { position: fixed; right: 0; bottom: 30rpx; left: 0; display: flex; justify-content: flex-end; padding: 0 30rpx; box-sizing: border-box; }
.back-fab { margin: 0; padding: 14rpx 44rpx; border: 4rpx solid #f0c14a; border-radius: 40rpx; background: linear-gradient(#e79b1c, #b0630d); color: #fff7d8; font-size: 32rpx; font-weight: 900; }
.back-fab::after { border: none; }
@media (min-width: 700px) { .note-screen { max-width: 750rpx; margin: 0 auto; } }
</style>
