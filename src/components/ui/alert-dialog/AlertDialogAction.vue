<script setup lang="ts">
import { type HTMLAttributes, computed } from 'vue'
import { AlertDialogAction, type AlertDialogActionProps } from 'radix-vue'
import { cn } from '~/lib/utils'
import { buttonVariants } from '~/components/ui/button'
import { type ButtonVariants } from '~/components/ui/button'

const props = defineProps<
  AlertDialogActionProps & { class?: HTMLAttributes['class']; variant?: ButtonVariants['variant'] }
>()

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props

  return delegated
})
</script>

<template>
  <!-- NOTE: 调整按钮高度, 支持 `variant` 属性 -->
  <AlertDialogAction v-bind="delegatedProps" :class="cn(buttonVariants({ variant }), 'h-8', props.class)">
    <slot />
  </AlertDialogAction>
</template>
