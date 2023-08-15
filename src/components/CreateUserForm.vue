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

import type { User } from '@/database'
import type { Dayjs } from 'dayjs'

const dragHandle = $ref<HTMLElement | null>(null)

const userForm = $ref<User>({
  id: randomId(),
  name: '点击修改昵称',
  sex: 'unknown',
  birthdate: undefined,
  location: '',
  hometown: '',
  sign: '',
  qid: '',
  level: 0,
  loginDays: 0,
})

function randomId(): string {
  return randomInt(1e8, 1e9).toString()
}

async function onFinish(user: User): Promise<void> {
  if (user.birthdate) {
    // @ts-ignore
    user.birthdate = (user.birthdate as Dayjs).unix()
  }
  userForm.sex ??= 'unknown'
  if (await db.users.get(user.id)) {
    message.error('用户已存在')
  } else {
    await db.users.add(user)
    message.success('用户创建成功')
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
    userForm.name = nameTarget?.innerText || '昵称不可为空'
  }
})

watch(idFocused, (focused) => {
  if (!focused) {
    userForm.id = idTarget?.innerText || randomId()
  }
})

let isInputting = $ref(false)

function onInput(e: Event, editType: 'name' | 'id'): void {
  if (!isInputting) {
    const el = e.target as HTMLDivElement
    if (editType === 'id') {
      const filteredText = el.innerText.replace(/[^\d]/g, '')
      if (filteredText !== el.innerText || el.innerText.length > 10) {
        el.innerText = userForm.id.toString()
      }
    } else {
      if (el.innerText.length > 10) {
        el.innerText = userForm.name
      }
    }
    // @ts-ignore
    // userForm[editType] = el.innerText
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
        <Avatar type="user" :aid="userForm.id" size="4rem" />
        <a-form :model="userForm" name="basic" label-align="left" autocomplete="off" @finish="onFinish">
          <a-form-item
            name="name"
            :wrapper-col="{
              flex: 1,
            }"
            class="editable"
          >
            <div
              ref="nameTarget"
              :value="userForm.name"
              class="w-full text-center text-xl decoration-blue-300/80 caret-blue-300/80 outline-none"
              contenteditable
              :class="{ 'underline': nameFocused }"
              @input="(e) => onInput(e, 'name')"
              @compositionstart="onCompositionStart"
              @compositionend="(e) => onCompositionEnd(e, 'name')"
            >
              {{ userForm.name }}
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
                :value="userForm.id"
                class="w-26 text-center text-lg decoration-blue-200/80 caret-blue-300/80 outline-none"
                contenteditable
                :class="{ 'underline': idFocused }"
                @input="(e) => onInput(e, 'id')"
                @compositionstart="onCompositionStart"
                @compositionend="(e) => onCompositionEnd(e, 'id')"
              >
                {{ userForm.id }}
              </span>
              <span class="absolute right--6 cursor-pointer px-1 text-sky-400" @click="userForm.id = randomId()">
                <InlineSvg :src="DiceIcon"></InlineSvg>
              </span>
            </div>
          </a-form-item>
          <a-form-item
            name="sign"
            :wrapper-col="{
              flex: 1,
            }"
          >
            <a-textarea
              v-model:value="userForm.sign"
              show-count
              :maxlength="80"
              placeholder="编辑个性签名"
              allow-clear
              :auto-size="{ minRows: 2, maxRows: 3 }"
              size="small"
            />
          </a-form-item>
          <div class="w-full flex flex-row justify-between gap-2">
            <a-form-item label="性别" name="sex" :colon="false">
              <a-select v-model:value="userForm.sex" allow-clear size="small">
                <a-select-option value="man">♂ 男</a-select-option>
                <a-select-option value="female">♀ 女</a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item label="生日" name="birthdate" :colon="false">
              <a-date-picker v-model:value="userForm.birthdate" :disabled-date="disableFuture" size="small" />
            </a-form-item>
          </div>
          <a-form-item label="现居" name="location" :colon="false">
            <a-input v-model:value="userForm.location" :maxlength="14" size="small" />
          </a-form-item>
          <a-form-item label="故乡" name="hometown" :colon="false">
            <a-input v-model:value="userForm.hometown" :maxlength="14" size="small" />
          </a-form-item>
          <a-form-item label="ID卡" name="qid" :colon="false">
            <a-input v-model:value="userForm.qid" show-count :maxlength="10" size="small" />
          </a-form-item>
          <div class="flex flex-row gap-2">
            <a-form-item label="等级" name="level" :colon="false">
              <a-input-number id="inputNumber" v-model:value="userForm.level" :min="0" :max="999" size="small" />
            </a-form-item>
            <a-form-item label="登陆" name="loginDays" :colon="false">
              <a-input-number
                id="inputNumber"
                v-model:value="userForm.loginDays"
                :min="0"
                :max="999"
                size="small"
                addon-after="天"
              />
            </a-form-item>
          </div>
          <button
            class="mt-2 w-full rounded-full bg-sky-400 py-1 tracking-widest text-light-50 outline-none transition-transform"
            active="scale-98"
          >
            创建用户
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
  @apply w-full;
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
