<script setup lang="ts">
import { type as getOsType } from '@tauri-apps/plugin-os'
import { configure } from 'vee-validate'

import type { OsType } from '@tauri-apps/plugin-os'

configure({
  validateOnBlur: false,
})

let osType = $ref<OsType>()

provide('osType', $$(osType))

onMounted(async () => {
  osType = await getOsType()
})
</script>

<template>
  <Toaster />
  <div :class="$style.defaultLayout" class="grid h-screen">
    <AppSidebar style="grid-area: sidebar" />
    <AppTitlebar style="grid-area: titlebar" />
    <RouterView v-slot="{ Component }" style="grid-area: main; height: calc(100vh - 1.75rem)">
      <Suspense>
        <component :is="Component" class="bg-background" :class="{ 'bg-opacity-80 dark:bg-opacity-90': focused }" />
      </Suspense>
    </RouterView>
  </div>
</template>

<style module>
.default-layout {
  grid:
    'sidebar titlebar' auto
    'sidebar main' minmax(0, 1fr)
    / auto minmax(0, 1fr);
}
</style>
