<!-- eslint-disable no-await-in-loop -->
<script setup lang="ts">
import { WebviewWindow } from '@tauri-apps/api/window'
import linkifyStr from 'linkify-string'
import { onBeforeMount } from 'vue'

import { Behav } from '@/adapter/behav'
import WaveAudioPlayer from '@/components/WaveAudioPlayer.vue'
import { useChatStore } from '@/stores'
import { getMentionString, getPlainScene } from '@/utils'

import type { Contents } from '@/adapter/content'

const { messageId, messages, onlyImage } = defineProps<{
  messageId: string
  messages: Contents[]
  onlyImage: boolean
}>()

const screenWidth = window.screen.width
const screenHeight = window.screen.height

const behav = new Behav()

const chat = useChatStore()

const imageMap = $ref<Map<string, string>>(new Map())

interface VideoInfo {
  url: string
  cover: string
  width: number
  height: number
  duration: number
}

const videoInfo = $ref<VideoInfo>({
  url: '',
  cover: '',
  width: 0,
  height: 0,
  duration: 0,
})

let audioUrl = $ref('')

let isLoading = $ref(true)

const mentionMap = $ref<Map<string, string>>(new Map())

let contextmenuShow = $ref(false)

const contextmenuOptions = $ref({
  theme: 'matcha-theme',
  x: 0,
  y: 0,
})

function getWindowSize(width: number, height: number, scale = 0.8): { width: number; height: number } {
  let windowWidth = width
  let windowHeight = height
  if (windowWidth > screenWidth * scale) {
    windowWidth = screenWidth * scale
    windowHeight = (windowWidth * height) / width
  }
  if (windowHeight > screenHeight * scale) {
    windowHeight = screenHeight * scale
    windowWidth = (windowHeight * width) / height
  }
  return {
    width: Math.ceil(windowWidth),
    height: Math.ceil(windowHeight),
  }
}

function createPreviewWindow(type: 'image' | 'video', url: string, width: number, height: number): void {
  const title = type === 'image' ? '图像' : '视频'
  const label = url.split('/').pop() as string
  new WebviewWindow(label, {
    title: `${title}预览`,
    url: `/preview/${type}?url=${url}`,
    center: true,
    minWidth: 706,
    minHeight: 564,
    ...getWindowSize(width, height),
  })
}

function createImagePreview(event: Event): void {
  const el = event.target as HTMLImageElement
  const id = el.alt
  createPreviewWindow('image', imageMap.get(id) as string, el.naturalWidth, el.naturalHeight)
}

function createVideoPreview(): void {
  createPreviewWindow('video', videoInfo.url, videoInfo.width, videoInfo.height)
}

function initVideoInfo(url: string): Promise<void> {
  videoInfo.url = url
  return new Promise((resolve) => {
    let dataURL = ''
    const video = document.createElement('video')
    video.src = url
    video.crossOrigin = 'anonymous'
    video.preload = 'auto'
    video.addEventListener('loadeddata', () => {
      const canvas = document.createElement('canvas')
      const width = video.videoWidth
      const height = video.videoHeight
      const duration = video.duration
      canvas.width = width
      canvas.height = height
      canvas.getContext('2d')!.drawImage(video, 0, 0, width, height)
      dataURL = canvas.toDataURL('image/jpeg')
      videoInfo.cover = dataURL
      videoInfo.width = width
      videoInfo.height = height
      videoInfo.duration = duration
      resolve()
    })
  })
}

function getReplyMessage(messageId: string): string {
  return getPlainScene(chat.getMessage(messageId)?.scene)
}

function getTextMessage(text: string): string {
  return linkifyStr(text, { target: '_blank', validate: { email: () => false } })
}

onBeforeMount(async () => {
  for (const message of messages) {
    if (message.type === 'image') {
      imageMap.set(message.data.id, message.data.url)
    } else if (message.type === 'video') {
      const videoUrl = message.data.url
      await initVideoInfo(videoUrl)
    } else if (message.type === 'voice') {
      audioUrl = message.data.url
    } else if (message.type === 'mention') {
      const mentionString = await getMentionString(message)
      mentionMap.set(message.data.target, mentionString)
    }
  }
  isLoading = false
})

function openContextmenu(e: MouseEvent): void {
  contextmenuShow = true
  contextmenuOptions.x = e.clientX
  contextmenuOptions.y = e.clientY
}
</script>

