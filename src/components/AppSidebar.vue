<script setup lang="ts">
import { type as getOsType } from '@tauri-apps/plugin-os'

const osType = getOsType()
</script>

<template>
  <aside
    class="flex flex-col items-center gap-4 bg-background pb-5"
    :class="[
      focused ? 'bg-opacity-40 dark:bg-opacity-60' : 'bg-opacity-70 dark:bg-opacity-90',
      osType === 'macos' ? 'pt-8 w-18' : 'pt-7 w-15',
    ]"
  >
    <AppLogo class="size-9" />
    <AppSidebarNavigation />
    <AppSidebarUserAvatar class="mt-auto" />
    <AppSidebarManageButton />
  </aside>
</template>
