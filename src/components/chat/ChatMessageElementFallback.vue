<script setup lang="ts">
import type { Contents } from '~/adapter/content'

const { data } = $defineProps<{
  data: Contents['data']
}>()
</script>

<template>
  <div class="bg-red-400 box-decoration-clone text-white">
    {{ data }}
  </div>
</template>
