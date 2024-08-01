import BotEventDialog from '~/components/BotEventDialog.vue'
import GroupCreateFormDialog from '~/components/chat/GroupCreateFormDialog.vue'
import GroupEditFormDialog from '~/components/chat/GroupEditFormDialog.vue'
import MemberEditFormDialog from '~/components/chat/MemberEditFormDialog.vue'
import UserCreateFormDialog from '~/components/chat/UserCreateFormDialog.vue'
import UserEditFormDialog from '~/components/chat/UserEditFormDialog.vue'
import CheckUpdateDialog from '~/components/CheckUpdateDialog.vue'
import UserManageDialog from '~/components/UserManageDialog.vue'

import type { ComponentProps } from '~/types'

interface ModalState {
  component: Component
  props?: object
}

const ModalDialog = {
  userManage: UserManageDialog,
  userCreate: UserCreateFormDialog,
  userEdit: UserEditFormDialog,
  memberEdit: MemberEditFormDialog,
  groupCreate: GroupCreateFormDialog,
  groupEdit: GroupEditFormDialog,
  botEvent: BotEventDialog,
  checkUpdate: CheckUpdateDialog,
}

type ModalComponent = keyof typeof ModalDialog

interface ModalProps {
  userManage: ComponentProps<typeof UserManageDialog>
  userCreate: ComponentProps<typeof UserCreateFormDialog>
  userEdit: ComponentProps<typeof UserEditFormDialog>
  memberEdit: ComponentProps<typeof MemberEditFormDialog>
  groupCreate: ComponentProps<typeof GroupCreateFormDialog>
  groupEdit: ComponentProps<typeof GroupEditFormDialog>
  botEvent: ComponentProps<typeof BotEventDialog>
  checkUpdate: ComponentProps<typeof CheckUpdateDialog>
}

export const useModalStore = defineStore('modal', () => {
  let modalState = $shallowRef<ModalState | null>(null)
  let modalOpen = $ref(false)

  function openModal<M extends ModalComponent>(modal: M, props?: ModalProps[M]) {
    modalState = {
      component: ModalDialog[modal],
      props,
    }
    modalOpen = true
  }

  return $$({
    modalState,
    modalOpen,
    openModal,
  })
})
