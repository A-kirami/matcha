<script setup lang="ts">
import { Behav } from '~/adapter/behav'

import type { Contents } from '~/adapter/content'

const session = useSessionStore()

/** 获取输入内容 */
function getContent(el: HTMLElement): Contents[] {
  const nodes = el.childNodes
  if (!nodes) {
    return []
  }
  let contents: Contents[] = []
  for (const content of extractContent(nodes)) {
    const lastContent = contents.at(-1)
    if (lastContent?.type === 'text' && content.type === 'text') {
      lastContent.data.text += content.data.text
    } else {
      contents.push(content)
    }
  }
  if (session.currentSession?.replyMessageId) {
    contents.unshift({
      type: 'reply',
      data: {
        // eslint-disable-next-line camelcase
        message_id: session.currentSession.replyMessageId,
      },
    })
  }
  return contents
}

/** 从元素子节点中提取输入内容 */
function* extractContent(nodeList: NodeListOf<ChildNode>): Generator<Contents, void, void> {
  for (const element of nodeList) {
    const node = element as HTMLElement
    const contentType = node.dataset?.type || 'unknown'
    if (node instanceof Text && node.data) {
      yield {
        type: 'text',
        data: {
          text: node.data,
        },
      }
    } else {
      switch (contentType) {
        case 'image': {
          yield {
            type: contentType,
            data: {
              id: node.dataset.id!,
              url: node.dataset.url!,
            },
          }

          break
        }
        case 'mention': {
          yield {
            type: contentType,
            data: {
              target: node.dataset.id!,
            },
          }

          break
        }
        case 'file': {
          yield {
            type: node.dataset.fileType as 'image' | 'audio' | 'video' | 'file',
            data: {
              id: node.dataset.fileId!,
              url: node.dataset.fileUrl!,
            },
          }

          break
        }
        default: { if (node.nodeName === 'DIV') {
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
    }
  }
}

const inputBoxRef = $ref<ComponentInstance['ChatBoxInputBox']>()

const behav = new Behav()

const state = useStateStore()

function handleUpload(FileInfo: UploadFile & { path: string }) {
  inputBoxRef?.insertFile(FileInfo)
}

async function handleSend() {
  if (!inputBoxRef?.inputRef) {
    return
  }
  const contents = getContent(inputBoxRef.inputRef)
  if (contents.length > 0) {
    await behav.sendMessage(state.user!, state.chatTarget!, contents)
  }
  inputBoxRef.clearInput()
}
</script>

<template>
  <div class="mb-5 mt-3 flex items-end gap-2 px-3">
    <ChatBoxInputFileButton class="flex-shrink-0" @upload="handleUpload" />
    <ChatBoxInputBox ref="inputBoxRef" @send="handleSend" />
    <ChatSendButton @click="handleSend" />
  </div>
</template>
