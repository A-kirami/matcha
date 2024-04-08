<script setup lang="ts">
import type { OsType } from '@tauri-apps/plugin-os'

const osType = inject<OsType>('osType')

const isMacOs = $computed(() => osType === 'macos')
</script>

<template>
  <aside
    class="w-15 flex flex-col items-center gap-4 bg-background pb-5"
    :class="[
      focused ? 'bg-opacity-40 dark:bg-opacity-60' : 'bg-opacity-70 dark:bg-opacity-90',
      isMacOs ? 'pt-2' : 'pt-7',
    ]"
  >
    <WindowControls v-if="isMacOs" />
    <AppLogo class="size-9" />
    <AppSidebarNavigation />
    <AppSidebarUserAvatar class="mt-auto" />
    <AppSidebarManageButton />
  </aside>
</template>
