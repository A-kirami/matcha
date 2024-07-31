/* eslint-disable camelcase */
import { getTauriVersion, getVersion } from '@tauri-apps/api/app'
import { arch, platform, type, version } from '@tauri-apps/plugin-os'
import { Base64 } from 'js-base64'

import { Adapter } from '~/adapter/adapter'

import { ActionHandler } from './action'
import { EventHandler, ConnectMetaEvent, HeartbeatMetaEvent, StatusUpdateMetaEvent } from './event'

import type { OneBotHeaders } from '~/adapter/adapter'

interface OneBotV12Headers extends OneBotHeaders {
  'User-Agent': string
  'Sec-WebSocket-Protocol': string
}

export class OneBotV12 extends Adapter {
  readonly protocolName = 'OneBot V12 标准'
  readonly protocolId = 'OneBot.V12.Standard'
  readonly protocolUrl = ''
  readonly supportMode = 'websocketClient'
  readonly actionHandler = new ActionHandler()
  readonly eventHandler = new EventHandler()

  async getConnectHeaders(): Promise<OneBotV12Headers> {
    const archName = arch()
    const platformName = platform()
    const osType = type()
    const osVersion = version()
    const tauriVersion = await getTauriVersion()
    const appVersion = await getVersion()
    return {
      'User-Agent': `OneBot/12 (standard) Tauri/${tauriVersion} (${osType} ${osVersion}; ${platformName};${archName}) Matcha/${appVersion}`,
      'Sec-WebSocket-Protocol': '12.matcha',
    }
  }

  async onConnect(): Promise<void> {
    const connectEvent: ConnectMetaEvent = {
      id: getUUID(),
      time: getTimestamp(),
      type: 'meta',
      detail_type: 'connect',
      sub_type: '',
      version: {
        impl: 'matcha',
        version: await getVersion(),
        onebot_version: '12',
      },
    }
    await this.send(connectEvent)
    const statusUpdateEvent: StatusUpdateMetaEvent = {
      id: getUUID(),
      time: getTimestamp(),
      type: 'meta',
      detail_type: 'status_update',
      sub_type: '',
      status: {
        good: true,
        bots: [
          {
            self: {
              platform: 'matcha',
              user_id: this.state.bot!.id,
            },
            online: true,
          },
        ],
      },
    }
    await this.send(statusUpdateEvent)
  }

  async onHeartbeat(): Promise<void> {
    const HeartbeatEvent: HeartbeatMetaEvent = {
      id: getUUID(),
      time: getTimestamp(),
      type: 'meta',
      detail_type: 'heartbeat',
      sub_type: '',
      interval: this.config.heartbeatInterval,
    }
    await this.send(HeartbeatEvent)
  }

  JSONEncode(_key: string, value: unknown): unknown {
    if (value instanceof Uint8Array) {
      return Base64.fromUint8Array(value)
    }
    return value
  }
}
