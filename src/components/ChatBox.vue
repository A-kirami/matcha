<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue'
import { watchEffect } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'

import { Behav } from '@/adapter/behav'
import { checkMatchaCommand, runMatchaCommand } from '@/command'
import ChatBoxTopbar from '@/components/ChatBoxTopbar.vue'
import ChatInput from '@/components/ChatInput.vue'
import ChatMessage from '@/components/ChatMessage.vue'
import ChatNotice from '@/components/ChatNotice.vue'
import ChatRequest from '@/components/ChatRequest.vue'
import SendButton from '@/components/SendButton.vue'
import TimeSeparator from '@/components/TimeSeparator.vue'
import { db, User, Group } from '@/database'
import { useChatStore, useStatusStore } from '@/stores'

import type { PartialOptions, OverlayScrollbars } from 'overlayscrollbars'

const { chatType, chatId } = defineProps<{
  chatType: 'private' | 'group'
  chatId: string
}>()

const options: PartialOptions = {
  scrollbars: {
    autoHide: 'leave',
    autoHideDelay: 100,
  },
}

const behav = new Behav()

const chat = useChatStore()

const status = useStatusStore()

const chatInput = $ref<InstanceType<typeof ChatInput> | null>(null)

const scroller = $ref<InstanceType<typeof OverlayScrollbarsComponent> | null>(null)

let chatPerson = $ref<User | Group | null>(null)

let autoScroll = $ref(true)

let scrollLock = $ref(false)

watchEffect(async () => {
  const dbGet = chatType === 'group' ? db.groups : db.users
  chatPerson = (await dbGet.get(chatId)) || null
})

const chatList = $computed(() => {
  const chats = chat.chatLogs.filter((chat) => chat.scene.chat_type === chatType)
  if (chatType === 'group') {
    return chats.filter((chat) => chat.scene.receiver_id === chatId)
  } else {
    const session = [status.bot?.id, status.user?.id]
    return chats.filter((chat) => session.includes(chat.scene.sender_id) && session.includes(chat.scene.receiver_id))
  }
})

async function sendMessage(): Promise<void> {
  const contents = chatInput?.getContent() || []
  if (!contents.length || !chatPerson) {
    return
  }
  if (checkMatchaCommand(contents)) {
    await runMatchaCommand(chatType, chatId, contents)
  } else {
    await behav.sendMessage(chatType, status.user!, chatPerson, contents)
  }
  chatInput?.clearContent()
}

/** 滚动到底部 */
function scrollToBottom(force = false): void {
  if (!autoScroll && !force) {
    return
  }
  if (scrollLock) {
    scrollLock = false
    return
  }
  const instance = scroller!.osInstance()
  if (instance) {
    const { viewport } = instance!.elements()
    viewport.scrollTo({ top: viewport.scrollHeight })
  }
}

/** 滚动时判断是否触底 */
const scrollEnd = useDebounceFn((instance: OverlayScrollbars): void => {
  const { viewport } = instance.elements()
  autoScroll = viewport.scrollTop + viewport.clientHeight === viewport.scrollHeight
}, 200)

/** 分隔消息时间 */
const splitTime = 60 * 10

/** 分隔时间线显示 */
function isSeparator(index: number): boolean {
  if (!index) {
    return false
  }

  const currentScene = chatList[index].scene
  if (currentScene.detail_type.endsWith('message_delete')) {
    return false
  }

  const prevScene = chatList
    .slice(0, index)
    .filter((chat) => !chat.scene.detail_type.endsWith('message_delete'))
    .pop()?.scene

  return prevScene ? currentScene.time - prevScene.time > splitTime : false
}

/** 禁用滚动 */
function lockScroll() {
  scrollLock = true
}

onBeforeRouteLeave((_, from) => {
  status.latelySession = from.fullPath
})
</script>

<template>
  <section class="flex flex-auto flex-col bg-light-400 transition-colors duration-500" dark="bg-dark-600">
    <ChatBoxTopbar v-if="chatPerson" :chat-type="chatType" :chat-person="chatPerson"></ChatBoxTopbar>
    <OverlayScrollbarsComponent ref="scroller" :options="options" defer @os-scroll="scrollEnd">
      <DynamicScroller :items="chatList" :min-item-size="30" class="px-6 py-3" @resize="scrollToBottom">
        <template #default="{ item, index, active }">
          <DynamicScrollerItem :item="item" :active="active" :size-dependencies="[item.scene]" :data-index="index">
            <TimeSeparator v-if="isSeparator(index)" class="py-3" :time="item.scene.time" />
            <div class="py-3">
              <ChatMessage v-if="item.type === 'message' && !item.recall" :message="item" @skip-scroll="lockScroll" />
              <ChatNotice v-else-if="item.type === 'notice'" :notice="item" />
              <ChatRequest v-else-if="item.type === 'request'" :request="item" />
            </div>
          </DynamicScrollerItem>
        </template>
      </DynamicScroller>
    </OverlayScrollbarsComponent>
    <div
      v-show="status.assignUser"
      class="mt-auto flex flex-row items-end gap-4 border-t bg-light-50 px-4 py-2 transition-colors duration-500"
      dark="bg-dark-800 border-dark-400"
    >
      <ChatInput ref="chatInput" :chat-type="chatType" :chat-id="chatId" @send="sendMessage" />
      <SendButton @send="sendMessage" />
    </div>
  </section>
</template>
