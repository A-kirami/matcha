<script setup lang="ts">
import { type as getOsType } from '@tauri-apps/plugin-os'
import { relaunch } from '@tauri-apps/plugin-process'
import { configure } from 'vee-validate'

import type { OsType } from '@tauri-apps/plugin-os'

import { isRelease } from '~build/meta'

configure({
  validateOnBlur: false,
})

let osType = $ref<OsType>()

provide('osType', $$(osType))

onMounted(async () => {
  osType = await getOsType()

  const general = useGeneralSettingsStore()

  if (isRelease && general.autoUpdate) {
    const update = await checkUpdate()
    if (update?.available) {
      await update.downloadAndInstall()
      await relaunch()
    }
  }
})
</script>

<template>
  <div :class="$style.defaultLayout" class="grid h-screen">
    <AppSidebar style="grid-area: sidebar" />
    <AppTitlebar style="grid-area: titlebar" />
    <RouterView v-slot="{ Component }" style="grid-area: main; height: calc(100vh - 1.75rem)">
      <Suspense>
        <component :is="Component" class="bg-background" :class="{ 'bg-opacity-80 dark:bg-opacity-90': focused }" />
      </Suspense>
    </RouterView>
  </div>
  <Toaster class="pointer-events-auto" />
</template>

<style module>
.default-layout {
  grid:
    'sidebar titlebar' auto
    'sidebar main' minmax(0, 1fr)
    / auto minmax(0, 1fr);
}
</style>
