<script setup lang="ts">
import { relaunch } from '@tauri-apps/plugin-process'
import { check } from '@tauri-apps/plugin-updater'
import { configure } from 'vee-validate'

import { isRelease } from '~build/meta'

configure({
  validateOnBlur: false,
})

onMounted(async () => {
  const general = useGeneralSettingsStore()

  await general.startAssetsServer(general.assetsServerAddress)

  if (isRelease && general.autoUpdate) {
    try {
      const update = await check()
      if (update) {
        await update.downloadAndInstall()
        await relaunch()
      }
    } catch (error) {
      void logger.error(`检查更新失败: ${error as string}`)
    }
  }
})
</script>

<template>
  <div :class="$style.defaultLayout" class="grid h-screen">
    <AppSidebar style="grid-area: sidebar;" />
    <AppTitlebar style="grid-area: titlebar;" />
    <RouterView v-slot="{ Component }" style="grid-area: main; height: calc(100vh - 1.75rem);">
      <Suspense>
        <component :is="Component" class="bg-background" :class="{ 'bg-opacity-80 dark:bg-opacity-90': focused }" />
      </Suspense>
    </RouterView>
  </div>
  <Toaster class="pointer-events-auto" />
  <ModalWindow />
</template>

<style module>
.default-layout {
  grid:
    "sidebar titlebar" auto
    "sidebar main" minmax(0, 1fr)
    / auto minmax(0, 1fr);
}
</style>
