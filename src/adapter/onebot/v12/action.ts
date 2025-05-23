/* eslint-disable unicorn/no-null */
/* eslint-disable camelcase */
import { getVersion } from '@tauri-apps/api/app'

import { AdapterActionHandler } from '~/adapter/action'
import { Behav } from '~/adapter/behav'
import { UnsupportedActionError, InternalHandlerError, ProtocolError } from '~/adapter/errors'

import { MessageHandler } from './message'
import { response } from './utils'

import type { Messages } from './message'
import type { ActionResponse, ActionRequest, Status, Version, UserInfo, GroupInfo, FileURL, FilePath, FileData } from './typed'
import type { ActionStrategy } from '~/adapter/action'

const messageHandler = new MessageHandler()

export class ActionHandler extends AdapterActionHandler {
  readonly strategy = actionStrategy

  async handle({ action, params }: ActionRequest): Promise<ActionResponse> {
    try {
      const func = this.strategy[action]
      if (!func) {
        throw new UnsupportedActionError(response(1_0002, null, '不支持的动作请求'))
      }
      const asyncFn = asyncWrapper<ActionResponse>(func)
      return await asyncFn(params)
    } catch (error) {
      const errStr = String(error)
      void logger.error(errStr)
      throw error instanceof ProtocolError ? error : new InternalHandlerError(response(2_0002, null, errStr))
    }
  }
}

const fileFragmented = new Map<string, { name: string, total_size: number }>()

