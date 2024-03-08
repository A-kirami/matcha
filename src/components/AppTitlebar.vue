<script setup lang="ts">
import { getCurrent } from '@tauri-apps/api/webviewWindow'
import InlineSvg from 'vue-inline-svg'

import windowCloseIcon from '~/assets/window-close.svg?url'
import windowMaximizeIcon from '~/assets/window-maximize.svg?url'
import windowMinimizeIcon from '~/assets/window-minimize.svg?url'

const appWindow = getCurrent()

async function minimizeWindow() {
  await appWindow.minimize()
}

async function maximizeWindow() {
  await appWindow.toggleMaximize()
}

async function closeWindow() {
  await appWindow.close()
}
</script>

<template>
  <header
    data-tauri-drag-region
    class="h-7 flex items-center justify-end bg-white text-gray-500"
    :class="{ 'bg-opacity-80': focused }"
    dark="border-dark-400"
  >
    <div
      class="h-full w-10 inline-flex cursor-pointer items-center justify-center"
      hover="bg-gray-200"
      @click="minimizeWindow"
    >
      <InlineSvg :src="windowMinimizeIcon" width="1rem" height="1rem"></InlineSvg>
    </div>
    <div
      class="h-full w-10 inline-flex cursor-pointer items-center justify-center"
      hover="bg-gray-200"
      @click="maximizeWindow"
    >
      <InlineSvg :src="windowMaximizeIcon" width="1rem" height="1rem"></InlineSvg>
    </div>
    <div
      class="h-full w-10 inline-flex cursor-pointer items-center justify-center"
      hover="bg-rose-400 text-light-50"
      @click="closeWindow"
    >
      <InlineSvg :src="windowCloseIcon" width="1rem" height="1rem"></InlineSvg>
    </div>
  </header>
</template>
