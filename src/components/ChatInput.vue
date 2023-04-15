<!-- eslint-disable camelcase -->
<script setup lang="ts">
import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue'
import Tribute from 'tributejs'
import { watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'

import AudioIcon from '@/assets/audio_file.svg?url'
import VideoIcon from '@/assets/video_file.svg?url'
import { db } from '@/database'
import { useStatusStore } from '@/stores'
import { createFileCache, getUserAvatar, getGroupAvatar, nonNullable, getUserNickname } from '@/utils'

import type { Contents } from '@/adapter/content'

// eslint-disable-next-line func-call-spacing
defineEmits<{ (e: 'send'): void }>()

const { chatType, chatId } = defineProps<{
  chatType: 'private' | 'group'
  chatId: string
}>()

const route = useRoute()

const status = useStatusStore()

const inputBox = $ref<HTMLDivElement | null>(null)

onMounted(() => {
  inputBox && tribute.attach(inputBox)
  focusInputBox()
})

onBeforeUnmount(() => {
  inputBox && tribute.detach(inputBox)
})

function focusInputBox(): void {
  if (inputBox) {
    nextTick(() => {
      inputBox.focus()
    })
  }
}

async function onPaste(e: Event): Promise<void> {
  const selection = window.getSelection()
  if (!selection) {
    return
  }

  const data = (e as ClipboardEvent).clipboardData
  if (!data) {
    return
  }

  const range = selection?.getRangeAt(0)
  range.deleteContents()

  const nodeList: (Text | HTMLImageElement)[] = []
  let pasteText = data.getData('text/plain')
  if (pasteText) {
    const textNode = new Text(pasteText)
    nodeList.push(textNode)
  } else {
    const imageList = []
    const files = data.files

    for (let i = 0; i < files.length; i++) {
      const pasteFile = files[i]
      imageList.push(
        (async () => {
          if (!/^(image|video|audio)/.test(pasteFile.type)) {
            throw new TypeError('不支持的文件类型')
          }
          const type = pasteFile.type.split('/')[0] as 'image' | 'video' | 'audio'
          const { id, url } = await createFileCache(type, pasteFile)
          const imageNode = new Image()
          imageNode.id = id
          imageNode.src = type === 'image' ? URL.createObjectURL(pasteFile) : type === 'audio' ? AudioIcon : VideoIcon
          imageNode.alt = type === 'audio' ? 'voice' : type
          imageNode.setAttribute('url', url)
          imageNode.style.display = 'inline'
          imageNode.style.maxWidth = type === 'image' ? '12.5rem' : '4rem'
          imageNode.style.verticalAlign = 'bottom'
          imageNode.style.margin = '0 0.25rem'
          return imageNode
        })()
      )
    }
    nodeList.push(...(await Promise.all(imageList)))
  }

  for (const node of nodeList) {
    range.insertNode(node)
    range.collapse(false)
  }

  selection.removeAllRanges()
  selection.addRange(range)
}

/** 清除输入内容 */
function clearContent(): void {
  if (inputBox) {
    inputBox.textContent = ''
  }
}

/** 获取输入内容 */
function getContent(): Contents[] | null {
  const nodes = inputBox?.childNodes || null
  if (!nodes) {
    return null
  }
  const contents: Contents[] = []
  for (const content of extractContent(nodes)) {
    const lastContent = contents.at(-1)
    if (lastContent?.type === 'text' && content.type === 'text') {
      lastContent.data.text += content.data.text
    } else {
      contents.push(content)
    }
  }
  return contents
}

/** 从元素子节点中提取输入内容 */
// eslint-disable-next-line no-undef
function* extractContent(nodeList: NodeListOf<ChildNode>): Generator<Contents, void, void> {
  for (let index = 0; index < nodeList.length; index++) {
    const node = nodeList[index] as HTMLElement
    if (node instanceof Text && node.data) {
      yield {
        type: 'text',
        data: {
          text: node.data,
        },
      }
    } else if (node instanceof Image) {
      yield {
        type: node.alt as 'image' | 'video' | 'voice',
        data: {
          sub_type: 'normal',
          id: node.id,
          url: node.getAttribute('url') as string,
        },
      }
    } else if (node.nodeName === 'SPAN') {
      yield {
        type: 'mention',
        data: {
          user_id: node.id,
          all: node.id === '0',
        },
      }
    } else if (node.nodeName === 'DIV') {
      yield {
        type: 'text',
        data: {
          text: '\n',
        },
      }
      yield* extractContent(node.childNodes)
    }
  }
}

watch(
  () => route.params.chatId,
  () => {
    focusInputBox()
  }
)

defineExpose({
  clearContent,
  getContent,
})

interface Mentions {
  id: number
  name: string
}

async function getMentions(): Promise<Mentions[]> {
  const mentions: Mentions[] = []
  if (chatType === 'group') {
    mentions.push({ id: 0, name: '全体成员' })
    const members = await db.members.where({ groupId: chatId }).toArray()
    mentions.push(
      ...(await Promise.all(
        members.map(async (item) => ({ id: Number(item.userId), name: await getUserNickname(item.userId, chatId) }))
      ))
    )
  } else {
    mentions.push(
      ...[status.bot, status.user].map((item) => item && { id: item.id, name: item.name }).filter(nonNullable)
    )
  }
  return mentions
}

const tribute = new Tribute<Mentions>({
  async values(_, cb) {
    cb(await getMentions())
  },
  allowSpaces: true,
  selectTemplate(item) {
    return `<span id="${item.original.id}" class="text-sky-400" contenteditable="false">@${item.original.name}</span>`
  },
  menuItemTemplate(item) {
    const avatarUrl = item.original.id ? getUserAvatar(item.original.id) : getGroupAvatar(chatId)
    const userIdInfo = item.original.id ? `<span>(${item.original.id})</span>` : ''
    return `<img src="${avatarUrl}" class="w-6 rounded-1/2 v-middle inline"><div class="flex items-center gap-1"><span class="inline-block truncate max-w-26">${item.original.name}</span>${userIdInfo}</div>`
  },
  noMatchTemplate() {
    return '<span style:"visibility: hidden;"></span>'
  },
  lookup(item) {
    return item.name + item.id
  },
})
</script>

<template>
  <OverlayScrollbarsComponent class="h-full max-h-25 w-full rounded-2xl bg-gray-100" defer>
    <div
      ref="inputBox"
      class="whitespace-pre-wrap break-all bg-gray-100 px-2 py-1 align-middle text-sm text-gray-500 caret-gray-500/50 outline-none"
      contenteditable
      @paste.prevent="onPaste"
      @keydown.ctrl.enter="$emit('send')"
    ></div>
  </OverlayScrollbarsComponent>
</template>

<style lang="postcss">
.tribute-container {
  @apply z-10 mb-2 h-auto overflow-y-auto rounded shadow-md max-h-50 scrollbar scrollbar-rounded;
}

.tribute-container ul {
  @apply list-none overflow-hidden rounded p-0 mb-0;
}

.tribute-container li {
  @apply cursor-pointer bg-white p-2 text-sm text-gray-800 dark:bg-gray-700 dark:text-gray-100 flex items-center gap-2;
}

.tribute-container li.highlight,
.tribute-container li:hover {
  @apply bg-blue-50 text-blue-400 dark:bg-blue-900 dark:text-blue-300;
}
</style>
