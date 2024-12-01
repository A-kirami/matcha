<script setup lang="ts">
import { twMerge } from 'tailwind-merge'

import Button from './ControlsButton.vue'
import Icons from './ControlsIcons.vue'
import { closeWindow, isWindowMaximized, maximizeWindow, minimizeWindow } from './utils'
</script>

<template>
  <div :class="twMerge('mr-[10px] h-auto items-center space-x-[13px]', $attrs.class as string)" @contextmenu.prevent>
    <Button
      class="m-0 aspect-square h-6 w-6 cursor-default rounded-full bg-[#dadada] p-0 text-[#3d3d3d] active:bg-[#bfbfbf] dark:bg-[#373737] hover:bg-[#d1d1d1] dark:text-white dark:active:bg-[#565656] dark:hover:bg-[#424242]"
      @click="minimizeWindow"
    >
      <Icons icon="minimizeWin" class="h-[9px] w-[9px]" />
    </Button>
    <Button
      class="m-0 aspect-square h-6 w-6 cursor-default rounded-full bg-[#dadada] p-0 text-[#3d3d3d] active:bg-[#bfbfbf] dark:bg-[#373737] hover:bg-[#d1d1d1] dark:text-white dark:active:bg-[#565656] dark:hover:bg-[#424242]"
      @click="maximizeWindow"
    >
      <Icons v-if="isWindowMaximized" icon="maximizeRestoreWin" class="h-[9px] w-[9px]" />
      <Icons v-else icon="maximizeWin" class="h-2 w-2" />
    </Button>
    <Button
      class="m-0 aspect-square h-6 w-6 cursor-default rounded-full bg-[#dadada] p-0 text-[#3d3d3d] active:bg-[#bfbfbf] dark:bg-[#373737] hover:bg-[#d1d1d1] dark:text-white dark:active:bg-[#565656] dark:hover:bg-[#424242]"
      @click="closeWindow"
    >
      <Icons icon="closeWin" class="h-2 w-2" />
    </Button>
  </div>
</template>
