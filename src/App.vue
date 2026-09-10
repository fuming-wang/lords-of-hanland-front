<script setup lang="ts">
import { onLaunch, onShow } from '@dcloudio/uni-app'

onLaunch(() => {
  console.info('Lords of Hanland launched')
  // vite 开发模式下页面模块按需编译:首次跳转到尚未编译的页面时,
  // 编译可能来不及完成,导致路由已切换但页面不渲染(停留在旧页面)。
  // 启动时预热全部页面模块,保证登录后第一次跳转就能正常渲染。
  if (import.meta.env.DEV) {
    const pageModules = import.meta.glob('../pages/**/*.vue')
    Object.values(pageModules).forEach((load) => {
      load().catch(() => {})
    })
  }
})

onShow(() => {
  // 统一处理从后台恢复时的会话、资源和音频状态。
})
</script>

<template>
  <slot />
</template>
