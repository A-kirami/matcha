export interface User {
  /** 注册时间 */
  regTime: number
  /** QQ */
  id: string
  /** 昵称 */
  name: string
  /** 性别 */
  sex: 'male' | 'female' | 'unknown'
  /** 出生日期 */
  birthdate?: number
  /** 所在地 */
  location: string
  /** 故乡 */
  hometown: string
  /** 个性签名 */
  sign: string
  /** ID 身份卡 */
  qid: string
  /** 等级 */
  level: number
  /** 连续登陆天数 */
  loginDays: number
  /** 上次使用时间 */
  lastUseTime: number
}

export interface Friend {
  /** QQ */
  userId: string
  /** 好友 ID */
  friendId: string
  /** 备注 */
  remark: string
}

export interface Group {
  /** 群号 */
  id: string
  /** 群名 */
  name: string
  /** 创建时间 */
  time: number
  /** 群介绍 */
  intro: string
  /** 等级 */
  level: number
  /** 当前成员数 */
  memberCount: number
  /** 最大成员数 */
  maxMemberCount: number
  /** 是否启用全体禁言 */
  wholeBanned: boolean
  /** 最后一条消息的时间 */
  lastMessageTime: number
}

export interface Member {
  /** 所在群号 */
  groupId: string
  /** QQ */
  userId: string
  /** 群名片 */
  card: string
  /** 群权限 */
  role: 'owner' | 'admin' | 'member'
  /** 群聊等级 */
  level: number
  /** 专属头衔 */
  title: string
  /** 加群时间 */
  joinTime: number
  /** 头衔过期时间 */
  titleExpireTime: number
  /** 禁言到期时间 */
  banExpireTime: number
}

export interface CacheFile {
  /** 文件 ID */
  id: string
  /** 文件名 */
  name: string
  /** 文件大小 */
  size: number
  /** 文件数据的 SHA256 校验和 */
  sha256: string
}
