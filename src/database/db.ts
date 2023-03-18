import Dexie, { Table } from 'dexie'

import type { User, Friend, Group, Member } from './model'

export class MatchaDB extends Dexie {
  users!: Table<User, number>
  friends!: Table<Friend, [number, number]>
  groups!: Table<Group, number>
  members!: Table<Member, [number, number]>

  constructor() {
    super('matcha')
    this.version(1).stores({
      users: 'id',
      friends: '[userId+friendId], userId, friendId',
      groups: 'id',
      members: '[groupId+userId], groupId, userId',
    })
  }
}

export const db = new MatchaDB()
