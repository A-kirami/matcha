<script setup lang="ts">
import { invoke } from '@tauri-apps/api/core'
import { open } from '@tauri-apps/plugin-dialog'
import { stat } from '@tauri-apps/plugin-fs'
import { Paperclip } from 'lucide-vue-next'

import type { UploadFile, FileType } from '~/types'

const emits = defineEmits<{
  upload: [val: UploadFile & { path: string }]
}>()

async function uploadFile() {
  const filePath = await open({
    title: '选择上传文件',
    filters: [
      {
        name: 'All Files',
        extensions: ['*'],
      },
    ],
  })
  if (filePath) {
    const fileStat = await stat(filePath)
    const type = await invoke<FileType>('get_file_type', { file: { path: filePath } })
    emits('upload', {
      name: filePath.split('/').pop()?.split('\\')
        .pop() || '',
      path: filePath,
      size: fileStat.size,
      type,
    })
  }
}
</script>

<template>
  <Button variant="ghost" size="icon" class="size-8" @click="uploadFile">
    <Paperclip class="stroke-1.5 text-muted-foreground" />
  </Button>
</template>
