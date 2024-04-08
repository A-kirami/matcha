<script setup lang="ts">
import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue'
import { toast } from 'vue-sonner'

import type { Event } from '~/adapter/event'

const { event } = $defineProps<{
  event: Event
}>()

let open = $(defineModel('open', { default: false }))

function copyEvent() {
  navigator.clipboard.writeText(JSON.stringify(event))
  toast.success('', { description: '事件已复制' })
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogTrigger as-child>
      <slot></slot>
    </DialogTrigger>
    <DialogContent class="grid-rows-[auto_minmax(0,1fr)_auto] max-h-[90dvh] sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>原始事件</DialogTitle>
        <DialogDescription>查看原始事件代码</DialogDescription>
      </DialogHeader>
      <OverlayScrollbarsComponent defer class="select-text rounded-md bg-gray-100 px-4 py-2 dark:bg-[#242936]">
        <HighlightCode language="json" :code="JSON.stringify(event, null, '\t')" />
      </OverlayScrollbarsComponent>
      <DialogFooter>
        <Button class="h-8 w-full" @click="copyEvent">复制事件</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
