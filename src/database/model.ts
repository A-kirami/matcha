export interface User {
  /** QQ */
  id: number
  /** 昵称 */
  name: string
  /** 性别 */
  sex?: 'male' | 'female' | 'unknown'
  /** 生日 */
  birthday?: number
  /** 所在地 */
  location?: string
  /** 故乡 */
  hometown?: string
  /** 个性签名 */
  sign?: string
  /** ID 身份卡 */
  qid?: string
  /** 等级 */
  level?: number
  /** 连续登陆天数 */
  loginDays?: number
}

export interface Friend {
  /** QQ */
  userId: number
  /** 好友 ID */
  friendId: number
  /** 备注 */
  remark: string
}

export interface Group {
  /** 群号 */
  id: number
  /** 群名 */
  name: string
  /** 创建时间 */
  time?: number
  /** 群介绍 */
  intro?: string
  /** 等级 */
  level?: number
  /** 当前成员数 */
  memberCount: number
  /** 最大成员数 */
  maxMemberCount: number
}

export interface Member {
  /** 所在群号 */
  groupId: number
  /** QQ */
  userId: number
  /** 群名片 */
  card: string
  /** 群权限 */
  role: 'owner' | 'admin' | 'member'
  /** 群聊等级 */
  level: number
  /** 等级头衔 */
  rank: string
  /** 专属头衔 */
  title: string
  /** 加群时间 */
  joinTime?: number
  /** 最后发言时间 */
  lastSentTime?: number
  /** 头衔过期时间 */
  titleExpireTime?: number
  /** 禁言到期时间 */
  banExpireTime?: number
}
