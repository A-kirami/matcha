<script setup lang="ts">
import type { VideoContent } from '~/adapter/content'

const { data } = $defineProps<{
  data: VideoContent['data']
}>()

interface VideoInfo {
  url: string
  cover: string
  width: number
  height: number
  duration: number
}

let videoInfo = $ref<VideoInfo | null>(null)

function createVideoElement(url: string): HTMLVideoElement {
  const video = document.createElement('video')
  video.src = url
  video.crossOrigin = 'anonymous'
  video.preload = 'auto'
  return video
}

function createCoverImage(video: HTMLVideoElement): string {
  const canvas = document.createElement('canvas')
  const width = video.videoWidth
  const height = video.videoHeight
  canvas.width = width
  canvas.height = height
  canvas.getContext('2d')!.drawImage(video, 0, 0, width, height)
  return canvas.toDataURL('image/jpeg')
}

function getVideoInfo(url: string): Promise<VideoInfo> {
  return new Promise((resolve, reject) => {
    const videoInfo: VideoInfo = {
      url,
      cover: '',
      width: 0,
      height: 0,
      duration: 0,
    }
    const video = createVideoElement(url)

    const onLoadedData = () => {
      videoInfo.cover = createCoverImage(video)
      videoInfo.width = video.videoWidth
      videoInfo.height = video.videoHeight
      videoInfo.duration = video.duration
      resolve(videoInfo)
      cleanup()
    }

    const onError = () => {
      reject(new Error(`Video loading failed for url: ${url}`))
      cleanup()
    }

    const cleanup = () => {
      video.removeEventListener('loadeddata', onLoadedData)
      video.removeEventListener('error', onError)
    }

    video.addEventListener('loadeddata', onLoadedData)
    video.addEventListener('error', onError)
  })
}

async function previewVideo() {
  if (videoInfo) {
    await createPreviewWindow(`/preview/video?url=${videoInfo.url}`, '视频预览', videoInfo.width, videoInfo.height)
  }
}

onBeforeMount(async () => {
  videoInfo = await getVideoInfo(data.url)
})
</script>

<template>
  <div v-if="videoInfo" data-type="video" class="relative svg:hover:scale-110" @click="previewVideo">
    <img :src="videoInfo.cover" alt="video cover" />
    <div :class="$style.videoMask" class="absolute left-0 top-0 size-full cursor-pointer"></div>
    <svg
      class="pointer-events-none absolute left-50% top-50% translate--50% text-light-200 opacity-85 transition-transform duration-250"
      fill="currentColor"
      viewBox="0 0 34 34"
      width="72"
      height="72"
      part="button"
    >
      <path d="M8.5 8.7c0-1.7 1.2-2.4 2.6-1.5l14.4 8.3c1.4.8 1.4 2.2 0 3l-14.4 8.3c-1.4.8-2.6.2-2.6-1.5V8.7z"></path>
    </svg>
  </div>
</template>

<style module>
.video-mask {
  background-image: linear-gradient(
    rgb(0 0 0 / 40%) 0%,
    rgb(0 0 0 / 0%) 20%,
    rgb(0 0 0 / 0%) 80%,
    rgb(0 0 0 / 40%) 100%
  );
}
</style>
