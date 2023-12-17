<script setup lang="ts">
defineProps<{
  chatType: 'private' | 'group'
  chatId: string
}>()
</script>

<template>
  <section class="w-64 flex-shrink-0 border-l lt-lg:hidden lt-xl:w-48" dark="border-dark-400"></section>
</template>
