<script setup lang="ts">
import { computed } from 'vue'
import InlineSvg from 'vue-inline-svg'

import Akkarin from '@/assets/akkarin.svg?url'
import { getUserAvatar, getGroupAvatar } from '@/utils'

const {
  type,
  aid,
  role = null,
  border = false,
  size = null,
} = defineProps<{
  type: string
  aid?: number | string
  role?: string | null
  border?: boolean
  size?: string | null
}>()

const avatarUrl = computed(() => {
  if (!aid) {
    return Akkarin
  }
  const avatarFn = type !== 'group' ? getUserAvatar : getGroupAvatar
  return avatarFn(aid)
})

const avatarSize = computed(() => {
  if (size) {
    return {
      width: size,
      height: size,
    }
  }
  return {}
})
</script>

<template>
  <div
    class="relative flex-shrink-0"
    un-before="absolute w-3.5 h-3.5 border-2 border-light-50 rounded-1/2 top-9 right-0"
    dark="before:border-dark-800"
    :class="[role]"
    :style="avatarSize"
  >
    <img
      v-if="aid"
      :src="avatarUrl"
      alt="user avatar"
      class="h-full w-full border-2 border-light-50 rounded-1/2 border-solid text-blue-800"
      dark="border-dark-800"
      :class="{ border }"
    />
    <InlineSvg
      v-else
      :src="avatarUrl"
      :width="size"
      :height="size"
      class="h-full border-2 border-light-50 rounded-1/2 border-solid bg-gray-100 text-gray-800"
      dark="border-dark-800 text-light-200 bg-dark-200"
    ></InlineSvg>
  </div>
</template>

<style scoped lang="postcss">
.admin::before {
  @apply content-empty bg-green-300;
}

.owner::before {
  @apply content-empty bg-yellow-300;
}

.border {
  @apply border-3 border-transparent;
  outline: solid 1px hsl(218deg 22% 90%);
}

.dark .border {
  outline: solid 1px hsl(210deg 2% 19%);
}
</style>
