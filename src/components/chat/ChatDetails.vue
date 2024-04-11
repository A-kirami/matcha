<template>
  <div class="chat-details grid grid-rows-[1.5fr_1fr] grid-cols-1 w-52 px-3">
    <ChatDetailsInfo class="mt-8" />
    <ChatDetailsAction class="mb-5" />
  </div>
</template>

<style scoped>
.chat-details {
  @media (width <= 916px) {
    display: none;
  }
}
</style>
