<script setup lang="ts">
import { unix } from 'dayjs'
import { CheckCheck, X, Bot } from 'lucide-vue-next'

import { Behav } from '~/adapter/behav'

import type { Message } from '~/stores/chat'

const { message } = $defineProps<{
  message: Message
}>()

const behav = new Behav()

const state = useStateStore()

const scene = $computed(() => message.scene)

const isUserMsg = $computed(() => scene.sender_id === state.user?.id)

const userName = scene.detail_type === 'group' ? scene.member.card || scene.user_name : scene.user_name

const title = (() => {
  if (scene.detail_type === 'group') {
    return scene.member.title
  } else {
    return null
  }
})()

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

const time = unix(scene.time).format('HH:mm:ss')

async function resendMessage(): Promise<void> {
  await behav.sendMessage(state.user!, state.chatTarget!, scene.message)
}

async function pokeUser(): Promise<void> {
  await behav.pokeUser(state.user!.id, scene.user_id, 'group_id' in scene ? scene.group_id : undefined)
}

const messageRef = ref<HTMLElement | null>(null)

const messageIsRead = useElementVisibility(messageRef)

watchOnce(messageIsRead, () => {
  message.isRead = true
})

const general = useGeneralSettingsStore()
</script>

<template>
  <article
    v-if="!message.isRecall || (message.isRecall && general.showRecallMessage)"
    ref="messageRef"
    class="flex gap-3 transition-opacity duration-300"
    :class="{
      'flex-row-reverse': isUserMsg,
      'opacity-50 hover:opacity-100': message.isRecall,
    }"
  >
    <ChatUserCard :uid="scene.user_id">
      <Avatar
        class="ring-2 ring-offset-2"
        :class="{
          'ring-foreground/20 dark:ring-foreground/50': role,
          'ring-amber-200 dark:ring-amber-400': role === 'owner',
          'ring-sky-200 dark:ring-sky-400': role === 'admin',
        }"
        @dblclick="pokeUser"
      >
        <AvatarImage :src="getAvatarUrl('user', scene.user_id)" :alt="`${userName} avatar`" />
        <AvatarFallback>{{ userName }}</AvatarFallback>
      </Avatar>
    </ChatUserCard>
    <div class="max-w-75% flex flex-col gap-y-1" :class="[isUserMsg ? 'items-end' : 'items-start']">
      <div class="flex items-center" :class="{ 'flex-row-reverse': isUserMsg }">
        <span class="mx-1 text-sm font-medium">{{ userName }}</span>
        <span
          v-if="scene.sender_id === state.bot?.id"
          class="flex items-center gap-0.5 border border-violet-200 rounded-sm bg-violet-50 px-0.5 text-xs text-violet-400"
          ><Bot class="size-4 stroke-1.5" />机器人</span
        >
        <span
          v-if="title"
          class="border rounded-sm px-0.5 text-xs"
          :class="{
            'border-amber-200 bg-amber-50 text-amber-400': role === 'owner',
            'border-sky-200 bg-sky-50 text-sky-400': role === 'admin',
          }"
          >{{ title }}</span
        >
      </div>
      <ChatMessageMenu :message="message">
        <div
          :data-message-id="message.scene.message_id"
          class="select-text overflow-hidden rounded-xl text-sm"
          :class="[$style.messageBubble, isUserMsg ? 'rounded-tr-none bg-blue-50' : 'rounded-tl-none bg-white']"
        >
          <!-- eslint-disable-next-line vue/valid-v-for -->
          <ChatMessageElement v-for="msg in scene.message" :type="msg.type" :data="msg.data" />
        </div>
      </ChatMessageMenu>
      <div class="h-5 flex items-center gap-1 px-1">
        <span v-if="isUserMsg" @click="resendMessage">
          <CheckCheck v-if="message.isSent" class="size-5 cursor-pointer text-emerald-400" />
          <X v-else class="size-5 cursor-pointer text-rose-400" />
        </span>
        <span class="text-xs text-zinc-400">{{ time }}</span>
      </div>
    </div>
  </article>
</template>

<style module>
.message-bubble:not(:has(> :where([data-type='image'], [data-type='video'], [data-type='file']):only-child)) {
  @apply p-2.5;

  & [data-message-id] {
    @apply bg-transparent;
  }

  & [data-type='image'] {
    @apply rounded-lg max-w-60;
  }
}
</style>
