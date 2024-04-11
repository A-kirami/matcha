<route lang="yaml">
meta:
  navDisplay: true
  icon: chat.svg
  activeIcon: chat-active.svg
</route>

<script lang="ts">
const state = useStateStore()

export default defineComponent({
  beforeRouteEnter: (to) => {
    if (to.path === '/chat' && state.chatTarget) {
      return `/chat/${state.chatTarget.type}/${state.chatTarget.id}`
    }
  },
})
</script>

<template>
  <main class="flex">
    <ChatContacts />
    <RouterView class="flex-1" />
  </main>
</template>
