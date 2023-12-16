<!-- eslint-disable camelcase -->
<!-- eslint-disable @typescript-eslint/ban-ts-comment -->
<script setup lang="ts">
// TODO: 标记为💩山，需要重构
import { UseDraggable } from '@vueuse/components'
import { useFocus } from '@vueuse/core'
import dayjs from 'dayjs'
import { watch } from 'vue'
import { useRoute } from 'vue-router'

import { Behav } from '@/adapter/behav'
import Avatar from '@/components/Avatar.vue'
import { db } from '@/database'
import { useStatusStore, useChatStore } from '@/stores'

import type { Dayjs } from 'dayjs'

const behav = new Behav()

const chat = useChatStore()

const status = useStatusStore()

const dragHandle = $ref<HTMLElement | null>(null)

interface MemberForm {
  card: string
  role: 'owner' | 'admin' | 'member'
  level: number
  title: string
  joinTime: Dayjs
}

const memberForm = $ref<MemberForm>({
  card: status.user!.name,
  role: 'member',
  level: 0,
  title: '',
  joinTime: dayjs(),
})
const route = useRoute()

async function onFinish(member: MemberForm): Promise<void> {
  const { card, role, level, title, joinTime } = member
  const newMember = {
    groupId: route.params.chatId.toString(),
    userId: status.user!.id,
    card: card === status.user!.name ? '' : card,
    role: role || 'member',
    level,
    title,
    // @ts-ignore
    joinTime: joinTime ? (joinTime as Dayjs).unix() : dayjs().unix(),
    lastSentTime: 0,
    titleExpireTime: 0,
    banExpireTime: 0,
  }
  await db.members.add(newMember)
  await chat.appendScene({
    ...behav.createScene('notice'),
    detail_type: 'group_member_increase',
    sub_type: 'join',
    user_id: newMember.userId,
    group_id: newMember.groupId,
    operator_id: newMember.userId,
    chat_type: 'group',
    sender_id: newMember.userId,
    receiver_id: newMember.groupId,
  })
  visible = false
}

function disableFuture(currentDate: Dayjs): boolean {
  return dayjs().isBefore(currentDate)
}

const cardTarget = $ref<HTMLElement | null>(null)
const { focused: cardFocused } = useFocus($$(cardTarget))

watch(cardFocused, (focused) => {
  if (!focused) {
    memberForm.card = cardTarget?.innerText || status.user?.name || ''
  }
})

let isInputting = $ref(false)

function onInput(e: Event, editType: 'name' | 'id'): void {
  if (!isInputting) {
    const el = e.target as HTMLDivElement
    if (el.innerText.length > 10) {
      el.innerText = memberForm.card || status.user!.name
    }
    // @ts-ignore
    memberForm[editType] = el.innerText
  }
}

function onCompositionStart(): void {
  isInputting = true
}

function onCompositionEnd(e: Event, editType: 'name' | 'id'): void {
  isInputting = false
  onInput(e, editType)
}

const props = defineProps<{ modelValue: boolean }>()

const emit = defineEmits<{ (e: 'update:modelValue', value: boolean): void }>()

let visible = $computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
  },
})
</script>

<template>
  <UseDraggable class="fixed" :prevent-default="true" :handle="dragHandle">
    <a-modal
      ref="modalRef"
      v-model:visible="visible"
      :wrap-style="{ overflow: 'hidden' }"
      :closable="false"
      :mask="false"
      :footer="null"
      width="20rem"
      :body-style="{ padding: 0 }"
      centered
    >
      <div class="flex flex-col items-center gap-2 px-7 pb-4">
        <div ref="dragHandle" class="decorate mb-2 cursor-move"></div>
        <Avatar type="user" :aid="status.user!.id" size="4rem" />
        <a-form :model="memberForm" name="basic" label-align="left" autocomplete="off" @finish="onFinish">
          <a-form-item
            name="card"
            :wrapper-col="{
              flex: 1,
            }"
            class="editable"
          >
            <div
              ref="cardTarget"
              :value="memberForm.card"
              class="w-full text-center text-xl decoration-blue-300/80 caret-blue-300/80 outline-none"
              contenteditable
              :class="{ 'underline': cardFocused }"
              @input="(e) => onInput(e, 'name')"
              @compositionstart="onCompositionStart"
              @compositionend="(e) => onCompositionEnd(e, 'name')"
            >
              {{ memberForm.card }}
            </div>
          </a-form-item>
          <a-form-item label="头衔" name="title" :colon="false">
            <a-input v-model:value="memberForm.title" :maxlength="14" size="small" />
          </a-form-item>
          <div class="w-full flex flex-row justify-between gap-2">
            <a-form-item label="等级" name="level" :colon="false">
              <a-input-number id="inputNumber" v-model:value="memberForm.level" :min="0" :max="100" size="small" />
            </a-form-item>
            <a-form-item label="加群" name="joinTime" :colon="false">
              <a-date-picker v-model:value="memberForm.joinTime" :disabled-date="disableFuture" size="small" />
            </a-form-item>
          </div>
          <a-form-item label="权限" name="role" :colon="false">
            <a-radio-group v-model:value="memberForm.role" button-style="solid" size="small">
              <a-radio-button value="member">成员</a-radio-button>
              <a-radio-button value="admin">管理</a-radio-button>
              <a-radio-button value="owner">群主</a-radio-button>
            </a-radio-group>
          </a-form-item>
          <button
            class="mt-2 w-full rounded-full bg-sky-400 py-1 text-light-50 tracking-widest outline-none transition-transform"
            active="scale-98"
          >
            创建成员
          </button>
        </a-form>
      </div>
    </a-modal>
  </UseDraggable>
</template>

<style scoped lang="postcss">
.decorate {
  @apply relative h-2 w-40 bg-blue-300 transition-colors;

  &::before,
  &::after {
    @apply absolute top-0 w-0 h-0 content-empty transition-colors;
    border-top: 0.5rem solid rgb(147 197 253);
    border-right: 0.5rem solid transparent;
    border-bottom: 0.5rem solid transparent;
    border-left: 0.5rem solid transparent;
  }

  &::before {
    @apply left--2;
  }

  &::after {
    @apply right--2;
  }

  &:hover {
    @apply bg-sky-400;

    &::before,
    &::after {
      border-top: 0.5rem solid rgb(56 189 248);
    }
  }
}

:deep(.ant-modal) {
  @apply w-81;
}

:deep(.ant-form) {
  @apply flex flex-col items-center gap-1;
}

:deep(.select-container.ant-form-item-control-wrapper) {
  @apply w-full;
}

:deep(.ant-form-item) {
  @apply mb-0;
}

:deep(.ant-form > .ant-form-item) {
  @apply w-full;
}

:deep(.ant-input-number) {
  @apply w-16;
}

:deep(.ant-select) {
  @apply w-18;
}

:deep(.ant-picker-input) {
  @apply w-24;
}

:deep(.ant-form-item .ant-input-textarea-show-count::after) {
  @apply absolute bottom-2 right-2 mb-0 z-3;
}

:deep(.ant-input-textarea textarea),
:deep(.ant-input),
:deep(.ant-input-affix-wrapper),
:deep(.ant-picker),
:deep(.ant-input-number) {
  @apply rounded-1;
}

:deep(.ant-select-selector) {
  @apply !rounded-1;
}

:deep(.ant-input-number-group-addon) {
  @apply rounded-r-1;
}

:deep(.ant-select-clear) {
  @apply mt--9px;
}

:deep(.editable .ant-form-item-control-input-content) {
  @apply flex justify-center;
}

:deep(.ant-input-textarea textarea) {
  @apply my-1;
}
</style>
