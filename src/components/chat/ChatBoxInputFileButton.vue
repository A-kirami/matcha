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
  const file = await open({
    title: '选择上传文件',
    filters: [
      {
        name: 'All Files',
        extensions: ['*'],
      },
    ],
  })
  if (file) {
    const fileStat = await stat(file.path)
    const type = await invoke<FileType>('get_file_type', { file: { path: file.path } })
    emits('upload', {
      name: file.name || '',
      path: file.path,
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
