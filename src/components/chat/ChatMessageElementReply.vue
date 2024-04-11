<script setup lang="ts">
import type { ReplyContent } from '~/adapter/content'

const { data } = $defineProps<{
  data: ReplyContent['data']
}>()
</script>

<template>
  <ChatReplyCard data-type="reply" class="mb-1 cursor-pointer" :reply-id="data.message_id" />
</template>
