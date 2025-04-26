import { defineStore } from 'pinia'

/** 全局共享状态 */
export const useStateStore = defineStore(
  'state',

  () => {
    let user = $ref<Contact>()
    let bot = $ref<Contact>()
    let chatTarget = $ref<Contact>()
    const pinnedOrder = $ref<string[]>([])
    const isConnected = $ref(false)

    async function refreshUser(id?: string) {
      const contact = await getContact('user', id || user!.id)
      user = {
        ...contact,
        isBot: false,
      }
    }

    async function refreshBot(id?: string) {
      const contact = await getContact('user', id || bot!.id)
      bot = {
        ...contact,
        isBot: true,
      }
    }

    async function refreshChatTarget(id?: string) {
      if (!chatTarget) {
        return
      }
      const contact = await getContact(chatTarget.type, id || chatTarget.id)
      chatTarget = {
        ...contact,
        isBot: bot?.id === id,
      }
    }

    const route = useRoute('/chat/[chatType].[chatId]')

    watch(
      () => route.params,
      async ({ chatType, chatId }) => {
        if (chatType && chatId) {
          const contact = await getContact(chatType as Contact['type'], chatId as Contact['id'])
          chatTarget = {
            ...contact,
            isBot: bot?.id === chatId,
          }
        }
      },
      { immediate: true },
    )

    const router = useRouter()

    watch($$(chatTarget), async (target) => {
      if (!target) {
        await router.push('/chat')
      }
    })

    const adapter = useAdapterStore()

    watch($$(bot), async () => {
      await adapter.bot.reboot()
    })

    return $$({
      user,
      bot,
      chatTarget,
      pinnedOrder,
      isConnected,
      refreshUser,
      refreshBot,
      refreshChatTarget,
    })
  },

  {
    persist: {
      pick: ['user', 'bot', 'pinnedOrder'],
    },
  },
)
