<script setup lang="ts">
import ChatContact from '@/components/ChatContact.vue'
</script>

<template>
  <div class="h-full flex justify-between">
    <ChatContact />
    <RouterView v-slot="{ Component }">
      <KeepAlive>
        <component :is="Component" />
      </KeepAlive>
    </RouterView>
    <RouterView name="action" />
  </div>
</template>
