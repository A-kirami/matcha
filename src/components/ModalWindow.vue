<script setup lang="ts">
const modal = useModalStore()
</script>

<template>
  <component
    :is="modal.modalState?.component"
    v-bind="modal.modalState?.props"
    v-model:open="modal.modalOpen"
  ></component>
</template>
