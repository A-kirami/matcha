<script setup lang="ts">
import { WebviewWindow } from '@tauri-apps/api/webviewWindow'
import { SlidersHorizontal, Info, Bolt, Terminal, RefreshCw } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

import type { Update } from '@tauri-apps/plugin-updater'

import { isRelease } from '~build/meta'

const router = useRouter()

const routes = router.getRoutes()

const settingsPath = routes
  .filter((route) => route.meta.isSettings)
  .sort((a, b) => ((a.meta.position as number) ?? Infinity) - ((b.meta.position as number) ?? Infinity))[0].path

async function openAbout() {
  const window = WebviewWindow.getByLabel('about')
  if (window) {
    await window.setFocus()
  }
  return new WebviewWindow('about', {
    url: '/about',
    title: '关于',
    center: true,
    width: 460,
    height: 320,
    resizable: false,
    decorations: false,
  })
}

let commandOpen = $ref(false)

let updateOpen = $ref(false)

let updateInfo = $ref<Update>()

async function manualCheckUpdate() {
  const update = await checkUpdate()
  if (update?.available) {
    updateInfo = update
    updateOpen = true
  } else {
    toast.success('', { description: '当前已是最新版本，无需更新' })
  }
}

const isDev = import.meta.env.DEV
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <SlidersHorizontal class="size-7 cursor-pointer stroke-1.5 text-gray-500" dark="text-gray-400" />
    </DropdownMenuTrigger>
    <DropdownMenuContent class="ml-15 w-46 -mb-10">
      <DropdownMenuItem class="cursor-pointer" @click="commandOpen = true">
        <Terminal class="mr-2 size-4 stroke-1.5" />
        <span>命令面板</span>
        <DropdownMenuShortcut>Ctrl+J</DropdownMenuShortcut>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <RouterLink :to="settingsPath">
        <DropdownMenuItem class="cursor-pointer">
          <Bolt class="mr-2 size-4 stroke-1.5" />
          <span>设置</span>
        </DropdownMenuItem>
      </RouterLink>
      <DropdownMenuItem class="cursor-pointer" @click="openAbout">
        <Info class="mr-2 size-4 stroke-1.5" />
        <span>关于</span>
      </DropdownMenuItem>
      <DropdownMenuItem v-if="isRelease || isDev" class="cursor-pointer" @click="manualCheckUpdate">
        <RefreshCw class="mr-2 size-4 stroke-1.5" />
        <span>检查更新</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
  <AppCommand v-model:open="commandOpen" />
  <CheckUpdateDialog v-if="updateInfo" v-model:open="updateOpen" :update-info="updateInfo" />
</template>
