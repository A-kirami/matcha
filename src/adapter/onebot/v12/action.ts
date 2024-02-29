/* eslint-disable camelcase */
import { getVersion } from '@tauri-apps/api/app'
import { invoke } from '@tauri-apps/api/core'

import { AdapterActionHandler } from '~/adapter/action'
import { Behav } from '~/adapter/behav'
import { UnsupportedActionError, InternalHandlerError, ProtocolError } from '~/adapter/errors'

import { MessageHandler } from './message'
import { response } from './utils'

import type { Messages } from './message'
import type { ActionResponse, ActionRequest, Status, Version, UserInfo, GroupInfo } from './typed'
import type { ActionStrategy } from '~/adapter/action'

const messageHandler = new MessageHandler()

export class ActionHandler extends AdapterActionHandler {
  readonly strategy = actionStrategy

  async handle({ action, params }: ActionRequest): Promise<ActionResponse> {
    try {
      const func = this.strategy[action]
      if (!func) {
        throw new UnsupportedActionError(response(10002, null, '不支持的动作请求'))
      }
      const asyncFn = asyncWrapper<ActionResponse>(func)
      return await asyncFn(params)
    } catch (error) {
      const errStr = (error as Error).toString()
      logger.error(errStr)
      if (error instanceof ProtocolError) {
        throw error
      } else {
        throw new InternalHandlerError(response(20002, null, errStr))
      }
    }
  }
}

const fileFragmented = new Map<string, { name: string; total_size: number }>()

