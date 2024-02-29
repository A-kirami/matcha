/* eslint-disable camelcase */

import { createContent } from '~/adapter/content'
import { AdapterMessageHandler } from '~/adapter/message'

import type {
  TextContent,
  MentionContent,
  ReplyContent,
  FaceContent,
  DiceContent,
  RpsContent,
  PokeContent,
  ShakeContent,
  AnonymousContent,
  LinkShareContent,
  MusicShareContent,
  ContactContent,
  LocationContent,
  ImageContent,
  VoiceContent,
  VideoContent,
  ForwardContent,
  ForwardContentNode,
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

/** 表情消息 */
export type FaceMessage = Message<
  'face',
  {
    /** QQ 表情 ID */
    id: string
  }
>

type FileMessage<T extends 'image' | 'record' | 'video', D = StrKeyObject> = Message<
  T,
  D & {
    /** 文件名 */
    file: string
    /** 文件链接 */
    url?: string
    /** 是否使用已缓存的文件, 默认 true */
    cache?: boolean
    /** 是否通过代理下载文件, 默认 true */
    proxy?: boolean
    /** 只在通过网络 URL 发送时有效，单位秒，表示下载网络文件的超时时间，默认不超时 */
    timeout?: number
  }
>

/** 图片消息 */
export type ImageMessage = FileMessage<
  'image',
  {
    /** 图片类型, flash 表示闪照, show 表示秀图, 默认普通图片 */
    type?: 'flash' | 'show'
  }
>

/** 语音消息 */
export type RecordMessage = FileMessage<
  'record',
  {
    /** 语音是否变声，默认 false */
    magic: boolean
  }
>

/** 视频消息 */
export type VideoMessage = FileMessage<'video'>

/** 艾特消息 */
export type AtMessage = Message<
  'at',
  {
    /** 被 @ 的 QQ 号，all 表示全体成员 */
    qq: string
  }
>

/** 猜拳消息 */
export type RpsMessage = Message<'rps'>

/** 骰子消息 */
export type DiceMessage = Message<'dice'>

/** 窗口抖动消息 */
export type ShakeMessage = Message<'shake'>

/** 戳一戳消息 */
export type PokeMessage = Message<
  'poke',
  {
    type: string
    id: string
    name: string
  }
>

/** 匿名消息 */
export type AnonymousMessage = Message<
  'anonymous',
  {
    /** 无法匿名时是否继续发送 */
    ignore?: boolean
  }
>

/** 推荐消息 */
export type ContactMessage = Message<
  'contact',
  {
    /** 无法匿名时是否继续发送 */
    type: 'qq' | 'group'
    id: string
  }
>

/** 位置消息 */
export type LocationMessage = Message<
  'location',
  {
    /** 纬度 */
    lat: string
    /** 经度 */
    lon: string
    /** 标题 */
    title?: string
    /** 内容描述 */
    content?: string
  }
>

/** 链接分享消息 */
export type LinkShareMessage = Message<
  'share',
  {
    url: string
    title: string
    content?: string
    image?: string
  }
>

/** 音乐分享消息 */
export type MusicShareMessage = Message<
  'music',
  {
    type: 'qq' | '163' | 'xm' | 'custom'
    id?: string
    url?: string
    audio?: string
    title?: string
    content?: string
    image?: string
  }
>

/** 回复消息 */
export type ReplyMessage = Message<
  'reply',
  {
    /** 回复时引用的消息 ID */
    id: string
  }
>

/** 转发消息 */
export type ForwardMessage = Message<
  'forward',
  {
    /** 合并转发 ID，需通过 `get_forward_msg` API 获取具体内容 */
    id: string
  }
>

/** 转发消息节点 */
export type ForwardMessageNode = Message<
  'node',
  {
    /** 转发的消息 ID */
    id?: string
    /** 发送者 QQ 号 */
    user_id?: string
    /** 发送者昵称 */
    nickname?: string
    /** 消息内容 */
    content?: string | Messages[]
  }
>

export interface MessageMapping {
  text: TextMessage
  at: AtMessage
  reply: ReplyMessage
  face: FaceMessage
  dice: DiceMessage
  rps: RpsMessage
  poke: PokeMessage
  shake: ShakeMessage
  anonymous: AnonymousMessage
  share: LinkShareMessage
  music: MusicShareMessage
  contact: ContactMessage
  location: LocationMessage
  image: ImageMessage
  record: RecordMessage
  video: VideoMessage
  forward: ForwardMessage
  node: ForwardMessageNode
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

  'mention': (content: MentionContent): AtMessage => {
    return createMessage('at', {
      qq: content.data.target,
    })
  },

  'reply': (content: ReplyContent): ReplyMessage => {
    return createMessage('reply', {
      id: content.data.message_id,
    })
  },

  'face': (content: FaceContent): FaceMessage => {
    return createMessage('face', {
      id: content.data.id.toString(),
    })
  },

  'dice': (): DiceMessage => {
    return createMessage('dice', {})
  },

  'rps': (): RpsMessage => {
    return createMessage('rps', {})
  },

  'poke': (content: PokeContent): PokeMessage => {
    return createMessage('poke', {
      type: '',
      id: content.data.user_id,
      name: '',
    })
  },

  'shake': (): ShakeMessage => {
    return createMessage('shake', {})
  },

  'anonymous': (): AnonymousMessage => {
    return createMessage('anonymous', {})
  },

  'share': (content: LinkShareContent | MusicShareContent): LinkShareMessage | MusicShareMessage => {
    const { type, url, title, content: dataContent, image } = content.data
    if (type === 'link') {
      return createMessage('share', {
        url,
        title,
        content: dataContent,
        image,
      })
    } else {
      const { sub_type: subType, id } = content.data
      return createMessage('music', {
        type: subType,
        id,
        url,
        title,
        content: dataContent,
        image,
      })
    }
  },

  'contact': (content: ContactContent): ContactMessage => {
    return createMessage('contact', {
      type: content.data.type === 'user' ? 'qq' : 'group',
      id: content.data.id,
    })
  },

  'location': (content: LocationContent): LocationMessage => {
    const { latitude, longitude, title, content: dataContent } = content.data
    return createMessage('location', {
      lat: latitude.toString(),
      lon: longitude.toString(),
      title,
      content: dataContent,
    })
  },

  'image': (content: ImageContent): ImageMessage => {
    const { id, url, sub_type } = content.data
    return createMessage('image', {
      file: id,
      url,
      type: ['flash', 'show'].includes(sub_type) ? (sub_type as 'flash' | 'show') : undefined,
    })
  },

  'voice': (content: VoiceContent): RecordMessage => {
    const { id, url } = content.data
    return createMessage('record', {
      file: id,
      url,
      magic: false,
    })
  },

  'video': (content: VideoContent): VideoMessage => {
    const { id, url } = content.data
    return createMessage('video', {
      file: id,
      url,
    })
  },

  'forward': (): ForwardMessage => {
    throw new Error('未实现消息段, 跳过')
  },

  'node': (): ForwardMessageNode => {
    throw new Error('未实现消息段, 跳过')
  },
}

const messageParseStrategy: MessageParseStrategy<MessageMapping> = {
  'text': (message: TextMessage): TextContent => {
    return createContent('text', { ...message.data })
  },

  'at': (message: AtMessage): MentionContent => {
    return createContent('mention', {
      'target': message.data.qq,
    })
  },

  'reply': (message: ReplyMessage): ReplyContent => {
    return createContent('reply', {
      'message_id': message.data.id,
      'user_id': '',
    })
  },

  'face': (message: FaceMessage): FaceContent => {
    return createContent('face', {
      'id': Number(message.data.id),
      'name': '',
    })
  },

  'dice': (): DiceContent => {
    return createContent('dice', { value: randomInt(0, 5) })
  },

  'rps': (): RpsContent => {
    return createContent('rps', { value: randomInt(0, 2) })
  },

  'poke': (message: PokeMessage): PokeContent => {
    return createContent('poke', { 'user_id': message.data.id })
  },

  'shake': (): ShakeContent => {
    return createContent('shake', {})
  },

  'anonymous': (): AnonymousContent => {
    return createContent('anonymous', {})
  },

  'share': (message: LinkShareMessage): LinkShareContent => {
    return createContent('share', {
      type: 'link',
      ...message.data,
    }) as LinkShareContent
  },

  'music': (message: MusicShareMessage): MusicShareContent => {
    const { type: sub_type, id, url, title, content, image } = message.data
    return createContent('share', {
      type: 'music',
      sub_type,
      id,
      url: url ?? '',
      title: title ?? '',
      content,
      image,
    }) as MusicShareContent
  },

  'contact': (message: ContactMessage): ContactContent => {
    return createContent('contact', {
      type: message.data.type === 'qq' ? 'user' : 'group',
      id: message.data.id,
    })
  },

  'location': (message: LocationMessage): LocationContent => {
    const { lat, lon, title, content } = message.data
    return createContent('location', {
      latitude: Number(lat),
      longitude: Number(lon),
      title: title ?? '',
      content: content ?? '',
    })
  },

  'image': async (message: ImageMessage): Promise<ImageContent> => {
    const { id, url } = await createFileCache(message.data.file, 'image')
    return createContent('image', {
      id,
      url,
      'sub_type': message.data.type ?? 'normal',
    })
  },

  'record': async (message: RecordMessage): Promise<VoiceContent> => {
    const { id, url } = await createFileCache(message.data.file, 'audio')
    return createContent('voice', {
      id,
      url,
    })
  },

  'video': async (message: VideoMessage): Promise<VideoContent> => {
    const { id, url } = await createFileCache(message.data.file, 'video')
    return createContent('video', {
      id,
      url,
    })
  },

  'forward': (): ForwardContent => {
    throw new Error('未实现消息段, 跳过')
  },

  'node': (): ForwardContentNode => {
    throw new Error('未实现消息段, 跳过')
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
