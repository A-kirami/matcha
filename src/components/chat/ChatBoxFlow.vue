<script setup lang="tsx">
import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue'

import ChatMessage from './ChatMessage.vue'
import ChatNotice from './ChatNotice.vue'
import ChatRequest from './ChatRequest.vue'

import type { OverlayScrollbars } from 'overlayscrollbars'
import type { Chats } from '~/stores/chat'

const state = useStateStore()

const osRef = $ref<InstanceType<typeof OverlayScrollbarsComponent> | null>(null)

let scrollLock = true

const onScroll = useDebounceFn((instance: OverlayScrollbars) => {
  const { viewport } = instance.elements()
  scrollLock = viewport.scrollTop + viewport.clientHeight === viewport.scrollHeight
}, 200)

let initialized = $ref(false)

async function onUpdated(instance: OverlayScrollbars) {
  if (!scrollLock) {
    return
  }
  await nextTick()
  const viewport = instance.elements().viewport
  const behavior = initialized ? 'smooth' : 'instant'
  viewport.scrollTo({ top: viewport.scrollHeight, behavior })
  initialized = true
}

watch(
  () => state.chatTarget,
  () => {
    initialized = false
  }
)

const chat = useChatStore()

const chatType = $computed(() => (state.chatTarget?.type === 'user' ? 'private' : state.chatTarget?.type))

const chatList = $computed(() => chat.getChatLogs(chatType, state.chatTarget?.id))

const SPLIT_TIME = 60 * 10

const prevNonDeleteIndexMap = new Map<string, number>()

function isSeparator(index: number): boolean {
  if (!index) {
    return false
  }

  const currentScene = chatList[index].scene
  if (currentScene.detail_type.endsWith('message_delete')) {
    return false
  }

  const prevNonDeleteIndex = prevNonDeleteIndexMap.get(state.chatTarget!.id) ?? -1

  const prevScene = prevNonDeleteIndex >= 0 ? chatList[prevNonDeleteIndex].scene : null

  prevNonDeleteIndexMap.set(state.chatTarget!.id, index)

  return prevScene ? currentScene.time - prevScene.time > SPLIT_TIME : false
}

const ChatItem = (props: { chat: Chats }) => {
  const { chat } = props
  const chatRef = ref<HTMLElement | null>(null)
  const chatIsRead = useElementVisibility(chatRef)

  watchOnce(chatIsRead, () => {
    chat.isRead = true
  })

  return (
    <div ref={chatRef}>
      {chat.type === 'message' ? (
        <ChatMessage message={chat} />
      ) : chat.type === 'notice' ? (
        <ChatNotice notice={chat} />
      ) : chat.type === 'request' ? (
        <ChatRequest request={chat} />
      ) : null}
    </div>
  )
}
</script>

<template>
  <OverlayScrollbarsComponent
    ref="osRef"
    :options="{ scrollbars: { autoHide: 'leave', autoHideDelay: 0, theme: 'os-theme-light' } }"
    @os-scroll="onScroll"
    @os-updated="onUpdated"
  >
    <div class="px-4 py-3 space-y-6">
      <template v-for="(item, index) in chatList" :key="item.id">
        <ChatTimeSeparator v-if="isSeparator(index)" :time="item.scene.time" />
        <ChatItem :chat="item" />
      </template>
    </div>
  </OverlayScrollbarsComponent>
</template>
