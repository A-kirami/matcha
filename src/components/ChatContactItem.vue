<script setup lang="ts">
import { unix } from 'dayjs'

import Avatar from '@/components/Avatar.vue'
import { useChatStore } from '@/stores'
import { getPlainScene } from '@/utils'

import type { User, Group } from '@/database'

const { chatType, chatPerson } = defineProps<{
  chatType: 'private' | 'group'
  chatPerson: User | Group | null
}>()

const chat = useChatStore()

const chatList = $computed(() => {
  if (!chatPerson) {
    return []
  }
  return chat.chatLogs.filter((chat) => chat.scene.talker === `${chatType}.${chatPerson.id}`)
})

/** 最后发言 */
const lastChat = $computed(() => {
  return chatList.at(-1)
})

/** 最后发言时间 */
const lastTime = $computed(() => {
  if (lastChat) {
    return unix(lastChat.scene.time).format('HH:mm')
  }
  return null
})

/** 未读消息数 */
const unreadMessage = $computed(() => {
  return chatList.filter((chat) => !chat.read).length
})
</script>

<template>
  <div class="mt-4 flex flex-row cursor-pointer items-center justify-between gap-3 rounded-lg p-3">
    <Avatar :type="chatType" :aid="chatPerson?.id" size="3rem"></Avatar>
    <div class="flex flex-grow flex-col gap-1 lt-xl:hidden">
      <div class="flex flex-row items-center justify-between">
        <span class="max-w-32 truncate text-base font-550 text-gray-700" dark="text-gray-400">{{
          chatPerson?.name ?? '未指定 Bot 用户'
        }}</span>
        <span class="text-xs text-zinc-400">{{ lastTime }}</span>
      </div>
      <div v-show="lastChat" class="flex flex-row items-center justify-between">
        <span class="max-w-34 truncate text-xs text-zinc-400">{{ getPlainScene(lastChat?.scene) }}</span>
        <span
          v-show="unreadMessage"
          class="h-22px w-22px flex items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-500"
          >{{ unreadMessage }}</span
        >
      </div>
    </div>
  </div>
</template>
