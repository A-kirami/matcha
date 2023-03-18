import { Adapter } from '@/adapter/adapter'
import { useStatusStore } from '@/stores'

import { ActionHandler } from './action'
import { EventHandler } from './event'

import type { OneBotHeaders } from '@/adapter/adapter'

interface OneBotV11Headers extends OneBotHeaders {
  'X-Self-ID': string
  'X-Client-Role': 'API' | 'Event' | 'Universal'
}

export class OneBotV11 extends Adapter {
  readonly protocolName = 'OneBot V11 标准'
  readonly protocolId = 'OneBot.V11.Standard'
  readonly protocolUrl = ''
  readonly supportMode = 'websocketClient'
  readonly actionHandler = new ActionHandler()
  readonly eventHandler = new EventHandler()

  getConnectHeaders(): OneBotV11Headers {
    const status = useStatusStore()
    return {
      'X-Self-ID': status.assignBot.toString(),
      'X-Client-Role': 'Universal',
    }
  }
}
