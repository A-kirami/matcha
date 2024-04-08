<script setup lang="ts">
import InlineSvg from 'vue-inline-svg'

const { type = 'file' } = $defineProps<{
  type?: 'image' | 'audio' | 'video' | 'file'
}>()

const icon = getAssetsUrl(`files/${type}.svg`)
</script>

<template>
  <InlineSvg :src="icon" />
</template>
