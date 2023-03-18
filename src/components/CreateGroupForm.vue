<!-- eslint-disable @typescript-eslint/ban-ts-comment -->
<script setup lang="ts">
// TODO: 标记为💩山，需要重构
import { UseDraggable } from '@vueuse/components'
import { useFocus } from '@vueuse/core'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import { watch } from 'vue'
import InlineSvg from 'vue-inline-svg'

import DiceIcon from '@/assets/dice.svg?url'
import Avatar from '@/components/Avatar.vue'
import { db } from '@/database'
import { randomInt } from '@/utils'

import type { Dayjs } from 'dayjs'

const dragHandle = $ref<HTMLElement | null>(null)

interface GroupForm {
  id: number
  name: string
  time?: Dayjs
  intro?: string
  level?: number
  maxMemberCount: string
}

const groupForm = $ref<GroupForm>({
  id: randomId(),
  name: '点击修改群名称',
  time: undefined,
  intro: undefined,
  level: undefined,
  maxMemberCount: '200',
})

function randomId(): number {
  return randomInt(1e7, 1e8)
}

async function onFinish(group: GroupForm): Promise<void> {
  // @ts-ignore
  const { id, name, time, intro, level, maxMemberCount } = group
  if (await db.groups.get(id)) {
    message.error('群组已存在')
  } else {
    await db.groups.add({
      id,
      name,
      time: time ? time.unix() : dayjs().unix(),
      intro,
      level,
      maxMemberCount: Number(maxMemberCount),
      memberCount: 0,
    })
    message.success('群组创建成功')
  }
  visible = false
}

function disableFuture(currentDate: Dayjs): boolean {
  return dayjs().isBefore(currentDate)
}

const nameTarget = $ref<HTMLElement | null>(null)
const { focused: nameFocused } = useFocus($$(nameTarget))

const idTarget = $ref<HTMLElement | null>(null)
const { focused: idFocused } = useFocus($$(idTarget))

watch(nameFocused, (focused) => {
  if (!focused) {
    groupForm.name = nameTarget?.innerText || '昵称不可为空'
  }
})

watch(idFocused, (focused) => {
  if (!focused) {
    groupForm.id = Number(idTarget?.innerText) || randomId()
  }
})

let isInputting = $ref(false)

function onInput(e: Event, editType: 'name' | 'id'): void {
  if (!isInputting) {
    const el = e.target as HTMLDivElement
    if (editType === 'id') {
      const filteredText = el.innerText.replace(/[^\d]/g, '')
      if (filteredText !== el.innerText || el.innerText.length > 10) {
        el.innerText = groupForm.id.toString()
      }
    } else {
      if (el.innerText.length > 14) {
        el.innerText = groupForm.name
      }
    }
    // @ts-ignore
    groupForm[editType] = el.innerText
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
        <Avatar type="group" :aid="groupForm.id" size="4rem" />
        <a-form :model="groupForm" name="basic" label-align="left" autocomplete="off" @finish="onFinish">
          <a-form-item
            name="name"
            :wrapper-col="{
              flex: 1,
            }"
            class="editable"
          >
            <div
              ref="nameTarget"
              :value="groupForm.name"
              class="w-full text-center text-xl decoration-blue-300/80 caret-blue-300/80 outline-none"
              contenteditable
              :class="{ 'underline': nameFocused }"
              @input="(e) => onInput(e, 'name')"
              @compositionstart="onCompositionStart"
              @compositionend="(e) => onCompositionEnd(e, 'name')"
            >
              {{ groupForm.name }}
            </div>
          </a-form-item>
          <a-form-item
            name="id"
            :wrapper-col="{
              flex: 1,
            }"
            class="editable"
          >
            <div class="relative flex flex-row items-center gap-1">
              <span
                ref="idTarget"
                :value="groupForm.id"
                class="w-26 text-center text-lg decoration-blue-200/80 caret-blue-300/80 outline-none"
                contenteditable
                :class="{ 'underline': idFocused }"
                @input="(e) => onInput(e, 'id')"
                @compositionstart="onCompositionStart"
                @compositionend="(e) => onCompositionEnd(e, 'id')"
              >
                {{ groupForm.id }}
              </span>
              <span class="absolute right--6 cursor-pointer px-1 text-sky-400" @click="groupForm.id = randomId()">
                <InlineSvg :src="DiceIcon"></InlineSvg>
              </span>
            </div>
          </a-form-item>
          <a-form-item
            name="intro"
            :wrapper-col="{
              flex: 1,
            }"
          >
            <a-textarea
              v-model:value="groupForm.intro"
              show-count
              :maxlength="300"
              placeholder="群主很懒,什么都没有留下"
              allow-clear
              :auto-size="{ minRows: 2, maxRows: 3 }"
              size="small"
            />
          </a-form-item>
          <div class="w-full flex flex-row justify-between gap-2">
            <a-form-item label="等级" name="level" :colon="false">
              <a-input-number id="inputNumber" v-model:value="groupForm.level" :min="0" :max="999" size="small" />
            </a-form-item>
            <a-form-item label="创建" name="time" :colon="false">
              <a-date-picker v-model:value="groupForm.time" :disabled-date="disableFuture" size="small" />
            </a-form-item>
          </div>
          <a-form-item label="规模" name="loginDays" :colon="false">
            <a-radio-group v-model:value="groupForm.maxMemberCount" button-style="solid" size="small">
              <a-radio-button value="200">200人</a-radio-button>
              <a-radio-button value="500">500人</a-radio-button>
              <a-radio-button value="1000">1000人</a-radio-button>
              <a-radio-button value="2000">2000人</a-radio-button>
            </a-radio-group>
          </a-form-item>
          <button
            class="mt-2 w-full rounded-full bg-sky-400 py-1 tracking-widest text-light-50 outline-none transition-transform"
            active="scale-98"
          >
            创建群组
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

:deep(.ant-form-item) {
  @apply mb-0;
}

:deep(.ant-form > .ant-form-item) {
  @apply w-full;
}

:deep(.ant-input-number) {
  @apply w-16;
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

:deep(.ant-radio-group-small .ant-radio-button-wrapper) {
  @apply px-6px;
}
</style>
