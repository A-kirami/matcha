import { unix } from 'dayjs'

import { db } from '@/database'
import { asyncWrapper } from '@/utils'

import { nonNullable } from './utils'

import type {
  Contents,
  TextContent,
  MentionContent,
  FaceContent,
  LinkShareContent,
  MusicShareContent,
  ContentMapping,
} from '@/adapter/content'
import type { Scenes } from '@/adapter/scene'
import type { Context } from '@/adapter/typed'

/**
 * 获取用户头像
 * @param uid QQ号
 *
 * @returns 用户头像图片链接
 */
export function getUserAvatar(uid: number | string): string {
  return `https://q1.qlogo.cn/g?b=qq&nk=${uid}&s=640`
}

/**
 * 获取群头像
 * @param gid 群号
 *
 * @returns 群头像图片链接
 */
export function getGroupAvatar(gid: number | string): string {
  return `https://p.qlogo.cn/gh/${gid}/${gid}/640/`
}

/**
 * 获取纯文本消息
 * @param contents 消息内容
 *
 * @returns 纯文本消息内容
 */
export async function getPlainMessage(contents: Contents[], context: Context): Promise<string> {
  const plainMessagePromise = contents.map(async (content) => {
    const plainFn = plainStrategy[content.type]
    if (!plainFn) {
      return null
    }
    if (typeof plainFn === 'string') {
      return plainFn
    }
    const asyncFn = asyncWrapper<string>(plainFn)
    return await asyncFn(content, context)
  })
  return (await Promise.all(plainMessagePromise)).filter(nonNullable).join('')
}

export async function getMentionString(content: MentionContent, groupId?: string) {
  let mentionName: string
  if (content.data.target === 'all') {
    mentionName = '全体成员'
  } else {
    const userId = content.data.target
    mentionName = await getUserNickname(userId, groupId)
  }
  return `@${mentionName}`
}

type PlainStrategy<C> = {
  readonly [K in keyof C]?: string | ((content: C[K], context: Context) => string | Promise<string>)
}

const plainStrategy: PlainStrategy<ContentMapping> = {
  text: (content: TextContent): string => content.data.text,
  mention: async (content: MentionContent, context: Context): Promise<string> => {
    const groupId = context.chatType === 'group' ? context.chatId : undefined
    const mentionString = await getMentionString(content, groupId)
    return mentionString + ''
  },
  reply: '回复> ',
  face: (content: FaceContent): string => `[表情:${content.data.name}]`,
  dice: '[掷骰子]',
  rps: '[猜拳]',
  poke: '[戳一戳]',
  shake: '[窗口抖动]',
  anonymous: '',
  share: (content: LinkShareContent | MusicShareContent): string => {
    return content.data.type === 'link' ? '[链接分享]' : '[音乐分享]'
  },
  contact: '[推荐联系人]',
  location: '[位置]',
  file: '[文件]',
  image: '[图片]',
  voice: '[语音]',
  video: '[视频]',
  forward: '[转发消息]',
}

/**
 * 获取消息 ID，从 10000 开始自增
 *
 * @returns 分配的消息 ID
 */
export const getMessageId = (() => {
  let messageId = 10000
  return (): number => {
    messageId++
    return messageId
  }
})()

/**
 * 获取纯文本事件场景
 * @param scene 事件场景
 *
 * @returns 纯文本事件场景
 */
export function getPlainScene(scene?: Scenes): string {
  if (!scene) {
    return ''
  }
  switch (scene.type) {
    case 'message': {
      return scene.plain_message
    }
    default:
      return ''
  }
}

/**
 * 获取用户昵称
 * @param userId 用户 ID
 * @param groupId 所在群 ID
 *
 * @returns 用户昵称
 */
export async function getUserNickname(userId: string, groupId?: string): Promise<string> {
  if (groupId) {
    const member = await db.members.get({ userId, groupId })
    if (member?.card) {
      return member?.card
    }
  }
  const user = await db.users.get(userId)
  const userName = user?.name
  return userName || userId.toString()
}

/**
 * 获取用户年龄
 * @param birthday 生日时间戳
 */
export function getUserAge(birthday: number): number {
  return unix(birthday).diff(undefined, 'year')
}

const ROLE = ['owner', 'admin', 'member']

/**
 * 检查用户权限
 * @param role 最低要求权限
 * @param groupId 群组
 * @param userId 检查用户
 *
 * @returns 用户是否具有权限
 */
export async function roleCheck(role: 'owner' | 'admin' | 'member', groupId: string, userId: string): Promise<boolean> {
  const member = await db.members.get([groupId, userId])
  if (!member) {
    return false
  }
  return ROLE.indexOf(member.role) <= ROLE.indexOf(role)
}
