<script setup lang="ts">
const { modalStack } = storeToRefs(useModalStore())
</script>

<template>
  <component
    :is="modal.component"
    v-for="[key, modal] in modalStack"
    :key="key"
    v-bind="modal.props"
    v-model:open="modal.isOpen"
  />
</template>
