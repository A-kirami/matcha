<script setup lang="ts">
import { getCurrent } from '@tauri-apps/api/webviewWindow'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue'

import type { OverlayScrollbars } from 'overlayscrollbars'

const currentWindow = getCurrent()

interface PreviewContent {
  urls: string[]
  currentIndex: number
}

let previewContent: PreviewContent = $ref<PreviewContent>({
  urls: [],
  currentIndex: 0,
})

const currentImage = $computed(() => previewContent.urls[previewContent.currentIndex])

currentWindow.listen<PreviewContent>('set-preview-content', (e) => {
  previewContent = e.payload
})

currentWindow.emit('preview-window-created')

const osRef = $ref<InstanceType<typeof OverlayScrollbarsComponent> | null>(null)

let isDragging = $ref(false)

let hasOverflow = $ref(false)

function updateHasOverflow(instance: OverlayScrollbars) {
  hasOverflow = Object.values(instance?.state()?.hasOverflow || {}).some((value) => value)
}

function handleMouseDown() {
  if (hasOverflow) {
    isDragging = true
  } else {
    requestAnimationFrame(() => {
      currentWindow.startDragging()
    })
  }
}

function handleMouseMove(event: MouseEvent) {
  if (isDragging) {
    const viewport = osRef?.osInstance()?.elements()?.viewport

    if (!viewport) {
      return
    }

    let deltaX = event.movementX
    let deltaY = event.movementY

    let scrollX = viewport.scrollLeft
    let scrollY = viewport.scrollTop

    let newScrollX = scrollX - deltaX
    let newScrollY = scrollY - deltaY

    viewport.scrollTo(newScrollX, newScrollY)
  }
}

function handleMouseUp() {
  isDragging = false
}

const SCALING_FACTOR = 1.2
const MIN_SCALE = 0.1
const MAX_SCALE = 10

let scale = $ref(1)

let displayRatio = $ref(1)

let showDisplayRatio = $ref(false)

const imgRef = $ref<HTMLImageElement | null>(null)

function updateDisplayRatio() {
  if (imgRef) {
    const currentWidth = imgRef.getBoundingClientRect().width
    displayRatio = currentWidth / imgRef.naturalWidth
  }
}

const hiddenDisplayRatio = useDebounceFn(() => {
  showDisplayRatio = false
}, 1500)

const point = { x: 0, y: 0 }

async function handleWheel(event: WheelEvent) {
  if (imgRef) {
    const viewport = osRef?.osInstance()?.elements()?.viewport

    if (!viewport) {
      return
    }

    if (scale <= 1) {
      point.x = 0
      point.y = 0
    }

    const xs = (event.offsetX - point.x) / scale
    const ys = (event.offsetY - point.y) / scale

    scale = Math.min(Math.max(MIN_SCALE, scale * (event.deltaY > 0 ? 1 / SCALING_FACTOR : SCALING_FACTOR)), MAX_SCALE)

    if (scale >= 1) {
      point.x = event.offsetX - xs * scale
      point.y = event.offsetY - ys * scale
    }

    await nextTick()

    requestAnimationFrame(() => {
      viewport.scrollTo(-point.x, -point.y)
    })

    updateDisplayRatio()
    showDisplayRatio = true
    hiddenDisplayRatio()
  }
}

function handleLoad() {
  updateDisplayRatio()
}
</script>

<template>
  <main
    :class="[{ 'cursor-grab': hasOverflow, 'cursor-grabbing': isDragging }, $style.previewContent]"
    class="relative h-full"
    @mousedown="handleMouseDown"
    @mouseup="handleMouseUp"
    @mousemove="handleMouseMove"
    @wheel.prevent="handleWheel"
  >
    <div
      class="absolute left-1/2 top-1/2 z-1 m-auto rounded-lg bg-black px-4 py-1 text-lg text-white transition-opacity duration-400 -translate-x-1/2 -translate-y-1/2"
      :class="[showDisplayRatio ? 'opacity-60' : 'opacity-0']"
    >
      {{ (displayRatio * 100).toFixed(0) + '%' }}
    </div>
    <OverlayScrollbarsComponent ref="osRef" class="h-full" defer @os-updated="updateHasOverflow">
      <img
        ref="imgRef"
        class="self-center justify-self-center"
        :class="{ '': hasOverflow }"
        :src="currentImage"
        :style="`transform: scale(${scale})`"
        draggable="false"
        @load="handleLoad"
      />
    </OverlayScrollbarsComponent>
  </main>
</template>

<style module>
.preview-content {
  & [data-overlayscrollbars-contents] {
    @apply grid;
  }
}
</style>
