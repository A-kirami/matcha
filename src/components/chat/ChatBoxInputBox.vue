<script setup lang="ts">
import mime from 'mime/lite'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue'
import Tribute from 'tributejs'
import { createVNode, render } from 'vue'

import FileCard from '~/components/FileCard.vue'

import type { UploadFile } from '~/types'

const emit = defineEmits<{ send: [] }>()

const general = useGeneralSettingsStore()

const inputRef = $ref<HTMLDivElement | null>(null)

function onEnter(e: KeyboardEvent): void {
  const enterSend = general.sendMessageShortcut === 'enter' && !e.shiftKey && !e.ctrlKey
  const ctrlEnterSend = general.sendMessageShortcut === 'ctrlEnter' && e.ctrlKey
  if (enterSend || ctrlEnterSend) {
    e.preventDefault()
    emit('send')
  }
}

async function focusInputBox() {
  await nextTick()
  inputRef && inputRef.focus()
}

async function onPaste(e: Event): Promise<void> {
  const data = (e as ClipboardEvent).clipboardData
  if (!data) {
    return
  }

  const nodeList: (Text | Element)[] = []
  let pasteText = data.getData('text/plain')
  if (pasteText) {
    const textNode = new Text(pasteText)
    nodeList.push(textNode)
  } else {
    const fileList = []
    const files = data.files

    for (let i = 0; i < files.length; i++) {
      const pasteFile = files[i]
      fileList.push(handlePasteFile(pasteFile))
    }
    nodeList.push(...(await Promise.all(fileList)))
  }

  insertNodes(nodeList)
}

function insertNodes(nodes: Node[]) {
  const selection = window.getSelection()
  if (!selection) {
    return
  }

  const range = selection.getRangeAt(0)
  range.deleteContents()

  for (const node of nodes) {
    range.insertNode(node)
    range.setStartAfter(node)
    range.setEndAfter(node)
    range.collapse(false)
  }

  selection.removeAllRanges()
  selection.addRange(range)
}

const style = useCssModule()

const MAX_IMAGE_SIZE = 1024 * 1024 * 10

async function handlePasteFile(pasteFile: File) {
  const fileCache = await createFileCache(pasteFile, null, pasteFile.name)
  const { id, url } = fileCache
  if (/^image/.test(pasteFile.type) && pasteFile.size <= MAX_IMAGE_SIZE) {
    return createImageNode({ id, url })
  }
  return createFileNode(id, pasteFile)
}

function createImageNode({ id, url }: { id: string; url: string }) {
  const imageNode = new Image()
  imageNode.dataset.type = 'image'
  imageNode.dataset.id = id
  imageNode.dataset.url = url
  imageNode.src = url
  imageNode.alt = 'image'
  imageNode.className = style.inlayImage
  return imageNode
}

function createFileNode(id: string, { name, size, type }: UploadFile) {
  const props = { id, name, size, type }
  const fileCard = createVNode(FileCard, props)
  const fileNode = document.createElement('div')
  render(fileCard, fileNode)
  return fileNode.firstElementChild!
}

async function insertFile({ name, size, type, path }: UploadFile & { path: string }) {
  const mineType = type instanceof Object ? type.mimeType : mime.getType(type || name) || type
  const fileCache = await createFileCache(`file://${path}`, null, name)
  const { id, url } = fileCache
  const nodes: Element[] = []
  if (mineType && /^image/.test(mineType) && size <= MAX_IMAGE_SIZE) {
    const imageNode = createImageNode({ id, url })
    nodes.push(imageNode)
  } else {
    const fileNode = createFileNode(id, { name, size, type })
    nodes.push(fileNode)
  }
  insertNodes(nodes)
}

const state = useStateStore()

interface Mentions {
  id: string
  name: string
}

async function getMentions(): Promise<Mentions[]> {
  const mentions: Mentions[] = []
  if (state.chatTarget?.type === 'group') {
    mentions.push({ id: 'all', name: '全体成员' })
    const members = await db.members.where({ groupId: state.chatTarget.id }).toArray()
    mentions.push(
      ...(await Promise.all(
        members.map(async (item) => ({
          id: item.userId,
          name: await getUserNickname(item.userId, state.chatTarget!.id),
        }))
      ))
    )
  }
  return mentions
}

const getMentionAvatar = $computed(() => {
  return (id: string) => (id === 'all' ? getAvatarUrl('group', state.chatTarget?.id) : getAvatarUrl('user', id))
})

const tribute = new Tribute<Mentions>({
  async values(_, cb) {
    cb(await getMentions())
  },
  allowSpaces: true,
  selectTemplate(item) {
    return `<span data-type="mention" data-id="${item.original.id}" class="text-sky-400" contenteditable="false">@${item.original.name}</span>`
  },
  menuItemTemplate(item) {
    const userIdInfo =
      item.original.id === 'all' ? '' : `<span class="text-sm text-muted-foreground">${item.original.id}</span>`
    return `<img src="${getMentionAvatar(item.original.id)}" class="w-6 rounded-1/2 v-middle inline"><div class="flex items-center gap-1"><span class="inline-block truncate max-w-26 ">${item.original.name}</span>${userIdInfo}</div>`
  },
  noMatchTemplate() {
    return '<span style:"visibility: hidden;"></span>'
  },
  lookup(item) {
    return item.name + item.id
  },
})

onMounted(() => {
  inputRef && tribute.attach(inputRef)
  focusInputBox()
})

onBeforeUnmount(() => {
  inputRef && tribute.detach(inputRef)
})

onBeforeRouteUpdate(() => {
  focusInputBox()
})

const session = useSessionStore()

function clearReplyMessage(): void {
  session.currentSession!.replyMessageId = ''
}

function onBackspace(): void {
  if (!inputRef?.textContent) {
    clearReplyMessage()
  }
}

function clearInput() {
  if (inputRef) {
    inputRef.textContent = ''
  }
  clearReplyMessage()
  focusInputBox()
}

watch(
  () => session.currentSession?.replyMessageId,
  () => {
    focusInputBox()
  }
)

defineExpose($$({ inputRef, clearInput, insertFile }))
</script>

<template>
  <OverlayScrollbarsComponent
    defer
    :class="$style.inputBox"
    class="h-full max-h-32 min-h-8 w-full rounded-md bg-gray-100 pr-1 dark:bg-gray-800"
  >
    <ChatReplyCard
      v-if="session.currentSession?.replyMessageId"
      :reply-id="session.currentSession.replyMessageId"
      class="m-2 bg-gray-200"
      closed
      @close="clearReplyMessage"
    />
    <div
      ref="inputRef"
      class="w-full whitespace-pre-wrap break-all bg-transparent px-2 py-1 align-middle text-sm text-gray-500 caret-gray-500/50 outline-none"
      dark="text-gray-300 caret-gray-300/50"
      contenteditable
      @paste.prevent="onPaste"
      @keydown.backspace="onBackspace"
      @keydown.enter="onEnter"
    ></div>
  </OverlayScrollbarsComponent>
</template>

<style module>
.input-box {
  & [data-overlayscrollbars-contents] {
    @apply flex flex-col justify-center;
  }

  & .inlay-image {
    @apply inline max-h-40 max-w-40 vertical-bottom pr-1;

    &:not(:first-child) {
      @apply pl-1;
    }
  }
}
</style>
