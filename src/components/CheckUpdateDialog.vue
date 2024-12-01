<script setup lang="ts">
import { relaunch } from '@tauri-apps/plugin-process'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue'
import VueMarkdown from 'vue-markdown-render'

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
  <Dialog v-model:open="open">
    <DialogContent class="grid-rows-[auto_minmax(0,1fr)_auto] max-h-[90dvh] sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>发现新版本！</DialogTitle>
        <DialogDescription>检测到新版本可用，建议立即更新以获取最新功能</DialogDescription>
      </DialogHeader>
      <OverlayScrollbarsComponent v-if="updateInfo.body" defer>
        <VueMarkdown class="mx-2 text-sm prose prose-truegray" :source="updateInfo.body" />
      </OverlayScrollbarsComponent>
      <DialogFooter>
        <Button class="h-8 w-full" @click="installUpdate">
          立即更新
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
