<script setup lang="tsx">
const { theme } = $defineProps<{
  theme: 'light' | 'dark' | 'auto'
}>()

const Message = (
  <div class="flex gap-1">
    <div class="size-3 rounded-full bg-[--color-contrast]" />
    <div class="h-4 w-14 rounded-sm bg-[--color-contrast]" />
  </div>
)
</script>

<template>
  <div
    v-if="theme !== 'auto'"
    :class="[$style.theme, $style[theme]]"
    class="h-28 w-42 flex flex-1 gap-1 border-2 border-muted rounded-md bg-[--color-background] p-1 hover:border-accent"
  >
    <div class="w-4 rounded-sm bg-[--color-contrast]" />
    <div class="w-12 rounded-sm bg-[--color-primary]" />
    <div class="w-full flex flex-col gap-2 rounded-sm bg-[--color-primary] p-2">
      <Message />
      <Message />
      <Message class="flex-row-reverse" />
    </div>
  </div>
  <div v-else class="relative h-28 w-42 overflow-hidden border-2 border-muted rounded-md hover:border-accent">
    <div :class="[$style.theme, $style.light]" class="absolute size-full flex flex-1 gap-1 bg-[--color-background] p-1">
      <div class="w-4 rounded-sm bg-[--color-contrast]" />
      <div class="w-12 rounded-sm bg-[--color-primary]" />
      <div class="w-full flex flex-col gap-2 rounded-sm bg-[--color-primary] p-2">
        <Message />
        <Message />
        <Message class="flex-row-reverse" />
      </div>
    </div>
    <div
      :class="[$style.theme, $style.dark]"
      class="absolute size-full flex flex-1 gap-1 bg-[--color-background] p-1"
      style="clip-path: polygon(75% 0, 100% 0%, 100% 100%, 25% 100%);"
    >
      <div class="w-4 rounded-sm bg-[--color-contrast]" />
      <div class="w-12 rounded-sm bg-[--color-primary]" />
      <div class="w-full flex flex-col gap-2 rounded-sm bg-[--color-primary] p-2">
        <Message />
        <Message />
        <Message class="flex-row-reverse" />
      </div>
    </div>
  </div>
</template>

<style module>
.theme {
  &.light {
    --color-primary: rgb(241 243 245);
    --color-contrast: rgb(222 226 230);
    --color-background: rgb(255 255 255);
  }

  &.dark {
    --color-primary: rgb(28 30 33);
    --color-contrast: rgb(52 58 64);
    --color-background: rgb(0 0 0);
  }
}
</style>
