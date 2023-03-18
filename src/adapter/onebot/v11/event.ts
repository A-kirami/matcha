/* eslint-disable camelcase */
import { AdapterEventHandler } from '@/adapter/event'
import { db } from '@/database'
import { useStatusStore } from '@/stores'

import { MessageHandler } from './message'

import type { Messages } from './message'
import type { Event as BaseEvent, EventBuildStrategy, EventParseStrategy } from '@/adapter/event'
import type {
  SceneMapping,
  PrivateMessageScene,
  GroupMessageScene,
  FriendIncreaseNoticeScene,
  PrivateMessageDeleteNoticeScene,
  GroupMemberIncreaseNoticeScene,
  GroupMemberDecreaseNoticeScene,
  GroupMessageDeleteNoticeScene,
  GroupPokeNoticeScene,
  GroupAdminNoticeScene,
  GroupMemberBanNoticeScene,
  GroupMemberHonorNoticeScene,
  GroupHongbaoLuckyNoticeScene,
  GroupFileUploadNoticeScene,
  AddFriendRequestScene,
  JoinGroupRequestScene,
  GroupInviteRequestScene,
} from '@/adapter/scene'
import type { ValueOf } from '@/adapter/typed'

/** 事件 */
interface Event extends BaseEvent {
  /** 事件发生的时间戳 */
  time: number

  /** 收到事件的机器人 QQ 号 */
  self_id: number

  /** 上报类型 */
  post_type: 'message' | 'notice' | 'request' | 'meta_event'
}

/** 消息事件 */
interface MessageEvent extends Event {
  post_type: 'message'

  /** 消息类型 */
  message_type: string

  /** 消息子类型 */
  sub_type: string

  /** 消息 ID */
  message_id: number

  /** 发送者 QQ 号 */
  user_id: number

  /** 消息内容 */
  message: Messages[]

  /** 原始消息内容 */
  raw_message: string

  /** 字体 */
  font: number

  /** 发送人信息 */
  sender: GroupSender | PrivateSender
}

/** 私聊消息 */
export interface PrivateMessageEvent extends MessageEvent {
  message_type: 'private'

  /** 消息子类型, 如果是好友则是 friend, 如果是群临时会话则是 group */
  sub_type: 'friend' | 'group' | 'other'
  sender: PrivateSender
}

/** 私聊消息发送者 */
interface PrivateSender {
  /** 发送者 QQ 号 */
  user_id: number

  /** 昵称 */
  nickname: string

  /** 性别 */
  sex: 'male' | 'female' | 'unknown'

  /** 年龄 */
  age: number
}

/** 群聊消息 */
export interface GroupMessageEvent extends MessageEvent {
  message_type: 'group'

  /** 消息子类型, 正常消息是 normal, 匿名消息是 anonymous, 系统提示 ( 如「管理员已禁止群内匿名聊天」 ) 是 notice */
  sub_type: 'normal' | 'anonymous' | 'notice'

  /** 群号 */
  group_id: number

  /** 匿名信息, 如果不是匿名消息则为 null */
  anonymous: Anonymous | null
  sender: GroupSender
}

/** 匿名信息 */
interface Anonymous {
  /** 匿名用户 ID */
  id: number

  /** 匿名用户名称 */
  name: string

  /** 匿名用户 flag, 在调用禁言 API 时需要传入 */
  flag: string
}

/** 群消息发送者 */
interface GroupSender extends PrivateSender {
  /** 群名片／备注 */
  card: string

  /** 地区 */
  area: string

  /** 成员等级 */
  level: string

  /** 成员角色 */
  role: 'owner' | 'admin' | 'member'

  /** 专属头衔 */
  title: string
}

/** 通知事件 */
interface NoticeEvent extends Event {
  post_type: 'notice'

  /** 通知类型 */
  notice_type: string
}

/** 群文件上传事件 */
export interface GroupUploadNoticeEvent extends NoticeEvent {
  /** 通知类型 */
  notice_type: 'group_upload'

  /** 群号 */
  group_id: number

  /** 发送者 QQ 号 */
  user_id: number

  /** 文件信息 */
  file: File
}

/** 文件信息 */
interface File {
  /** 文件 ID */
  id: string

