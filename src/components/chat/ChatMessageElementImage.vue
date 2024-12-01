<script setup lang="ts">
import type { ImageContent } from '~/adapter/content'

const { data } = $defineProps<{
  data: ImageContent['data']
}>()

async function previewImage(event: Event) {
  const { naturalWidth, naturalHeight } = event.target as HTMLImageElement
  const gallery = document.querySelectorAll<HTMLImageElement>('[data-type="image"]')
  const currentIndex = [...gallery].indexOf(event.target as HTMLImageElement)
  const urls = [...gallery].map(img => img.src)
  const window = await createPreviewWindow('/preview/image', '图像预览', naturalWidth, naturalHeight)
  await window.once('preview-window-created', () => {
    void window.emit('set-preview-content', { urls, currentIndex })
  })
}
</script>

<template>
  <img
    :src="data.url"
    alt="image"
    data-type="image"
    draggable="false"
    class="max-w-80 w-full align-bottom not-first:mt-1.5 not-last:mb-1.5"
    @dblclick="previewImage"
  >
</template>
