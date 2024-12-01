<script setup lang="ts">
import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue'

const route = useRoute()

interface MetaData {
  title: string
  description: string
}

const metaData = $computed(() => {
  return route.meta as unknown as MetaData
})
</script>

<template>
  <section class="grid grid-rows-[auto_auto_minmax(0,1fr)] gap-4">
    <div class="px-2">
      <h3 class="text-lg font-medium">
        {{ metaData.title }}
      </h3>
      <p class="text-sm text-muted-foreground">
        {{ metaData.description }}
      </p>
    </div>
    <Separator />
    <OverlayScrollbarsComponent
      defer
      :options="{ scrollbars: { autoHide: 'leave', autoHideDelay: 0, theme: 'os-theme-light' } }"
      class="px-2"
    >
      <slot />
    </OverlayScrollbarsComponent>
  </section>
</template>
