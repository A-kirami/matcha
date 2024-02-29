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
