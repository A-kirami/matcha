<script setup lang="ts">
import { RefreshCw } from 'lucide-vue-next'

const state = useStateStore()
</script>

<template>
  <div class="flex flex-row cursor-pointer items-center gap-2" @click="state.refreshBot()">
    <span class="relative size-2 flex">
      <span
        class="absolute h-full w-full inline-flex rounded-full opacity-75"
        :class="{ 'bg-emerald-300 animate-ping': state.isConnected }"
      />
      <span
        class="relative size-2 inline-flex rounded-full bg-emerald-400"
        :class="[state.isConnected ? 'bg-emerald-400' : 'bg-rose-400']"
      />
    </span>
    <span class="text-xs text-muted-foreground">{{ state.isConnected ? '已连接' : '未连接' }}</span>
    <RefreshCw class="size-4 text-muted-foreground" />
  </div>
</template>
