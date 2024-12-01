<script setup lang="ts">
import { onKeyStroke, useMouseInElement } from '@vueuse/core'
import { twMerge } from 'tailwind-merge'
import { ref } from 'vue'

import Button from './ControlsButton.vue'
import Icons from './ControlsIcons.vue'
import { closeWindow, fullscreenWindow, maximizeWindow, minimizeWindow } from './utils'

const winBtns = ref<HTMLDivElement>()
const { isOutside } = useMouseInElement(winBtns)

const isAltKeyPressed = ref(false)
onKeyStroke(
  'Alt',
  () => {
    isAltKeyPressed.value = true
  },
  { eventName: 'keydown' },
)
onKeyStroke(
  'Alt',
  () => {
    isAltKeyPressed.value = false
  },
  { eventName: 'keyup' },
)
</script>

<template>
  <div
    ref="winBtns"
    :class="twMerge('space-x-2 px-3 text-black active:text-black dark:text-black', $attrs.class as string)"
    @contextmenu.prevent
  >
    <Button
      class="aspect-square h-3 w-3 content-center items-center self-center justify-center border border-black/[.12] rounded-full bg-[#ff544d] text-center text-black/60 dark:border-none active:bg-[#bf403a] hover:bg-[#ff544d] active:text-black/60"
      @click="closeWindow"
    >
      <Icons v-if="!isOutside" icon="closeMac" />
    </Button>
    <Button
      class="aspect-square h-3 w-3 content-center items-center self-center justify-center border border-black/[.12] rounded-full bg-[#ffbd2e] text-center text-black/60 dark:border-none active:bg-[#bf9122] hover:bg-[#ffbd2e] active:text-black/60"
      @click="minimizeWindow"
    >
      <Icons v-if="!isOutside" icon="minMac" />
    </Button>
    <Button
      class="aspect-square h-3 w-3 content-center items-center self-center justify-center border border-black/[.12] rounded-full bg-[#28c93f] text-center text-black/60 dark:border-none active:bg-[#1e9930] hover:bg-[#28c93f] active:text-black/60"
      @click="isAltKeyPressed ? maximizeWindow() : fullscreenWindow()"
    >
      <template v-if="!isOutside">
        <Icons v-if="isAltKeyPressed" icon="plusMac" />
        <Icons v-else icon="fullMac" />
      </template>
    </Button>
  </div>
</template>
