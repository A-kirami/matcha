<script setup lang="ts">
import { type HTMLAttributes, computed } from 'vue'
import { AlertDialogTitle, type AlertDialogTitleProps } from 'radix-vue'
import { cn } from '~/lib/utils'

const props = defineProps<AlertDialogTitleProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props

  return delegated
})
</script>

<template>
  <!-- NOTE: 调整文字大小 -->
  <AlertDialogTitle v-bind="delegatedProps" :class="cn('text-base font-semibold', props.class)">
    <slot />
  </AlertDialogTitle>
</template>
