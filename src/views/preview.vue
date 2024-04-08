<route lang="yaml">
meta:
  layout: 'raw'
</route>

<template>
  <RouterView v-slot="{ Component }">
    <Suspense>
      <component :is="Component" />
    </Suspense>
  </RouterView>
</template>
