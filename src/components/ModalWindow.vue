<script setup lang="ts">
const { modalStack } = storeToRefs(useModalStore())
</script>

<template>
  <component
    :is="modal.component"
    v-for="modal in modalStack"
    :key="modal.id"
    v-bind="modal.props"
    v-model:open="modal.isOpen"
  />
</template>
