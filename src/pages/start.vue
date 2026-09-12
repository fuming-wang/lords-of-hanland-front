<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { isLoggedIn, clearSession } from '../services/session'
import { relaunch } from '../services/navigation'

type Screen = 'splash' | 'menu'

const screen = ref<Screen>('splash')

onShow(() => {
  // 未登录(直接刷新 start 页或 token 已失效)先回登录页。
  if (!isLoggedIn()) {
    relaunch('/pages/login')
  }
})

function enterGame() {
  uni.navigateTo({ url: '/pages/server' })
}

// exitGame 退出:App 端直接退出应用,其余平台清除会话回登录页。
function exitGame() {
  // #ifdef APP-PLUS
  const appRuntime = (globalThis as typeof globalThis & {
    plus?: { runtime?: { quit?: () => void } }
  }).plus?.runtime
  if (appRuntime?.quit) {
    appRuntime.quit()
    return
  }
  // #endif
  clearSession()
  relaunch('/pages/login')
}
</script>

<template>
  <view class="game-root">
    <view v-if="screen === 'splash'" class="screen splash-screen" @tap="screen = 'menu'">
      <view class="splash-art">
        <view class="sun-glow"></view><view class="mountain mountain-back"></view><view class="mountain mountain-front"></view>
        <view class="warrior"><view class="warrior-hair"></view><view class="warrior-face"></view><view class="warrior-armor"></view><view class="warrior-ribbon"></view></view>
        <view class="title-seal"><text>汉</text><text>土</text><text>领</text><text>主</text></view>
        <view class="online-mark">ONLINE</view><view class="free-mark">永久免费</view>
      </view>
      <view class="tap-hint"><view class="tap-hint-line"></view><text>点击进入</text><view class="tap-hint-line"></view></view>
    </view>

    <view v-else class="screen splash-screen menu-screen">
      <view class="splash-art">
        <view class="sun-glow"></view><view class="mountain mountain-back"></view><view class="mountain mountain-front"></view>
        <view class="warrior"><view class="warrior-hair"></view><view class="warrior-face"></view><view class="warrior-armor"></view><view class="warrior-ribbon"></view></view>
        <view class="title-seal"><text>汉</text><text>土</text><text>领</text><text>主</text></view>
        <view class="online-mark">ONLINE</view><view class="free-mark">永久免费</view>
      </view>
      <view class="menu-panel">
        <view class="menu-item enter-item" @tap="enterGame"><text class="menu-arrow">➤</text><text>进入游戏</text></view>
        <view class="menu-item exit-item" @tap="exitGame">退出</view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.game-root {
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
  background: #191919;
  color: #fff;
}

.screen {
  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
}

.splash-screen {
  background: #191919;
}

