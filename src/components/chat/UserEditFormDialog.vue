<!-- eslint-disable camelcase -->
<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { toast } from 'vue-sonner'
import * as z from 'zod'

import { Form, FormField } from '~/components/ui/form'

const { targetId } = $defineProps<{
  targetId: string
}>()

const state = useStateStore()

const userFormSchema = toTypedSchema(
  z.object({
    name: z
      .string({ required_error: '角色名称不能为空', invalid_type_error: '角色名称必须是字符串' })
      .min(2, { message: '角色名称长度不能小于2' })
      .max(12, { message: '角色名称长度不能大于12' }),
  }),
)

let open = $(defineModel('open', { default: false }))

const formRef = $ref<InstanceType<typeof Form>>()

const onSubmit = getSubmitFn(userFormSchema, async (values) => {
  await db.users.update(targetId, values)
  await state.refreshChatTarget()
  if (state.user?.id === targetId) {
    await state.refreshUser()
  }
  if (state.bot?.id === targetId) {
    await state.refreshBot()
  }
  open = false
  toast.success('', { description: '保存修改成功' })
})

async function deleteUser() {
  await db.users.delete(targetId)
  if (state.chatTarget?.id === targetId) {
    state.chatTarget = undefined
  }
  if (state.user?.id === targetId) {
    state.user = undefined
  }
  if (state.bot?.id === targetId) {
    state.bot = undefined
  }
  open = false
  toast.success('', { description: '删除角色成功' })
}

async function resetForm() {
  const user = await db.users.get(targetId)
  if (formRef && user) {
    formRef.resetForm({ values: { name: user.name } })
  }
}

onMounted(resetForm)

onUpdated(resetForm)
</script>

<template>
  <Dialog v-model:open="open">
    <DialogTrigger as-child>
      <slot />
    </DialogTrigger>
    <DialogContent class="max-w-100">
      <DialogHeader>
        <DialogTitle>编辑角色</DialogTitle>
        <DialogDescription>编辑交互角色</DialogDescription>
      </DialogHeader>
      <Avatar class="mx-auto my-2 size-16 ring-2 ring-offset-3 ring-blue-400">
        <AvatarImage :src="getAvatarUrl('user', targetId)" alt="user avatar" />
        <AvatarFallback>{{ formRef?.values.name }}</AvatarFallback>
      </Avatar>
      <div class="text-center text-lg text-muted-foreground font-medium">
        {{ targetId }}
      </div>
      <Form id="user-form" ref="formRef" :validation-schema="userFormSchema" class="space-y-2" @submit="onSubmit">
        <FormField v-slot="{ componentField }" name="name">
          <FormItem v-auto-animate>
            <FormLabel>角色名称</FormLabel>
            <FormControl>
              <Input type="text" v-bind="componentField" class="h-8" />
            </FormControl>
            <FormDescription>角色的公开显示名称</FormDescription>
            <FormMessage />
          </FormItem>
        </FormField>
      </Form>
      <DialogFooter class="gap-2 sm:flex-col">
        <Button form="user-form" type="submit" class="h-8 w-full">
          保存修改
        </Button>
        <AlertDialog>
          <AlertDialogTrigger as-child>
            <Button variant="destructive" class="h-8 w-full">
              删除角色
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>删除此角色</AlertDialogTitle>
              <AlertDialogDescription>删除后将无法恢复，确定要删除吗？</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction variant="destructive" @click="deleteUser">
                确认
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
