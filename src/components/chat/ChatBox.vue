<template>
  <div :class="$style.chatBoxLayout" class="grid">
    <ChatBoxHeader style="grid-area: header;" />
    <ChatBoxFlow style="grid-area: flow;" />
    <ChatBoxInput style="grid-area: input;" />
  </div>
</template>

<style module>
.chat-box-layout {
  grid:
    "header" auto
    "flow" minmax(0, 1fr)
    "input" auto
    / minmax(0, 1fr);
}
</style>
