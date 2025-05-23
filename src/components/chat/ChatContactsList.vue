<script setup lang="ts">
import { useObservable, from } from '@vueuse/rxjs'
import { liveQuery } from 'dexie'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue'

const { filter } = $defineProps<{
  filter: string
}>()

const state = useStateStore()

const chat = useChatStore()

const groupList = $(
  useObservable(
    from(
      liveQuery(async () => {
        return await db.groups.toArray()
      }),
    ),
  ),
)

let contacts = $ref<Contact[]>([])

watchDebounced(
  [$$(groupList), $$(chat.chatLogs), $$(filter), () => state.pinnedOrder.length, () => state.bot],
  () => {
    const groupContacts: (Contact & { pinned: boolean, lastMessageTime: number })[]
      = groupList?.map(group => ({
        type: 'group',
        id: group.id,
        name: group.name,
        avatar: getAvatarUrl('group', group.id),
        pinned: state.pinnedOrder.includes(group.id),
        lastMessageTime: group.lastMessageTime,
      })) ?? []

    groupContacts.sort((a, b) => {
      if (a.pinned !== b.pinned) {
        return a.pinned ? -1 : 1
      }
      return a.pinned ? state.pinnedOrder.indexOf(a.id) - state.pinnedOrder.indexOf(b.id) : b.lastMessageTime - a.lastMessageTime
    })

    const contactList = state.bot ? [state.bot, ...groupContacts] : groupContacts

    contacts = contactList.filter(contact => contact.id.includes(filter) || contact.name.includes(filter))
  },
  { immediate: true, debounce: 50, maxWait: 100 },
)

const modal = useModalStore()

function openUserManage() {
  modal.open('userManage')
}
</script>

<template>
  <OverlayScrollbarsComponent
    defer
    :options="{ scrollbars: { autoHide: 'leave', autoHideDelay: 0, theme: 'os-theme-light' } }"
  >
    <ul v-if="state.bot" v-auto-animate class="space-y-3">
      <li v-for="contact in contacts" :key="contact.id" class="rounded-lg">
        <RouterLink :to="`/chat/${contact.type}/${contact.id}`">
          <ChatContactsListItem :contact="contact" />
        </RouterLink>
      </li>
    </ul>
    <Button v-else class="h-8 w-full" @click="openUserManage">
      管理机器人
    </Button>
  </OverlayScrollbarsComponent>
</template>
