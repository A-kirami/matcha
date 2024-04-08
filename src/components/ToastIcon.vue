<script setup lang="tsx">
import { Info, TriangleAlert, OctagonX, CircleCheckBig } from 'lucide-vue-next'

const { type } = $defineProps<{
  type: IconType
}>()

type IconType = 'info' | 'warning' | 'error' | 'success' | 'loading'

const Loading = (
  <div
    class="inline-block animate-spin border-[3px] border-current border-t-transparent rounded-full"
    role="status"
    aria-label="loading"
  >
    <span class="sr-only">Loading...</span>
  </div>
)

const icons = {
  info: Info,
  warning: TriangleAlert,
  error: OctagonX,
  success: CircleCheckBig,
  loading: Loading,
}

const style = useCssModule()

const IconClass = (() => {
  return style[`icon${type[0].toUpperCase()}${type.slice(1)}`]
})()
</script>

<template>
  <div :class="IconClass" class="size-8 inline-flex flex-shrink-0 items-center justify-center rounded-lg">
    <component :is="icons[type as IconType]" class="size-5" />
  </div>
</template>

<style module>
.icon-info {
  @apply bg-blue-50 text-blue-300;
}

.icon-warning {
  @apply bg-orange-50 text-orange-300;
}

.icon-error {
  @apply bg-red-50 text-red-300;
}

.icon-success {
  @apply bg-green-50 text-green-300;
}

.icon-loading {
  @apply text-blue-400;
}
</style>
