<script setup lang="ts">
import VideoPlay from 'vue3-video-play'

import 'vue3-video-play/dist/style.css'

const route = useRoute()

const resUrl = route.query.url as string

const videoPlayOptions = {
  width: '100%',
  height: '100%',
  volume: 0.8,
  controlBtns: ['audioTrack', 'quality', 'speedRate', 'volume', 'setting'],
}
</script>

<template>
  <VideoPlay :src="resUrl" v-bind="videoPlayOptions" />
</template>

<style scoped>
:deep(.d-player-contextmenu) {
  display: none;
}
</style>
