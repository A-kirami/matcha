/* eslint-disable camelcase */

import { createContent } from '~/adapter/content'
import { AdapterMessageHandler } from '~/adapter/message'

import type {
  TextContent,
  MentionContent,
  ReplyContent,
  FileContent,
  LocationContent,
  ImageContent,
  VoiceContent,
  VideoContent,
  ContentMapping,
} from '~/adapter/content'
import type { Message as AdapterMessage, MessageBuildStrategy, MessageParseStrategy } from '~/adapter/message'
import type { StrKeyObject, ValueOf } from '~/adapter/typed'

interface Message<T extends string = string, D extends StrKeyObject = StrKeyObject> extends AdapterMessage {
  type: T
  data: D
}

/** 文字消息 */
export type TextMessage = Message<'text', { text: string }>

/** 提及（即 @） */
export type MentionMessage = Message<'mention', { user_id: string }>

/** 提及所有人 */
export type MentionAllMessage = Message<'mention_all'>

/** 文件消息 */
export type FileMessage<T extends string = 'file'> = Message<T, { file_id: string }>

/** 图片消息 */
export type ImageMessage = FileMessage<'image'>

/** 语音消息 */
export type VoiceMessage = FileMessage<'voice'>

/** 音频消息 */
export type AudioMessage = FileMessage<'audio'>

/** 视频消息 */
export type VideoMessage = FileMessage<'video'>

/** 位置消息 */
export type LocationMessage = Message<
  'location',
  {
    /** 纬度 */
    latitude: number
    /** 经度 */
    longitude: number
    /** 标题 */
    title: string
    /** 地址内容 */
    content: string
  }
>

/** 回复消息 */
export type ReplyMessage = Message<
  'reply',
  {
    /** 回复的消息 ID */
    message_id: string
    /** 回复的消息发送者 ID，发送时可以不传入 */
    user_id?: string
  }
>

export interface MessageMapping {
  text: TextMessage
  mention: MentionMessage
  mention_all: MentionAllMessage
  file: FileMessage
  image: ImageMessage
  voice: VoiceMessage
  audio: AudioMessage
  video: VideoMessage
  location: LocationMessage
  reply: ReplyMessage
}

export type Messages = ValueOf<MessageMapping>

export function createMessage<T extends keyof MessageMapping>(
  type: T,
  data: MessageMapping[T]['data']
): MessageMapping[T] {
  return {
    type,
    data,
  } as MessageMapping[T]
}

const messageBuildStrategy: MessageBuildStrategy<ContentMapping> = {
  'text': (content: TextContent): TextMessage => {
    return createMessage('text', { ...content.data })
  },

  'mention': (content: MentionContent): MentionMessage | MentionAllMessage => {
    if (content.data.target === 'all') {
      return createMessage('mention_all', {})
    } else {
      return createMessage('mention', {
        user_id: content.data.target,
      })
    }
  },

  'reply': (content: ReplyContent): ReplyMessage => {
    return createMessage('reply', content.data)
  },

  'location': (content: LocationContent): LocationMessage => {
    return createMessage('location', content.data)
  },

  'file': (content: FileContent): FileMessage => {
    return createMessage('file', { file_id: content.data.id })
  },

  'image': (content: ImageContent): ImageMessage => {
    return createMessage('image', { file_id: content.data.id })
  },

  'voice': (content: VoiceContent): VoiceMessage => {
    return createMessage('voice', { file_id: content.data.id })
  },

  'video': (content: VideoContent): VideoMessage => {
    return createMessage('video', { file_id: content.data.id })
  },
}

const messageParseStrategy: MessageParseStrategy<MessageMapping> = {
  'text': (message: TextMessage): TextContent => {
    return createContent('text', { ...message.data })
  },

  'mention': (message: MentionMessage): MentionContent => {
    return createContent('mention', { target: message.data.user_id })
  },

  'mention_all': (): MentionContent => {
    return createContent('mention', { target: 'all' })
  },

  'file': async (message: FileMessage): Promise<FileContent> => {
    return createContent('file', { id: message.data.file_id, url: await getFile(GetType.URL, message.data.file_id) })
  },

  'image': async (message: ImageMessage): Promise<ImageContent> => {
    return createContent('image', {
      id: message.data.file_id,
      url: await getFile(GetType.URL, message.data.file_id),
      sub_type: 'normal',
    })
  },

  'voice': async (message: VoiceMessage): Promise<VoiceContent> => {
    return createContent('voice', {
      id: message.data.file_id,
      url: await getFile(GetType.URL, message.data.file_id),
    })
  },

  'audio': async (message: AudioMessage): Promise<VoiceContent> => {
    return createContent('voice', {
      id: message.data.file_id,
      url: await getFile(GetType.URL, message.data.file_id),
    })
  },

  'video': async (message: VideoMessage): Promise<VideoContent> => {
    return createContent('video', {
      id: message.data.file_id,
      url: await getFile(GetType.URL, message.data.file_id),
    })
  },

  'location': (message: LocationMessage): LocationContent => {
    return createContent('location', message.data)
  },

  'reply': (message: ReplyMessage): ReplyContent => {
    return createContent('reply', message.data)
  },
}

export class MessageHandler extends AdapterMessageHandler<Messages> {
  readonly buildStrategy = messageBuildStrategy
  readonly parseStrategy = messageParseStrategy

  private static instance: MessageHandler

  constructor() {
    if (MessageHandler.instance) {
      return MessageHandler.instance
    }
    super()
    MessageHandler.instance = this
  }
}
