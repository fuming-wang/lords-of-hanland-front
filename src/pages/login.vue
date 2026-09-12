<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { login, register, translateAuthError } from '../services/auth'
import { isLoggedIn } from '../services/session'
import { relaunch } from '../services/navigation'

type Mode = 'login' | 'register'

const mode = ref<Mode>('login')
const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const errorMessage = ref('')
const submitting = ref(false)

onShow(() => {
  // 已登录(例如从 401 重定向回来前 token 已被清除)则直接进入启动页。
  if (isLoggedIn()) {
    relaunch('/pages/start')
  }
})

function switchMode(next: Mode) {
  if (next === mode.value) return
  mode.value = next
  errorMessage.value = ''
  password.value = ''
  confirmPassword.value = ''
}

function validate(): string {
  const name = username.value.trim()
  const nameLength = Array.from(name).length
  if (nameLength < 2 || nameLength > 32) return '用户名需为 2-32 个字符'
  if (password.value.length < 6 || password.value.length > 64) return '密码需为 6-64 个字符'
  if (mode.value === 'register' && password.value !== confirmPassword.value) {
    return '两次输入的密码不一致'
  }
  return ''
}

async function submit() {
  if (submitting.value) return
  const problem = validate()
  if (problem) {
    errorMessage.value = problem
    return
  }
  submitting.value = true
  errorMessage.value = ''
  const name = username.value.trim()
  try {
    if (mode.value === 'register') {
      await register(name, password.value)
      // 注册成功直接登录进入游戏,免去重复输入。
      await login(name, password.value)
    } else {
      await login(name, password.value)
    }
    relaunch('/pages/start')
  } catch (err) {
    errorMessage.value = translateAuthError(err instanceof Error ? err.message : '')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <view class="login-screen">
    <view class="scene-bg">
      <view class="scene-moon"></view>
      <view class="scene-hill scene-hill-far"></view>
      <view class="scene-hill scene-hill-near"></view>
    </view>

    <view class="login-card">
      <text class="game-title">汉土领主</text>
      <text class="game-subtitle">乱世争雄 · 登录建业</text>

      <view class="mode-tabs">
        <view class="mode-tab" :class="{ active: mode === 'login' }" @tap="switchMode('login')">登 录</view>
        <view class="mode-tab" :class="{ active: mode === 'register' }" @tap="switchMode('register')">注 册</view>
      </view>

      <view class="form">
        <view class="field">
          <text class="field-label">用户名</text>
          <input
            v-model="username"
            class="field-input"
            type="text"
            maxlength="32"
            placeholder="2-32 个字符"
            placeholder-style="color:#7a735c"
          />
        </view>
        <view class="field">
          <text class="field-label">密码</text>
          <input
            v-model="password"
            class="field-input"
            :password="true"
            maxlength="64"
            placeholder="6-64 个字符"
            placeholder-style="color:#7a735c"
            @confirm="submit"
          />
        </view>
        <view v-if="mode === 'register'" class="field">
          <text class="field-label">确认密码</text>
          <input
            v-model="confirmPassword"
            class="field-input"
            :password="true"
            maxlength="64"
            placeholder="再次输入密码"
            placeholder-style="color:#7a735c"
            @confirm="submit"
          />
        </view>
      </view>

      <text v-if="errorMessage" class="error-text">{{ errorMessage }}</text>

      <button class="submit-btn" :disabled="submitting" @tap="submit">
        {{ submitting ? '请稍候…' : mode === 'login' ? '进入游戏' : '注册并进入游戏' }}
      </button>
      <text class="form-tip">{{ mode === 'login' ? '还没有账号?切换到「注册」创建账号' : '注册即代表你同意游戏内行为规范' }}</text>
    </view>
  </view>
</template>

<style scoped>
.login-screen {
  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
  background: #05080f;
  color: #f6efd8;
  box-sizing: border-box;
}

.scene-bg { position: absolute; top: 0; left: 0; width: 100%; height: 480rpx; }
.scene-moon {
  position: absolute; top: 60rpx; right: 90rpx; width: 130rpx; height: 130rpx;
  border-radius: 50%; background: radial-gradient(circle at 38% 38%, #fff6d8, #e8d28a 60%, #b9993f);
  box-shadow: 0 0 60rpx rgba(240, 214, 140, .45);
}
.scene-hill { position: absolute; bottom: -40rpx; left: -10%; width: 120%; border-radius: 50% 50% 0 0; }
.scene-hill-far { height: 220rpx; background: #101827; }
.scene-hill-near { height: 140rpx; background: #0b1220; }

.login-card {
  position: relative;
  margin: 300rpx 40rpx 0;
  padding: 56rpx 44rpx 44rpx;
  border-radius: 16rpx;
  background: linear-gradient(180deg, #141b2c, #0d1322);
  box-shadow: 0 0 0 4rpx #2b2a20, 0 10rpx 40rpx rgba(0, 0, 0, .6);
  box-sizing: border-box;
}

.game-title { display: block; color: #ffd84a; font-size: 64rpx; font-weight: 900; text-align: center; letter-spacing: 8rpx; text-shadow: 0 0 20rpx rgba(255, 216, 74, .4); }
.game-subtitle { display: block; margin-top: 8rpx; color: #a89a72; font-size: 26rpx; text-align: center; letter-spacing: 4rpx; }

.mode-tabs { display: flex; margin-top: 44rpx; border-radius: 12rpx; overflow: hidden; border: 4rpx solid #3a3524; }
.mode-tab { flex: 1; padding: 22rpx 0; color: #a89a72; font-size: 34rpx; font-weight: 900; text-align: center; background: #0a0f1c; letter-spacing: 6rpx; }
.mode-tab.active { color: #2b1c06; background: linear-gradient(#f0c14a, #d19a2a); text-shadow: 0 1rpx 0 rgba(255, 255, 255, .4); }

.form { margin-top: 40rpx; }
.field { margin-bottom: 28rpx; }
.field-label { display: block; margin-bottom: 12rpx; color: #c9bd97; font-size: 28rpx; }
.field-input {
  width: 100%;
  height: 92rpx;
  padding: 0 24rpx;
  border: 4rpx solid #3a3524;
  border-radius: 10rpx;
  background: #0a0f1c;
  color: #f6efd8;
  font-size: 32rpx;
  box-sizing: border-box;
}
.field-input:focus { border-color: #f0c14a; }

.error-text { display: block; margin-top: 6rpx; color: #ff6a5a; font-size: 26rpx; line-height: 1.5; }

.submit-btn {
  margin: 44rpx 0 0;
  padding: 24rpx 0;
  border: 5rpx solid #f0c14a;
  border-radius: 12rpx;
  background: linear-gradient(#e79b1c, #b0630d);
  color: #fff7d8;
  font-size: 36rpx;
  font-weight: 900;
  letter-spacing: 4rpx;
}
.submit-btn::after { border: none; }
.submit-btn[disabled] { opacity: .6; }

.form-tip { display: block; margin-top: 24rpx; color: #7a735c; font-size: 24rpx; text-align: center; }

@media (min-width: 700px) { .login-screen { max-width: 750rpx; margin: 0 auto; } }
</style>
