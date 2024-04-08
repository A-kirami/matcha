<script setup lang="ts">
const { uid } = $defineProps<{
  uid: string
}>()

let user = $ref<User>()

onMounted(async () => {
  user = await db.users.get(uid)
})

const open = $ref(false)

const state = useStateStore()
</script>

<template>
  <HoverCard>
    <HoverCardTrigger as-child>
      <slot></slot>
    </HoverCardTrigger>
    <HoverCardContent v-if="state.chatTarget?.type === 'group'" class="w-full px-4 py-3">
      <div class="flex space-x-4">
        <Avatar>
          <AvatarImage :src="getAvatarUrl('user', uid)" alt="user avatar" />
          <AvatarFallback>{{ user?.name }}</AvatarFallback>
        </Avatar>
        <div>
          <h4 class="text-sm font-semibold">{{ user?.name }}</h4>
          <p class="text-sm text-muted-foreground">{{ uid }}</p>
          <Button class="mt-2 h-auto px-3 py-1 text-xs" @click="open = true">编辑资料</Button>
        </div>
      </div>
    </HoverCardContent>
  </HoverCard>
  <MemberEditFormDialog
    v-if="user && state.chatTarget?.type === 'group'"
    v-model:open="open"
    :group-id="state.chatTarget.id"
    :user-id="user.id"
    :user-name="user.name"
  />
</template>