  /** 文件名 */
  name: string

  /** 文件大小 ( 字节数 ) */
  size: number
  busid: number
}

/** 群管理员变动 */
export interface GroupAdminNoticeEvent extends NoticeEvent {
  notice_type: 'group_admin'

  /** 事件子类型, set表示设置, unset表示取消管理员 */
  sub_type: 'set' | 'unset'

  /** 群号 */
  group_id: number

  /** 管理员 QQ 号 */
  user_id: number
}

/** 群成员减少 */
export interface GroupDecreaseNoticeEvent extends NoticeEvent {
  notice_type: 'group_decrease'

  /** 事件子类型, 分别表示主动退群、成员被踢、登录号被踢 */
  sub_type: 'leave' | 'kick' | 'kick_me'

  /** 群号 */
  group_id: number

  /** 操作者 QQ 号 ( 如果是主动退群, 则和 user_id 相同 ) */
  operator_id: number

  /** 离开者 QQ 号 */
  user_id: number
}

/** 群成员增加 */
export interface GroupIncreaseNoticeEvent extends NoticeEvent {
  notice_type: 'group_increase'

  /** 事件子类型, approve表示管理员已同意入群， invite表示管理员邀请入群 */
  sub_type: 'approve' | 'invite'

  /** 群号 */
  group_id: number

  /** 操作者 QQ 号 */
  operator_id: number

  /** 加入者 QQ 号 */
  user_id: number
}

/** 群禁言 */
export interface GroupBanNoticeEvent extends NoticeEvent {
  notice_type: 'group_ban'

  /** 事件子类型, ban表示禁言, lift_ban表示解除禁言 */
  sub_type: 'ban' | 'lift_ban'

  /** 群号 */
  group_id: number

  /** 操作者 QQ 号 */
  operator_id: number

  /** 被禁言 QQ 号 */
  user_id: number

  /** 禁言时长, 单位秒 */
  duration: number
}

/** 好友添加 */
export interface FriendAddNoticeEvent extends NoticeEvent {
  notice_type: 'friend_add'

  /** 新添加好友 QQ 号 */
  user_id: number
}

/** 群消息撤回 */
export interface GroupRecallNoticeEvent extends NoticeEvent {
  notice_type: 'group_recall'

  /** 群号 */
  group_id: number

  /** 操作者 QQ 号 */
  operator_id: number

  /** 被禁言 QQ 号 */
  user_id: number

  /** 被撤回的消息 ID */
  message_id: number
}

/** 好友消息撤回 */
export interface FriendRecallNoticeEvent extends NoticeEvent {
  notice_type: 'friend_recall'

  /** 好友 QQ 号 */
  user_id: number

  /** 被撤回的消息 ID */
  message_id: number
}

interface NotifyEvent extends NoticeEvent {
  notice_type: 'notify'
  sub_type: string

  /** 群号 */
  group_id: number

  /** 发送者 QQ 号 */
  user_id: number
}

/** 群内戳一戳 */
export interface GroupPokeNotifyEvent extends NotifyEvent {
  sub_type: 'poke'

  /** 被戳者 QQ 号 */
  target_id: number
}

/** 群红包运气王 */
export interface GroupHongbaoLuckyNotifyEvent extends NotifyEvent {
  sub_type: 'lucky_king'

  /** 运气王 QQ 号 */
  target_id: number
}

/** 群成员荣誉变更 */
export interface GroupMemberHonorNotifyEvent extends NotifyEvent {
  sub_type: 'honor'
  honor_type: 'talkative' | 'performer' | 'emotion'
}

/** 请求事件 */
interface RequestEvent extends Event {
  post_type: 'request'

  /** 请求类型 */
  request_type: string
}

interface AddRequestEvent extends RequestEvent {
  /** 发送请求的 QQ 号 */
  user_id: number

  /** 验证信息 */
  comment: string

  /** 请求 flag，在调用处理请求的 API 时需要传入 */
  flag: string
}

/** 添加好友请求 */
export interface FriendRequestEvent extends AddRequestEvent {
  request_type: 'friend'
}

/** 加群请求／邀请 */
export interface GroupRequestEvent extends AddRequestEvent {
  request_type: 'group'

