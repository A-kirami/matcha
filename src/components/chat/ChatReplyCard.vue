<!-- eslint-disable camelcase -->
<script setup lang="ts">
import { X } from 'lucide-vue-next'
import InlineSvg from 'vue-inline-svg'

import QuoteIcon from '~/assets/quote.svg?url'

const { replyId, closed } = $defineProps<{
  replyId: string
  closed?: boolean
}>()

defineEmits<(e: 'close') => void>()

const chat = useChatStore()

interface ReplyInfo {
  id: string
  uid: string
  nickname: string
  message: string
}

let replyInfo = $ref<ReplyInfo>()

onMounted(async () => {
  const message = chat.getMessage(replyId)
  if (message) {
    const { user_id, group_id } = message.scene as { user_id: string, group_id?: string }
    const nickname = await getUserNickname(user_id, group_id)
    replyInfo = {
      id: replyId,
      uid: user_id,
      nickname,
      message: message.scene.plain_message,
    }
  }
})
</script>

<template>
  <div v-if="replyInfo" class="rounded-lg bg-gray-100 px-3 py-2 transition-colors hover:bg-gray-200">
    <div class="mb-2 flex items-center gap-2">
      <Avatar class="size-6">
        <AvatarImage :src="getAvatarUrl('user', replyInfo.uid)" alt="reply user avatar" />
        <AvatarFallback>{{ replyInfo.nickname }}</AvatarFallback>
      </Avatar>
      <span class="text-sm text-gray-800 font-medium">{{ replyInfo.nickname }}</span>
      <Button v-if="closed" variant="ghost" size="icon" class="ml-auto size-6" @click="$emit('close')">
        <X class="size-5 cursor-pointer text-gray-400" />
      </Button>
    </div>
    <div class="relative text-xs">
      <InlineSvg :src="QuoteIcon" class="absolute inline-block size-4 rotate-180 text-gray-300 -top-0.5" />
      <span class="line-clamp-3 indent-5 text-gray-400">
        {{ replyInfo.message }}
      </span>
    </div>
  </div>
</template>
