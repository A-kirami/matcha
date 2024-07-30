<!-- eslint-disable camelcase -->
<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { toast } from 'vue-sonner'
import * as z from 'zod'

import { Form, FormField } from '~/components/ui/form'

const state = useStateStore()

const groupFormSchema = toTypedSchema(
  z.object({
    id: z
      .string({ required_error: '群组 ID 不能为空', invalid_type_error: '群组 ID 必须是字符串' })
      .min(6, { message: '群组 ID 长度不能小于6' })
      .max(12, { message: '群组 ID 长度不能大于12' })
      .regex(/^[a-zA-Z0-9]+$/, { message: '群组 ID 只能包含字母和数字' })
      .refine(async (id) => !(await db.groups.get(id)), { message: '群组 ID 已存在' }),
    name: z
      .string({ required_error: '群组名称不能为空', invalid_type_error: '群组名称必须是字符串' })
      .min(2, { message: '群组名称长度不能小于2' })
      .max(12, { message: '群组名称长度不能大于12' }),
    owner_join: z.boolean().default(true),
    bot_join: z.boolean().default(true),
  })
)

const formRef = $ref<InstanceType<typeof Form> | null>(null)

const avatarUrl = $computed(() => {
  return getAvatarUrl('group', formRef?.values.id)
})

let open = $(defineModel('open', { default: false }))

const onSubmit = getSubmitFn(groupFormSchema, async (values) => {
  await db.groups.add({
    ...values,
    time: getTimestamp(),
    intro: '',
    level: 1,
    maxMemberCount: 200,
    memberCount: 0,
    wholeBanned: false,
    lastMessageTime: 0,
  })

  open = false

  const membersToAdd = [
    values.owner_join && state.user ? ({ userId: state.user.id, role: 'owner' } as const) : null,
    values.bot_join && state.bot ? ({ userId: state.bot.id, role: 'member' } as const) : null,
  ].filter(nonNullable)

  await Promise.all(
    membersToAdd.map((member) =>
      db.members.add({
        groupId: values.id,
        userId: member.userId,
        card: '',
        role: member.role,
        level: 0,
        title: '',
        joinTime: getTimestamp(),
        titleExpireTime: 0,
        banExpireTime: 0,
      })
    )
  )

  toast.success('', { description: '创建群组成功' })
})
</script>

<template>
  <Dialog v-model:open="open">
    <DialogTrigger as-child>
      <slot></slot>
    </DialogTrigger>
    <DialogContent class="max-w-100">
      <DialogHeader>
        <DialogTitle>创建群组</DialogTitle>
        <DialogDescription>创建聊天群组</DialogDescription>
      </DialogHeader>
      <Avatar class="mx-auto my-2 size-16 ring-2 ring-offset-3 ring-blue-400">
        <AvatarImage :src="avatarUrl" alt="group avatar" />
        <AvatarFallback>{{ formRef?.values.name }}</AvatarFallback>
      </Avatar>
      <Form id="group-form" ref="formRef" :validation-schema="groupFormSchema" class="space-y-2" @submit="onSubmit">
        <FormField v-slot="{ componentField }" name="id">
          <FormItem v-auto-animate>
            <FormControl>
              <Input type="text" v-bind="componentField" :disabled="false" class="h-8" />
            </FormControl>
            <FormLabel>群组 ID</FormLabel>
            <FormDescription>群组的唯一标识符</FormDescription>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField v-slot="{ componentField }" name="name">
          <FormItem v-auto-animate>
            <FormControl>
              <Input type="text" v-bind="componentField" class="h-8" />
            </FormControl>
            <FormLabel>群组名称</FormLabel>
            <FormDescription>群组的公开显示名称</FormDescription>
            <FormMessage />
          </FormItem>
        </FormField>
        <div class="grid grid-cols-2 gap-4">
          <FormField v-slot="{ value, handleChange }" type="checkbox" name="owner_join">
            <FormItem class="flex flex-row items-start gap-x-3 border rounded-md p-4 space-y-0">
              <FormControl>
                <Checkbox :checked="value" @update:checked="handleChange" />
              </FormControl>
              <div class="leading-none space-y-1">
                <FormLabel>群主自动加入</FormLabel>
                <FormDescription>创建后作为群主加入该群组</FormDescription>
                <FormMessage />
              </div>
            </FormItem>
          </FormField>
          <FormField v-slot="{ value, handleChange }" type="checkbox" name="bot_join">
            <FormItem class="flex flex-row items-start gap-x-3 border rounded-md p-4 space-y-0">
              <FormControl>
                <Checkbox :checked="value" @update:checked="handleChange" />
              </FormControl>
              <div class="leading-none space-y-1">
                <FormLabel>机器人自动加入</FormLabel>
                <FormDescription>创建后机器人加入该群组</FormDescription>
                <FormMessage />
              </div>
            </FormItem>
          </FormField>
        </div>
      </Form>
      <DialogFooter>
        <Button form="group-form" type="submit" class="mt-2 h-8 w-full">创建</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
