import { defineStore } from 'pinia'

import { useAdapterStore } from './protocol'
import { useStatusStore } from './status'

import type { Event } from '@/adapter/event'
import type { Scenes } from '@/adapter/scene'

interface Chat {
  id: string
  scene: Scenes
  event?: Event
  read: boolean
  send: boolean
}

export const useChatStore = defineStore('chat', () => {
  const privateChats = $ref<Map<string, Chat[]>>(new Map())
  const groupChats = $ref<Map<string, Chat[]>>(new Map())
  const chatMessages = $ref<Map<string, string>>(new Map())

  const adapter = useAdapterStore()
  const status = useStatusStore()

  async function appendScene(scene: Scenes, push = true): Promise<void> {
    if (scene.type === 'message') {
      chatMessages.set(scene.message_id, scene.id)
    }
    const event = await adapter.bot.eventHandler.handle(scene)
    const chat = {
      id: scene.id,
      scene,
      event,
      read: false,
      send: true,
    }
    if (event && push) {
      chat.send = await adapter.bot.send(event)
    }
    const {
      group_id: groupId,
      self: { bot_id: botId },
    }: { group_id?: string; self: { bot_id: string } } = scene
    const privateId = `${botId}.${status.user?.id}`
    const chats = groupId && scene.detail_type !== 'group_invite' ? groupChats : privateChats
    const chatId = (groupId ?? privateId).toString()
    !chats.has(chatId) && chats.set(chatId, [])
    chats.get(chatId)!.push(chat)
  }

  function getChats(chatType: 'private' | 'group', chatId: number | string): Chat[] {
    chatId = chatId.toString()
    const chatKey = chatType === 'private' ? `${status.bot?.id}.${status.user?.id}` : chatId
    const chatsMap = chatType === 'private' ? privateChats : groupChats
    !chatsMap.has(chatKey) && chatsMap.set(chatKey, [])
    return chatsMap.get(chatKey) as Chat[]
  }

  return {
    privateChats,
    groupChats,
    chatMessages,
    appendScene,
    getChats,
  }
})