const actionStrategy: ActionStrategy<ActionResponse> = {
  get_supported_actions: (): ActionResponse<string[]> => {
    return response(0, Object.keys(actionStrategy))
  },

  get_status: (): ActionResponse<Status> => {
    const state = useStateStore()
    return response(0, {
      good: true,
      bots: [
        {
          self: {
            platform: 'qq',
            user_id: state.bot!.id,
          },
          online: true,
        },
      ],
    })
  },

  get_version: async (): Promise<ActionResponse<Version>> => {
    return response(0, {
      impl: 'matcha',
      version: await getVersion(),
      onebot_version: '12',
    })
  },

  send_message: async ({
    detail_type,
    user_id,
    group_id,
    message,
  }: {
    detail_type: 'private' | 'group'
    user_id?: string
    group_id?: string
    message: Messages[]
  }): Promise<ActionResponse<{ message_id: string, time: number }>> => {
    let receiver
    if (detail_type === 'private') {
      receiver = await getContact('user', user_id!)
    } else if (detail_type === 'group') {
      receiver = await getContact('group', group_id!)
    } else {
      return response(1404, null, '不支持发送')
    }
    if (!receiver) {
      return response(1404, null, '发送的目标不存在')
    }
    const contents = await messageHandler.parse(message)
    const behav = new Behav()
    const scene = await behav.sendMessage(behav.state.bot!, receiver, contents)
    return response(0, { message_id: scene.message_id, time: scene.time })
  },

  delete_message: async ({ message_id }: { message_id: string }): Promise<ActionResponse<null>> => {
    const behav = new Behav()
    await behav.recallMessage(message_id.toString(), behav.state.bot!.id)
    return response(0)
  },

  get_self_info: (): ActionResponse<UserInfo> => {
    const state = useStateStore()
    return response(0, {
      user_id: state.bot!.id,
      user_name: state.bot!.name,
      user_displayname: '',
    })
  },

  get_user_info: async ({
    user_id,
  }: {
    user_id: string
  }): Promise<ActionResponse<UserInfo & { user_remark: string }>> => {
    const user = await db.users.get(user_id)
    if (!user) {
      return response(1404, null, '用户不存在')
    }
    const state = useStateStore()
    const friend = await db.friends.get({ userId: state.bot!.id, friendId: user.id })
    return response(0, {
      user_id: user.id,
      user_name: user.name,
      user_displayname: '',
      user_remark: friend ? friend.remark : '',
    })
  },

  get_friend_list: async (): Promise<ActionResponse<(UserInfo & { user_remark: string })[]>> => {
    const state = useStateStore()
    const friends = await db.friends.where({ userId: state.bot!.id }).toArray()
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
        }),
      ),
    )
  },

  get_group_info: async ({ group_id }: { group_id: string }): Promise<ActionResponse<GroupInfo>> => {
    const group = await db.groups.get(group_id)
    if (!group) {
      return response(1404, null, '群组不存在')
    }
    return response(0, {
      group_id: group.id,
      group_name: group.name,
    })
  },

  get_group_list: async (): Promise<ActionResponse<GroupInfo[]>> => {
    const state = useStateStore()
    const members = await db.members.where({ userId: state.bot!.id }).toArray()
    return response(
      0,
      await Promise.all(
        members.map(async (member) => {
          const group = await db.groups.get(member.groupId)
          return {
            group_id: group!.id,
            group_name: group!.name,
          }
        }),
      ),
    )
  },

  get_group_member_info: async ({
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

  get_group_member_list: async ({ group_id }: { group_id: string }): Promise<ActionResponse<UserInfo[]>> => {
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
        }),
      ),
    )
  },

  set_group_name: async ({
    group_id,
    group_name,
  }: {
    group_id: string
    group_name: string
  }): Promise<ActionResponse<null>> => {
    const behav = new Behav()
    await behav.editGroupName(group_id, behav.state.bot!.id, group_name)
    return response(0)
  },

  leave_group: async ({ group_id }: { group_id: string }): Promise<ActionResponse<null>> => {
    const behav = new Behav()
    await behav.removeGroupMember(group_id, behav.state.bot!.id, behav.state.bot!.id)
    return response(0)
  },

  upload_file: async (
    fileInfo: FileURL<'url'> | FilePath<'path'> | FileData<'data'>,
  ): Promise<ActionResponse<null> | ActionResponse<{ file_id: string }>> => {
    try {
      if (fileInfo.sha256) {
        const file = await db.files.where({ sha256: fileInfo.sha256 }).first()
        if (file) {
          return response(0, { file_id: file.id })
        }
      }
      if (fileInfo.type === 'data') {
        fileInfo.data
          = fileInfo.data instanceof Uint8Array ? { binary: fileInfo.data } : { str: fileInfo.data as string }
      }
      const { size, sha256 } = await Commands.uploadFile(fileInfo)
      const fileId = getUUID()
      await db.files.add({ id: fileId, name: fileInfo.name, sha256, size })
      return response(0, { file_id: fileId })
    } catch (error) {
      return response(3_2000, null, String(error))
    }
  },

  upload_file_fragmented: async (
    fileInfo: UploadFilePrepare | UploadFileTransfer | UploadFileFinish,
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
        await Commands.createFileFragment(file_id, offset, data)
        return response(0)
      }
      case 'finish': {
        const { file_id, sha256 } = fileInfo
        const { name, total_size } = fileFragmented.get(file_id)!
        await Commands.mergeFileFragment(file_id, total_size, sha256)
        fileFragmented.delete(file_id)
        await db.files.add({ id: file_id, name, sha256, size: total_size })
        return response(0, { file_id })
      }
      default: {
        return response(1_0004, null, '无效的上传阶段')
      }
    }
  },

  get_file: async ({
    file_id,
    type,
  }: {
    file_id: string
    type: 'url' | 'path' | 'data'
  }): Promise<ActionResponse<FileURL> | ActionResponse<FilePath> | ActionResponse<FileData>> => {
    const file = await db.files.get(file_id)
    if (!file) {
      return response(3_2000, null, '文件不存在')
    }
    const { name, sha256 } = file
    switch (type) {
      case 'url': {
        return response(0, { name, sha256, url: await getFile(GetType.URL, file_id) })
      }
      case 'path': {
        return response(0, { name, sha256, path: await getFile(GetType.PATH, file_id) })
      }
      case 'data': {
        return response(0, { name, sha256, data: await getFile(GetType.DATA, file_id) })
      }
      default: {
        return response(1_0004, null, '无效的获取方式')
      }
    }
  },

  get_file_fragmented: async (
    fileInfo: GetFilePrepareParameters | GetFileTransferParameters,
  ): Promise<ActionResponse<GetFilePrepareReturn> | ActionResponse<GetFileTransferReturn>> => {
    switch (fileInfo.stage) {
      case 'prepare': {
        const file = await db.files.get(fileInfo.file_id)
        if (!file) {
          return response(3_2000, null, '文件不存在')
        }
        const { name, size: total_size, sha256 } = file
        return response(0, { name, total_size, sha256 })
      }
      case 'transfer': {
        const { file_id, offset, size } = fileInfo
        const filePath = await getFile(GetType.PATH, file_id)
        const contents = await Commands.readFile(filePath, offset, size)
        return response(0, {
          data: new Uint8Array(contents),
        })
      }
      default: {
        return response(1_0004, null, '无效的获取阶段')
      }
    }
  },
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
