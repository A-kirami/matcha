import type { Contents } from './content'
import type { Message } from './message'
import type { ValueOf } from './typed'

interface Scene {
  /** 事件唯一标识符 */
  id: string
  /** 事件发生时间（Unix 时间戳），单位：秒 */
  time: number
  /** 机器人自身标识 */
  self: {
    platform: string
    bot_id: string
  }
  /** 事件类型，必须是 meta、message、notice、request 中的一个，分别表示元事件、消息事件、通知事件和请求事件 */
  type: 'message' | 'notice' | 'request'
}

interface MessageScene<T extends Message = Message> extends Scene {
  type: 'message'
  detail_type: 'private' | 'group'
  sub_type: string
  /** 消息 ID */
  message_id: string
  /** 消息内容 */
  message: Contents[]
  /** 未经转换的原始消息 */
  original_message?: T[]
  /** 纯文本格式消息 */
  plain_message: string
  /** 发送者 ID */
  user_id: string
  /** 发送者昵称 */
  user_name: string
}

/** 私聊消息 */
export interface PrivateMessageScene<T extends Message = Message> extends MessageScene<T> {
  detail_type: 'private'
  sub_type: 'friend' | 'group' | 'temp'
}

/** 群聊消息 */
export interface GroupMessageScene<T extends Message = Message> extends MessageScene<T> {
  detail_type: 'group'
  sub_type: 'normal' | 'anonymous'
  /** 群号 */
  group_id: string
  /** 群名 */
  group_name: string
  /** 匿名信息 */
  anonymous: { id: number; name: string } | null
  /** 成员信息 */
  member: MemberInfo
}

interface MemberInfo {
  /** 群名片 */
  card: string
  /** 群权限 */
  role: 'owner' | 'admin' | 'member'
  /** 群成员等级 lv.0-lv.100 */
  level: number
  /** 专属头衔 */
  title: string
}

interface NoticeScene extends Scene {
  type: 'notice'
  detail_type: string
}

interface PrivateNoticeScene extends NoticeScene {
  user_id: string
  user_name: string
}

/** 好友增加 */
export interface FriendIncreaseNoticeScene extends PrivateNoticeScene {
  detail_type: 'friend_increase'
}

/** 好友减少 */
export interface FriendDecreaseNoticeScene extends PrivateNoticeScene {
  detail_type: 'friend_decrease'
}

/** 私聊消息撤回 */
export interface PrivateMessageDeleteNoticeScene extends PrivateNoticeScene {
  detail_type: 'private_message_delete'
  message_id: string
}

/** 私聊戳一戳（非好友是否能够使用？） */
export interface FriendPokeNoticeScene extends PrivateNoticeScene {
  detail_type: 'friend_poke'
  target_id: string
  target_name: string
}

/** 离线文件接收 */
export interface OfflineFileNoticeScene extends PrivateNoticeScene {
  detail_type: 'offline_file'
  file: File
}

interface File {
  id: string
  name: string
  size: number
  url?: string
}

interface GroupNoticeScene extends NoticeScene {
  group_id: string
  group_name: string
  user_id: string
  user_name: string
}

interface GroupOperateNoticeScene extends GroupNoticeScene {
  operator_id: string
  operator_name: string
}

/** 群成员增加 */
export interface GroupMemberIncreaseNoticeScene extends GroupOperateNoticeScene {
  detail_type: 'group_member_increase'
  sub_type: 'join' | 'invite'
}

/** 群成员减少 */
export interface GroupMemberDecreaseNoticeScene extends GroupOperateNoticeScene {
  detail_type: 'group_member_decrease'
  sub_type: 'leave' | 'remove'
}

/** 群聊消息撤回 */
export interface GroupMessageDeleteNoticeScene extends GroupOperateNoticeScene {
  detail_type: 'group_message_delete'
  sub_type: 'recall' | 'delete'
  message_id: string
}

/** 群聊戳一戳 */
export interface GroupPokeNoticeScene extends GroupNoticeScene {
  detail_type: 'group_poke'
  target_id: string
  target_name: string
}

/** 群管理员变动 */
export interface GroupAdminNoticeScene extends GroupOperateNoticeScene {
  detail_type: 'group_admin'
  sub_type: 'set' | 'unset'
}

/** 群成员禁言 */
export interface GroupMemberBanNoticeScene extends GroupOperateNoticeScene {
  detail_type: 'group_member_ban'
  sub_type: 'ban' | 'lift_ban'
  duration?: number
}

