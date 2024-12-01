<script setup lang="ts">
import { twMerge } from 'tailwind-merge'

import Button from './ControlsButton.vue'
import Icons from './ControlsIcons.vue'
import { closeWindow, isWindowMaximized, maximizeWindow, minimizeWindow } from './utils'
</script>

<template>
  <div :class="twMerge('h-full', $attrs.class as string)" @contextmenu.prevent>
    <Button
      class="max-h-8 w-[46px] cursor-default rounded-none bg-transparent text-black/90 active:bg-black/[.03] hover:bg-black/[.05] dark:text-white dark:active:bg-white/[.04] dark:hover:bg-white/[.06]"
      @click="minimizeWindow"
    >
      <Icons icon="minimizeWin" />
    </Button>
    <Button
      :class="
        twMerge(
          'max-h-8 w-[46px] cursor-default rounded-none bg-transparent',
          'text-black/90 hover:bg-black/[.05] active:bg-black/[.03] dark:text-white dark:hover:bg-white/[.06] dark:active:bg-white/[.04]'
        )
      "
      @click="maximizeWindow"
    >
      <Icons v-if="isWindowMaximized" icon="maximizeRestoreWin" />
      <Icons v-else icon="maximizeWin" />
    </Button>
    <Button
      class="max-h-8 w-[46px] cursor-default rounded-none bg-transparent text-black/90 active:bg-[#c42b1c]/90 hover:bg-[#c42b1c] dark:text-white hover:text-white"
      @click="closeWindow"
    >
      <Icons icon="closeWin" />
    </Button>
  </div>
</template>
