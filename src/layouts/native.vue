<template>
  <div
    class="grid grid-rows-[auto_minmax(0,1fr)] h-screen"
  >
    <WindowTitlebar
      class="h-7" :class="[
        focused ? 'bg-opacity-40 dark:bg-opacity-60' : 'bg-opacity-70 dark:bg-opacity-90'
      ]"
    />
    <RouterView
      :class="[
        focused ? 'bg-opacity-40 dark:bg-opacity-60' : 'bg-opacity-70 dark:bg-opacity-90'
      ]"
    />
  </div>
</template>
