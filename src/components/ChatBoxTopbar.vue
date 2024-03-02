<script setup lang="ts">
import { useObservable, from } from '@vueuse/rxjs'
import { liveQuery } from 'dexie'

import { Behav } from '~/adapter/behav'

const { chatType, chatPerson } = $defineProps<{
  chatType: 'private' | 'group'
  chatPerson: User | Group | null
}>()

const behav = new Behav()

const status = useStatusStore()

const isGroup = $computed(() => chatType === 'group')

const allMembers = $(
  useObservable(
    from(
      liveQuery(async () => {
        return await db.members.toArray()
      })
    )
  )
)

const groupMembers = $computed(() => {
  return allMembers?.filter((member) => member.groupId === chatPerson?.id)
})

const isGroupMember = $computed(() => {
  return groupMembers?.some((member) => {
    return member.userId === status.user?.id
  })
})

const isFriend = $(
  useObservable(
    from(
      liveQuery(async () => {
        return !!(await db.friends.get({ userId: status.assignUser, friendId: status.assignBot }))
      })
    )
  )
)

const MAX_SHOW_MEMBERS = 4

const showMembers = $computed(() => {
  return groupMembers?.slice(0, MAX_SHOW_MEMBERS) || []
})

const buttonText = $computed(() => {
  if (isGroup) {
    return isGroupMember ? '退出此群' : '申请入群'
  } else {
    return isFriend ? '删除好友' : '添加好友'
  }
})

let visible = $ref<boolean>(false)

async function quickAction(): Promise<void> {
  switch (buttonText) {
    case '申请入群': {
      visible = true
      break
    }
    case '退出此群': {
      await behav.removeGroupMember(chatPerson!.id, status.assignUser, status.assignUser)
      break
    }
    case '添加好友': {
      await behav.requestAddFriend(status.assignBot, status.assignUser)
      break
    }
    case '删除好友': {
      await behav.removeFriend(status.assignUser, status.assignBot)
      break
    }
    default: {
      return
    }
  }
}
</script>

<template>
  <CreateMemberForm v-model="visible" />
  <header
    class="h-14 flex flex-row justify-between border-b border-light-700 bg-light-50 px-5 py-2.5 transition-colors duration-500"
    dark="bg-dark-800 border-dark-400"
  >
    <div class="flex flex-row cursor-pointer items-center">
      <Avatar :type="chatType" :aid="chatPerson?.id ?? 0" :border="true" size="2.8rem"></Avatar>
      <div class="ml-4 self-center">
        <span ref="groupNameSpan" class="text-xl font-550" dark="text-gray-400">{{ chatPerson?.name }}</span>
      </div>
    </div>
    <div class="flex flex-row items-center gap-4 py-2">
      <div v-if="isGroup" class="flex flex-row cursor-pointer">
        <Avatar
          v-for="(member, index) in showMembers"
          :key="member.userId"
          type="user"
          :aid="member.userId"
          :style="{ transform: `translateX(${(showMembers.length - index - 1) * 15}px)` }"
          size="2.2rem"
        ></Avatar>
      </div>
      <button class="text-sm outline-none" @click="quickAction">{{ buttonText }}</button>
    </div>
  </header>
</template>

<style scoped>
button {
  position: relative;
  z-index: 1;
  padding: 4px 12px;
  overflow: hidden;
  font-weight: 500;
  color: hsl(206deg 96% 62%);
  background: hsl(210deg 100% 80% / 30%);
  border: unset;
  border-radius: 9999px;
  transition: all 250ms;
}

button::before {
  position: absolute;
  top: 0;
  left: 0;
  z-index: -1;
  width: 0;
  height: 100%;
  content: '';
  background-color: hsl(206deg 100% 50%);
  border-radius: 9999px;
  transition: all 250ms;
}

button:hover {
  color: hsl(0deg 0% 91%);
}

button:hover::before {
  width: 100%;
}

button:active {
  transform: scale(0.95);
}
</style>
