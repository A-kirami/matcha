import { defineStore } from 'pinia'

import { db } from '@/database'

import type { User, Group } from '@/database'

export interface ReplyMessageInfo {
  id: string
  nickname: string
  message: string
}

interface PrivateChat {
  /** 会话类型 */
  readonly type: 'private'
  /** 会话对象 */
  contact: User
}

interface GroupChat {
  /** 会话类型 */
  readonly type: 'group'
  /** 会话对象 */
  contact: Group
}

export type State = {
  /** 会话ID */
  readonly id: string
  /** 输入消息内容 */
  inputMessage?: string
  /** 回复消息 */
  replyMessage?: ReplyMessageInfo
} & (PrivateChat | GroupChat)

export const useSessionStore = defineStore(
  'session',

  () => {
    /** 最近会话路由 */
    const lately = $ref('')
    /** 当前会话 */
    let state = $ref<State | null>(null)
    /** 会话列表 */
    const states = $ref<Map<string, State>>(new Map())

    async function createSessionState(type: State['type'], id: State['id']): Promise<void> {
      const dbGet = type === 'group' ? db.groups : db.users
      const contact = await dbGet.get(id)
      if (!contact) {
        return
      }
      state = {
        id,
        type,
        contact,
      } as State
    }

    async function loadSessionState(path: string, type: State['type'], id: State['id']): Promise<void> {
      state = states.get(path) || null
      if (!state) {
        await createSessionState(type, id)
      }
    }

    function saveSessionState(path: string): void {
      state && states.set(path, state)
    }

    return $$({
      lately,
      state,
      states,
      createSessionState,
      loadSessionState,
      saveSessionState,
    })
  }
)
