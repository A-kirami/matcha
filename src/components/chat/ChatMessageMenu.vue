<script setup lang="ts">
import ClipboardJS from 'clipboard'
import { Copy, FileJson2, Reply, Undo2 } from 'lucide-vue-next'

import { Behav } from '~/adapter/behav'

import type { Message } from '~/stores/chat'

const { message } = $defineProps<{
  message: Message
}>()

const behav = new Behav()

const session = useSessionStore()

const messageId = message.scene.message_id

function setReplyMessage() {
  session.currentSession!.replyMessageId = messageId
}

const eventOpen = $ref(false)

const copyTarget = `[data-message-id="${messageId}"]`

const clipboard = new ClipboardJS('#copy-message')

clipboard.on('success', (e) => {
  e.clearSelection()
})

onUnmounted(() => {
  clipboard.destroy()
})
</script>

<template>
  <ContextMenu>
    <ContextMenuTrigger as-child>
      <slot />
    </ContextMenuTrigger>
    <ContextMenuContent class="text-sm space-y-1">
      <ContextMenuItem
        v-if="message.event"
        class="flex items-center gap-2 px-2 py-1 text-gray-500"
        @click="eventOpen = true"
      >
        <FileJson2 class="size-4 stroke-1" />
        <span>查看事件</span>
      </ContextMenuItem>
      <ContextMenuItem
        id="copy-message"
        class="flex items-center gap-2 px-2 py-1 text-gray-500"
        :data-clipboard-target="copyTarget"
      >
        <Copy class="size-4 stroke-1" />
        <span>复制</span>
      </ContextMenuItem>
      <ContextMenuItem class="flex items-center gap-2 px-2 py-1 text-gray-500" @click="setReplyMessage">
        <Reply class="size-4 stroke-1" />
        <span>回复</span>
      </ContextMenuItem>
      <ContextMenuItem
        class="flex items-center gap-2 px-2 py-1 text-gray-500"
        @click="behav.recallMessage(messageId, behav.state.user?.id || '0')"
      >
        <Undo2 class="size-4 stroke-1" />
        <span>撤回</span>
      </ContextMenuItem>
    </ContextMenuContent>
  </ContextMenu>
  <BotEventDialog v-if="message.event" v-model:open="eventOpen" :event="message.event" />
</template>
