/* eslint-disable camelcase */
import { getVersion } from '@tauri-apps/api/app'

import { AdapterActionHandler } from '@/adapter/action'
import { Behav } from '@/adapter/behav'
import { UnsupportedActionError } from '@/adapter/errors'
import { db } from '@/database'
import { logger } from '@/plugins'
import { useStatusStore, useChatStore } from '@/stores'
import { asyncWrapper, getUserAge } from '@/utils'

import { MessageHandler, createMessage } from './message'
import { result } from './utils'

import type { GroupSender, PrivateSender, PrivateMessageEvent, GroupMessageEvent } from './event'
import type { Messages } from './message'
import type { ActionResult, ActionRequest, ActionStrategy } from '@/adapter/action'
import type {
  PrivateMessageScene,
  GroupMessageScene,
  GroupMemberDecreaseNoticeScene,
  GroupMemberBanNoticeScene,
  PrivateMessageDeleteNoticeScene,
  GroupMessageDeleteNoticeScene,
  GroupWholeBanNoticeScene,
  GroupAdminNoticeScene,
  GroupMemberCardNoticeScene,
  GroupNameNoticeScene,
  GroupMemberTitleNoticeScene,
  FriendIncreaseNoticeScene,
  GroupMemberIncreaseNoticeScene,
} from '@/adapter/scene'
import type { StrKeyObject } from '@/adapter/typed'
import type { Group, Member, User } from '@/database'

const messageHandler = new MessageHandler()

export class ActionHandler extends AdapterActionHandler {
  readonly strategy = actionStrategy

  async handle({ action, params }: ActionRequest): Promise<ActionResult> {
    try {
      const func = this.strategy[action]
      if (!func) {
        throw new UnsupportedActionError(result(1404, { message: '不支持的动作请求' }).response)
      }
      const asyncFn = asyncWrapper<ActionResult>(func)
      return await asyncFn(params)
    } catch (error) {
      logger.error((error as Error).toString())
      throw error
    }
  }
}

