<!-- eslint-disable camelcase -->
<script setup lang="ts">
import { Behav } from '~/adapter/behav'

import type { Scenes } from '~/adapter/scene'
import type { Request } from '~/stores/chat'

const { request } = $defineProps<{
  request: Request
}>()

const behav = new Behav()

const state = useStateStore()

let requestInfo = $ref<RequestInfo>()

let isAdmin = $ref(true)

const scene = request.scene

interface RequestInfo {
  title: string
  type: 'group' | 'user'
  target: string
  name: string
  avatar: string
  prompt: string
  comment?: string
  handle: (approve: boolean) => Promise<Scenes | undefined>
}

enum RequestTitles {
  add_friend = '添加好友',
  join_group = '申请入群',
  group_invite = '邀请入群',
}

enum RequestPrompts {
  add_friend = '请求添加{pronoun}为好友',
  join_group = '申请加入本群',
  group_invite = '邀请{pronoun}加入',
}

async function getRequestInfo(scene: Request['scene']): Promise<RequestInfo> {
  const { id, detail_type, group_id, comment, sender_id, receiver_id } = scene as Request['scene'] & {
    group_id?: string
    comment?: string
  }

  const title = RequestTitles[detail_type]
  const type = detail_type === 'group_invite' ? 'group' : 'user'
  const target = detail_type === 'group_invite' ? group_id : sender_id
  const prompt = RequestPrompts[detail_type].replace('{pronoun}', scene.sender_id === state.user?.id ? '对方' : '你')

  const { name, avatar } = await getContact(type, target)

  const handle
    = detail_type === 'add_friend'
      ? async (approve: boolean) => await behav.approveAddFriend(id, state.user?.id || '', approve)
      : (detail_type === 'join_group'
          ? async (approve: boolean) => await behav.approveJoinGroup(id, state.user?.id || '', approve)
          : async (approve: boolean) => {
            if (approve) {
              return await behav.requestJoinGroup(group_id, receiver_id)
            }
          })

  return {
    title,
    type,
    target,
    prompt,
    comment,
    name,
    avatar,
    handle,
  }
}

watch(
  () => state.user,
  async () => {
    requestInfo = await getRequestInfo(scene)
    isAdmin = scene.detail_type === 'join_group' ? await roleCheck('admin', scene.group_id, state.user?.id || '') : true
    request.preview = requestInfo.prompt
  },
  { immediate: true },
)
</script>

<template>
  <div
    v-if="requestInfo"
    class="mx-auto w-64 flex flex-col items-center overflow-hidden rounded-md bg-background shadow-sm"
  >
    <div class="text-base font-medium leading-loose">
      {{ requestInfo.title }}
    </div>
    <div class="w-full flex items-center gap-3 px-4 py-3">
      <Avatar>
        <AvatarImage :src="requestInfo.avatar" alt="request avatar" />
        <AvatarFallback>{{ requestInfo.name }}</AvatarFallback>
      </Avatar>
      <div class="flex flex-col gap-1">
        <span v-if="scene.detail_type !== 'group_invite'" class="max-w-50 flex flex-col">
          <span class="truncate font-medium">{{ requestInfo.name }}</span>
          <span class="whitespace-nowrap text-sm text-muted-foreground">{{ requestInfo.prompt }}</span>
        </span>
        <span v-else class="max-w-50 flex items-center gap-1">
          <span class="whitespace-nowrap">{{ requestInfo.prompt }}</span>
          <span class="truncate font-medium">{{ requestInfo.name }}</span>
        </span>
        <span v-if="requestInfo.comment" class="line-clamp-2 text-xs text-muted-foreground">附加信息：{{ requestInfo.comment }}</span>
      </div>
    </div>
    <div
      v-show="isAdmin && scene.sender_id !== state.user?.id"
      class="w-full flex justify-evenly text-base leading-loose"
    >
      <template v-if="request.action === 'await'">
        <span
          class="flex-grow cursor-pointer text-center transition-colors duration-200"
          hover="bg-red-50 text-red-400"
          @click="requestInfo?.handle(false)"
        >拒绝</span>
        <span
          class="flex-grow cursor-pointer text-center transition-colors duration-200"
          hover="bg-blue-50 text-blue-400"
          @click="requestInfo?.handle(true)"
        >同意</span>
      </template>
      <span v-else>已{{ request.action === 'agree' ? '同意' : '拒绝' }}该请求</span>
    </div>
  </div>
</template>
