<script setup lang="ts">
import { ref } from 'vue'
import { clearSession, getUsername } from '../../services/session'
import { relaunch } from '../../services/navigation'

const accountName = ref(getUsername())

function goBack() { uni.navigateBack() }

function logout() {
  uni.showModal({
    title: '退出登录',
    content: '确定要退出当前账号吗?',
    success: (res) => {
      if (!res.confirm) return
      clearSession()
      relaunch('/pages/login')
    },
  })
}
</script>

<template>
  <view class="member-screen">
    <view class="member-header">
      <view class="scene-bg"><view class="scene-roof"></view><view class="scene-water"></view></view>
      <text class="header-title">许昌</text>
    </view>
    <view class="member-sub">我的会员信息</view>

    <view class="member-body">
      <text class="para">当前账号:{{ accountName || '未知' }}</text>
      <text class="para para-space">您当前不是会员,立即开通可享受会员尊贵权益</text>
      <text class="para para-space">三国会员为您提供:</text>
      <text class="benefit">升级加速,免费自动补满气血,免费赠送将才英才,神兵套装5折优惠券等等专属会员用户权益</text>

      <button class="action-btn">查看更多的会员权益</button>
      <button class="action-btn open-btn">马上开通会员 <text class="arrow">>></text></button>
    </view>

    <view class="member-footer">
      <button class="back-fab logout-btn" @tap="logout">退出登录</button>
      <button class="back-fab" @tap="goBack">返回</button>
    </view>
  </view>
</template>

<style scoped>
.member-screen {
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
.member-header { position: relative; height: 180rpx; overflow: hidden; background: linear-gradient(180deg, #0a0d16, #0b1220); }
.scene-bg { position: absolute; top: 0; left: 0; width: 100%; height: 120rpx; opacity: .9; background: linear-gradient(#3c86c8 0 30%, #4f8f9a 31% 60%, #17242c 61%); }
.scene-roof { position: absolute; bottom: 6rpx; left: 30rpx; width: 220rpx; height: 40rpx; border-radius: 40% 40% 0 0; background: #7c4a2c; }
.scene-water { position: absolute; bottom: 10rpx; right: 40rpx; width: 260rpx; height: 24rpx; border-radius: 50%; background: #18c2d6; }
.header-title { position: absolute; top: 120rpx; left: 0; width: 100%; color: #fff; font-size: 48rpx; font-weight: 900; text-align: center; text-shadow: 3rpx 3rpx #111; }
.member-sub { position: absolute; top: 190rpx; left: 0; width: 100%; color: #ff3b2f; font-size: 46rpx; font-weight: 900; text-align: center; text-shadow: 0 0 10rpx rgba(255,59,47,.7); }

.member-body {
  position: relative;
  min-height: 1500rpx;
  margin: 0 30rpx;
  margin-top: 280rpx;
  padding: 60rpx 44rpx;
  border-radius: 8rpx 8rpx 20rpx 20rpx;
  background: radial-gradient(circle at 50% 55%, rgba(150,40,60,.4), transparent 60%), linear-gradient(180deg, #7a1020, #4a0a14 70%);
  box-shadow: 0 0 0 4rpx #2b1a1f, inset 0 0 50rpx rgba(255,80,80,.15);
}
.para { display: block; color: #d8c8cf; font-size: 34rpx; line-height: 1.7; }
.para-space { margin-top: 40rpx; color: #e8d0d8; }
.benefit { display: block; margin-top: 10rpx; color: #ffd84a; font-size: 34rpx; line-height: 1.7; }
.action-btn { display: block; margin: 40rpx auto 0; padding: 20rpx 40rpx; border: 5rpx solid #d84a3a; border-radius: 12rpx; background: linear-gradient(#c0202a, #7a0d16); color: #ffe27a; font-size: 32rpx; font-weight: 900; }
.action-btn.open-btn { color: #fff; }
.action-btn::after { border: none; }
.arrow { color: #ffd84a; }

.member-footer { position: fixed; right: 0; bottom: 30rpx; left: 0; display: flex; gap: 20rpx; justify-content: flex-end; padding: 0 30rpx; box-sizing: border-box; }
.back-fab { margin: 0; padding: 14rpx 44rpx; border: 4rpx solid #f0c14a; border-radius: 40rpx; background: linear-gradient(#e79b1c, #b0630d); color: #fff7d8; font-size: 32rpx; font-weight: 900; }
.back-fab::after { border: none; }
.logout-btn { border-color: #d84a3a; background: linear-gradient(#c0202a, #7a0d16); color: #ffe27a; }
@media (min-width: 700px) { .member-screen { max-width: 750rpx; margin: 0 auto; } }
</style>
