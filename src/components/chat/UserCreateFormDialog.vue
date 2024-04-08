<!-- eslint-disable camelcase -->
<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { toast } from 'vue-sonner'
import * as z from 'zod'

import { Form, FormField } from '~/components/ui/form'

const userFormSchema = toTypedSchema(
  z.object({
    id: z
      .string({ required_error: '角色 ID 不能为空', invalid_type_error: '角色 ID 必须是字符串' })
      .min(6, { message: '角色 ID 长度不能小于6' })
      .max(12, { message: '角色 ID 长度不能大于12' })
      .regex(/^[a-zA-Z0-9]+$/, { message: '角色 ID 只能包含字母和数字' })
      .refine(async (id) => !(await db.users.get(id)), { message: '角色 ID 已存在' }),
    name: z
      .string({ required_error: '角色名称不能为空', invalid_type_error: '角色名称必须是字符串' })
      .min(2, { message: '角色名称长度不能小于2' })
      .max(12, { message: '角色名称长度不能大于12' }),
  })
)

const formRef = $ref<InstanceType<typeof Form> | null>(null)

const avatarUrl = $computed(() => {
  return getAvatarUrl('user', formRef?.values.id)
})

let open = $(defineModel('open', { default: false }))

const onSubmit = getSubmitFn(userFormSchema, async (values) => {
  await db.users.add({
    ...values,
    sex: 'unknown',
    birthdate: undefined,
    location: '',
    hometown: '',
    sign: '',
    qid: '',
    level: 0,
    loginDays: 0,
    lastUseTime: 0,
  })
  open = false
  toast.success('', { description: '创建角色成功' })
})
</script>

<template>
  <Dialog v-model:open="open">
    <DialogTrigger as-child>
      <slot></slot>
    </DialogTrigger>
    <DialogContent class="max-w-100">
      <DialogHeader>
        <DialogTitle>创建角色</DialogTitle>
        <DialogDescription>创建交互角色</DialogDescription>
      </DialogHeader>
      <Avatar class="mx-auto my-2 size-16 ring-2 ring-offset-3 ring-blue-400">
        <AvatarImage :src="avatarUrl" alt="user avatar" />
        <AvatarFallback>{{ formRef?.values.name }}</AvatarFallback>
      </Avatar>
      <Form id="user-form" ref="formRef" :validation-schema="userFormSchema" class="space-y-2" @submit="onSubmit">
        <FormField v-slot="{ componentField }" name="id">
          <FormItem v-auto-animate>
            <FormControl>
              <Input type="text" v-bind="componentField" :disabled="false" class="h-8" />
            </FormControl>
            <FormLabel>角色 ID</FormLabel>
            <FormDescription>角色的唯一标识符</FormDescription>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField v-slot="{ componentField }" name="name">
          <FormItem v-auto-animate>
            <FormControl>
              <Input type="text" v-bind="componentField" class="h-8" />
            </FormControl>
            <FormLabel>角色名称</FormLabel>
            <FormDescription>角色的公开显示名称</FormDescription>
            <FormMessage />
          </FormItem>
        </FormField>
      </Form>
      <DialogFooter>
        <Button form="user-form" type="submit" class="mt-2 h-8 w-full">创建</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
