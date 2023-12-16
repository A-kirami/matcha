<!-- eslint-disable camelcase -->
<script setup lang="ts">
import { unix } from 'dayjs'
import { watch } from 'vue'

import Avatar from '@/components/Avatar.vue'
import { useChatStore, useStatusStore } from '@/stores'
import { getPlainScene, getUserNickname } from '@/utils'

import type { User, Group } from '@/database'

const { chatType, chatPerson } = defineProps<{
  chatType: 'private' | 'group'
  chatPerson: User | Group | null
}>()

const chat = useChatStore()

const status = useStatusStore()

let previewMessage = $ref<string>('')

const chatList = $computed(() => {
  if (!chatPerson) {
    return []
  }
  const chats = chat.chatLogs.filter((chat) => chat.scene.chat_type === chatType)
  if (chatType === 'group') {
    return chats.filter((chat) => chat.scene.receiver_id === chatPerson.id)
  } else {
    const session = [status.bot?.id, status.user?.id]
    return chats.filter((chat) => session.includes(chat.scene.sender_id) && session.includes(chat.scene.receiver_id))
  }
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

watch(
  () => lastChat,
  async (lastChat) => {
    if (!lastChat) {
      return
    }
    let message = getPlainScene(lastChat.scene)
    const { user_id, group_id } = lastChat.scene as { user_id?: string; group_id?: string }
    if (!group_id || !user_id || user_id === status.assignUser) {
      previewMessage = message
    } else {
      const nickname = await getUserNickname(user_id, group_id)
      previewMessage = `${nickname}: ${message}`
    }
  }
)
</script>

<template>
  <div class="mt-4 flex flex-row cursor-pointer items-center justify-between gap-3 rounded-lg p-3">
    <Avatar :type="chatType" :aid="chatPerson?.id" size="3rem"></Avatar>
    <div class="flex flex-grow flex-col gap-1 lt-xl:hidden">
      <div class="flex flex-row items-center justify-between">
        <span class="max-w-32 truncate text-base text-gray-700 font-550" dark="text-gray-400">{{
          chatPerson?.name ?? '未指定 Bot 用户'
        }}</span>
        <span class="text-xs text-zinc-400">{{ lastTime }}</span>
      </div>
      <div v-show="lastChat" class="flex flex-row items-center justify-between">
        <span class="max-w-34 truncate text-xs text-zinc-400">{{ previewMessage }}</span>
        <span
          v-show="unreadMessage"
          class="h-22px w-22px flex items-center justify-center rounded-full bg-blue-100 text-xs text-blue-500 font-medium"
          >{{ unreadMessage }}</span
        >
      </div>
    </div>
  </div>
</template>
