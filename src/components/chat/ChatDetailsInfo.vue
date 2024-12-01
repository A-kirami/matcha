<script setup lang="ts">
const state = useStateStore()
</script>

<template>
  <div class="flex flex-col items-center gap-4">
    <Avatar size="lg" class="size-24 ring-2 ring-offset-4 ring-blue-400">
      <AvatarImage :src="state.chatTarget?.avatar || ''" alt="chat avatar" />
      <AvatarFallback>{{ state.chatTarget?.name }}</AvatarFallback>
    </Avatar>
    <div class="text-center">
      <div class="max-w-40 truncate text-lg text-foreground font-semibold">
        {{ state.chatTarget?.name }}
      </div>
      <div class="text-muted-foreground">
        {{ state.chatTarget?.id }}
      </div>
    </div>
    <ChatDetailsInfoBot v-if="state.chatTarget?.isBot" />
    <ChatDetailsInfoGroup v-else />
  </div>
</template>
