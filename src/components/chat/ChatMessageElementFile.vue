<script setup lang="ts">
import { invoke } from '@tauri-apps/api/core'
import { save } from '@tauri-apps/plugin-dialog'
import { toast } from 'vue-sonner'

import type { FileContent } from '~/adapter/content'
import type { FileInfo } from '~/utils/file'

const { data } = $defineProps<{
  data: FileContent['data']
}>()

let fileInfo = $ref<FileInfo>()

async function saveFile() {
  const path = await save({
    title: '保存到本地',
    defaultPath: fileInfo?.name,
    filters: [
      {
        name: 'All Files',
        extensions: ['*'],
      },
    ],
  })
  if (path) {
    await invoke('copy_file', { source: fileInfo!.path, target: path })
    toast.success('', { description: '文件已保存' })
  }
}

onMounted(async () => {
  fileInfo = await getFileInfo(data.id)
})
</script>

<template>
  <FileCard
    v-if="fileInfo"
    :id="fileInfo.id"
    :name="fileInfo.name"
    :size="fileInfo.size"
    data-type="file"
    downloadable
    @download="saveFile"
  />
</template>
