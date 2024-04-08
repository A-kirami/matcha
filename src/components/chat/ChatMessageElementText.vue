<script setup lang="ts">
import type { TextContent } from '~/adapter/content'

const { data } = $defineProps<{
  data: TextContent['data']
}>()
</script>

<template>
  <span data-type="text" class="whitespace-pre-wrap break-all text-gray-800">{{ data.text }}</span>
</template>
