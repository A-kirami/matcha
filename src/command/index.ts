import { invoke } from '@tauri-apps/api/core'

export const commandFn = {
  openDevtools,
  clearChats,
  clearAllChats,
} as const

async function openDevtools(): Promise<void> {
  await invoke('open_devtools')
}

function clearChats(chatType: 'private' | 'group', chatId: string): void {
  const chat = useChatStore()
  const state = useStateStore()

  const chats = chat.chatLogs.filter((chat) => chat.scene.chat_type === chatType)
  if (chatType === 'group') {
    chat.chatLogs = chats.filter((chat) => chat.scene.receiver_id === chatId)
  } else {
    const session = [state.bot?.id, state.user?.id]
    chat.chatLogs = chats.filter(
      (chat) => session.includes(chat.scene.sender_id) && session.includes(chat.scene.receiver_id)
    )
  }
}

function clearAllChats(): void {
  const chat = useChatStore()
  chat.chatLogs.length = 0
}
