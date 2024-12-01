<script setup lang="ts">
import { useObservable, from } from '@vueuse/rxjs'
import { liveQuery } from 'dexie'

import type { Contact } from '~/types'

const state = useStateStore()

const allMembers = $(
  useObservable(
    from(
      liveQuery(async () => {
        return await db.members.toArray()
      }),
    ),
  ),
)

const groupMembers = $computed(() => {
  return allMembers?.filter(member => member.groupId === state.chatTarget?.id)
})

provide('groupMembers', $$(groupMembers))

let memberContacts = $ref<Contact[]>([])

watch($$(groupMembers), async () => {
  if (groupMembers) {
    memberContacts = await Promise.all(groupMembers.map(async member => await getContact('user', member.userId)))
  }
})

provide('memberContacts', $$(memberContacts))
</script>

<template>
  <div class="flex">
    <ChatBox class="flex-1" />
    <ChatDetails />
  </div>
</template>
