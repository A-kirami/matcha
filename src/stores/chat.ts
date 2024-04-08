import { defineStore } from 'pinia'

import type { Event } from '~/adapter/event'
import type { Scenes, MessageScenes, NoticeScenes, RequestScenes } from '~/adapter/scene'

interface Chat<T extends Scenes['type'], S extends Scenes> {
  id: string
  type: T
  scene: S
  event?: Event
  isSent?: boolean
  isRead?: boolean
  preview?: string
}

export interface Message extends Chat<'message', MessageScenes> {
  isRecall: boolean
}

export type Notice = Chat<'notice', NoticeScenes>

export interface Request extends Chat<'request', RequestScenes> {
  action: 'await' | 'agree' | 'refuse'
  reason?: string
}

export type Chats = Message | Notice | Request

function newChat(scene: Scenes, event?: Event) {
  return {
    id: scene.id,
    type: scene.type,
    scene,
    event,
    isSent: false,
    isRead: false,
  }
}

export const useChatStore = defineStore('chat', () => {
  const chatLogs = $ref<Chats[]>([])

  const adapter = useAdapterStore()

  const connect = useConnectSettingsStore()

  const state = useStateStore()

  function getChatLogs(chatType?: 'group' | 'private', chatId?: string) {
    if (!chatType || !chatId) {
      return []
    }

    const sessionSet = new Set([state.bot?.id, state.user?.id])

    return chatLogs.filter((chat) => {
      if (chat.scene.chat_type !== chatType) {
        return false
      }
      if (chatType === 'group') {
        return chat.scene.receiver_id === chatId
      } else {
        return sessionSet.has(chat.scene.sender_id) && sessionSet.has(chat.scene.receiver_id)
      }
    })
  }

  async function appendScene<S extends Scenes>(scene: S, insert?: string): Promise<S> {
    const event = await adapter.bot.eventHandler.handle(scene)
    let chat: Chats
    switch (scene.type) {
      case 'message': {
        chat = { ...newChat(scene, event), isRecall: false } as Message
        break
      }
      case 'notice': {
        chat = { ...newChat(scene, event) } as Notice
        break
      }
      case 'request': {
        chat = { ...newChat(scene, event), action: 'await' } as Request
        break
      }
      default:
        throw new Error('unknown scene type')
    }
    const sendEvent = connect.postSelfEvents || scene.sender_id !== state.bot?.id
    if (event && sendEvent) {
      chat.isSent = await adapter.bot.send(event)
    }
    chat.preview = await getPreviewMessage(scene, state.user?.id)
    if (insert) {
      const index = chatLogs.findIndex((chat) => chat.id === insert)
      if (index !== -1) {
        chatLogs.splice(index + 1, 0, chat)
      }
    } else {
      chatLogs.push(chat)
    }
    return scene
  }

  function getChat<T extends Chats['type']>(chatId: string, type?: T): Extract<Chats, { type: T }> {
    const chat = chatLogs.find((c) => (type ? c.type === type : true) && c.id === chatId)
    return chat as Extract<Chats, { type: T }>
  }

  function getMessage(messageId: string): Message | null {
    return (
      (chatLogs.find((chat) => chat.type === 'message' && chat.scene.message_id === messageId) as
        | Message
        | undefined) || null
    )
  }

  return $$({
    chatLogs,
    getChatLogs,
    appendScene,
    getChat,
    getMessage,
  })
})
