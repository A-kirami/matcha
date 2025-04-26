import { Dexie } from 'dexie'

import type { Table } from 'dexie'

class MatchaDB extends Dexie {
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
      .upgrade(async (trans) => {
        const users = trans.table<User & { birthday?: number }>('users').toCollection()
        await users.modify((user) => {
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

        const friends = trans.table<Friend>('friends').toCollection()
        await friends.modify((friend) => {
          friend.userId = friend.userId.toString()
          friend.friendId = friend.friendId.toString()
        })

        const groups = trans.table<Group>('groups').toCollection()
        await groups.modify((group) => {
          group.id = group.id.toString()
          group.time ??= getTimestamp()
          group.intro ??= ''
          group.level ??= 1
          group.wholeBanned = false
        })

        const members = trans.table<Member & { rank?: string, lastSentTime?: number }>('members').toCollection()
        await members.modify((member) => {
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
    this.version(4).upgrade(async (trans) => {
      const users = trans.table<User>('users').toCollection()
      await users.modify((user) => {
        user.lastUseTime ??= 0
      })

      const groups = trans.table<Group>('groups').toCollection()
      await groups.modify((group) => {
        group.lastMessageTime ??= 0
      })
    })
  }
}

export const db = new MatchaDB()