/** 开启/关闭群全体禁言 */
export interface GroupAllBanNoticeScene extends GroupOperateNoticeScene {
  detail_type: 'group_all_ban'
  sub_type: 'open' | 'close'
}

/** 允许/禁止群匿名聊天 */
export interface GroupAnonymousNoticeScene extends GroupOperateNoticeScene {
  detail_type: 'group_anonymous'
  sub_type: 'allow' | 'block'
}

/** 群名称更新 */
export interface GroupNameNoticeScene extends GroupOperateNoticeScene {
  detail_type: 'group_name'
}

/** 群成员名片更新 */
export interface GroupMemberCardNoticeScene extends GroupOperateNoticeScene {
  detail_type: 'group_member_card'
  card: string
  // 能否取得 old card?
}

/** 群成员头衔变更 */
export interface GroupMemberTitleNoticeScene extends GroupOperateNoticeScene {
  detail_type: 'group_member_title'
  title: string
}

/** 群成员荣誉变更 */
export interface GroupMemberHonorNoticeScene extends GroupNoticeScene {
  detail_type: 'group_member_honor'
  honor: 'talkative' | 'performer' | 'emotion'
}

/** 精华消息变更 */
export interface GroupEssenceNoticeScene extends GroupNoticeScene {
  detail_type: 'group_essence'
  sub_type: 'add' | 'remove'
  message_id: number
}

/** 群红包运气王 */
export interface GroupHongbaoLuckyNoticeScene extends GroupNoticeScene {
  detail_type: 'group_hongbao_lucky'
  target_id: string
  target_name: string
}

/** 群文件上传 */
export interface GroupFileUploadNoticeScene extends GroupNoticeScene {
  detail_type: 'group_file_upload'
  file: File
}

/** 客户端在线状态 */
export interface ClientStatusNoticeScene extends NoticeScene {
  detail_type: 'client_status'
  status: {
    /** 客户端 ID */
    app_id: number
    /** 设备名称 */
    device_name: string
    /** 设备类型 */
    device_kind: string
    /** 当前是否在线 */
    online: boolean
  }
}

interface RequestScene extends Scene {
  type: 'request'
}

/** 好友申请 */
export interface AddFriendRequestScene extends RequestScene {
  detail_type: 'add_friend'
  user_id: string
  user_name: string
  /** 请求信息 */
  comment: string
}

/** 加群申请 */
export interface JoinGroupRequestScene extends RequestScene {
  detail_type: 'join_group'
  user_id: string
  user_name: string
  group_id: string
  group_name: string
  operator_id?: string
  operator_name?: string
  /** 请求信息 */
  comment: string
}

/** 邀请进群 */
export interface GroupInviteRequestScene extends RequestScene {
  detail_type: 'group_invite'
  user_id: string
  user_name: string
  group_id: string
  group_name: string
}

export interface SceneMapping<T extends Message = Message> {
  'message.private': PrivateMessageScene<T>
  'message.group': GroupMessageScene<T>
  'notice.friend_increase': FriendIncreaseNoticeScene
  'notice.friend_decrease': FriendDecreaseNoticeScene
  'notice.private_message_delete': PrivateMessageDeleteNoticeScene
  'notice.friend_poke': FriendPokeNoticeScene
  'notice.offline_file': OfflineFileNoticeScene
  'notice.group_member_increase': GroupMemberIncreaseNoticeScene
  'notice.group_member_decrease': GroupMemberDecreaseNoticeScene
  'notice.group_message_delete': GroupMessageDeleteNoticeScene
  'notice.group_poke': GroupPokeNoticeScene
  'notice.group_admin': GroupAdminNoticeScene
  'notice.group_member_ban': GroupMemberBanNoticeScene
  'notice.group_all_ban': GroupAllBanNoticeScene
  'notice.group_anonymous': GroupAnonymousNoticeScene
  'notice.group_name': GroupNameNoticeScene
  'notice.group_member_card': GroupMemberCardNoticeScene
  'notice.group_member_title': GroupMemberTitleNoticeScene
  'notice.group_member_honor': GroupMemberHonorNoticeScene
  'notice.group_essence': GroupEssenceNoticeScene
  'notice.group_hongbao_lucky': GroupHongbaoLuckyNoticeScene
  'notice.group_file_upload': GroupFileUploadNoticeScene
  // 'notice.client_status': ClientStatusNoticeScene
  'request.add_friend': AddFriendRequestScene
  'request.join_group': JoinGroupRequestScene
  'request.group_invite': GroupInviteRequestScene
}

export type Scenes = ValueOf<SceneMapping>
