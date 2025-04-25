<script setup lang="ts">
import { Plus } from 'lucide-vue-next'

defineOptions({
  inheritAttrs: false,
})

const state = useStateStore()

const modal = useModalStore()

function openUserManage() {
  modal.open('userManage')
}
</script>

<template>
  <div v-if="state.user" class="relative cursor-pointer" v-bind="$attrs" @click="openUserManage">
    <Avatar class="size-9">
      <AvatarImage :src="state.user.avatar" alt="user avatar" />
      <AvatarFallback>{{ state.user.name }}</AvatarFallback>
    </Avatar>
    <span
      class="absolute bottom-0.5 size-4 border-2 border-transparent rounded-full bg-clip-padding -right-1"
      :class="[state.isConnected ? 'bg-emerald-400' : 'bg-rose-400']"
    />
  </div>
  <Button
    v-else
    variant="outline"
    size="icon"
    class="size-9 rounded-full ring-2 ring-gray-200 dark:ring-gray-700"
    hover:svg="rotate-90 scale-110 stroke-2"
    v-bind="$attrs"
    @click="openUserManage"
  >
    <Plus class="rotate-45 stroke-1.5 text-gray-600 transition-transform" />
  </Button>
</template>
