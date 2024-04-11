<script setup lang="ts">
import ChatMessageAudio from './ChatMessageElementAudio.vue'
import ChatMessageFallback from './ChatMessageElementFallback.vue'
import ChatMessageFile from './ChatMessageElementFile.vue'
import ChatMessageImage from './ChatMessageElementImage.vue'
import ChatMessageLink from './ChatMessageElementLink.vue'
import ChatMessageMention from './ChatMessageElementMention.vue'
import ChatMessageReply from './ChatMessageElementReply.vue'
import ChatMessageText from './ChatMessageElementText.vue'
import ChatMessageVideo from './ChatMessageElementVideo.vue'

import type { Component } from 'vue'
import type { Contents } from '~/adapter/content'

const { type, data } = definePropsRefs<{
  type: Contents['type']
  data: Contents['data']
}>()

const messageElements: Partial<Record<Contents['type'], Component>> = {
  text: ChatMessageText,
  mention: ChatMessageMention,
  link: ChatMessageLink,
  image: ChatMessageImage,
  video: ChatMessageVideo,
  audio: ChatMessageAudio,
  file: ChatMessageFile,
  reply: ChatMessageReply,
}
</script>

<template>
  <component :is="messageElements[type] || ChatMessageFallback" :data="data" />
</template>
