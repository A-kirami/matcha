/* eslint-disable camelcase */
import { message } from 'ant-design-vue'

import { db } from '@/database'
import { useStatusStore } from '@/stores'
import { getTimestamp, getUUID, getPlainMessage, getMessageId } from '@/utils'

import type { Contents } from './content'
import type { GroupMessageScene, PrivateMessageScene } from './scene'
import type { User, Group } from '@/database'

export class Behav {
  readonly status = useStatusStore()

  private static instance: Behav

  constructor() {
    if (Behav.instance) {
      return Behav.instance
    }
    Behav.instance = this
  }

  createScene<T extends 'message' | 'notice' | 'request'>(
    type: T
  ): {
    id: string
    time: number
    self: {
      platform: string
      bot_id: string
    }
    type: T
  } {
    return {
      id: getUUID(),
      time: getTimestamp(),
      self: {
        platform: 'qq',
        bot_id: this.status.bot!.id,
      },
      type,
    }
  }

  async sendPrivateMessage(sender: User, receiver: User, contents: Contents[]): Promise<PrivateMessageScene> {
    const message_id = getMessageId().toString()
    let sub_type: 'temp' | 'friend' | 'group' = 'temp'
    const isFriend = !!(await db.friends.get({ userId: this.status.assignUser, friendId: this.status.assignBot }))
    if (isFriend) {
      sub_type = 'friend'
    } else {
      const senderGroups = (await db.members.where({ userId: sender.id }).toArray()).map((item) => item.groupId)
      const receiverGroups = (await db.members.where({ userId: receiver.id }).toArray()).map((item) => item.groupId)
      const intersection = senderGroups.filter((x) => receiverGroups.includes(x))
      if (intersection.length) {
        sub_type = 'group'
      }
    }
    return {
      ...this.createScene('message'),
      detail_type: 'private',
      sub_type,
      message_id,
      message: contents,
      plain_message: await getPlainMessage(contents, { chatType: 'group', chatId: receiver.id }),
      user_id: sender.id,
      user_name: sender.name,
    }
  }

  async sendGroupMessage(sender: User, receiver: Group, contents: Contents[]): Promise<GroupMessageScene> {
    const member = await db.members.get({ userId: sender.id, groupId: receiver.id })
    if (!member) {
      message.error('只有群成员才能发送消息')
      throw new Error('不是本群成员')
    }
    const message_id = getMessageId().toString()
    return {
      ...this.createScene('message'),
      detail_type: 'group',
      sub_type: 'normal',
      message_id,
      message: contents,
      plain_message: await getPlainMessage(contents, { chatType: 'group', chatId: receiver.id }),
      user_id: sender.id,
      user_name: sender.name,
      group_id: receiver.id,
      group_name: receiver.name,
      anonymous: null,
      member,
    }
  }

  async sendMessage(
    chatType: 'private' | 'group',
    sender: User,
    receiver: User | Group,
    contents: Contents[]
  ): Promise<PrivateMessageScene | GroupMessageScene> {
    if (chatType === 'private') {
      return this.sendPrivateMessage(sender, receiver as User, contents)
    } else {
      return this.sendGroupMessage(sender, receiver as Group, contents)
    }
  }
}
