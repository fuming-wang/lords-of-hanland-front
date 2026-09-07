<script setup lang="ts">
import { onLaunch, onShow } from '@dcloudio/uni-app'

onLaunch(() => {
  console.info('Lords of Hanland launched')
})

onShow(() => {
  // 统一处理从后台恢复时的会话、资源和音频状态。
})
</script>

<template>
  <slot />
</template>
