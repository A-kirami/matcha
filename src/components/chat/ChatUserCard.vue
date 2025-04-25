<script setup lang="ts">
const { uid } = $defineProps<{
  uid: string
}>()

let user = $ref<User>()

onMounted(async () => {
  user = await db.users.get(uid)
})

const state = useStateStore()

const modal = useModalStore()

function openEditDialog() {
  if (user && state.chatTarget?.type === 'group') {
    modal.open('memberEdit', { groupId: state.chatTarget.id, userId: uid, userName: user.name })
  }
}
</script>

<template>
  <HoverCard>
    <HoverCardTrigger as-child>
      <slot />
    </HoverCardTrigger>
    <HoverCardContent v-if="state.chatTarget?.type === 'group'" class="w-full px-4 py-3">
      <div class="flex space-x-4">
        <Avatar>
          <AvatarImage :src="getAvatarUrl('user', uid)" alt="user avatar" />
          <AvatarFallback>{{ user?.name }}</AvatarFallback>
        </Avatar>
        <div>
          <h4 class="text-sm font-semibold">
            {{ user?.name }}
          </h4>
          <p class="text-sm text-muted-foreground">
            {{ uid }}
          </p>
          <Button class="mt-2 h-auto px-3 py-1 text-xs" @click="openEditDialog">
            编辑资料
          </Button>
        </div>
      </div>
    </HoverCardContent>
  </HoverCard>
</template>
