/* eslint-disable camelcase */
import { AdapterEventHandler } from '~/adapter/event'

import { MessageHandler } from './message'

import type { Messages } from './message'
import type { Self, Status, Version } from './typed'
import type { Event as BaseEvent, EventStrategy } from '~/adapter/event'
import type {
  SceneMapping,
  PrivateMessageScene,
  GroupMessageScene,
  FriendIncreaseNoticeScene,
  FriendDecreaseNoticeScene,
  PrivateMessageDeleteNoticeScene,
  GroupMemberIncreaseNoticeScene,
  GroupMemberDecreaseNoticeScene,
  GroupMessageDeleteNoticeScene,
} from '~/adapter/scene'

/** 事件 */
interface Event extends BaseEvent {
  /** 事件唯一标识符 */
  id: string

  /** 事件发生的时间戳 */
  time: number

  /** 事件类型 */
  type: 'meta' | 'message' | 'notice' | 'request'

  /** 事件详细类型 */
  detail_type: string

  /** 事件子类型（详细类型的下一级类型） */
  sub_type: string

  /** 机器人自身标识 */
  self?: Self
}

/** 元事件 */
interface MetaEvent extends Event {
  type: 'meta'
}

/** 连接事件 */
export interface ConnectMetaEvent extends MetaEvent {
  detail_type: 'connect'
  version: Version
}

/** 心跳事件 */
export interface HeartbeatMetaEvent extends MetaEvent {
  detail_type: 'heartbeat'
  interval: number
}

/** 状态更新事件 */
export interface StatusUpdateMetaEvent extends MetaEvent {
  detail_type: 'status_update'
  status: Status
}

/** 消息事件 */
interface MessageEvent extends Required<Event> {
  type: 'message'
  detail_type: 'private' | 'group'
  message_id: string
  message: Messages[]
  alt_message: string
  user_id: string
}

/** 私聊消息 */
export interface PrivateMessageEvent extends MessageEvent {
  detail_type: 'private'
}

/** 群消息 */
export interface GroupMessageEvent extends MessageEvent {
  detail_type: 'group'
  group_id: string
}

/** 通知事件 */
interface NoticeEvent extends Required<Event> {
  type: 'notice'
}

/** 好友增加 */
export interface FriendIncreaseNoticeEvent extends NoticeEvent {
  detail_type: 'friend_increase'
  user_id: string
}

/** 好友增加 */
export interface FriendDecreaseNoticeEvent extends NoticeEvent {
  detail_type: 'friend_decrease'
  user_id: string
}

/** 私聊消息删除 */
export interface PrivateMessageDeleteNoticeEvent extends NoticeEvent {
  detail_type: 'private_message_delete'
  message_id: string
  user_id: string
}

/** 群成员增加 */
export interface GroupMemberIncreaseNoticeEvent extends NoticeEvent {
  detail_type: 'group_member_increase'
  sub_type: 'join' | 'invite' | ''
  group_id: string
  user_id: string
  operator_id: string
}

/** 群成员减少 */
export interface GroupMemberDecreaseNoticeEvent extends NoticeEvent {
  detail_type: 'group_member_decrease'
  sub_type: 'leave' | 'kick' | ''
  group_id: string
  user_id: string
  operator_id: string
}

/** 群消息删除 */
export interface GroupMessageDeleteNoticeEvent extends NoticeEvent {
  detail_type: 'group_message_delete'
  sub_type: 'recall' | 'delete' | ''
  group_id: string
  user_id: string
  message_id: string
  operator_id: string
}

export type Events =
  | PrivateMessageEvent
  | GroupMessageEvent
  | FriendIncreaseNoticeEvent
  | FriendDecreaseNoticeEvent
  | PrivateMessageDeleteNoticeEvent
  | GroupMemberIncreaseNoticeEvent
  | GroupMemberDecreaseNoticeEvent
  | GroupMessageDeleteNoticeEvent

const messageHandler = new MessageHandler()