const actionStrategy: ActionStrategy = {
  /** 发送私聊消息 */
  'send_private_msg': async ({
    user_id,
    message,
  }: {
    user_id: number
    message: Messages[] | string
    auto_escape: boolean
  }): Promise<ActionResult<{ message_id: number }, PrivateMessageScene> | ActionResult<ErrorInfo>> => {
    const user = await db.users.get(user_id.toString())
    if (!user) {
      return result(1404, { message: '用户不存在' })
    }
    const messages = typeof message === 'string' ? [createMessage('text', { text: message })] : message
    const contents = await messageHandler.parse(messages)
    const behav = new Behav()
    const scene = await behav.sendPrivateMessage(behav.status.bot!, user, contents)
    scene.original_message = messages
    return result(0, { message_id: Number(scene.message_id) }, scene)
  },

  /** 发送群聊消息 */
  'send_group_msg': async ({
    group_id,
    message,
  }: {
    group_id: number
    message: Messages[] | string
    auto_escape: boolean
  }): Promise<ActionResult<{ message_id: number }, GroupMessageScene> | ActionResult<ErrorInfo>> => {
    const group = await db.groups.get(group_id.toString())
    if (!group) {
      return result(1404, { message: '群聊不存在' })
    }
    const messages = typeof message === 'string' ? [createMessage('text', { text: message })] : message
    const contents = await messageHandler.parse(messages)
    const behav = new Behav()
    const scene = await behav.sendGroupMessage(behav.status.bot!, group, contents)
    scene.original_message = messages
    return result(0, { message_id: Number(scene.message_id) }, scene)
  },

  /** 发送消息 */
  'send_msg': async ({
    message_type,
    user_id,
    group_id,
    message,
  }: {
    message_type: 'private' | 'group'
    user_id: number
    group_id: number
    message: Messages[] | string
    auto_escape: boolean
  }): Promise<ActionResult<{ message_id: number }, PrivateMessageScene | GroupMessageScene>> => {
    if (message_type === 'private') {
      return (await (actionStrategy.send_private_msg as (request: StrKeyObject) => Promise<ActionResult>)({
        user_id,
        message,
      })) as ActionResult<{ message_id: number }, PrivateMessageScene>
    } else {
      return (await (actionStrategy.send_group_msg as (request: StrKeyObject) => Promise<ActionResult>)({
        group_id,
        message,
      })) as ActionResult<{ message_id: number }, GroupMessageScene>
    }
  },

  /** 撤回消息 */
  'delete_msg': async ({
    message_id,
  }: {
    message_id: number
  }): Promise<ActionResult<null, PrivateMessageDeleteNoticeScene | GroupMessageDeleteNoticeScene>> => {
    const behav = new Behav()
    const status = useStatusStore()
    const scene = await behav.recallMessage(message_id.toString(), status.bot!.id)
    return result(0, null, scene)
  },

  /** 获取消息 */
  'get_msg': async ({
    message_id,
  }: {
    message_id: number
  }): Promise<
    ActionResult<
      | {
          time: number
          message_type: 'private' | 'group'
          message_id: number
          real_id: number
          sender: GroupSender | PrivateSender
          message: Messages[]
        }
      | ErrorInfo
    >
  > => {
    const chat = useChatStore()
    const chats = chat.getChats()
    const messageChat = chats.find((chat) => chat.type === 'message' && chat.scene.message_id === message_id.toString())
    if (!messageChat) {
      return result(1404, { message: '消息不存在' })
    }
    const { time, message_type, sender, message } = messageChat.event as PrivateMessageEvent | GroupMessageEvent
    return result(0, {
      time,
      message_type,
      message_id,
      real_id: message_id,
      sender,
      message,
    })
  },

  /** 群组踢人 */
  'set_group_kick': async ({
    group_id,
    user_id,
  }: {
    group_id: number
    user_id: number
    reject_add_request: boolean
  }): Promise<ActionResult<null, GroupMemberDecreaseNoticeScene>> => {
    const behav = new Behav()
    const status = useStatusStore()
    const scene = await behav.removeGroupMember(group_id.toString(), user_id.toString(), status.bot!.id)
    return result(0, null, scene)
  },

  /** 群组单人禁言 */
  'set_group_ban': async ({
    group_id,
    user_id,
    duration = 30 * 60,
  }: {
    group_id: number
    user_id: number
    duration: number
  }): Promise<ActionResult<null, GroupMemberBanNoticeScene>> => {
    const behav = new Behav()
    const status = useStatusStore()
    const scene = await behav.banGroupMember(group_id.toString(), user_id.toString(), status.bot!.id, duration)
    return result(0, null, scene)
  },

  /** 群组全员禁言 */
  'set_group_whole_ban': async ({
    group_id,
    enable = true,
  }: {
    group_id: number
    enable: boolean
  }): Promise<ActionResult<null, GroupWholeBanNoticeScene>> => {
    const behav = new Behav()
    const status = useStatusStore()
    const scene = await behav.banGroupWhole(group_id.toString(), status.bot!.id, enable)
    return result(0, null, scene)
  },

  /** 设置群组管理员 */
  'set_group_admin': async ({
    group_id,
    user_id,
    enable = true,
  }: {
    group_id: number
    user_id: number
    enable: boolean
  }): Promise<ActionResult<null, GroupAdminNoticeScene>> => {
    const behav = new Behav()
    const status = useStatusStore()
    const scene = await behav.setGroupAdmin(group_id.toString(), user_id.toString(), status.bot!.id, enable)
    return result(0, null, scene)
  },

  /** 设置群名片 */
  'set_group_card': async ({
    group_id,
    user_id,
    card = '',
  }: {
    group_id: number
    user_id: number
    card: string
  }): Promise<ActionResult<null, GroupMemberCardNoticeScene>> => {
    const behav = new Behav()
    const status = useStatusStore()
    const scene = await behav.editGroupMemberCard(group_id.toString(), user_id.toString(), status.bot!.id, card)
    return result(0, null, scene)
  },

  /** 设置群名 */
  'set_group_name': async ({
    group_id,
    group_name,
  }: {
    group_id: number
    group_name: string
  }): Promise<ActionResult<null, GroupNameNoticeScene>> => {
    const behav = new Behav()
    const status = useStatusStore()
    const scene = await behav.editGroupName(group_id.toString(), status.bot!.id, group_name)
    return result(0, null, scene)
  },

  /** 退出群组 */
  'set_group_leave': async ({
    group_id,
    is_dismiss = false,
  }: {
    group_id: number
    is_dismiss: boolean
  }): Promise<ActionResult<null | ErrorInfo> | ActionResult<null, GroupMemberDecreaseNoticeScene>> => {
    const behav = new Behav()
    const status = useStatusStore()
    if (is_dismiss) {
      await behav.dismissGroup(group_id.toString(), status.bot!.id)
      return result(0)
    } else {
      const scene = await behav.removeGroupMember(group_id.toString(), status.bot!.id, status.bot!.id)
      return result(0, null, scene)
    }
  },

  /** 设置群组专属头衔 */
  'set_group_special_title': async ({
    group_id,
    user_id,
    special_title = '',
    duration = -1,
  }: {
    group_id: number
    user_id: number
    special_title: string
    duration: number
  }): Promise<ActionResult<null, GroupMemberTitleNoticeScene>> => {
    const behav = new Behav()
    const status = useStatusStore()
    const scene = await behav.editGroupMemberspecialTitle(
      group_id.toString(),
      user_id.toString(),
      status.bot!.id,
      special_title,
      duration
    )
    return result(0, null, scene)
  },

  /** 处理加好友请求 */
  'set_friend_add_request': async ({
    flag,
    approve = true,
    remark = '',
  }: {
    flag: string
    approve: boolean
    remark: string
  }): Promise<ActionResult<null, FriendIncreaseNoticeScene>> => {
    const behav = new Behav()
    const status = useStatusStore()
    const scene = await behav.approveAddFriend(flag, status.bot!.id, approve, remark)
    return result(0, null, scene)
  },

  /** 处理加群请求／邀请 */
  'set_group_add_request': async ({
    flag,
    approve = true,
    reason = '',
  }: {
    flag: string
    approve: boolean
    reason: string
  }): Promise<ActionResult<null, GroupMemberIncreaseNoticeScene>> => {
    const behav = new Behav()
    const status = useStatusStore()
    const scene = await behav.approveJoinGroup(flag, status.bot!.id, approve, reason)
    return result(0, null, scene)
  },

  /** 获取登录号信息 */
  'get_login_info': async (): Promise<ActionResult<{ user_id: number; nickname: string }>> => {
    const status = useStatusStore()
    return result(0, { user_id: Number(status.bot!.id), nickname: status.bot!.name })
  },

  /** 获取陌生人信息 */
  'get_stranger_info': async ({
    user_id,
  }: {
    user_id: number
  }): Promise<
    | ActionResult<{ user_id: number; nickname: string; sex: 'male' | 'female' | 'unknown'; age: number }>
    | ActionResult<ErrorInfo>
  > => {
    const user = await db.users.get(user_id.toString())
    if (!user) {
      return result(1404, { message: '用户不存在' })
    }
    return result(0, {
      user_id,
      nickname: user.name,
      sex: user.sex || 'unknown',
      age: user.birthdate ? getUserAge(user.birthdate) : 0,
    })
  },

  /** 获取好友列表 */
  'get_friend_list': async (): Promise<ActionResult<{ user_id: number; nickname: string; remark: string }[]>> => {
    const status = useStatusStore()
    const friends = await db.friends.where({ userId: status.bot!.id }).toArray()
    const friendList = friends.map(async (friend) => {
      const user = await db.users.get(friend.friendId)
      return {
        user_id: Number(friend.friendId),
        nickname: user?.name || '',
        remark: friend.remark,
      }
    })
    return result(0, await Promise.all(friendList))
  },

  /** 获取群信息 */
  'get_group_info': async ({
    group_id,
  }: {
    group_id: number
  }): Promise<ActionResult<GroupInfo> | ActionResult<ErrorInfo>> => {
    const group = await db.groups.get(group_id.toString())
    if (!group) {
      return result(1404, { message: '群组不存在' })
    }
    return result(0, getGroupInfo(group))
  },

  /** 获取群列表 */
  'get_group_list': async (): Promise<ActionResult<GroupInfo[]>> => {
    const groupList = await db.groups.toArray()
    return result(
      0,
      groupList.map((group) => getGroupInfo(group))
    )
  },

  /** 获取群成员信息 */
  'get_group_member_info': async ({
    group_id,
    user_id,
  }: {
    group_id: string
    user_id: string
  }): Promise<ActionResult<MemberInfo> | ActionResult<ErrorInfo>> => {
    const status = useStatusStore()
    const operator = await db.members.get({ groupId: group_id, userId: status.bot!.id })
    if (!operator) {
      return result(1403, { message: '没有加入该群' })
    }
    const member = await db.members.get({ groupId: group_id, userId: user_id })
    if (!member) {
      return result(1404, { message: '群成员不存在' })
    }
    const info = await getMemberInfo(member, operator.role)
    return result(0, info)
  },

  /** 获取群成员列表 */
  'get_group_member_list': async ({
    group_id,
  }: {
    group_id: string
  }): Promise<ActionResult<MemberInfo[]> | ActionResult<ErrorInfo>> => {
    const status = useStatusStore()
    const operator = await db.members.get({ groupId: group_id, userId: status.bot!.id })
    if (!operator) {
      return result(1403, { message: '没有加入该群' })
    }
    const members = await db.members.where({ groupId: group_id }).toArray()
    const infoList = members.map(async (member) => await getMemberInfo(member, operator.role))
    return result(0, await Promise.all(infoList))
  },

  /** 检查是否可以发送图片 */
  'can_send_image': (): ActionResult<{ yes: boolean }> => {
    return result(0, {
      yes: true,
    })
  },

  /** 检查是否可以发送图片 */
  'can_send_record': (): ActionResult<{ yes: boolean }> => {
    return result(0, {
      yes: true,
    })
  },

  /** 获取运行状态 */
  'get_status': (): ActionResult<{ online: boolean; good: boolean }> => {
    return result(0, {
      online: true,
      good: true,
    })
  },

  /** 获取版本信息 */
  'get_version_info': async (): Promise<
    ActionResult<{ app_name: string; app_version: string; protocol_version: string }>
  > => {
    const appVersion = await getVersion()
    return result(0, {
      'app_name': 'matcha',
      'app_version': appVersion,
      'protocol_version': 'v11',
    })
  },
}

