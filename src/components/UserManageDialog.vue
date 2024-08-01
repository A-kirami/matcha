<script setup lang="ts">
import { useObservable, from } from '@vueuse/rxjs'
import { liveQuery } from 'dexie'
import { ArrowRightLeft, Bot, UserRound, Pencil } from 'lucide-vue-next'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue'

const state = useStateStore()

const userList = $(
  useObservable(
    from(
      liveQuery(async () => {
        return await db.users.toArray()
      })
    )
  )
)

const filter = $ref('')

const users = $computed(() => {
  return (
    userList
      ?.sort((a, b) => {
        if (a.id === state.user?.id) {
          return -1
        }
        if (b.id === state.user?.id) {
          return 1
        }
        if (a.id === state.bot?.id) {
          return -1
        }
        if (b.id === state.bot?.id) {
          return 1
        }
        return b.lastUseTime - a.lastUseTime
      })
      .filter((user) => user.id.includes(filter) || user.name.includes(filter)) || []
  )
})

function exchangeUserBot() {
  ;[state.user, state.bot] = [state.bot, state.user]
}

async function assignUser(type: 'user' | 'bot', uid: string) {
  if (type === 'user' && uid !== state.bot?.id) {
    await state.refreshUser(uid)
  } else if (type === 'bot' && uid !== state.user?.id) {
    await state.refreshBot(uid)
  } else {
    exchangeUserBot()
  }
  await db.users.update(uid, { lastUseTime: getTimestamp() })
}

const open = $(defineModel('open', { default: false }))
</script>

<template>
  <Dialog v-model:open="open">
    <DialogTrigger as-child>
      <slot></slot>
    </DialogTrigger>
    <DialogContent class="max-w-100">
      <DialogHeader>
        <DialogTitle class="text-base">角色管理</DialogTitle>
        <DialogDescription class="text-sm">管理当前交互的用户和机器人角色</DialogDescription>
      </DialogHeader>
      <div class="mt-2 flex items-center justify-evenly gap-4">
        <div class="relative">
          <Avatar class="size-14 ring-4 ring-rose-100" dark="ring-rose-500">
            <AvatarImage :src="state.user?.avatar || ''" alt="user avatar" />
            <AvatarFallback>{{ state.user?.name }}</AvatarFallback>
          </Avatar>
          <div
            class="absolute left-1/2 top-0 flex gap-0.5 rounded bg-rose-100 px-1 py-0.5 text-xs text-rose-500 -translate-x-1/2 -translate-y-1/2"
            dark="text-rose-100 bg-rose-500"
          >
            <UserRound class="size-4 stroke-1.5" />
            <span class="ws-nowrap">用户</span>
          </div>
        </div>
        <Button variant="ghost" size="icon" @click="exchangeUserBot">
          <ArrowRightLeft class="stroke-1.5 text-foreground" />
        </Button>
        <div class="relative">
          <Avatar class="size-14 ring-4 ring-violet-100" dark="ring-violet-500">
            <AvatarImage :src="state.bot?.avatar || ''" alt="bot avatar" />
            <AvatarFallback>{{ state.bot?.name }}</AvatarFallback>
          </Avatar>
          <div
            class="absolute left-1/2 top-0 flex gap-0.5 rounded bg-violet-100 px-1 py-0.5 text-xs text-violet-500 -translate-x-1/2 -translate-y-1/2"
            dark="text-violet-100 bg-violet-500"
          >
            <Bot class="size-4 stroke-1.5" />
            <span class="ws-nowrap">机器人</span>
          </div>
        </div>
      </div>
      <SearchBar v-model="filter" />
      <OverlayScrollbarsComponent
        defer
        :options="{ scrollbars: { autoHide: 'leave', autoHideDelay: 0, theme: 'os-theme-light' } }"
        class="max-h-60 p-1"
      >
        <div v-auto-animate class="space-y-2">
          <div
            v-for="user in users"
            :key="user.id"
            class="flex items-center gap-2 rounded-md px-2 py-1.5"
            :class="{
              'bg-rose-100 ring-1 ring-rose-500 dark:bg-rose-500 dark:ring-none': user.id === state.user?.id,
              'bg-violet-100 ring-1 ring-violet-500 dark:bg-violet-500 dark:ring-none': user.id === state.bot?.id,
            }"
          >
            <Avatar class="">
              <AvatarImage :src="getAvatarUrl('user', user.id)" alt="user avatar" />
              <AvatarFallback>{{ user.name }}</AvatarFallback>
            </Avatar>
            <div>
              <p class="text-sm font-medium leading-none">{{ user.name }}</p>
              <p class="text-sm text-muted-foreground">{{ user.id }}</p>
            </div>
            <div class="ml-auto">
              <Button
                variant="ghost"
                size="icon"
                class="size-8"
                :class="{
                  'cursor-default bg-rose-200 hover:bg-rose-200 dark:bg-rose-800 dark:hover:bg-rose-800':
                    user.id === state.user?.id,
                  'hover:bg-violet-200 dark:hover:bg-violet-800': user.id === state.bot?.id,
                }"
                @click="assignUser('user', user.id)"
              >
                <UserRound
                  class="size-4 stroke-1.5"
                  :class="{ 'text-rose-500 dark:text-rose-200': user.id === state.user?.id }"
                />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                class="size-8"
                :class="{
                  'hover:bg-rose-200 dark:hover:bg-rose-800': user.id === state.user?.id,
                  'cursor-default bg-violet-200 hover:bg-violet-200 dark:bg-violet-800 dark:hover:bg-violet-800':
                    user.id === state.bot?.id,
                }"
                @click="assignUser('bot', user.id)"
              >
                <Bot
                  class="size-4 stroke-1.5"
                  :class="{ 'text-violet-500 dark:text-violet-200': user.id === state.bot?.id }"
                />
              </Button>
              <UserEditFormDialog :target-id="user.id">
                <Button
                  variant="ghost"
                  size="icon"
                  class="size-8"
                  :class="{
                    'hover:bg-rose-200 dark:hover:bg-rose-800': user.id === state.user?.id,
                    'hover:bg-violet-200 dark:hover:bg-violet-800': user.id === state.bot?.id,
                  }"
                >
                  <Pencil class="size-4 stroke-1.5" />
                </Button>
              </UserEditFormDialog>
            </div>
          </div>
        </div>
      </OverlayScrollbarsComponent>
      <DialogFooter>
        <UserCreateFormDialog>
          <Button class="h-8 w-full">新建角色</Button>
        </UserCreateFormDialog>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
