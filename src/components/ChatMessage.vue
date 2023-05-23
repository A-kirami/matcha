<script setup lang="ts">
import { useElementVisibility } from '@vueuse/core'
import { unix } from 'dayjs'
import { watch } from 'vue'
import InlineSvg from 'vue-inline-svg'

import { Behav } from '@/adapter/behav'
import ChangeIcon from '@/assets/change.svg?url'
import FailIcon from '@/assets/fail.svg?url'
import TickIcon from '@/assets/tick.svg?url'
import Avatar from '@/components/Avatar.vue'
import HighlightCode from '@/components/HighlightCode.vue'
import MessageContent from '@/components/MessageContent.vue'
import { useStatusStore, useChatStore } from '@/stores'
import { getUUID, getTimestamp, getMessageId } from '@/utils'

import type { ContentMapping } from '@/adapter/content'
import type { MessageScenes } from '@/adapter/scene'
import type { Message } from '@/stores/chat'

const { message } = defineProps<{
  message: Message
}>()

const emit = defineEmits<{ (e: 'skipScroll'): void }>()

const behav = new Behav()

const status = useStatusStore()

const chat = useChatStore()

const scene = $ref(message.scene)

/** 消息是否为Bot发送 */
const isBot = scene.sender_id === status.assignBot

/** 单个消息 */
const onlySingle = scene.message.length === 1

/** 包含消息类型 */
const messageType = new Set(scene.message.map((c) => c.type))

function onlyType(type: keyof ContentMapping) {
  return onlySingle && messageType.has(type)
}

const onlyImage = onlyType('image')

/** 用户头衔 */
const title = (() => {
  if (scene.detail_type === 'group') {
    return scene.member.title
  } else {
    return null
  }
})()

const time = unix(scene.time).format('HH:mm:ss')

const role = (() => {
  if (scene.detail_type === 'group') {
    if (scene.anonymous) {
      return undefined
    }
    return scene.member.role
  } else {
    return undefined
  }
})()

/** 用户名 */
const userName = scene.detail_type === 'group' ? scene.member.card || scene.user_name : scene.user_name

const messageRef = $ref<HTMLElement | null>(null)

const messageIsRead = $(useElementVisibility($$(messageRef)))

/** 将消息标记为已读 */
watch(
  () => messageIsRead,
  () => {
    const chatMessage = message
    chatMessage.read = true
  }
)

let toolbarShow = $ref(false)

function showToolbar(): void {
  toolbarShow = true
}

function hiddenToolbar(): void {
  toolbarShow = false
}

let showMessage = $ref(true)

/** 切换显示内容 */
function changeContent(): void {
  emit('skipScroll')
  showMessage = !showMessage
}

/** 将消息重新发送 */
async function resendMessage(): Promise<void> {
  if (isBot) {
    return
  }
  const sceneClone = JSON.parse(JSON.stringify(scene)) as MessageScenes
  sceneClone.id = getUUID()
  sceneClone.time = getTimestamp()
  // eslint-disable-next-line camelcase
  sceneClone.message_id = getMessageId().toString()
  await chat.appendScene(sceneClone)
}

/** 戳一戳用户 */
async function pokeUser(): Promise<void> {
  await behav.pokeUser(status.assignUser, scene.user_id, 'group_id' in scene ? scene.group_id : undefined)
}
</script>

<template>
  <div class="flex cursor-default gap-3" :class="{ 'flex-row-reverse': !isBot }">
    <Avatar
      type="user"
      :aid="scene.user_id"
      :role="role"
      size="3rem"
      class="cursor-pointer"
      @dblclick="pokeUser"
    ></Avatar>
    <div class="w-full flex flex-col" :class="[isBot ? 'items-start' : 'items-end']">
      <div class="flex items-center gap-2" :class="{ 'flex-row-reverse': !isBot }">
        <span class="text-sm font-bold">{{ userName }}</span>
        <span
          v-if="title || isBot"
          class="border rounded-sm px-0.5 text-xs leading-0.9rem"
          :class="[isBot ? 'bot-title' : `${role}-title`]"
          >{{ isBot ? 'Bot' : title }}</span
        >
      </div>
      <div
        class="w-full flex gap-3"
        :class="{ 'flex-row-reverse': !isBot }"
        @mouseenter="showToolbar"
        @mouseleave="hiddenToolbar"
      >
        <article
          ref="messageRef"
          class="my-1 max-w-75% select-text overflow-hidden whitespace-pre-wrap break-all rounded-b-xl text-left text-sm text-gray-500 shadow-sm"
          :class="[isBot ? 'bot-message' : 'user-message', { '!bg-transparent': onlyImage && showMessage }]"
        >
          <MessageContent
            v-show="showMessage"
            class="!bg-transparent"
            :class="{ 'bubble-padding': !(onlyImage || onlyType('video')) }"
            :messages="scene.message"
            :only-image="onlyImage"
          />
          <HighlightCode
            v-show="!showMessage"
            v-if="message.event"
            class="bubble-padding"
            language="json"
            :code="JSON.stringify(message.event, null, '\t')"
          />
        </article>
        <Transition name="fade">
          <div v-show="toolbarShow && message.event" class="mt-2">
            <div class="my-1 cursor-pointer rounded-1/2 px-1 py-1" active="scale-90" @click="changeContent">
              <InlineSvg class="text-sky-300" :src="ChangeIcon"></InlineSvg>
            </div>
          </div>
        </Transition>
      </div>
      <div class="flex items-center text-xs text-gray-400">
        <span>{{ time }}</span>
        <span class="ml-1" :class="{ 'cursor-pointer': !isBot }" @click="resendMessage">
          <InlineSvg v-if="message.push" class="text-emerald-400" :src="TickIcon"></InlineSvg>
          <InlineSvg v-else class="text-rose-400" :src="FailIcon"></InlineSvg>
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="postcss">
.bot-message {
  @apply bg-white rounded-r-xl;
}

.user-message {
  @apply bg-blue-50 rounded-l-xl;
}

.bubble-padding {
  @apply py-2.5 px-2.5;
}

.member-title {
  @apply text-blue-400 border-blue-200 bg-blue-50;
}

.admin-title {
  @apply text-green-400 border-green-200 bg-green-50;
}

.owner-title {
  @apply text-yellow-400 border-yellow-200 bg-yellow-50;
}

.bot-title {
  @apply text-blue-400 border-blue-200 bg-violet-50;
}

.fade-enter-active,
.fade-leave-active {
  @apply transition-opacity;
}

.fade-enter-from,
.fade-leave-to {
  @apply opacity-0;
}
</style>
