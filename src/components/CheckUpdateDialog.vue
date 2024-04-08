<script setup lang="ts">
import { relaunch } from '@tauri-apps/plugin-process'

import type { Update } from '@tauri-apps/plugin-updater'

const { updateInfo } = $defineProps<{
  updateInfo: Update
}>()

let open = $(defineModel('open', { default: false }))

async function installUpdate() {
  await updateInfo.downloadAndInstall()
  await relaunch()
}
</script>

<template>
  <AlertDialog v-model:open="open">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>发现新版本！</AlertDialogTitle>
        <AlertDialogDescription>检测到新版本可用，建议立即更新以获取最新功能</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>之后再说</AlertDialogCancel>
        <AlertDialogAction @click="installUpdate">立即更新</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
