<script setup lang="ts">
import { useObservable, from } from '@vueuse/rxjs'
import { liveQuery } from 'dexie'
import InlineSvg from 'vue-inline-svg'

import AddChatIcon from '@/assets/add-chat.svg?url'
import ChatContactItem from '@/components/ChatContactItem.vue'
import CreateGroupForm from '@/components/CreateGroupForm.vue'
import CreateUserForm from '@/components/CreateUserForm.vue'
import SearchBox from '@/components/SearchBox.vue'
import { db } from '@/database'
import { useStatusStore } from '@/stores'

const status = useStatusStore()

const groupList = useObservable(
  from(
    liveQuery(async () => {
      return await db.groups.toArray()
    })
  )
)

let userFormVisible = $ref<boolean>(false)
let groupFormVisible = $ref<boolean>(false)

function openUserForm() {
  userFormVisible = true
}

function openGroupForm() {
  groupFormVisible = true
}
</script>

<template>
  <CreateUserForm v-model="userFormVisible" />
  <CreateGroupForm v-model="groupFormVisible" />
  <section
    class="w-72 flex flex-shrink-0 flex-col items-center justify-start border-r py-3 lt-lg:w-18 lt-xl:w-52"
    dark="border-dark-400"
  >
    <div class="w-full flex items-center justify-around px-2">
      <SearchBox></SearchBox>
      <a-dropdown>
        <InlineSvg :src="AddChatIcon" class="h-5 w-5 cursor-pointer text-gray-400 outline-none" hover="text-blue-300" />
        <template #overlay>
          <a-menu>
            <a-menu-item>
              <a @click="openUserForm">创建用户</a>
            </a-menu-item>
            <a-menu-item>
              <a @click="openGroupForm">创建群组</a>
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </div>
    <ul v-auto-animate class="mt-4 w-64">
      <li>
        <RouterLink v-slot="{ isActive }" :to="`/chat/private/${status.bot?.id ?? 0}`" active-class="active">
          <ChatContactItem chat-type="private" :chat-person="status.bot" :class="{ 'active': isActive }" />
        </RouterLink>
      </li>
      <li v-for="group in groupList" :key="group.id" class="mt--2">
        <RouterLink v-slot="{ isActive }" :to="`/chat/group/${group.id}`" active-class="active">
          <ChatContactItem chat-type="group" :chat-person="group" :class="{ 'active': isActive }" />
        </RouterLink>
      </li>
    </ul>
  </section>
</template>

<style scoped lang="postcss">
.active {
  @apply shadow-xl shadow-gray-500/10;
}
</style>
