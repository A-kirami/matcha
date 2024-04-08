<script setup lang="ts">
const search = $ref('')
</script>

<template>
  <div class="chat-contacts w-62 flex flex-col">
    <div class="contacts-toolbar mb-3 mt-2 flex gap-2 px-4">
      <SearchBar v-model="search" class="contacts-search" />
      <ChatContactsAddButton class="flex-shrink-0" />
    </div>
    <ChatContactsList class="contacts-list mb-5 flex-1 px-3" :filter="search" />
  </div>
</template>

<style scoped>
@media (width <= 708px) {
  .chat-contacts {
    @apply w-16;
  }

  .contacts-toolbar {
    @apply px-3;
  }

  .contacts-search {
    @apply hidden;
  }

  .contacts-list {
    @apply pt-2;
  }
}
</style>
