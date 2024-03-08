<template>
  <div class="default-layout">
    <AppSidebar style="grid-area: sidebar" />
    <AppTitlebar style="grid-area: titlebar" />
    <RouterView v-slot="{ Component }" style="grid-area: main">
      <component :is="Component" class="bg-white" :class="{ 'bg-opacity-80': focused }" />
    </RouterView>
  </div>
</template>

<style scoped>
.default-layout {
  @apply h-screen grid;
  grid:
    'sidebar titlebar' auto
    'sidebar main' 1fr
    / auto 1fr;
}
</style>
