<script setup lang="ts">
import { invoke } from '@tauri-apps/api/core'
import { open, save } from '@tauri-apps/plugin-dialog'
import { FileUp, FileDown } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

const emits = defineEmits<{
  importSettings: []
}>()

const general = useGeneralSettingsStore()
const connect = useConnectSettingsStore()

async function importSettings() {
  const file = await open({
    title: '选择配置文件',
    filters: [
      {
        name: 'matcha 配置文件',
        extensions: ['mcs'],
      },
    ],
  })
  if (file) {
    const contents = await invoke<number[]>('read_file', { path: file.path })
    const setting = new TextDecoder().decode(new Uint8Array(contents))
    const config = JSON.parse(setting)
    general.$patch(config.general)
    connect.$patch(config.connect)
    emits('importSettings')
    toast.success('', { description: '导入配置成功' })
  }
}

async function exportSettings() {
  const path = await save({
    title: '导出配置文件',
    defaultPath: 'matcha-settings.mcs',
    filters: [
      {
        name: 'matcha 配置文件',
        extensions: ['mcs'],
      },
    ],
  })
  if (path) {
    const setting = JSON.stringify({
      general: general.$state,
      connect: connect.$state,
    })
    const contents = Array.from(new TextEncoder().encode(setting))
    await invoke('write_file', { contents, path, overwrite: true })
    toast.success('', { description: '导出配置成功' })
  }
}
</script>

<template>
  <div class="flex gap-1">
    <SearchBar />
    <TooltipProvider :delay-duration="1500">
      <Tooltip>
        <TooltipTrigger as-child>
          <Button variant="outline" size="icon" class="size-8" @click="importSettings">
            <FileDown class="size-5 stroke-1.5 text-zinc-400" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" class="px-2">
          <p class="text-xs">导入配置</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger as-child>
          <Button variant="outline" size="icon" class="size-8" @click="exportSettings">
            <FileUp class="size-5 stroke-1.5 text-zinc-400" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" class="px-2">
          <p class="text-xs">导出配置</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </div>
</template>
