<script setup lang="ts">
import { attachConsole } from '@tauri-apps/plugin-log'
import { locale as dayjsLocale } from 'dayjs'

import 'dayjs/locale/zh-cn'

dayjsLocale('zh-cn')

document.addEventListener('contextmenu', (e) => {
  if (import.meta.env.PROD) {
    e.preventDefault()
  }
})

const general = useGeneralSettingsStore()

const { theme } = storeToRefs(general)

const themeMode = useColorMode({
  emitAuto: true,
  storageRef: theme,
})

provide('themeMode', themeMode)

onBeforeMount(async () => {
  await attachConsole()
  await setWindowEffect()
  await setAcrylicWindowEffect(general.applyAcrylicWindowEffects)
})
</script>

<template>
  <RouterView />
</template>
