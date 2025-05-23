import type { ActionRequest as BaseActionRequest, ActionResponse as BaseActionResponse } from '~/adapter/action'

export type ActionRequest = BaseActionRequest & { self?: Self }

export type ActionResponse<D = unknown> = BaseActionResponse<D> & { message: string }

export interface Self {
  platform: string
  user_id: string
}

export interface Status {
  good: boolean
  bots: {
    self: Self
    online: boolean
  }[]
}

export interface Version {
  impl: string
  version: string
  onebot_version: string
}

export interface UserInfo {
  user_id: string
  user_name: string
  user_displayname: string
}

export interface GroupInfo {
  group_id: string
  group_name: string
}

type FileType = 'url' | 'path' | 'data'

interface FileInfo<T extends FileType = never> {
  name: string
  sha256?: string
  type?: T
}

export type FileURL<T extends FileType = never> = FileInfo<T> & { url: string, headers?: string }

export type FilePath<T extends FileType = never> = FileInfo<T> & { path: string }

export type FileData<T extends FileType = never> = FileInfo<T> & {
  data: string | Uint8Array | { str?: string, binary?: Uint8Array }
}
