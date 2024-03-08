<template>
  <div class="chat-box-layout">
    <ChatBoxHeader style="grid-area: header" />
    <ChatBoxMessageArea style="grid-area: message-area" />
    <ChatBoxInput style="grid-area: input" />
  </div>
</template>

<style scoped>
.chat-box-layout {
  @apply grid;
  grid:
    'header' auto
    'message-area' 1fr
    'input' auto
    / 1fr;
}
</style>
