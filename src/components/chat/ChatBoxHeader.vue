<script setup lang="ts">
import { useObservable, from } from '@vueuse/rxjs'
import { liveQuery } from 'dexie'
import { EllipsisVertical, UserRoundPlus, LogIn, LogOut, Pencil, UserRoundMinus } from 'lucide-vue-next'

import { Behav } from '~/adapter/behav'
import GroupEditFormDialog from '~/components/chat/GroupEditFormDialog.vue'
import UserEditFormDialog from '~/components/chat/UserEditFormDialog.vue'

const behav = new Behav()

const state = useStateStore()

const groupMembers = $(inject<Member[]>('groupMembers'))

const isGroupMember = $computed(() => {
  return groupMembers?.some((member) => {
    return member.userId === state.user?.id
  })
})

async function handleGroupMember() {
  if (isGroupMember) {
    await behav.removeGroupMember(state.chatTarget!.id, state.user!.id, state.user!.id)
  } else {
    const scene = await behav.requestJoinGroup(state.chatTarget!.id, state.user!.id)
    if (!groupMembers.length) {
      await behav.approveJoinGroup(scene.id, '0', true)
    }
  }
}

const isFriend = $(
  useObservable(
    from(
      liveQuery(async () => {
        return !!(await db.friends.get({ userId: state.user?.id, friendId: state.bot?.id }))
      })
    )
  )
)

async function handleFriend() {
  if (isFriend) {
    await behav.removeFriend(state.user!.id, state.bot!.id)
  } else {
    await behav.requestAddFriend(state.bot!.id, state.user!.id)
  }
}

const EditDialog = $computed(() => {
  return state.chatTarget?.type === 'group' ? GroupEditFormDialog : UserEditFormDialog
})
</script>

<template>
  <div class="h-13 flex items-center gap-3 px-4">
    <Avatar>
      <AvatarImage :src="state.chatTarget?.avatar || ''" alt="chat avatar" />
      <AvatarFallback>{{ state.chatTarget?.name }}</AvatarFallback>
    </Avatar>
    <div class="flex-shrink truncate text-foreground font-medium">{{ state.chatTarget?.name }}</div>
    <div class="ml-auto flex text-muted-foreground">
      <TooltipProvider :delay-duration="1500">
        <Tooltip>
          <TooltipTrigger>
            <component :is="EditDialog" v-if="state.chatTarget" :target-id="state.chatTarget?.id">
              <Button variant="ghost" size="icon">
                <Pencil class="size-5 stroke-1.5" />
              </Button>
            </component>
          </TooltipTrigger>
          <TooltipContent side="bottom" class="px-2">
            <p class="text-xs">{{ state.chatTarget?.type === 'group' ? '编辑群组' : '编辑用户' }}</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip v-if="state.chatTarget?.type === 'group'">
          <TooltipTrigger as-child>
            <Button variant="ghost" size="icon" @click="handleGroupMember">
              <LogOut v-if="isGroupMember" class="size-5 stroke-1.5" />
              <LogIn v-else class="size-5 stroke-1.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" class="px-2">
            <p class="text-xs">{{ isGroupMember ? '退出群组' : '加入群组' }}</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip v-else>
          <TooltipTrigger as-child>
            <Button variant="ghost" size="icon" @click="handleFriend">
              <UserRoundMinus v-if="isFriend" class="size-5 stroke-1.5" />
              <UserRoundPlus v-else class="size-5 stroke-1.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" class="px-2">
            <p class="text-xs">{{ isFriend ? '删除好友' : '添加好友' }}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <Button variant="ghost" size="icon">
        <EllipsisVertical class="size-5 stroke-1.5" />
      </Button>
    </div>
  </div>
</template>
