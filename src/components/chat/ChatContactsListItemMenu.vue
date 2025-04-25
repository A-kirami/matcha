<script setup lang="ts">
import { Pin, PinOff, Pencil, Trash2 } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

import type { Contact } from '~/types'

const { contact, isPinned } = $defineProps<{
  contact: Contact
  isPinned: boolean
}>()

const state = useStateStore()

function handlePin() {
  state.pinnedOrder = isPinned ? state.pinnedOrder.filter(id => id !== contact.id) : [...state.pinnedOrder, contact.id]
}

const deleteOpen = $ref(false)

const isGroup = contact.type === 'group'

const contactText = isGroup ? '群组' : '角色'

async function deleteContact() {
  const contactDb = isGroup ? db.groups : db.users
  await contactDb.delete(contact.id)
  if (state.chatTarget?.id === contact.id) {
    state.chatTarget = undefined
  }
  if (!isGroup) {
    state.bot = undefined
  }
  toast.success('', { description: `删除${contactText}成功` })
}

const modal = useModalStore()

function openEditDialog() {
  modal.open(isGroup ? 'groupEdit' : 'userEdit', {
    targetId: contact.id,
  })
}
</script>

<template>
  <ContextMenu>
    <ContextMenuTrigger as-child>
      <slot />
    </ContextMenuTrigger>
    <ContextMenuContent class="text-sm space-y-1">
      <template v-if="isGroup">
        <ContextMenuItem v-if="isPinned" class="flex items-center gap-2 px-2 py-1 text-gray-500" @click="handlePin">
          <PinOff class="size-4 stroke-1" />
          <span>取消置顶</span>
        </ContextMenuItem>
        <ContextMenuItem v-else class="flex items-center gap-2 px-2 py-1 text-gray-500" @click="handlePin">
          <Pin class="size-4 stroke-1" />
          <span>置顶</span>
        </ContextMenuItem>
      </template>
      <ContextMenuItem class="flex items-center gap-2 px-2 py-1 text-gray-500" @click="openEditDialog">
        <Pencil class="size-4 stroke-1" />
        <span>编辑</span>
      </ContextMenuItem>
      <ContextMenuItem class="flex items-center gap-2 px-2 py-1 text-gray-500" @click="deleteOpen = true">
        <Trash2 class="size-4 stroke-1" />
        <span>删除</span>
      </ContextMenuItem>
    </ContextMenuContent>
  </ContextMenu>
  <AlertDialog v-model:open="deleteOpen">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>删除此{{ contactText }}</AlertDialogTitle>
        <AlertDialogDescription>删除后将无法恢复，确定要删除吗？</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>取消</AlertDialogCancel>
        <AlertDialogAction variant="destructive" @click="deleteContact">
          确认
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