  /** 请求子类型，分别表示加群请求、邀请登录号入群 */
  sub_type: 'add' | 'invite'

  /** 群号 */
  group_id: number
}

export interface EventMapping {
  'message.private': PrivateMessageEvent
  'message.group': GroupMessageEvent
  'notice.group_upload': GroupUploadNoticeEvent
  'notice.group_admin': GroupAdminNoticeEvent
  'notice.group_decrease': GroupDecreaseNoticeEvent
  'notice.group_increase': GroupIncreaseNoticeEvent
  'notice.group_ban': GroupBanNoticeEvent
  'notice.friend_add': FriendAddNoticeEvent
  'notice.group_recall': GroupRecallNoticeEvent
  'notice.friend_recall': FriendRecallNoticeEvent
  'notice.notify.poke': GroupPokeNotifyEvent
  'notice.notify.lucky_king': GroupHongbaoLuckyNotifyEvent
  'notice.notify.honor': GroupMemberHonorNotifyEvent
  'request.friend': FriendRequestEvent
  'request.group': GroupRequestEvent
}

export type Events = ValueOf<EventMapping>

const messageHandler = new MessageHandler()

const eventBuildStrategy: EventBuildStrategy<SceneMapping<Messages>> = {
  'message.private': async (scene: PrivateMessageScene<Messages>): Promise<PrivateMessageEvent> => {
    const {
      time,
      type: post_type,
      detail_type: message_type,
      sub_type,
      user_id,
      message_id,
      message,
      plain_message: raw_message,
      user_name: nickname,
    } = scene
    return {
      time,
      self_id: Number(scene.self.bot_id),
      post_type,
      message_type,
      sub_type: sub_type === 'temp' ? 'other' : sub_type,
      user_id: Number(user_id),
      message_id: Number(message_id),
      message: scene.original_message || (await messageHandler.build(message)),
      raw_message,
      font: 0,
      sender: {
        user_id: Number(user_id),
        nickname,
        sex: 'unknown',
        age: 0,
      },
    }
  },

  'message.group': async (scene: GroupMessageScene<Messages>): Promise<GroupMessageEvent> => {
    const {
      time,
      type: post_type,
      detail_type: message_type,
      sub_type,
      user_id,
      group_id,
      message_id,
      message,
      plain_message: raw_message,
      user_name: nickname,
      anonymous,
      member: { card, role, rank: level, title },
    } = scene
    return {
      time,
      self_id: Number(scene.self.bot_id),
      post_type,
      message_type,
      sub_type,
      user_id: Number(user_id),
      group_id: Number(group_id),
      message_id: Number(message_id),
      message: scene.original_message || (await messageHandler.build(message)),
      raw_message,
      font: 0,
      anonymous: anonymous ? { ...anonymous, flag: anonymous.id.toString() } : null,
      sender: {
        user_id: Number(user_id),
        nickname,
        sex: 'unknown',
        age: 0,
        area: '',
        card,
        role,
        level,
        title,
      },
    }
  },

  'notice.friend_increase': (scene: FriendIncreaseNoticeScene): FriendAddNoticeEvent => {
    const { time, type: post_type, user_id } = scene
    return {
      time,
      self_id: Number(scene.self.bot_id),
      post_type,
      notice_type: 'friend_add',
      user_id: Number(user_id),
    }
  },

  'notice.private_message_delete': (scene: PrivateMessageDeleteNoticeScene): FriendRecallNoticeEvent => {
    const { time, type: post_type, user_id, message_id } = scene
    return {
      time,
      self_id: Number(scene.self.bot_id),
      post_type,
      notice_type: 'friend_recall',
      user_id: Number(user_id),
      message_id: Number(message_id),
    }
  },

  'notice.group_member_increase': (scene: GroupMemberIncreaseNoticeScene): GroupIncreaseNoticeEvent => {
    const { time, type: post_type, sub_type, group_id, operator_id, user_id } = scene
    return {
      time,
      self_id: Number(scene.self.bot_id),
      post_type,
      notice_type: 'group_increase',
      sub_type: sub_type === 'join' ? 'approve' : sub_type,
      user_id: Number(user_id),
      group_id: Number(group_id),
      operator_id: Number(operator_id),
    }
  },

  'notice.group_member_decrease': (scene: GroupMemberDecreaseNoticeScene): GroupDecreaseNoticeEvent => {
    const { time, type: post_type, sub_type, group_id, operator_id, user_id } = scene
    return {
      time,
      self_id: Number(scene.self.bot_id),
      post_type,
      notice_type: 'group_decrease',
      sub_type: sub_type === 'leave' ? sub_type : user_id === scene.self.bot_id ? 'kick_me' : 'kick',
      user_id: Number(user_id),
      group_id: Number(group_id),
      operator_id: Number(operator_id),
    }
  },

  'notice.group_message_delete': (scene: GroupMessageDeleteNoticeScene): GroupRecallNoticeEvent => {
    const { time, type: post_type, group_id, operator_id, user_id, message_id } = scene
    return {
      time,
      self_id: Number(scene.self.bot_id),
      post_type,
      notice_type: 'group_recall',
      user_id: Number(user_id),
      group_id: Number(group_id),
      operator_id: Number(operator_id),
      message_id: Number(message_id),
    }
  },

  'notice.group_poke': (scene: GroupPokeNoticeScene): GroupPokeNotifyEvent => {
    const { time, type: post_type, user_id, group_id, target_id } = scene
    return {
      time,
      self_id: Number(scene.self.bot_id),
      post_type,
      notice_type: 'notify',
      sub_type: 'poke',
      user_id: Number(user_id),
      group_id: Number(group_id),
      target_id: Number(target_id),
    }
  },

  'notice.group_admin': (scene: GroupAdminNoticeScene): GroupAdminNoticeEvent => {
    const { time, type: post_type, detail_type: notice_type, sub_type, user_id, group_id } = scene
    return {
      time,
      self_id: Number(scene.self.bot_id),
      post_type,
      notice_type,
      sub_type,
      user_id: Number(user_id),
      group_id: Number(group_id),
    }
  },

  'notice.group_member_ban': (scene: GroupMemberBanNoticeScene): GroupBanNoticeEvent => {
    const { time, type: post_type, sub_type, group_id, operator_id, user_id, duration = 0 } = scene
    return {
      time,
      self_id: Number(scene.self.bot_id),
      post_type,
      notice_type: 'group_ban',
      sub_type,
      user_id: Number(user_id),
      group_id: Number(group_id),
      operator_id: Number(operator_id),
      duration,
    }
  },

  'notice.group_member_honor': (scene: GroupMemberHonorNoticeScene): GroupMemberHonorNotifyEvent => {
    const { time, type: post_type, user_id, group_id, honor: honor_type } = scene
    return {
      time,
      self_id: Number(scene.self.bot_id),
      post_type,
      notice_type: 'notify',
      sub_type: 'honor',
      honor_type,
      user_id: Number(user_id),
      group_id: Number(group_id),
    }
  },

  'notice.group_hongbao_lucky': (scene: GroupHongbaoLuckyNoticeScene): GroupHongbaoLuckyNotifyEvent => {
    const { time, type: post_type, user_id, group_id, target_id } = scene
    return {
      time,
      self_id: Number(scene.self.bot_id),
      post_type,
      notice_type: 'notify',
      sub_type: 'lucky_king',
      user_id: Number(user_id),
      group_id: Number(group_id),
      target_id: Number(target_id),
    }
  },

  'notice.group_file_upload': (scene: GroupFileUploadNoticeScene): GroupUploadNoticeEvent => {
    const { time, type: post_type, user_id, group_id, file } = scene
    return {
      time,
      self_id: Number(scene.self.bot_id),
      post_type,
      notice_type: 'group_upload',
      user_id: Number(user_id),
      group_id: Number(group_id),
      file: { ...file, busid: file.size },
    }
  },

  'request.add_friend': (scene: AddFriendRequestScene): FriendRequestEvent => {
    const { time, type: post_type, user_id, comment } = scene
    return {
      time,
      self_id: Number(scene.self.bot_id),
      post_type,
      request_type: 'friend',
      user_id: Number(user_id),
      comment,
      flag: scene.id,
    }
  },

  'request.join_group': (scene: JoinGroupRequestScene): GroupRequestEvent => {
    const { time, type: post_type, user_id, group_id, comment } = scene
    return {
      time,
      self_id: Number(scene.self.bot_id),
      post_type,
      request_type: 'group',
      sub_type: 'add',
      user_id: Number(user_id),
      group_id: Number(group_id),
      comment,
      flag: scene.id,
    }
  },

  'request.group_invite': (scene: GroupInviteRequestScene): GroupRequestEvent => {
    const { time, type: post_type, user_id, group_id } = scene
    return {
      time,
      self_id: Number(scene.self.bot_id),
      post_type,
      request_type: 'group',
      sub_type: 'invite',
      user_id: Number(user_id),
      group_id: Number(group_id),
      comment: '',
      flag: scene.id,
    }
  },
}

