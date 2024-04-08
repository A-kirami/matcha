<script setup lang="tsx">
import { Pin, PinOff, Pencil, Trash2 } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

import GroupEditFormDialog from '~/components/chat/GroupEditFormDialog.vue'
import UserEditFormDialog from '~/components/chat/UserEditFormDialog.vue'

import type { Contact } from '~/types'

const { contact, isPinned } = $defineProps<{
  contact: Contact
  isPinned: boolean
}>()

const state = useStateStore()

function handlePin() {
  if (isPinned) {
    state.pinnedOrder = state.pinnedOrder.filter((id) => id !== contact.id)
  } else {
    state.pinnedOrder = state.pinnedOrder.concat(contact.id)
  }
}

const editOpen = $ref(false)

const deleteOpen = $ref(false)

async function deleteGroup() {
  await db.groups.delete(contact.id)
  if (state.chatTarget?.id === contact.id) {
    state.chatTarget = null
  }
  toast.success('', { description: '删除群组成功' })
}

const EditFormDialog = () => {
  const EditComponent = contact.type === 'group' ? GroupEditFormDialog : UserEditFormDialog
  return <EditComponent v-model:open={editOpen} targetId={contact.id} />
}
</script>

<template>
  <ContextMenu>
    <ContextMenuTrigger as-child>
      <slot></slot>
    </ContextMenuTrigger>
    <ContextMenuContent class="text-sm space-y-1">
      <ContextMenuItem v-if="isPinned" class="flex items-center gap-2 px-2 py-1 text-gray-500" @click="handlePin">
        <PinOff class="size-4 stroke-1" />
        <span>取消置顶</span>
      </ContextMenuItem>
      <ContextMenuItem v-else class="flex items-center gap-2 px-2 py-1 text-gray-500" @click="handlePin">
        <Pin class="size-4 stroke-1" />
        <span>置顶</span>
      </ContextMenuItem>
      <ContextMenuItem class="flex items-center gap-2 px-2 py-1 text-gray-500" @click="editOpen = true">
        <Pencil class="size-4 stroke-1" />
        <span>编辑</span>
      </ContextMenuItem>
      <ContextMenuItem class="flex items-center gap-2 px-2 py-1 text-gray-500" @click="deleteOpen = true">
        <Trash2 class="size-4 stroke-1" />
        <span>删除</span>
      </ContextMenuItem>
    </ContextMenuContent>
  </ContextMenu>
  <EditFormDialog />
  <AlertDialog v-model:open="deleteOpen">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>删除此联系人</AlertDialogTitle>
        <AlertDialogDescription>删除后将无法恢复，确定要删除吗？</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>取消</AlertDialogCancel>
        <AlertDialogAction variant="destructive" @click="deleteGroup">确认</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