const actionStrategy: ActionStrategy<ActionResponse> = {
  'get_supported_actions': (): ActionResponse<string[]> => {
    return response(0, Object.keys(actionStrategy))
  },

  'get_status': (): ActionResponse<Status> => {
    const status = useStatusStore()
    return response(0, {
      good: true,
      bots: [
        {
          self: {
            platform: 'qq',
            user_id: status.assignBot,
          },
          online: true,
        },
      ],
    })
  },

  'get_version': async (): Promise<ActionResponse<Version>> => {
    return response(0, {
      impl: 'matcha',
      version: await getVersion(),
      onebot_version: '12',
    })
  },

  'send_message': async ({
    detail_type,
    user_id,
    group_id,
    message,
  }: {
    detail_type: 'private' | 'group'
    user_id?: string
    group_id?: string
    message: Messages[]
  }): Promise<ActionResponse<{ message_id: string; time: number }>> => {
    let receiver
    if (detail_type === 'private') {
      receiver = await db.users.get(user_id!)
      if (!receiver) {
        return response(1404, null, '用户不存在')
      }
    } else if (detail_type === 'group') {
      receiver = await db.groups.get(group_id!)
      if (!receiver) {
        return response(1404, null, '群组不存在')
      }
    } else {
      return response(1404, null, '不支持发送')
    }
    const contents = await messageHandler.parse(message)
    const behav = new Behav()
    const scene = await behav.sendMessage(detail_type, behav.status.bot!, receiver, contents)
    return response(0, { message_id: scene.message_id, time: scene.time })
  },

  'delete_message': async ({ message_id }: { message_id: string }): Promise<ActionResponse<null>> => {
    const behav = new Behav()
    await behav.recallMessage(message_id.toString(), behav.status.assignBot)
    return response(0)
  },

  'get_self_info': (): ActionResponse<UserInfo> => {
    const status = useStatusStore()
    return response(0, {
      user_id: status.assignBot,
      user_name: status.bot!.name,
      user_displayname: '',
    })
  },

  'get_user_info': async ({
    user_id,
  }: {
    user_id: string
  }): Promise<ActionResponse<UserInfo & { user_remark: string }>> => {
    const user = await db.users.get(user_id)
    if (!user) {
      return response(1404, null, '用户不存在')
    }
    const status = useStatusStore()
    const friend = await db.friends.get({ userId: status.assignBot, friendId: user.id })
    return response(0, {
      user_id: user.id,
      user_name: user.name,
      user_displayname: '',
      user_remark: friend ? friend.remark : '',
    })
  },

  'get_friend_list': async (): Promise<ActionResponse<Array<UserInfo & { user_remark: string }>>> => {
    const status = useStatusStore()
    const friends = await db.friends.where({ userId: status.assignBot }).toArray()
    return response(
      0,
      await Promise.all(
        friends.map(async (friend) => {
          const user = await db.users.get(friend.friendId)
          return {
            user_id: user!.id,
            user_name: user!.name,
            user_displayname: '',
            user_remark: friend.remark,
          }
        })
      )
    )
  },

  'get_group_info': async ({ group_id }: { group_id: string }): Promise<ActionResponse<GroupInfo>> => {
    const group = await db.groups.get(group_id)
    if (!group) {
      return response(1404, null, '群组不存在')
    }
    return response(0, {
      group_id: group.id,
      group_name: group.name,
    })
  },

  'get_group_list': async (): Promise<ActionResponse<GroupInfo[]>> => {
    const status = useStatusStore()
    const members = await db.members.where({ userId: status.assignBot }).toArray()
    return response(
      0,
      await Promise.all(
        members.map(async (member) => {
          const group = await db.groups.get(member.groupId)
          return {
            group_id: group!.id,
            group_name: group!.name,
          }
        })
      )
    )
  },

  'get_group_member_info': async ({
    group_id,
    user_id,
  }: {
    group_id: string
    user_id: string
  }): Promise<ActionResponse<UserInfo>> => {
    const member = await db.members.get({ groupId: group_id, userId: user_id })
    if (!member) {
      return response(1404, null, '群组成员不存在')
    }
    const user = await db.users.get(user_id)
    return response(0, {
      user_id: user!.id,
      user_name: user!.name,
      user_displayname: member.card,
    })
  },

  'get_group_member_list': async ({ group_id }: { group_id: string }): Promise<ActionResponse<UserInfo[]>> => {
    const members = await db.members.where({ groupId: group_id }).toArray()
    return response(
      0,
      await Promise.all(
        members.map(async (member) => {
          const user = await db.users.get(member.userId)
          return {
            user_id: user!.id,
            user_name: user!.name,
            user_displayname: member.card,
          }
        })
      )
    )
  },

  'set_group_name': async ({
    group_id,
    group_name,
  }: {
    group_id: string
    group_name: string
  }): Promise<ActionResponse<null>> => {
    const behav = new Behav()
    await behav.editGroupName(group_id, behav.status.assignBot, group_name)
    return response(0)
  },

  'leave_group': async ({ group_id }: { group_id: string }): Promise<ActionResponse<null>> => {
    const behav = new Behav()
    await behav.removeGroupMember(group_id, behav.status.assignBot, behav.status.assignBot)
    return response(0)
  },

  'upload_file': async (
    fileInfo: FileURL<'url'> | FilePath<'path'> | FileData<'data'>
  ): Promise<ActionResponse<null> | ActionResponse<{ file_id: string }>> => {
    try {
      if (fileInfo.sha256) {
        const file = await db.files.where({ sha256: fileInfo.sha256 }).first()
        if (file) {
          return response(0, { file_id: file.id })
        }
      }
      if (fileInfo.type === 'data') {
        fileInfo.data =
          fileInfo.data instanceof Uint8Array ? { binary: fileInfo.data } : { str: fileInfo.data as string }
      }
      const { size, sha256 } = await invoke<{ size: number; sha256: string }>('upload_file', { file: fileInfo })
      const fileId = getUUID()
      await db.files.add({ id: fileId, name: fileInfo.name, sha256, size })
      return response(0, { file_id: fileId })
    } catch (err) {
      return response(32000, null, `${err}`)
    }
  },

  'upload_file_fragmented': async (
    fileInfo: UploadFilePrepare | UploadFileTransfer | UploadFileFinish
  ): Promise<ActionResponse<null> | ActionResponse<{ file_id: string }>> => {
    switch (fileInfo.stage) {
      case 'prepare': {
        const fileId = getUUID()
        const { name, total_size } = fileInfo
        fileFragmented.set(fileId, { name, total_size })
        return response(0, { file_id: fileId })
      }
      case 'transfer': {
        const { file_id, offset, data } = fileInfo
        await invoke('create_file_fragment', { file_id, offset, data })
        return response(0)
      }
      case 'finish': {
        const { file_id, sha256 } = fileInfo
        const { name, total_size } = fileFragmented.get(file_id)!
        await invoke<string>('merge_file_fragment', { file_id, total_size, sha256 })
        fileFragmented.delete(file_id)
        await db.files.add({ id: file_id, name, sha256, size: total_size })
        return response(0, { file_id })
      }
      default:
        return response(10004, null, '无效的上传阶段')
    }
  },

  'get_file': async ({
    file_id,
    type,
  }: {
    file_id: string
    type: 'url' | 'path' | 'data'
  }): Promise<ActionResponse<FileURL> | ActionResponse<FilePath> | ActionResponse<FileData>> => {
    const file = await db.files.get(file_id)
    if (!file) {
      return response(32000, null, '文件不存在')
    }
    const { name, sha256 } = file
    switch (type) {
      case 'url':
        return response(0, { name, sha256, url: await getFile(GetType.URL, file_id) })
      case 'path':
        return response(0, { name, sha256, path: await getFile(GetType.PATH, file_id) })
      case 'data':
        return response(0, { name, sha256, data: await getFile(GetType.DATA, file_id) })
      default:
        return response(10004, null, '无效的获取方式')
    }
  },

  'get_file_fragmented': async (
    fileInfo: GetFilePrepareParameters | GetFileTransferParameters
  ): Promise<ActionResponse<GetFilePrepareReturn> | ActionResponse<GetFileTransferReturn>> => {
    switch (fileInfo.stage) {
      case 'prepare': {
        const file = await db.files.get(fileInfo.file_id)
        if (!file) {
          return response(32000, null, '文件不存在')
        }
        const { name, size: total_size, sha256 } = file
        return response(0, { name, total_size, sha256 })
      }
      case 'transfer': {
        const { file_id, offset, size } = fileInfo
        return response(0, {
          data: await invoke<Uint8Array>('read_file', { path: await getFile(GetType.PATH, file_id), offset, size }),
        })
      }
      default:
        return response(10004, null, '无效的获取阶段')
    }
  },
}

type FileType = 'url' | 'path' | 'data'

interface FileInfo<T extends FileType = never> {
  name: string
  sha256?: string
  type?: T
}

type FileURL<T extends FileType = never> = FileInfo<T> & { url: string; headers?: string }

type FilePath<T extends FileType = never> = FileInfo<T> & { path: string }

type FileData<T extends FileType = never> = FileInfo<T> & {
  data: string | Uint8Array | { str?: string; binary?: Uint8Array }
}

interface UploadFilePrepare {
  stage: 'prepare'
  name: string
  total_size: number
}

interface UploadFileTransfer {
  stage: 'transfer'
  file_id: string
  offset: number
  data: string | Uint8Array
}

interface UploadFileFinish {
  stage: 'finish'
  file_id: string
  sha256: string
}

interface GetFilePrepareParameters {
  stage: 'prepare'
  file_id: string
}

interface GetFilePrepareReturn {
  name: string
  total_size: number
  sha256: string
}

interface GetFileTransferParameters {
  stage: 'transfer'
  file_id: string
  offset: number
  size: number
}

interface GetFileTransferReturn {
  data: Uint8Array
}
