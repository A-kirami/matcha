<script setup lang="ts">
import { Search } from 'lucide-vue-next'

const model = defineModel<string>()
</script>

<template>
  <div class="relative w-full items-center">
    <Input
      id="search"
      v-model="model"
      type="text"
      placeholder="搜索"
      class="h-8 pl-8 text-xs focus-visible:ring-none placeholder-gray-400"
    />
    <span class="absolute start-0 inset-y-0 flex items-center justify-center px-2">
      <Search class="size-4 text-gray-400" />
    </span>
  </div>
</template>
