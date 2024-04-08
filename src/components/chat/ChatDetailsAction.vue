<script setup lang="ts">
import { Bot, MessageCircleCode, ChevronRight, Workflow } from 'lucide-vue-next'
</script>

<template>
  <div class="flex flex-col gap-2">
    <Button variant="secondary" class="h-9 flex justify-start gap-2 px-4 text-muted-foreground">
      <span class="size-7 flex items-center justify-center rounded-md bg-violet-100">
        <Bot class="size-5 stroke-1.5 text-violet-500" />
      </span>
      <span class="text-xs">快捷调用</span>
      <ChevronRight class="ml-auto size-5 stroke-1.5" />
    </Button>
    <Button variant="secondary" class="h-9 flex justify-start gap-2 text-muted-foreground">
      <span class="size-7 flex items-center justify-center rounded-md bg-blue-100">
        <MessageCircleCode class="size-5 stroke-1.5 text-blue-500" />
      </span>
      <span class="text-xs">自定义事件</span>
      <ChevronRight class="ml-auto size-5 stroke-1.5" />
    </Button>
    <Button variant="secondary" class="h-9 flex justify-start gap-2 text-muted-foreground">
      <span class="size-7 flex items-center justify-center rounded-md bg-orange-100">
        <Workflow class="size-5 stroke-1.5 text-orange-500" />
      </span>
      <span class="text-xs">运行流程</span>
      <ChevronRight class="ml-auto size-5 stroke-1.5" />
    </Button>
  </div>
</template>
