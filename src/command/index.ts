import { invoke } from '@tauri-apps/api/tauri'

import { useChatStore, useStatusStore } from '@/stores'
import { asyncWrapper } from '@/utils'

import type { Contents, TextContent } from '@/adapter/content'

const chat = useChatStore()

const status = useStatusStore()

/** 检查是否使用了 MatchaCommand */
export function checkMatchaCommand(contents: Contents[]): boolean {
  if (contents.length === 1 && contents[0].type === 'text') {
    const text = (contents[0] as TextContent).data.text.toLowerCase()
    if (text.startsWith('matcha:>')) {
      return true
    }
  }
  return false
}

export async function runMatchaCommand(
  chatType: 'private' | 'group',
  chatId: string,
  contents: Contents[]
): Promise<void> {
  const command = extractCommand(contents)
  const commandFn = commandStrategy[command]
  if (commandFn) {
    const asyncFn = asyncWrapper(commandFn)
    await asyncFn(chatType, chatId)
  }
}

function extractCommand(contents: Contents[]): string {
  const text = (contents[0] as TextContent).data.text
  return text.replace(/^matcha:>/i, '').trim()
}

interface CommandStrategy {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [k: string]: ((...param: any) => void | Promise<void>) | undefined
}

const commandStrategy: CommandStrategy = {
  'devtools': openDevtools,
  'clear': clearChats,
  'clearAll': clearAllChats,
}

async function openDevtools(): Promise<void> {
  await invoke('open_devtools')
}

function clearChats(chatType: 'private' | 'group', chatId: string): void {
  const chats = chat.chatLogs.filter((chat) => chat.scene.chat_type === chatType)
  if (chatType === 'group') {
    chat.chatLogs = chats.filter((chat) => chat.scene.receiver_id === chatId)
  } else {
    const session = [status.bot?.id, status.user?.id]
    chat.chatLogs = chats.filter(
      (chat) => session.includes(chat.scene.sender_id) && session.includes(chat.scene.receiver_id)
    )
  }
}

function clearAllChats(): void {
  chat.chatLogs.length = 0
}
