<script setup lang="ts">
import ChatUserCard from './ChatUserCard.vue'

import type { MentionContent } from '~/adapter/content'

const { data } = $defineProps<{
  data: MentionContent['data']
}>()

const state = useStateStore()

const mentionString = await getMentionString(data, state.chatTarget?.type === 'group' ? state.chatTarget.id : undefined)
</script>

<template>
  <ChatUserCard v-if="data.target != 'all'" :uid="data.target">
    <Button variant="link" data-type="mention" class="h-auto px-1 py-0 text-blue-400" @selectstart.prevent>
      {{ mentionString }}
    </Button>
  </ChatUserCard>
  <Button v-else variant="link" data-type="mention" class="h-auto px-1 py-0 text-blue-400" @selectstart.prevent>
    {{ mentionString }}
  </Button>
</template>
