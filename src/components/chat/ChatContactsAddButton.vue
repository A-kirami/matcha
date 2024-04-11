<script setup lang="ts">
import InlineSvg from 'vue-inline-svg'

import AddChatIcon from '~/assets/add-chat.svg?url'

defineOptions({
  inheritAttrs: false,
})
</script>

<template>
  <GroupCreateFormDialog>
    <Button variant="outline" size="icon" class="add-contact size-8" v-bind="$attrs">
      <InlineSvg :src="AddChatIcon" class="size-4 text-muted-foreground" />
    </Button>
  </GroupCreateFormDialog>
</template>

<style scoped>
.add-contact {
  @media (width <= 708px) {
    @apply w-full;
  }
}
</style>
