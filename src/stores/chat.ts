import { defineStore } from 'pinia'

import type { Event } from '~/adapter/event'
import type { Scenes, MessageScenes, NoticeScenes, RequestScenes } from '~/adapter/scene'

interface Chat<T extends Scenes['type'], S extends Scenes> {
  id: string
  type: T
  scene: S
  event?: Event
  push: boolean
  read: boolean
}

export interface Message extends Chat<'message', MessageScenes> {
  recall: boolean
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
    push: false,
    read: false,
  }
}

export const useChatStore = defineStore('chat', () => {
  const chatLogs = $ref<Chats[]>([])

  const adapter = useAdapterStore()

  const config = useConfigStore()

  const status = useStatusStore()

  async function appendScene<S extends Scenes>(scene: S, insert?: string): Promise<S> {
    const event = await adapter.bot.eventHandler.handle(scene)
    let chat: Chats
    switch (scene.type) {
      case 'message': {
        chat = { ...newChat(scene, event), recall: false } as Message
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
    if (event) {
      if (config.postSelfEvents || scene.sender_id !== status.assignBot) {
        chat.push = await adapter.bot.send(event)
      } else {
        chat.push = true
      }
    }
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
    const chat = type ? chatLogs.find((c) => c.type === type && c.id === chatId) : chatLogs.find((c) => c.id === chatId)
    return chat as Extract<Chats, { type: T }>
  }

  function getMessage(messageId: string): Message | null {
    return (
      (chatLogs.find((chat) => chat.type === 'message' && chat.scene.message_id === messageId) as
        | Message
        | undefined) || null
    )
  }

  return {
    chatLogs,
    appendScene,
    getChat,
    getMessage,
  }
})
