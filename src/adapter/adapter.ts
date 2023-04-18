import * as CommDriver from '@/driver'
import { useChatStore, useStatusStore } from '@/stores'

import { ProtocolError } from './errors'

import type { ActionRequest, ActionResponse, AdapterActionHandler } from './action'
import type { AdapterEventHandler, Event } from './event'
import type { Config } from '@/stores/config'

export type OneBotHeaders = Record<string, string>

export abstract class Adapter {
  /** 协议名称 */
  abstract readonly protocolName: string

  /** 协议标识符 */
  abstract readonly protocolId: string

  /** 协议连接 url */
  abstract readonly protocolUrl: string

  /** 协议支持连接方式 */
  abstract readonly supportMode: Config['comm']

  /** 动作处理器 */
  abstract readonly actionHandler: AdapterActionHandler

  /** 事件处理器 */
  abstract readonly eventHandler: AdapterEventHandler<Event>

  /** 驱动器实例 */
  driver: CommDriver.Driver | null = null

  chat = useChatStore()

  status = useStatusStore()

  constructor(public config: Config) {}

  async startup(): Promise<void> {
    if (!this.status.assignBot || this.driver) {
      return
    }
    const DriverCls: new (adapter: this) => CommDriver.Driver = Reflect.get(CommDriver, this.config.comm)
    this.driver = new DriverCls(this)
    await this.driver.run()
  }

  async shutdown(): Promise<void> {
    await this.driver?.stop()
    this.driver = null
  }

  async reboot(): Promise<void> {
    await this.shutdown()
    await this.startup()
  }

  async send(event: Event): Promise<boolean> {
    return (await this.driver?.send(event)) || false
  }

  getConnectUrl(): string {
    return new URL(this.protocolUrl, this.config.url).toString()
  }

  async actionHandle(request: ActionRequest): Promise<ActionResponse> {
    try {
      return await this.actionHandler.handle(request)
    } catch (error) {
      if (error instanceof ProtocolError) {
        return error.response
      }
      throw error
    }
  }

  /** 获取协议请求头 */
  abstract getConnectHeaders(): OneBotHeaders | Promise<OneBotHeaders>
}
