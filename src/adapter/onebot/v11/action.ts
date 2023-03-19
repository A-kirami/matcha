/* eslint-disable camelcase */
import { getVersion } from '@tauri-apps/api/app'

import { AdapterActionHandler } from '@/adapter/action'
import { Behav } from '@/adapter/behav'
import { UnsupportedActionError } from '@/adapter/errors'
import { db } from '@/database'
import { logger } from '@/plugins'
import { asyncWrapper } from '@/utils'

import { MessageHandler, createMessage } from './message'
import { response } from './utils'

import type { Messages } from './message'
import type { ActionResult, ActionRequest, ActionStrategy } from '@/adapter/action'
import type { PrivateMessageScene, GroupMessageScene } from '@/adapter/scene'
import type { StrKeyObject } from '@/adapter/typed'

const messageHandler = new MessageHandler()

export class ActionHandler extends AdapterActionHandler {
  readonly strategy = actionStrategy

  async handle({ action, params }: ActionRequest): Promise<ActionResult> {
    try {
      const func = this.strategy[action]
      if (!func) {
        throw new UnsupportedActionError(response(1404, { message: '不支持的动作请求' }))
      }
      const asyncFn = asyncWrapper<ActionResult>(func)
      return await asyncFn(params)
    } catch (error) {
      logger.error((error as Error).toString())
      throw error
    }
  }
}

const actionStrategy: ActionStrategy = {
  /** 发送私聊消息 */
  'send_private_msg': async ({
    user_id,
    message,
  }: {
    user_id: number
    message: Messages[] | string
    auto_escape: boolean
  }): Promise<ActionResult<{ message_id: number }, PrivateMessageScene>> => {
    const user = await db.users.get(user_id)
    if (!user) {
      throw new Error('用户不存在')
    }
    const messages = typeof message === 'string' ? [createMessage('text', { text: message })] : message
    const contents = await messageHandler.parse(messages)
    const behav = new Behav()
    const scene = await behav.sendPrivateMessage(behav.status.bot!, user, contents)
    scene.original_message = messages
    return {
      response: response(0, { message_id: Number(scene.message_id) }),
      scene,
    }
  },

  /** 发送群聊消息 */
  'send_group_msg': async ({
    group_id,
    message,
  }: {
    group_id: number
    message: Messages[] | string
    auto_escape: boolean
  }): Promise<ActionResult<{ message_id: number }, GroupMessageScene>> => {
    const group = await db.groups.get(group_id)
    if (!group) {
      throw new Error('群聊不存在')
    }
    const messages = typeof message === 'string' ? [createMessage('text', { text: message })] : message
    const contents = await messageHandler.parse(messages)
    const behav = new Behav()
    const scene = await behav.sendGroupMessage(behav.status.bot!, group, contents)
    scene.original_message = messages
    return {
      response: response(0, { message_id: Number(scene.message_id) }),
      scene,
    }
  },

  /** 发送消息 */
  'send_msg': async ({
    message_type,
    user_id,
    group_id,
    message,
  }: {
    message_type: 'private' | 'group'
    user_id: number
    group_id: number
    message: Messages[] | string
    auto_escape: boolean
  }): Promise<ActionResult<{ message_id: number }, PrivateMessageScene | GroupMessageScene>> => {
    if (message_type === 'private') {
      return (await (actionStrategy.send_private_msg as (request: StrKeyObject) => Promise<ActionResult>)({
        user_id,
        message,
      })) as ActionResult<{ message_id: number }, PrivateMessageScene>
    } else {
      return (await (actionStrategy.send_group_msg as (request: StrKeyObject) => Promise<ActionResult>)({
        group_id,
        message,
      })) as ActionResult<{ message_id: number }, GroupMessageScene>
    }
  },

  /** 检查是否可以发送图片 */
  'can_send_image': (): ActionResult<{ yes: boolean }> => {
    return {
      response: response(0, {
        yes: true,
      }),
    }
  },

  /** 检查是否可以发送图片 */
  'can_send_record': (): ActionResult<{ yes: boolean }> => {
    return {
      response: response(0, {
        yes: true,
      }),
    }
  },

  /** 获取运行状态 */
  'get_status': (): ActionResult<{ online: boolean; good: boolean }> => {
    return {
      response: response(0, {
        online: true,
        good: true,
      }),
    }
  },

  /** 获取版本信息 */
  'get_version_info': async (): Promise<
    ActionResult<{ app_name: string; app_version: string; protocol_version: string }>
  > => {
    const appVersion = await getVersion()
    return {
      response: response(0, {
        'app_name': 'matcha',
        'app_version': appVersion,
        'protocol_version': 'v11',
      }),
    }
  },
}