.splash-art {
  position: relative;
  width: 100%;
  height: 1180rpx;
  overflow: hidden;
  background:
    radial-gradient(circle at 58% 54%, rgba(255, 241, 110, 0.95) 0 8%, rgba(255, 133, 0, 0.82) 18%, transparent 45%),
    linear-gradient(145deg, #250000 0%, #7a1200 36%, #db3500 66%, #270000 100%);
}

.sun-glow {
  position: absolute;
  top: 280rpx;
  left: 28%;
  width: 620rpx;
  height: 620rpx;
  border-radius: 50%;
  background: radial-gradient(circle, #fffbd0 0 3%, #ffc400 18%, rgba(255, 65, 0, 0.35) 48%, transparent 70%);
  filter: blur(14rpx);
}

.mountain {
  position: absolute;
  bottom: -80rpx;
  width: 780rpx;
  height: 680rpx;
  border-radius: 50% 50% 0 0;
  transform: rotate(-10deg);
}

.mountain-back {
  left: -300rpx;
  background: linear-gradient(145deg, #64230c, #1f0907 72%);
  box-shadow: 220rpx -100rpx 0 #6c2b0d, 460rpx 70rpx 0 #4d1707;
}

.mountain-front {
  right: -300rpx;
  bottom: -180rpx;
  height: 850rpx;
  background: linear-gradient(160deg, #f4a400 0%, #cb3a08 32%, #560a08 75%);
  opacity: 0.94;
}

.warrior {
  position: absolute;
  right: -100rpx;
  bottom: 0;
  width: 680rpx;
  height: 920rpx;
}

.warrior-hair {
  position: absolute;
  top: 75rpx;
  left: 70rpx;
  width: 560rpx;
  height: 400rpx;
  border-radius: 52% 48% 44% 38%;
  transform: rotate(-12deg);
  background: linear-gradient(145deg, #ff4d70 8%, #c2083b 45%, #360005 76%);
  box-shadow: -70rpx 100rpx 0 -14rpx #610018, 160rpx -70rpx 0 -24rpx #ff8295;
}

.warrior-face {
  position: absolute;
  top: 220rpx;
  left: 210rpx;
  width: 280rpx;
  height: 350rpx;
  border-radius: 48% 42% 50% 54%;
  transform: rotate(-17deg);
  background: radial-gradient(circle at 64% 33%, #3b0607 0 4%, transparent 5%), linear-gradient(150deg, #ffe3a0 0%, #f4a173 58%, #9f372d 100%);
  box-shadow: 20rpx 34rpx 0 rgba(255, 201, 143, 0.28);
}

.warrior-armor {
  position: absolute;
  top: 540rpx;
  left: 60rpx;
  width: 560rpx;
  height: 480rpx;
  border-radius: 50% 50% 0 0;
  transform: rotate(-9deg);
  background: linear-gradient(145deg, #ffbb36 0 18%, #b80938 19% 56%, #6d001a 57% 75%, #f1a23e 76%);
  box-shadow: inset 0 22rpx 0 rgba(255, 230, 150, 0.45);
}

.warrior-ribbon {
  position: absolute;
  top: 20rpx;
  right: 0;
  width: 460rpx;
  height: 110rpx;
  transform: rotate(19deg);
  border-radius: 50%;
  background: linear-gradient(90deg, #ff9bad, #de003f 54%, #64001d);
}

.title-seal {
  position: absolute;
  top: 72rpx;
  left: 36rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #ffe500;
  font-size: 92rpx;
  font-weight: 900;
  line-height: 0.96;
  letter-spacing: -12rpx;
  text-shadow: 5rpx 5rpx 0 #fa2c00, 9rpx 9rpx 0 #610000;
  transform: rotate(-4deg);
}

.online-mark {
  position: absolute;
  top: 515rpx;
  left: 48rpx;
  color: #ffdf00;
  font-size: 58rpx;
  font-weight: 900;
  letter-spacing: 2rpx;
  text-shadow: 4rpx 4rpx 0 #fb2900;
}

.free-mark {
  position: absolute;
  right: 28rpx;
  bottom: 42rpx;
  padding: 20rpx 16rpx;
  border: 5rpx solid #ffdf00;
  border-radius: 50%;
  background: #a60212;
  color: #fff4bd;
  font-size: 34rpx;
  font-weight: 800;
  line-height: 1.2;
  writing-mode: vertical-rl;
  transform: rotate(10deg);
}

.tap-hint {
  position: absolute;
  bottom: 110rpx;
  left: 50%;
  display: flex;
  align-items: center;
  gap: 18rpx;
  transform: translateX(-50%);
  color: #ffe86a;
  font-size: 32rpx;
  font-weight: 700;
  text-shadow: 2rpx 2rpx #7c1a00;
  white-space: nowrap;
}

.tap-hint-line {
  width: 76rpx;
  height: 3rpx;
  background: #ffd028;
}

.menu-panel {
  position: absolute;
  top: 940rpx;
  left: 0;
  width: 100%;
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 116rpx;
  border-top: 4rpx solid #ffda00;
  border-bottom: 4rpx solid #8d1200;
  color: #171717;
  font-size: 58rpx;
  font-weight: 900;
  text-shadow: 2rpx 2rpx #fff;
}

.enter-item {
  background: linear-gradient(#ffc51b, #ff9d00);
}

.exit-item {
  background: linear-gradient(#6b0000, #300000);
  color: #111;
  text-shadow: 2rpx 2rpx #a75a5a;
}

.menu-arrow {
  margin-right: 22rpx;
  color: #812000;
  font-size: 52rpx;
}

@media (min-width: 700px) {
  .game-root {
    max-width: 750rpx;
    margin: 0 auto;
  }
}
</style>
