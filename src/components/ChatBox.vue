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

const chats = useChatStore()

const status = useStatusStore()

const chatInput = $ref<InstanceType<typeof ChatInput> | null>(null)

const scroller = $ref<InstanceType<typeof OverlayScrollbarsComponent> | null>(null)

let chatPerson = $ref<User | Group | null>(null)

let autoScroll = $ref(true)

let scrollLock = $ref(false)

watchEffect(async () => {
  const dbGet = chatType === 'group' ? db.groups : db.users
  chatPerson = (await dbGet.get(Number(chatId))) || null
})

const chatList = $computed(() => {
  const chatKey = chatType === 'group' ? chatId : `${status.bot?.id}.${status.user?.id}`
  return chats.getChats(chatType, chatKey)
})

async function sendMessage(): Promise<void> {
  const contents = chatInput?.getContent() || []
  if (!contents.length || !chatPerson) {
    return
  }
  if (checkMatchaCommand(contents)) {
    await runMatchaCommand(chatType, chatId, contents)
  } else {
    const scene = await behav.sendMessage(chatType, status.user!, chatPerson, contents)
    await chats.appendScene(scene)
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

/** 将消息标记为已读 */
function markReadMessage(index: number) {
  chatList[index].read = true
}

/** 分隔消息时间 */
const splitTime = 60 * 10

/** 分隔时间线显示 */
function isSeparator(index: number): boolean {
  if (!index) {
    return false
  }
  const time = chatList[index].scene.time
  const lastTime = chatList[index - 1]?.scene?.time
  return lastTime + splitTime < time
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
          <DynamicScrollerItem
            :item="item"
            :active="active"
            :size-dependencies="[item.scene.message]"
            :data-index="index"
          >
            <TimeSeparator v-if="isSeparator(index)" class="py-3" :time="item.scene.time" />
            <div class="py-3" :class="{'ml-auto': item.scene.user_id !== status.bot!.id.toString()}">
              <ChatMessage
                v-if="item.scene.type === 'message'"
                :index="index"
                :scene="item.scene"
                :event="item.event"
                :send="item.send"
                @read-message="markReadMessage"
                @skip-scroll="lockScroll"
              />
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
