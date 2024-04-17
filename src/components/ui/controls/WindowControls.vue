<script setup lang="ts">
import { type as getOsType } from '@tauri-apps/plugin-os'
import { twMerge } from 'tailwind-merge'
import type { WindowControlsProps } from './types'
import Gnome from './WindowControlsGnome.vue'
import MacOs from './WindowControlsMacOs.vue'
import Windows from './WindowControlsWindows.vue'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<WindowControlsProps>(), {
  justify: false,
  hide: false,
  hideMethod: 'display',
  className: '',
})

let platform = $ref(props.platform)

onMounted(async () => {
  const osType = await getOsType()
  if (!platform) {
    switch (osType) {
      case 'macos':
        platform = 'macos'
        break
      case 'linux':
        platform = 'gnome'
        break
      default:
        platform = 'windows'
    }
  }
})

const customClass = twMerge(
  'flex',
  props.className,
  props.hide && (props.hideMethod === 'display' ? 'hidden' : 'invisible')
)
</script>

<template>
  <MacOs v-if="platform === 'macos'" :class="twMerge(customClass, props.justify && 'ml-auto')" />
  <Gnome v-else-if="platform === 'gnome'" :class="twMerge(customClass, props.justify && 'ml-auto')" />
  <Windows v-else :class="twMerge(customClass, props.justify && 'ml-auto')" />
</template>
