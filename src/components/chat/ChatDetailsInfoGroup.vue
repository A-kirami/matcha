<script setup lang="ts">
import type { Contact } from '~/types'

const groupMembers = $(inject<Member[]>('groupMembers'))
const memberContacts = $(inject<Contact[]>('memberContacts'))

const MAX_AVATAR_COUNT = 4

const getMemberRole = $computed(() => (id: string) => {
  const member = groupMembers.find((member) => member.userId === id)
  if (!member) {
    return 'member'
  }
  return member.role
})
</script>

<template>
  <div class="flex -space-x-2">
    <TooltipProvider>
      <Tooltip v-for="member in memberContacts.slice(0, MAX_AVATAR_COUNT)" :key="member.id">
        <TooltipTrigger as-child>
          <Avatar
            class="size-8 ring-2 ring-white hover:z-1"
            :class="{
              'ring-amber-200': getMemberRole(member.id) === 'owner',
              'ring-sky-200': getMemberRole(member.id) === 'admin',
            }"
          >
            <AvatarImage :src="member.avatar" alt="member avatar" />
            <AvatarFallback>{{ member.name }}</AvatarFallback>
          </Avatar>
        </TooltipTrigger>
        <TooltipContent>
          <p>{{ member.name }}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
    <span
      v-if="memberContacts?.length > MAX_AVATAR_COUNT"
      class="size-[32px] inline-flex items-center justify-center rounded-full bg-blue-50 ring-2 ring-white hover:bg-blue-100"
    >
      <span class="text-sm text-gray-500 font-medium leading-none dark:text-gray-400"
        >+{{ memberContacts.length - MAX_AVATAR_COUNT }}</span
      >
    </span>
  </div>
</template>
