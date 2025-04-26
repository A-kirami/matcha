/* eslint-disable camelcase */
import { unix } from 'dayjs'

import type {
  Contents,
  TextContent,
  MentionContent,
  FaceContent,
  LinkShareContent,
  MusicShareContent,
  ContentMapping,
} from '~/adapter/content'
import type { Scenes } from '~/adapter/scene'
import type { Context } from '~/adapter/typed'

/**
 * 获取头像
 * @param id 用户或群号
 *
 * @returns 头像图片的链接
 */
export function getAvatarUrl(type: 'user' | 'group', id?: string): string {
  if ((typeof id === 'string' && !/^\d+$/.test(id)) || id === undefined) {
    return ''
  }
  return type === 'user' ? `https://q1.qlogo.cn/g?b=qq&nk=${id}&s=640` : `https://p.qlogo.cn/gh/${id}/${id}/640/`
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
      return
    }
    if (typeof plainFn === 'string') {
      return plainFn
    }
    const asyncFn = asyncWrapper<string>(plainFn)
    return await asyncFn(content, context)
  })
  const plainMessage = await Promise.all(plainMessagePromise)
  return plainMessage.filter(e => nonNullable(e)).join('')
}

export async function getMentionString(data: MentionContent['data'], groupId?: string) {
  let mentionName: string
  if (data.target === 'all') {
    mentionName = '全体成员'
  } else {
    const userId = data.target
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
    const mentionString = await getMentionString(content.data, groupId)
    return mentionString + ''
  },
  reply: '[回复] ',
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
  audio: '[语音]',
  video: '[视频]',
  forward: '[转发消息]',
}

/**
 * 获取消息 ID，从 10000 开始自增
 *
 * @returns 分配的消息 ID
 */
export const getMessageId = (() => {
  let messageId = 1_0000
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
    default: {
      return ''
    }
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
  if (userId === '0') {
    return true
  }
  const member = await db.members.get([groupId, userId])
  if (!member) {
    return false
  }
  return ROLE.indexOf(member.role) <= ROLE.indexOf(role)
}

/**
 * 获取联系人信息
 * @param type 联系人类型
 * @param id 联系人 ID
 *
 * @returns 联系人信息
 */
export async function getContact(type: Contact['type'], id: string): Promise<Contact> {
  const contactDb = type === 'user' ? db.users : db.groups
  const contactObj = await contactDb.get(id)
  return {
    type,
    id,
    name: contactObj?.name ?? id,
    avatar: getAvatarUrl(type, id),
  }
}

/**
 * 获取预览消息
 * @param scene 场景
 *
 * @returns 预览消息
 */
export async function getPreviewMessage(scene: Scenes, uid?: string): Promise<string> {
  const message = getPlainScene(scene)
  const { user_id, group_id } = scene as { user_id?: string, group_id?: string }
  if (!group_id || !user_id || user_id === uid) {
    return message
  }
  const nickname = await getUserNickname(user_id, group_id)
  return `${nickname}: ${message}`
}

/**
 * 解析消息组中的链接，并将链接转换为 `link` 元素。
 *
 * @param contents 消息组
 *
 * @returns 解析后的消息组，其中文本消息中的链接被转换为 `link` 消息。
 */
export function linkMessageParse(contents: Contents[]): Contents[] {
  const result: Contents[] = []

  for (const element of contents) {
    if (element.type === 'text') {
      const { text } = element.data
      const urlRegex = /https?:\/\/[^\s]+/g
      let lastIndex = 0

      for (const match of text.matchAll(urlRegex)) {
        const url = match[0]
        const startIndex = match.index
        const endIndex = startIndex + url.length

        // 添加链接之前的文本部分
        if (startIndex > lastIndex) {
          result.push({
            type: 'text',
            data: {
              text: text.slice(lastIndex, startIndex),
            },
          })
        }

        // 添加链接
        result.push({
          type: 'link',
          data: {
            url,
          },
        })

        lastIndex = endIndex
      }

      // 添加剩余的文本部分
      if (lastIndex < text.length) {
        result.push({
          type: 'text',
          data: {
            text: text.slice(lastIndex),
          },
        })
      }
    } else {
      // 直接添加非文本元素
      result.push(element)
    }
  }

  return result
}
