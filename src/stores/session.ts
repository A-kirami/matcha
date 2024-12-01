import { DefaultMap } from '~/utils/utils'

interface Session {
  replyMessageId: string
  uploadFiles: Map<string, string | File>
}

export const useSessionStore = defineStore('session', () => {
  const sessionMap = $ref<DefaultMap<string, Session>>(
    new DefaultMap((key) => {
      return { id: key, replyMessageId: '', uploadFiles: new Map() }
    }),
  )
  let currentSession = $ref<Session>()

  const state = useStateStore()

  watch(
    () => state.chatTarget,
    (chatTarget) => {
      if (chatTarget) {
        currentSession = sessionMap.got(`${chatTarget?.type}:${chatTarget?.id}`)
      }
    },
  )

  return $$({
    sessionMap,
    currentSession,
  })
})
