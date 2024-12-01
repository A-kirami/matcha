<!-- eslint-disable camelcase -->
<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { toast } from 'vue-sonner'
import * as z from 'zod'

import { Form, FormField } from '~/components/ui/form'

const { groupId, userId, userName } = $defineProps<{
  groupId: string
  userId: string
  userName: string
}>()

const state = useStateStore()

const memberFormSchema = toTypedSchema(
  z.object({
    card: z
      .string({ invalid_type_error: '成员名称必须是字符串' })
      .min(2, { message: '成员名称长度不能小于2' })
      .max(12, { message: '成员名称长度不能大于12' })
      .optional()
      .or(z.literal('')),
    role: z.enum(['owner', 'admin', 'member']),
  }),
)

let open = $(defineModel('open', { default: false }))

const formRef = $ref<InstanceType<typeof Form>>()

const onSubmit = getSubmitFn(memberFormSchema, async (values) => {
  await db.members.update([groupId, userId], values)
  await state.refreshChatTarget()
  open = false
  toast.success('', { description: '保存修改成功' })
})

async function removeMember() {
  await db.members.delete([groupId, userId])
  open = false
  toast.success('', { description: '移除成员成功' })
}

async function resetForm() {
  const member = await db.members.get([groupId, userId])
  if (formRef && member) {
    formRef.resetForm({ values: { card: member.card, role: member.role } })
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
        <DialogTitle>编辑成员</DialogTitle>
        <DialogDescription>编辑群组成员</DialogDescription>
      </DialogHeader>
      <Avatar class="mx-auto my-2 size-16 ring-2 ring-offset-3 ring-blue-400">
        <AvatarImage :src="getAvatarUrl('user', userId)" alt="user avatar" />
        <AvatarFallback>{{ userName }}</AvatarFallback>
      </Avatar>
      <div>
        <div class="text-center text-lg text-foreground font-medium">
          {{ userName }}
        </div>
        <div class="text-center text-muted-foreground font-medium">
          {{ userId }}
        </div>
      </div>
      <Form id="user-form" ref="formRef" :validation-schema="memberFormSchema" class="space-y-2" @submit="onSubmit">
        <FormField v-slot="{ componentField }" name="card">
          <FormItem v-auto-animate>
            <FormLabel>成员名称</FormLabel>
            <FormControl>
              <Input type="text" v-bind="componentField" class="h-8" />
            </FormControl>
            <FormDescription>成员在群组中的名称</FormDescription>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField v-slot="{ componentField }" name="role">
          <FormItem>
            <FormLabel>群组权限</FormLabel>
            <Select v-bind="componentField">
              <FormControl>
                <SelectTrigger class="h-9">
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="owner">
                    群主
                  </SelectItem>
                  <SelectItem value="admin">
                    管理员
                  </SelectItem>
                  <SelectItem value="member">
                    普通成员
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <FormDescription>群组成员的权限</FormDescription>
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
              移除成员
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>移除此成员</AlertDialogTitle>
              <AlertDialogDescription>确定要将此成员从群组移除吗？</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction variant="destructive" @click="removeMember">
                确认
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