interface ErrorInfo {
  message: string
}

interface GroupInfo {
  group_id: number
  group_name: string
  member_count: number
  max_member_count: number
}

interface MemberInfo {
  group_id: number
  user_id: number
  nickname: string
  card: string
  sex: 'male' | 'female' | 'unknown'
  age: number
  area: string
  join_time: number
  last_sent_time: number
  level: string
  role: 'owner' | 'admin' | 'member'
  unfriendly: boolean
  title: string
  title_expire_time: number
  card_changeable: boolean
}

function getGroupInfo(group: Group): GroupInfo {
  return {
    group_id: Number(group.id),
    group_name: group.name,
    member_count: group.memberCount,
    max_member_count: group.maxMemberCount,
  }
}

async function getMemberInfo(member: Member, role: 'owner' | 'admin' | 'member'): Promise<MemberInfo> {
  const chat = useChatStore()
  const lastSentTime = chat
    .getChats()
    .filter((chat) => chat.type === 'message')
    .at(-1)?.scene.time
  const cardChangeable = role === 'owner' ? true : role === 'admin' && member.role !== 'owner' ? true : false
  const user = (await db.users.get(member.userId)) as User
  return {
    group_id: Number(member.groupId),
    user_id: Number(member.userId),
    nickname: user.name,
    card: member.card,
    role: member.role,
    level: member.level.toString(),
    title: member.title,
    title_expire_time: member.titleExpireTime,
    join_time: member.joinTime,
    last_sent_time: lastSentTime || 0,
    sex: user.sex,
    age: user.birthdate ? getUserAge(user.birthdate) : 0,
    area: user.location,
    unfriendly: false,
    card_changeable: cardChangeable,
  }
}
