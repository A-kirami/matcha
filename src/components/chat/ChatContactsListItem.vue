<script setup lang="ts">
import { unix } from 'dayjs'
import { CheckCheck, X, Pin } from 'lucide-vue-next'

import type { Contact } from '~/types'

defineOptions({
  inheritAttrs: false,
})

const { contact } = $defineProps<{
  contact: Contact
}>()

const state = useStateStore()

const chat = useChatStore()

const chatType = contact?.type === 'user' ? 'private' : contact?.type

const chatList = $computed(() => chat.getChatLogs(chatType, contact?.id))

const lastChat = $computed(() => chatList.at(-1))

const lastTime = $computed(() => lastChat?.scene.time)

const lastTimeFormatted = $computed(() => lastTime && unix(lastTime).format('HH:mm'))

const actived = $computed(() => state.chatTarget?.id === contact.id)

let unReadCount = $ref(0)

const unReadCountString = $computed(() => {
  return unReadCount > 99 ? '99+' : unReadCount
})

watchDebounced(
  () => chatList,
  () => {
    unReadCount = chatList.filter((chat) => !chat.isRead).length
  },
  { debounce: 100, maxWait: 1000 }
)

watchDebounced(
  () => lastTime,
  async () => {
    await db.groups.update(contact.id, { lastMessageTime: lastTime })
  },
  { debounce: 100, maxWait: 1000 }
)

const isPinned = $computed(() => state.pinnedOrder.includes(contact.id))
</script>

<template>
  <ChatContactsListItemMenu :contact="contact" :is-pinned="isPinned">
    <div
      v-if="windowWidth > 708"
      :class="[$style.contactCard, { 'shadow-xl shadow-sky-300/10 z-1': actived }]"
      class="grid items-center gap-x-2 rounded-lg bg-background px-2 py-3"
      v-bind="$attrs"
    >
      <Avatar style="grid-area: avatar">
        <AvatarImage loading="lazy" :src="contact.avatar" alt="contact avatar" />
        <AvatarFallback>{{ contact.name }}</AvatarFallback>
      </Avatar>
      <span style="grid-area: name" class="truncate text-sm">{{ contact.name }}</span>
      <span style="grid-area: time" class="w-8 text-xs text-zinc-400">{{ lastTimeFormatted }}</span>
      <span style="grid-area: message" class="truncate text-xs text-zinc-400">{{ lastChat?.preview }}</span>
      <span style="grid-area: status" class="mt-0.5 flex justify-center">
        <span v-if="unReadCount" class="w-full rounded-full bg-blue-100 text-center text-xs text-blue-400">
          {{ unReadCountString }}
        </span>
        <template v-else-if="lastChat">
          <CheckCheck v-if="lastChat?.isSent" class="size-4 cursor-pointer text-emerald-400" />
          <X v-else class="size-4 cursor-pointer text-rose-400" />
        </template>
        <Pin v-show="isPinned" class="size-4 cursor-pointer text-blue-400" />
      </span>
    </div>
    <div v-else class="relative" v-bind="$attrs">
      <Avatar :class="{ 'ring-2 ring-offset-2 ring-blue-300 dark:ring-blue-500': actived }">
        <AvatarImage loading="lazy" :src="contact.avatar" alt="contact avatar" />
        <AvatarFallback>{{ contact.name }}</AvatarFallback>
      </Avatar>
      <span
        v-if="unReadCount"
        class="absolute min-w-4 inline-flex justify-center rounded-full bg-blue-100 px-1 text-xs text-blue-400 -right-2 -top-1"
      >
        {{ unReadCountString }}
      </span>
    </div>
  </ChatContactsListItemMenu>
</template>

<style module>
.contact-card {
  grid:
    'avatar name time' minmax(0, 1fr)
    'avatar message status' minmax(0, 1fr)
    / auto minmax(0, 1fr) auto;
}
</style>
