<script lang="ts" setup>
import type { HTMLAttributes } from 'vue'
import { useFormField } from './useFormField'
import { cn } from '~/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()

const { formDescriptionId } = useFormField()
</script>

<template>
  <!-- NOTE: 调整字体大小 -->
  <p :id="formDescriptionId" :class="cn('text-xs text-muted-foreground', props.class)">
    <slot />
  </p>
</template>
