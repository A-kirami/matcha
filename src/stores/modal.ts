import BotEventDialog from '~/components/BotEventDialog.vue'
import GroupCreateFormDialog from '~/components/chat/GroupCreateFormDialog.vue'
import GroupEditFormDialog from '~/components/chat/GroupEditFormDialog.vue'
import MemberEditFormDialog from '~/components/chat/MemberEditFormDialog.vue'
import UserCreateFormDialog from '~/components/chat/UserCreateFormDialog.vue'
import UserEditFormDialog from '~/components/chat/UserEditFormDialog.vue'
import CheckUpdateDialog from '~/components/CheckUpdateDialog.vue'
import UserManageDialog from '~/components/UserManageDialog.vue'

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

type ModalComponent = keyof typeof ModalDialog

type ModalProps = {
  [K in ModalComponent]: ComponentProps<(typeof ModalDialog)[K]>;
}

interface ModalState {
  component: Component
  props?: object
  isOpen: boolean
  key?: string
  keepAlive: boolean
}

export const useModalStore = defineStore('modal', () => {
  let modalStack = $ref<Map<string, ModalState>>(new Map())

  function open<M extends ModalComponent>(modal: M, props?: ModalProps[M], key?: string, keepAlive: boolean = false) {
    const modalKey = key ? `${modal}-${key}` : modal
    const modalState = {
      component: markRaw(ModalDialog[modal]),
      props,
      isOpen: true,
      key: modalKey,
      keepAlive,
    }
    modalStack.set(modalKey, modalState)
  }

  watchDebounced($$(modalStack), () => {
    const hasModalToClean = [...modalStack.entries()].some(
      ([_, modal]) => !modal.keepAlive && !modal.isOpen,
    )

    if (hasModalToClean) {
      const newModalStack = new Map(
        [...modalStack.entries()].filter(
          ([_, modal]) => modal.keepAlive || modal.isOpen,
        ),
      )
      modalStack = newModalStack
    }
  }, {
    debounce: 500,
    deep: true,
  })

  return $$({
    modalStack,
    open,
  })
})
