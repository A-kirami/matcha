import { defineStore } from 'pinia'

import { DefaultMap } from '@/utils'

import { useAdapterStore } from './protocol'
import { useStatusStore } from './status'

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
  const botChats = $ref(new DefaultMap<string, Chats[]>(() => []))

  const adapter = useAdapterStore()
  const status = useStatusStore()

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
    const botId = status.bot!.id
    botChats.got(botId).push(chat)
  }

  function getChats(chatType?: 'private' | 'group', chatId?: string): Chats[] {
    const chats = botChats.got(status.bot!.id)
    if (!chatType && !chatId) {
      return chats
    }
    return chats.filter((chat) => chat.scene.talker === `${chatType}.${chatId}`)
  }

  function getChat(chatId: string): Chats {
    const chats = botChats.got(status.bot!.id)
    return chats.find((chat) => chat.id === chatId) as Chats
  }

  function getMessage(messageId: string): Message {
    return getChats().find((chat) => chat.type === 'message' && chat.id === messageId) as Message
  }

  function getNotice(noticeId: string): Notice {
    return getChats().find((chat) => chat.type === 'notice' && chat.id === noticeId) as Notice
  }

  function getRequest(requestId: string): Request {
    return getChats().find((chat) => chat.type === 'request' && chat.id === requestId) as Request
  }

  return {
    botChats,
    appendScene,
    getChats,
    getChat,
    getMessage,
    getNotice,
    getRequest,
  }
})
