<script setup lang="ts">
import { attachConsole } from '@tauri-apps/plugin-log'
import { message } from 'ant-design-vue'
import { locale as dayjsLocale } from 'dayjs'

import 'dayjs/locale/zh-cn'

dayjsLocale('zh-cn')

message.config({
  maxCount: 7,
})

onBeforeMount(async () => {
  await attachConsole()
})

document.addEventListener('contextmenu', (e) => {
  if (import.meta.env.PROD) {
    e.preventDefault()
  }
})
</script>

<template>
  <RouterView />
</template>
