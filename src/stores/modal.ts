import BotEventDialog from '~/components/BotEventDialog.vue'
import GroupCreateFormDialog from '~/components/chat/GroupCreateFormDialog.vue'
import GroupEditFormDialog from '~/components/chat/GroupEditFormDialog.vue'
import MemberEditFormDialog from '~/components/chat/MemberEditFormDialog.vue'
import UserCreateFormDialog from '~/components/chat/UserCreateFormDialog.vue'
import UserEditFormDialog from '~/components/chat/UserEditFormDialog.vue'
import CheckUpdateDialog from '~/components/CheckUpdateDialog.vue'
import UserManageDialog from '~/components/UserManageDialog.vue'

import type { ComponentProps } from '~/types'

const ModalDialog = {
  userManage: UserManageDialog,
  userCreate: UserCreateFormDialog,
  userEdit: UserEditFormDialog,
  memberEdit: MemberEditFormDialog,
  groupCreate: GroupCreateFormDialog,
  groupEdit: GroupEditFormDialog,
  botEvent: BotEventDialog,
  checkUpdate: CheckUpdateDialog,
} as const satisfies Record<string, Component>

interface ModalState<M extends ModalComponent = ModalComponent> {
  id: symbol
  component: typeof ModalDialog[M]
  props?: ModalProps[M]
  isOpen: boolean
}

type ModalComponent = keyof typeof ModalDialog

type ModalProps = {
  [K in ModalComponent]: ComponentProps<(typeof ModalDialog)[K]>;
}

export const useModalStore = defineStore('modal', () => {
  const modalStack = $ref<ModalState[]>([])

  function open<M extends ModalComponent>(modal: M, props?: ModalProps[M]): symbol {
    const existingIdx = modalStack.findIndex(m => m.component === ModalDialog[modal])
    if (existingIdx === -1) {
      const id = Symbol()
      modalStack.push({
        id,
        component: markRaw(ModalDialog[modal]),
        props,
        isOpen: true,
      })
      return id
    } else {
      modalStack[existingIdx].isOpen = true
      modalStack[existingIdx].props = props
      modalStack.push(modalStack.splice(existingIdx, 1)[0])
      return modalStack[existingIdx].id
    }
  }

  return $$({
    modalStack,
    open,
  })
})
