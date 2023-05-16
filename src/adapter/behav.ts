/* eslint-disable camelcase */
import { message } from 'ant-design-vue'

import { db } from '@/database'
import { useStatusStore, useChatStore } from '@/stores'
import { getTimestamp, getUUID, getPlainMessage, getMessageId, roleCheck } from '@/utils'

import type { Contents } from './content'
import type {
  GroupMessageScene,
  PrivateMessageScene,
  JoinGroupRequestScene,
  AddFriendRequestScene,
  GroupInviteRequestScene,
  GroupMemberIncreaseNoticeScene,
  GroupMemberDecreaseNoticeScene,
  GroupMemberBanNoticeScene,
  FriendIncreaseNoticeScene,
  FriendDecreaseNoticeScene,
  GroupWholeBanNoticeScene,
  GroupAdminNoticeScene,
  GroupMemberCardNoticeScene,
  GroupMemberTitleNoticeScene,
  GroupNameNoticeScene,
  GroupMessageDeleteNoticeScene,
  PrivateMessageDeleteNoticeScene,
  GroupPokeNoticeScene,
  FriendPokeNoticeScene,
} from './scene'
import type { User, Group } from '@/database'
import type { Message } from '@/stores/chat'

export class Behav {
  readonly status = useStatusStore()

  readonly chat = useChatStore()

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
    self_id: string
    type: T
  } {
    return {
      id: getUUID(),
      time: getTimestamp(),
      self_id: this.status.assignBot,
      type,
    }
  }

  /** 发送私聊消息 */
  async sendPrivateMessage(sender: User, receiver: User, contents: Contents[]): Promise<PrivateMessageScene> {
    const lastContent = contents.at(-1)
    if (lastContent?.type === 'text') {
      lastContent.data.text = lastContent.data.text.trimEnd()
    }
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
    return await this.chat.appendScene({
      ...this.createScene('message'),
      detail_type: 'private',
      sub_type,
      message_id,
      message: contents,
      plain_message: await getPlainMessage(contents, { chatType: 'group', chatId: receiver.id }),
      user_id: sender.id,
      user_name: sender.name,
      chat_type: 'private',
      sender_id: sender.id,
      receiver_id: receiver.id,
    })
  }

  /** 发送群聊消息 */
  async sendGroupMessage(sender: User, receiver: Group, contents: Contents[]): Promise<GroupMessageScene> {
    const member = await db.members.get({ userId: sender.id, groupId: receiver.id })
    if (!member) {
      message.error('只有群成员才能发送消息')
      throw new Error('不是本群成员')
    }
    const lastContent = contents.at(-1)
    if (lastContent?.type === 'text') {
      lastContent.data.text = lastContent.data.text.trimEnd()
    }
    const message_id = getMessageId().toString()
    return await this.chat.appendScene({
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
      chat_type: 'group',
      sender_id: sender.id,
      receiver_id: receiver.id,
    })
  }

  /** 发送消息 */
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

  /** 撤回消息 */
  async recallMessage(
    messageId: string,
    operatorId: string
  ): Promise<PrivateMessageDeleteNoticeScene | GroupMessageDeleteNoticeScene> {
    const messageChat = this.chat.chatLogs.find(
      (chat) => chat.type === 'message' && chat.scene.message_id === messageId
    ) as Message | undefined
    if (!messageChat) {
      throw new Error('消息不存在')
    }
    messageChat.recall = true
    const scene = messageChat.scene
    if (scene.detail_type === 'private') {
      return await this.chat.appendScene(
        {
          ...this.createScene('notice'),
          detail_type: 'private_message_delete',
          message_id: messageId,
          user_id: scene.user_id,
          chat_type: 'private',
          sender_id: operatorId,
          receiver_id: scene.user_id,
        },
        messageChat.id
      )
    }
    let sub_type: 'delete' | 'recall' = 'recall'
    if (scene.user_id !== operatorId) {
      if (
        !(await roleCheck('admin', scene.group_id, operatorId)) ||
        (await roleCheck('admin', scene.group_id, scene.user_id))
      ) {
        throw new Error('无权操作')
      }
      sub_type = 'delete'
    }
    return await this.chat.appendScene(
      {
        ...this.createScene('notice'),
        detail_type: 'group_message_delete',
        sub_type,
        message_id: messageId,
        group_id: scene.group_id,
        user_id: scene.user_id,
        operator_id: operatorId,
        chat_type: 'group',
        sender_id: operatorId,
        receiver_id: scene.group_id,
      },
      messageChat.id
    )
  }

  /** 申请入群 */
  async requestJoinGroup(
    groupId: string,
    userId: string,
    comment = '',
    invitorId?: string
  ): Promise<JoinGroupRequestScene> {
    const group = await db.groups.get(groupId)
    if (!group) {
      throw new Error('群组不存在')
    }
    return await this.chat.appendScene({
      ...this.createScene('request'),
      detail_type: 'join_group',
      user_id: userId,
      group_id: groupId,
      invitor_id: invitorId,
      comment,
      chat_type: 'group',
      sender_id: userId,
      receiver_id: groupId,
    })
  }

  /** 邀请入群 */
  async inviteJoinGroup(groupId: string, userId: string, invitorId: string): Promise<GroupInviteRequestScene> {
    const group = await db.groups.get(groupId)
    if (!group) {
      throw new Error('群组不存在')
    }
    return await this.chat.appendScene({
      ...this.createScene('request'),
      detail_type: 'group_invite',
      group_id: groupId,
      user_id: userId,
      invitor_id: invitorId,
      chat_type: 'private',
      sender_id: invitorId,
      receiver_id: userId,
    })
  }

  /** 批准入群 */
  async approveJoinGroup(
    requestId: string,
    operatorId: string,
    approve = true,
    reason = ''
  ): Promise<GroupMemberIncreaseNoticeScene | undefined> {
    const request = this.chat.getChat(requestId, 'request')
    const scene = request.scene as JoinGroupRequestScene
    if (!(await roleCheck('admin', scene.group_id, scene.user_id))) {
      throw new Error('无权操作')
    }
    if (!approve) {
      request.action = 'refuse'
      request.reason = reason
      return
    }
    request.action = 'agree'
    return await this.chat.appendScene({
      ...this.createScene('notice'),
      detail_type: 'group_member_increase',
      sub_type: scene.invitor_id ? 'invite' : 'join',
      user_id: scene.user_id,
      group_id: scene.group_id,
      operator_id: operatorId,
      chat_type: 'group',
      sender_id: operatorId,
      receiver_id: scene.group_id,
    })
  }

  /** 移除群成员 */
  async removeGroupMember(
    groupId: string,
    userId: string,
    operatorId: string
  ): Promise<GroupMemberDecreaseNoticeScene> {
    if (userId !== operatorId) {
      if (!(await roleCheck('admin', groupId, operatorId))) {
        throw new Error('无权操作')
      }
      const user = await db.members.get([groupId, userId])
      if (user?.role !== 'member') {
        throw new Error('无权移除群成员')
      }
    }
    await db.members.delete([groupId, userId])
    return await this.chat.appendScene({
      ...this.createScene('notice'),
      detail_type: 'group_member_decrease',
      sub_type: userId === operatorId ? 'leave' : 'remove',
      group_id: groupId,
      user_id: userId,
      operator_id: operatorId,
      chat_type: 'group',
      sender_id: operatorId,
      receiver_id: groupId,
    })
  }

  /** 禁言群成员 */
  async banGroupMember(
    groupId: string,
    userId: string,
    operatorId: string,
    duration: number
  ): Promise<GroupMemberBanNoticeScene> {
    if (!(await roleCheck('admin', groupId, operatorId)) || (await roleCheck('admin', groupId, userId))) {
      throw new Error('无权操作')
    }
    await db.members.update([groupId, userId], { banExpireTime: getTimestamp() + duration })
    return await this.chat.appendScene({
      ...this.createScene('notice'),
      detail_type: 'group_member_ban',
      sub_type: duration ? 'ban' : 'lift_ban',
      group_id: groupId,
      user_id: userId,
      operator_id: operatorId,
      chat_type: 'group',
      duration,
      sender_id: operatorId,
      receiver_id: groupId,
    })
  }

  /** 禁言全体成员 */
  async banGroupWhole(groupId: string, operatorId: string, enable: boolean): Promise<GroupWholeBanNoticeScene> {
    if (!(await roleCheck('admin', groupId, operatorId))) {
      throw new Error('无权操作')
    }
    await db.groups.update(groupId, { wholeBanned: enable })
    return await this.chat.appendScene({
      ...this.createScene('notice'),
      detail_type: 'group_whole_ban',
      sub_type: enable ? 'open' : 'close',
      group_id: groupId,
      operator_id: operatorId,
      chat_type: 'group',
      sender_id: operatorId,
      receiver_id: groupId,
    })
  }

  /** 设置群管理员 */
  async setGroupAdmin(
    groupId: string,
    userId: string,
    operatorId: string,
    enable: boolean
  ): Promise<GroupAdminNoticeScene> {
    if (!(await roleCheck('owner', groupId, operatorId))) {
      throw new Error('无权操作')
    }
    await db.members.update([groupId, userId], { role: enable ? 'admin' : 'member' })
    return await this.chat.appendScene({
      ...this.createScene('notice'),
      detail_type: 'group_admin',
      sub_type: enable ? 'set' : 'unset',
      group_id: groupId,
      user_id: userId,
      operator_id: operatorId,
      chat_type: 'group',
      sender_id: operatorId,
      receiver_id: groupId,
    })
  }

  /** 编辑群名 */
  async editGroupName(groupId: string, operatorId: string, groupName: string): Promise<GroupNameNoticeScene> {
    if (!(await roleCheck('admin', groupId, operatorId))) {
      throw new Error('无权操作')
    }
    await db.groups.update(groupId, { name: groupName })
    return await this.chat.appendScene({
      ...this.createScene('notice'),
      detail_type: 'group_name',
      group_id: groupId,
      operator_id: operatorId,
      name: groupName,
      chat_type: 'group',
      sender_id: operatorId,
      receiver_id: groupId,
    })
  }

  /** 编辑群成员名片 */
  async editGroupMemberCard(
    groupId: string,
    userId: string,
    operatorId: string,
    card: string
  ): Promise<GroupMemberCardNoticeScene> {
    if (!(await roleCheck('admin', groupId, operatorId)) || (await roleCheck('owner', groupId, userId))) {
      throw new Error('无权操作')
    }
    await db.members.update([groupId, userId], { card })
    return await this.chat.appendScene({
      ...this.createScene('notice'),
      detail_type: 'group_member_card',
      card,
      group_id: groupId,
      user_id: userId,
      operator_id: operatorId,
      chat_type: 'group',
      sender_id: operatorId,
      receiver_id: groupId,
    })
  }

  /** 编辑群成员专属头衔 */
  async editGroupMemberspecialTitle(
    groupId: string,
    userId: string,
    operatorId: string,
    title: string,
    duration: number
  ): Promise<GroupMemberTitleNoticeScene> {
    if (!(await roleCheck('owner', groupId, operatorId))) {
      throw new Error('无权操作')
    }
    await db.members.update([groupId, userId], { title, titleExpireTime: duration })
    return await this.chat.appendScene({
      ...this.createScene('notice'),
      detail_type: 'group_member_title',
      group_id: groupId,
      user_id: userId,
      operator_id: operatorId,
      title,
      chat_type: 'group',
      sender_id: operatorId,
      receiver_id: groupId,
    })
  }

  /** 申请成为好友 */
  async requestAddFriend(userId: string, operatorId: string, comment = ''): Promise<AddFriendRequestScene> {
    return await this.chat.appendScene({
      ...this.createScene('request'),
      detail_type: 'add_friend',
      user_id: operatorId,
      comment,
      chat_type: 'private',
      sender_id: operatorId,
      receiver_id: userId,
    })
  }

  /** 处理好友申请 */
  async approveAddFriend(
    requestId: string,
    operatorId: string,
    approve = true,
    remark = ''
  ): Promise<FriendIncreaseNoticeScene | undefined> {
    const request = this.chat.getChat(requestId, 'request')
    const scene = request.scene as AddFriendRequestScene
    if (!approve) {
      request.action = 'refuse'
      return
    }
    request.action = 'agree'
    await db.friends.add({ userId: operatorId, friendId: scene.user_id, remark })
    await db.friends.add({ userId: scene.user_id, friendId: operatorId, remark: '' })
    return await this.chat.appendScene({
      ...this.createScene('notice'),
      detail_type: 'friend_increase',
      user_id: operatorId,
      chat_type: 'private',
      sender_id: operatorId,
      receiver_id: scene.user_id,
    })
  }

  /** 删除好友 */
  async removeFriend(userId: string, friendId: string): Promise<FriendDecreaseNoticeScene> {
    await db.friends.delete([userId, friendId])
    return await this.chat.appendScene({
      ...this.createScene('notice'),
      detail_type: 'friend_decrease',
      user_id: friendId,
      chat_type: 'private',
      sender_id: userId,
      receiver_id: friendId,
    })
  }

  /** 戳一戳 */
  async pokeUser(
    userId: string,
    targeId: string,
    groupId?: string
  ): Promise<FriendPokeNoticeScene | GroupPokeNoticeScene> {
    const poke = {
      ...this.createScene('notice'),
      detail_type: groupId ? 'group_poke' : 'friend_poke',
      user_id: userId,
      target_id: targeId,
    } as const
    if (groupId) {
      return await this.chat.appendScene({
        ...poke,
        group_id: groupId,
        chat_type: 'group',
        sender_id: userId,
        receiver_id: groupId,
      })
    } else {
      return await this.chat.appendScene({
        ...poke,
        chat_type: 'private',
        sender_id: userId,
        receiver_id: targeId,
      } as FriendPokeNoticeScene)
    }
  }

  /** 解散群组 */
  async dismissGroup(groupId: string, operatorId: string): Promise<void> {
    if (!(await roleCheck('owner', groupId, operatorId))) {
      throw new Error('无权操作')
    }
    await db.groups.delete(groupId)
    await db.members.where({ groupId }).delete()
  }
}
