<script setup lang="ts">
import { WebviewWindow } from '@tauri-apps/api/webviewWindow'
import { SlidersHorizontal, Info, Bolt, Terminal, RefreshCw } from 'lucide-vue-next'

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

let open = $ref(false)
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <SlidersHorizontal class="size-7 cursor-pointer stroke-1.5 text-gray-500" dark="text-gray-400" />
    </DropdownMenuTrigger>
    <DropdownMenuContent class="ml-15 w-46 -mb-10">
      <DropdownMenuItem class="cursor-pointer" @click="open = true">
        <Terminal class="mr-2 size-4 stroke-1.5" />
        <span>命令面板</span>
        <DropdownMenuShortcut>Ctrl+J</DropdownMenuShortcut>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <RouterLink :to="settingsPath">
        <DropdownMenuItem class="cursor-pointer">
          <Bolt class="mr-2 size-4 stroke-1.5" />
          设置
        </DropdownMenuItem>
      </RouterLink>
      <DropdownMenuItem class="cursor-pointer" @click="openAbout">
        <Info class="mr-2 size-4 stroke-1.5" />
        <span>关于</span>
      </DropdownMenuItem>
      <DropdownMenuItem class="cursor-pointer">
        <RefreshCw class="mr-2 size-4 stroke-1.5" />
        <span>检查更新</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
  <AppCommand v-model:open="open" />
</template>
