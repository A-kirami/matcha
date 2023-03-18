export type StrKeyObject<T = unknown> = Record<string, T>

export type ValueOf<T> = T[keyof T]

export interface Context {
  chatType: 'private' | 'group'
  chatId: string
}