const eventParseStrategy: EventParseStrategy<EventMapping> = {
  'message.private': async (event: PrivateMessageEvent): Promise<PrivateMessageScene> => {
    const {
      time,
      self_id,
      post_type: type,
      message_type: detail_type,
      sub_type,
      message_id,
      message,
      raw_message: plain_message,
      user_id,
      sender: { nickname: user_name },
    } = event
    return {
      id: crypto.randomUUID(),
      time,
      self: {
        platform: 'qq',
        bot_id: self_id.toString(),
      },
      type,
      detail_type,
      sub_type: sub_type === 'other' ? 'temp' : sub_type,
      message_id: message_id.toString(),
      message: await messageHandler.parse(message),
      plain_message,
      user_id: user_id.toString(),
      user_name,
    }
  },

  'message.group': async (event: GroupMessageEvent): Promise<GroupMessageScene> => {
    const {
      time,
      self_id,
      post_type: type,
      message_type: detail_type,
      sub_type,
      message_id,
      message,
      raw_message: plain_message,
      user_id,
      group_id,
      anonymous,
      sender: { nickname: user_name, card, role, title, level },
    } = event
    const member = await db.members.get({ userId: user_id, groupId: group_id })
    const group = await db.groups.get(group_id)
    return {
      id: crypto.randomUUID(),
      time,
      self: {
        platform: 'qq',
        bot_id: self_id.toString(),
      },
      type,
      detail_type,
      sub_type: sub_type as 'normal' | 'anonymous',
      message_id: message_id.toString(),
      message: await messageHandler.parse(message),
      plain_message,
      user_id: user_id.toString(),
      user_name,
      group_id: group_id.toString(),
      group_name: group!.name,
      anonymous,
      member: {
        card,
        role,
        title,
        rank: level,
        level: member!.level,
      },
    }
  },

  'notice.group_upload': async (event: GroupUploadNoticeEvent): Promise<GroupFileUploadNoticeScene> => {
    const { time, self_id, post_type: type, user_id, group_id, file } = event
    const user = await db.users.get(user_id)
    const group = await db.groups.get(group_id)
    return {
      id: crypto.randomUUID(),
      time,
      self: {
        platform: 'qq',
        bot_id: self_id.toString(),
      },
      type,
      detail_type: 'group_file_upload',
      user_id: user_id.toString(),
      user_name: user!.name,
      group_id: group_id.toString(),
      group_name: group!.name,
      file,
    }
  },

  'notice.group_admin': async (event: GroupAdminNoticeEvent): Promise<GroupAdminNoticeScene> => {
    const { time, self_id, post_type: type, notice_type: detail_type, sub_type, user_id, group_id } = event
    const user = await db.users.get(user_id)
    const group = await db.groups.get(group_id)
    const status = useStatusStore()
    return {
      id: crypto.randomUUID(),
      time,
      self: {
        platform: 'qq',
        bot_id: self_id.toString(),
      },
      type,
      detail_type,
      sub_type,
      user_id: user_id.toString(),
      user_name: user!.name,
      group_id: group_id.toString(),
      group_name: group!.name,
      operator_id: status.bot!.id.toString(),
      operator_name: status.bot!.name,
    }
  },

  'notice.group_decrease': async (event: GroupDecreaseNoticeEvent): Promise<GroupMemberDecreaseNoticeScene> => {
    const { time, self_id, post_type: type, sub_type, user_id, group_id } = event
    const user = await db.users.get(user_id)
    const group = await db.groups.get(group_id)
    const status = useStatusStore()
    return {
      id: crypto.randomUUID(),
      time,
      self: {
        platform: 'qq',
        bot_id: self_id.toString(),
      },
      type,
      detail_type: 'group_member_decrease',
      sub_type: sub_type === 'leave' ? 'leave' : 'remove',
      user_id: user_id.toString(),
      user_name: user!.name,
      group_id: group_id.toString(),
      group_name: group!.name,
      operator_id: status.bot!.id.toString(),
      operator_name: status.bot!.name,
    }
  },

  'notice.group_increase': async (event: GroupIncreaseNoticeEvent): Promise<GroupMemberIncreaseNoticeScene> => {
    const { time, self_id, post_type: type, sub_type, user_id, group_id } = event
    const user = await db.users.get(user_id)
    const group = await db.groups.get(group_id)
    const status = useStatusStore()
    return {
      id: crypto.randomUUID(),
      time,
      self: {
        platform: 'qq',
        bot_id: self_id.toString(),
      },
      type,
      detail_type: 'group_member_increase',
      sub_type: sub_type === 'approve' ? 'join' : sub_type,
      user_id: user_id.toString(),
      user_name: user!.name,
      group_id: group_id.toString(),
      group_name: group!.name,
      operator_id: status.bot!.id.toString(),
      operator_name: status.bot!.name,
    }
  },

  'notice.group_ban': async (event: GroupBanNoticeEvent): Promise<GroupMemberBanNoticeScene> => {
    const { time, self_id, post_type: type, sub_type, user_id, group_id } = event
    const user = await db.users.get(user_id)
    const group = await db.groups.get(group_id)
    const status = useStatusStore()
    return {
      id: crypto.randomUUID(),
      time,
      self: {
        platform: 'qq',
        bot_id: self_id.toString(),
      },
      type,
      detail_type: 'group_member_ban',
      sub_type,
      user_id: user_id.toString(),
      user_name: user!.name,
      group_id: group_id.toString(),
      group_name: group!.name,
      operator_id: status.bot!.id.toString(),
      operator_name: status.bot!.name,
    }
  },

  'notice.friend_add': async (event: FriendAddNoticeEvent): Promise<FriendIncreaseNoticeScene> => {
    const { time, self_id, post_type: type, user_id } = event
    const user = await db.users.get(user_id)
    return {
      id: crypto.randomUUID(),
      time,
      self: {
        platform: 'qq',
        bot_id: self_id.toString(),
      },
      type,
      detail_type: 'friend_increase',
      user_id: user_id.toString(),
      user_name: user!.name,
    }
  },

  'notice.group_recall': async (event: GroupRecallNoticeEvent): Promise<GroupMessageDeleteNoticeScene> => {
    const { time, self_id, post_type: type, user_id, group_id, message_id } = event
    const user = await db.users.get(user_id)
    const group = await db.groups.get(group_id)
    const member = await db.members.get({ groupId: group_id, userId: self_id })
    const status = useStatusStore()
    let sub_type: 'delete' | 'recall'
    if (member!.role !== 'member' && user_id !== status.bot!.id) {
      sub_type = 'delete'
    } else {
      sub_type = 'recall'
    }
    return {
      id: crypto.randomUUID(),
      time,
      self: {
        platform: 'qq',
        bot_id: self_id.toString(),
      },
      type,
      detail_type: 'group_message_delete',
      sub_type,
      user_id: user_id.toString(),
      user_name: user!.name,
      group_id: group_id.toString(),
      group_name: group!.name,
      operator_id: status.bot!.id.toString(),
      operator_name: status.bot!.name,
      message_id: message_id.toString(),
    }
  },

  'notice.friend_recall': async (event: FriendRecallNoticeEvent): Promise<PrivateMessageDeleteNoticeScene> => {
    const { time, self_id, post_type: type, user_id, message_id } = event
    const user = await db.users.get(user_id)
    return {
      id: crypto.randomUUID(),
      time,
      self: {
        platform: 'qq',
        bot_id: self_id.toString(),
      },
      type,
      detail_type: 'private_message_delete',
      user_id: user_id.toString(),
      user_name: user!.name,
      message_id: message_id.toString(),
    }
  },

  'notice.notify.poke': async (event: GroupPokeNotifyEvent): Promise<GroupPokeNoticeScene> => {
    const { time, self_id, post_type: type, user_id, group_id, target_id } = event
    const user = await db.users.get(user_id)
    const group = await db.groups.get(group_id)
    const target = await db.users.get(target_id)
    return {
      id: crypto.randomUUID(),
      time,
      self: {
        platform: 'qq',
        bot_id: self_id.toString(),
      },
      type,
      detail_type: 'group_poke',
      user_id: user_id.toString(),
      user_name: user!.name,
      group_id: group_id.toString(),
      group_name: group!.name,
      target_id: target_id.toString(),
      target_name: target!.name,
    }
  },

  'notice.notify.lucky_king': async (event: GroupHongbaoLuckyNotifyEvent): Promise<GroupHongbaoLuckyNoticeScene> => {
    const { time, self_id, post_type: type, user_id, group_id, target_id } = event
    const user = await db.users.get(user_id)
    const group = await db.groups.get(group_id)
    const target = await db.users.get(target_id)
    return {
      id: crypto.randomUUID(),
      time,
      self: {
        platform: 'qq',
        bot_id: self_id.toString(),
      },
      type,
      detail_type: 'group_hongbao_lucky',
      user_id: user_id.toString(),
      user_name: user!.name,
      group_id: group_id.toString(),
      group_name: group!.name,
      target_id: target_id.toString(),
      target_name: target!.name,
    }
  },

  'notice.notify.honor': async (event: GroupMemberHonorNotifyEvent): Promise<GroupMemberHonorNoticeScene> => {
    const { time, self_id, post_type: type, user_id, group_id, honor_type: honor } = event
    const user = await db.users.get(user_id)
    const group = await db.groups.get(group_id)
    return {
      id: crypto.randomUUID(),
      time,
      self: {
        platform: 'qq',
        bot_id: self_id.toString(),
      },
      type,
      detail_type: 'group_member_honor',
      user_id: user_id.toString(),
      user_name: user!.name,
      group_id: group_id.toString(),
      group_name: group!.name,
      honor,
    }
  },

  'request.friend': async (event: FriendRequestEvent): Promise<AddFriendRequestScene> => {
    const { time, self_id, post_type: type, user_id, comment } = event
    const user = await db.users.get(user_id)
    return {
      id: crypto.randomUUID(),
      time,
      self: {
        platform: 'qq',
        bot_id: self_id.toString(),
      },
      type,
      detail_type: 'add_friend',
      user_id: user_id.toString(),
      user_name: user!.name,
      comment,
    }
  },

  'request.group': async (event: GroupRequestEvent): Promise<JoinGroupRequestScene | GroupInviteRequestScene> => {
    const { time, self_id, post_type: type, sub_type, user_id, group_id, comment } = event
    const user = await db.users.get(user_id)
    const group = await db.groups.get(group_id)
    const groupRequest = {
      id: crypto.randomUUID(),
      time,
      self: {
        platform: 'qq',
        bot_id: self_id.toString(),
      },
      type,
      user_id: user_id.toString(),
      user_name: user!.name,
      group_id: group_id.toString(),
      group_name: group!.name,
    }
    if (sub_type === 'add') {
      return {
        ...groupRequest,
        detail_type: 'join_group',
        comment,
      }
    } else {
      return {
        ...groupRequest,
        detail_type: 'group_invite',
      }
    }
  },
}

export class EventHandler extends AdapterEventHandler<Events> {
  readonly buildStrategy = eventBuildStrategy
  readonly parseStrategy = eventParseStrategy

  getEventKey(event: Events): string {
    const { post_type: postType, sub_type: subType }: { post_type: string; sub_type?: string } = event
    let detailType
    switch (event.post_type) {
      case 'message': {
        detailType = event.message_type
        break
      }
      case 'notice': {
        detailType = event.notice_type
        break
      }
      case 'request': {
        detailType = event.request_type
        break
      }
      default:
        throw new Error('意外的事件类型')
    }
    return this.createKey(postType, detailType, subType)
  }
}
