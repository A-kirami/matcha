import Dexie from 'dexie'

import { getTimestamp } from '@/utils'

import type { User, Friend, Group, Member, CacheFile } from './model'
import type { Table } from 'dexie'

export class MatchaDB extends Dexie {
  users!: Table<User, string>
  friends!: Table<Friend, [string, string]>
  groups!: Table<Group, string>
  members!: Table<Member, [string, string]>
  files!: Table<CacheFile, string>

  constructor() {
    super('matcha')
    this.version(2)
      .stores({
        users: 'id',
        friends: '[userId+friendId], userId, friendId',
        groups: 'id',
        members: '[groupId+userId], groupId, userId',
      })
      .upgrade((trans) => {
        const statusData = localStorage.getItem('status')
        if (statusData) {
          const status = JSON.parse(statusData)
          status.assignBot = status.assignBot.toString()
          status.assignUser = status.assignUser.toString()
          localStorage.setItem('status', JSON.stringify(status))
        }
        const users = trans.table('users').toCollection()
        users.modify((user) => {
          user.id = user.id.toString()
          user.sex ??= 'unknown'
          user.birthdate = user.birthday
          delete user.birthday
          user.location ??= ''
          user.hometown ??= ''
          user.sign ??= ''
          user.qid ??= ''
          user.level ??= 0
          user.loginDays ??= 0
        })

        const friends = trans.table('friends').toCollection()
        friends.modify((friend) => {
          friend.userId = friend.userId.toString()
          friend.friendId = friend.friendId.toString()
        })

        const groups = trans.table('groups').toCollection()
        groups.modify((group) => {
          group.id = group.id.toString()
          group.time ??= getTimestamp()
          group.intro ??= ''
          group.level ??= 1
          group.wholeBanned = false
        })

        const members = trans.table('members').toCollection()
        members.modify((member) => {
          member.groupId = member.groupId.toString()
          member.userId = member.userId.toString()
          delete member.rank
          member.joinTime ??= getTimestamp()
          delete member.lastSentTime
          member.titleExpireTime ??= 0
          member.banExpireTime ??= 0
        })
      })
    this.version(3).stores({ files: 'id, sha256' })
  }
}

export const db = new MatchaDB()