const eventStrategy: EventStrategy<SceneMapping<Messages>> = {
  'message.private': async (scene: PrivateMessageScene<Messages>): Promise<PrivateMessageEvent> => {
    const { id, time, type, detail_type, sub_type, user_id, message_id, message, plain_message: alt_message } = scene
    return {
      id,
      time,
      type,
      detail_type,
      sub_type,
      self: {
        platform: 'matcha',
        user_id: scene.self_id,
      },
      user_id,
      message_id,
      message: await messageHandler.build(message),
      alt_message,
    }
  },

  'message.group': async (scene: GroupMessageScene<Messages>): Promise<GroupMessageEvent> => {
    const {
      id,
      time,
      type,
      detail_type,
      sub_type,
      user_id,
      group_id,
      message_id,
      message,
      plain_message: alt_message,
    } = scene
    return {
      id,
      time,
      type,
      detail_type,
      sub_type,
      self: {
        platform: 'matcha',
        user_id: scene.self_id,
      },
      user_id,
      group_id,
      message_id,
      message: await messageHandler.build(message),
      alt_message,
    }
  },

  'notice.friend_increase': (scene: FriendIncreaseNoticeScene): FriendIncreaseNoticeEvent => {
    const { id, time, type, detail_type, user_id } = scene
    return {
      id,
      time,
      type,
      detail_type,
      sub_type: '',
      self: {
        platform: 'matcha',
        user_id: scene.self_id,
      },
      user_id,
    }
  },

  'notice.friend_decrease': (scene: FriendDecreaseNoticeScene): FriendDecreaseNoticeEvent => {
    const { id, time, type, detail_type, user_id } = scene
    return {
      id,
      time,
      type,
      detail_type,
      sub_type: '',
      self: {
        platform: 'matcha',
        user_id: scene.self_id,
      },
      user_id,
    }
  },

  'notice.private_message_delete': (scene: PrivateMessageDeleteNoticeScene): PrivateMessageDeleteNoticeEvent => {
    const { id, time, type, detail_type, user_id, message_id } = scene
    return {
      id,
      time,
      type,
      detail_type,
      sub_type: '',
      self: {
        platform: 'matcha',
        user_id: scene.self_id,
      },
      notice_type: 'friend_recall',
      user_id,
      message_id,
    }
  },

  'notice.group_member_increase': (scene: GroupMemberIncreaseNoticeScene): GroupMemberIncreaseNoticeEvent => {
    const { id, time, type, detail_type, sub_type, group_id, operator_id, user_id } = scene
    return {
      id,
      time,
      type,
      detail_type,
      self: {
        platform: 'matcha',
        user_id: scene.self_id,
      },
      notice_type: 'group_increase',
      sub_type,
      user_id,
      group_id,
      operator_id,
    }
  },

  'notice.group_member_decrease': (scene: GroupMemberDecreaseNoticeScene): GroupMemberDecreaseNoticeEvent => {
    const { id, time, type, detail_type, sub_type, group_id, operator_id, user_id } = scene
    return {
      id,
      time,
      type,
      detail_type,
      self: {
        platform: 'matcha',
        user_id: scene.self_id,
      },
      notice_type: 'group_decrease',
      sub_type: sub_type === 'leave' ? 'leave' : 'kick',
      user_id,
      group_id,
      operator_id,
    }
  },

  'notice.group_message_delete': (scene: GroupMessageDeleteNoticeScene): GroupMessageDeleteNoticeEvent => {
    const { id, time, type, detail_type, sub_type, group_id, operator_id, user_id, message_id } = scene
    return {
      id,
      time,
      type,
      detail_type,
      sub_type,
      self: {
        platform: 'matcha',
        user_id: scene.self_id,
      },
      notice_type: 'group_recall',
      user_id,
      group_id,
      operator_id,
      message_id,
    }
  },
}

export class EventHandler extends AdapterEventHandler<Events> {
  readonly strategy = eventStrategy
}