<template>
  <div @contextmenu.prevent="openContextmenu">
    <context-menu v-model:show="contextmenuShow" :options="contextmenuOptions">
      <context-menu-item label="复制" @click="openContextmenu">
        <template #icon>
          <span i="carbon-copy" class="inline-block"></span>
        </template>
      </context-menu-item>
      <context-menu-item label="编辑" @click="openContextmenu">
        <template #icon>
          <span i="carbon-edit" class="inline-block"></span>
        </template>
      </context-menu-item>
      <context-menu-sperator />
      <context-menu-item label="回复" @click="openContextmenu">
        <template #icon>
          <span i="carbon-reply" class="inline-block"></span>
        </template>
      </context-menu-item>
      <context-menu-item label="撤回" @click="behav.recallMessage(messageId, behav.status.assignUser)">
        <template #icon>
          <span i="carbon-direction-u-turn" class="inline-block"></span>
        </template>
      </context-menu-item>
      <context-menu-item label="转发" @click="openContextmenu">
        <template #icon>
          <span i="carbon-chat-launch" class="inline-block"></span>
        </template>
      </context-menu-item>
    </context-menu>
    <div v-if="isLoading" class="loading">
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
    </div>
    <template v-for="message in messages" v-else :key="message.type">
      <div
        v-if="message.type === 'reply'"
        class="reply-message overflow-hidden text-ellipsis border-l-3 border-blue-200 pl-2 text-gray-400"
      >
        {{ getReplyMessage(message.data.message_id) }}
      </div>
      <!-- eslint-disable-next-line vue/no-v-html -->
      <span v-if="message.type === 'text'" v-html="getTextMessage(message.data.text)"></span>
      <span v-else-if="message.type === 'mention'" class="text-sky-400 not-last:mr-1">{{
        mentionMap.get(message.data.target)
      }}</span>
      <img
        v-else-if="message.type === 'image'"
        class="inline-block align-text-bottom not-first:ml-2 not-last:mr-2"
        :class="[{ 'rounded-xl': !onlyImage }, onlyImage ? 'max-w-80' : 'max-w-48']"
        :src="imageMap.get(message.data.id)"
        :alt="message.data.id"
        loading="lazy"
        referrerpolicy="no-referrer"
        draggable="false"
        @dblclick="createImagePreview"
      />
      <div v-else-if="message.type === 'video'" class="video-cover relative" @click="createVideoPreview">
        <img class="max-h-100" :src="videoInfo.cover" />
        <div class="video-mask"></div>
        <svg
          class="pointer-events-none absolute left-50% top-50% translate--50% text-gray-400 opacity-75"
          fill="currentColor"
          viewBox="0 0 34 34"
          width="72"
          height="72"
          part="button"
        >
          <path
            d="M8.5 8.7c0-1.7 1.2-2.4 2.6-1.5l14.4 8.3c1.4.8 1.4 2.2 0 3l-14.4 8.3c-1.4.8-2.6.2-2.6-1.5V8.7z"
          ></path>
        </svg>
      </div>
      <WaveAudioPlayer v-else-if="message.type === 'voice'" :src="audioUrl" />
    </template>
  </div>
</template>

<style scoped lang="postcss">
.video-cover svg {
  @apply transition-transform;
}

.video-cover:hover svg {
  @apply scale-110;
}

.video-mask {
  @apply cursor-pointer absolute top-0 left-0 w-full h-full transition-opacity duration-500 opacity-0;
  background-image: linear-gradient(rgb(0 0 0 / 40%), rgb(0 0 0 / 10%), rgb(0 0 0 / 10%), rgb(0 0 0 / 40%));
}

.video-mask:hover {
  @apply opacity-100;
}

.loading {
  --speed-of-animation: 0.9s;
  --gap: 6px;
  --first-color: hsl(199deg 100% 69%);
  --second-color: hsl(199deg 87% 63%);
  --third-color: hsl(199deg 98% 49%);
  --fourth-color: hsl(207deg 100% 66%);
  --fifth-color: hsl(207deg 94% 68%);
  display: flex;
  gap: 6px;
  align-items: center;
  justify-content: center;
  margin: 0.5rem 1.25rem;
}

.loading span {
  width: 4px;
  height: 32px;
  background: var(--first-color);
  animation: scale var(--speed-of-animation) ease-in-out infinite;
}

.loading span:nth-child(2) {
  background: var(--second-color);
  animation-delay: -0.8s;
}

.loading span:nth-child(3) {
  background: var(--third-color);
  animation-delay: -0.7s;
}

.loading span:nth-child(4) {
  background: var(--fourth-color);
  animation-delay: -0.6s;
}

.loading span:nth-child(5) {
  background: var(--fifth-color);
  animation-delay: -0.5s;
}

@keyframes scale {
  0%,
  40%,
  100% {
    transform: scaleY(0.05);
  }

  20% {
    transform: scaleY(1);
  }
}

.reply-message {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}
</style>
