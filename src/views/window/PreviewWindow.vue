<script setup lang="ts">
import VideoPlay from 'vue3-video-play'

import 'vue3-video-play/dist/style.css'

const { type } = defineProps<{ type: 'image' | 'video' }>()

const route = useRoute()

const resUrl = route.query.url as string

const videoPlayOptions = $ref({
  webFullScreen: true,
  volume: 0.8,
  controlBtns: ['audioTrack', 'quality', 'speedRate', 'volume', 'setting'],
})
</script>

<template>
  <main class="h-screen w-screen flex items-center justify-center overflow-hidden bg-light-600">
    <img v-if="type === 'image'" :src="resUrl" class="max-h-full max-w-full" />
    <VideoPlay v-else :src="resUrl" v-bind="videoPlayOptions" />
  </main>
</template>

<style scoped>
:deep(.d-player-contextmenu) {
  display: none;
}
</style>
