import { defineStore } from 'pinia'

export const useStatusStore = defineStore(
  'status',

  () => {
    /** 当前使用 Bot */
    const bot = $ref<User | null>(null)
    /** 使用 Bot ID */
    const assignBot = ref<string>('')
    /** 当前使用用户 */
    const user = $ref<User | null>(null)
    /** 使用用户 ID */
    const assignUser = ref<string>('')
    /** 最近会话路由 */
    const latelySession = $ref('')
    /** 全局加载状态 */
    const isLoading = $ref(false)

    return {
      bot,
      user,
      latelySession,
      isLoading,
      assignBot,
      assignUser,
    }
  },

  {
    persist: {
      paths: ['assignBot', 'assignUser'],
    },
  }
)
