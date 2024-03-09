<script setup lang="ts">
import { SlidersHorizontal, Info, Bolt, Terminal, RefreshCw } from 'lucide-vue-next'
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <SlidersHorizontal class="size-7 cursor-pointer text-gray-600" :stroke-width="1.5" />
    </DropdownMenuTrigger>
    <DropdownMenuContent class="mb--10 ml-15 w-46">
      <DropdownMenuItem>
        <Terminal class="mr-2 size-4" :stroke-width="1.5" />
        <span>命令面板</span>
        <DropdownMenuShortcut>Ctrl+J</DropdownMenuShortcut>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem>
        <Bolt class="mr-2 size-4" :stroke-width="1.5" />
        <RouterLink to="/settings" class="w-full">设置</RouterLink>
      </DropdownMenuItem>
      <DropdownMenuItem>
        <Info class="mr-2 size-4" :stroke-width="1.5" />
        <span>关于</span>
      </DropdownMenuItem>
      <DropdownMenuItem>
        <RefreshCw class="mr-2 size-4" :stroke-width="1.5" />
        <span>检查更新</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
