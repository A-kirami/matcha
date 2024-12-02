<script setup lang="ts">
import linkifyStr from 'linkify-string'

import type { TextContent } from '~/adapter/content'

const { data } = $defineProps<{
  data: TextContent['data']
}>()

function getTextMessage(text: string): string {
  return linkifyStr(text, { target: '_blank', className: 'text-blue-400 hover:underline', validate: { email: false } })
}
</script>

<template>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <span data-type="text" class="whitespace-pre-wrap break-all text-gray-800" v-html="getTextMessage(data.text)" />
</template>
