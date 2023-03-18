import type { StrKeyObject, ValueOf } from './typed'

interface Content<T extends string = string, D extends StrKeyObject = StrKeyObject> {
  type: T
  data: D
}

/** 文本内容 */
export type TextContent = Content<
  'text',
  {
    text: string
  }
>

/** 提及内容 @ */
export type MentionContent = Content<
  'mention',
  {
    /** 提及的用户 id */
    user_id: string
    /** 是否提及所有用户 */
    all?: boolean
  }
>

/** 回复内容 */
export type ReplyContent = Content<
  'reply',
  {
    /** 回复的消息 id */
    message_id: string
    /** 回复的用户 id */
    user_id: string
  }
>

/** 表情内容 */
export type FaceContent = Content<
  'face',
  {
    /** 表情 id */
    id: number
    /** 表情名称 */
    name: string
  }
>

/** 骰子内容 */
export type DiceContent = Content<
  'dice',
  {
    /** 骰子值 */
    value: number
  }
>

/** 猜拳内容 */
export type RpsContent = Content<
  'rps',
  {
    /** 石头 => 0，剪刀 => 1，布 => 2 */
    value: number
  }
>

/** 戳一戳内容 */
export type PokeContent = Content<
  'poke',
  {
    user_id: string
  }
>

/** 窗口抖动内容 */
export type ShakeContent = Content<'shake'>

/** 匿名发送内容 */
export type AnonymousContent = Content<'anonymous'>

/** 分享内容 */
type ShareContent<T extends string, D = StrKeyObject> = Content<
  'share',
  D & {
    /** 分享类型 */
    type: T
    /** 分享链接 */
    url: string
    /** 分享标题 */
    title: string
    /** 分享描述内容 */
    content?: string
    /** 分享显示图片 */
    image?: string
  }
>

/** 链接分享内容 */
export type LinkShareContent = ShareContent<'link'>

/** 音乐分享内容 */
export type MusicShareContent = ShareContent<
  'music',
  {
    /** 音乐类型, 分别表示使用 QQ 音乐、网易云音乐、虾米音乐、自定义 */
    sub_type: 'qq' | '163' | 'xm' | 'custom'
    /** 音乐 id */
    id?: string
  }
>

/** 推荐内容 */
export type ContactContent = Content<
  'contact',
  {
    /** 推荐类型 */
    type: 'user' | 'group'
    /** 推荐类型的 id */
    id: string
  }
>

/** 位置内容 */
export type LocationContent = Content<
  'location',
  {
    /** 纬度 */
    latitude: number
    /** 纬度 */
    longitude: number
    /** 位置标题 */
    title: string
    /** 位置信息 */
    content: string
  }
>

/** 文件内容 */
export type FileContent<T extends string = 'file', D extends StrKeyObject = StrKeyObject> = Content<
  T,
  D & {
    /** 文件 id */
    id: string
    /** 文件链接 */
    url: string
  }
>

/** 图片内容 */
export type ImageContent = FileContent<
  'image',
  {
    sub_type: 'normal' | 'emoji' | 'flash' | 'show'
  }
>

/** 语音内容 */
export type VoiceContent = FileContent<'voice'>

/** 视频内容 */
export type VideoContent = FileContent<'video'>

/** 转发内容 */
export type ForwardContent = Content<
  'forward',
  {
    content: ForwardContentNode[]
  }
>

/** 转发节点 */
export type ForwardContentNode = Content<
  'node',
  {
    user_id: string
    user_name: string
    message: Contents[]
    time: number
  }
>

export interface ContentMapping {
  text: TextContent
  mention: MentionContent
  reply: ReplyContent
  face: FaceContent
  dice: DiceContent
  rps: RpsContent
  poke: PokeContent
  shake: ShakeContent
  anonymous: AnonymousContent
  share: LinkShareContent | MusicShareContent
  contact: ContactContent
  location: LocationContent
  file: FileContent
  image: ImageContent
  voice: VoiceContent
  video: VideoContent
  forward: ForwardContent
  node: ForwardContentNode
}

/** 消息内容 */
export type Contents = ValueOf<ContentMapping>

export function createContent<T extends keyof ContentMapping>(
  type: T,
  data: ContentMapping[T]['data']
): ContentMapping[T] {
  return {
    type,
    data,
  } as ContentMapping[T]
}
