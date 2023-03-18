<script setup lang="ts">
import { message } from 'ant-design-vue'
import { locale as dayjsLocale } from 'dayjs'
import { onBeforeMount } from 'vue'

import { logger } from '@/plugins'

import 'dayjs/locale/zh-cn'

onBeforeMount(async () => {
  dayjsLocale('zh-cn')

  message.config({
    maxCount: 7,
  })

  await logger.attachConsole()
})
</script>

<template>
  <RouterView />
</template>
