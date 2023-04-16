import { defineStore } from 'pinia'

import { useAdapterStore } from './protocol'

import type { Event } from '@/adapter/event'
import type { Scenes, MessageScenes, NoticeScenes, RequestScenes } from '@/adapter/scene'

interface Chat {
  id: string
  type: 'message' | 'notice' | 'request'
  scene: Scenes
  event?: Event
  push: boolean
  read: boolean
}

export interface Message extends Chat {
  type: 'message'
  scene: MessageScenes
  recall: boolean
}

export interface Notice extends Chat {
  type: 'notice'
  scene: NoticeScenes
}

export interface Request extends Chat {
  type: 'request'
  scene: RequestScenes
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

  async function appendScene(scene: Scenes, push = true): Promise<void> {
    const event = await adapter.bot.eventHandler.handle(scene)
    let chat
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
        return
    }
    if (event && push) {
      chat.push = await adapter.bot.send(event)
    }
    chatLogs.push(chat)
  }

  function getChat<T extends Message>(chatId: string, type: 'message'): T
  function getChat<T extends Notice>(chatId: string, type: 'notice'): T
  function getChat<T extends Request>(chatId: string, type: 'request'): T
  function getChat<T extends Chats>(chatId: string, type?: T['type']): T {
    const chat = type ? chatLogs.find((c) => c.type === type && c.id === chatId) : chatLogs.find((c) => c.id === chatId)
    return chat as T
  }

  return {
    chatLogs,
    appendScene,
    getChat,
  }
})
