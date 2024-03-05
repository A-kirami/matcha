<template>
  <div class="layout">
    <Sidebar style="grid-area: sidebar" />
    <Titlebar style="grid-area: titlebar" />
    <RouterView v-slot="{ Component }" style="grid-area: main">
      <component :is="Component" />
    </RouterView>
  </div>
</template>

<style scoped>
.layout {
  @apply h-screen grid;
  grid:
    'sidebar titlebar' auto
    'sidebar main' 1fr
    / auto 1fr;
}
</style>
