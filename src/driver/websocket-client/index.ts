import { decode, encode } from '@msgpack/msgpack'
import WebSocket from '@tauri-apps/plugin-websocket'
import { toast } from 'vue-sonner'

import { Adapter } from '~/adapter/adapter'

import { Driver } from '../driver'

import type { Message, ConnectionConfig } from '@tauri-apps/plugin-websocket'
import type { ActionRequest } from '~/adapter/action'
import type { Event } from '~/adapter/event'

export class websocketClient implements Driver {
  ws: WebSocket | null = null
  connectUrl: string
  connectingError: boolean = false
  heartbeatPause?: () => void
  heartbeatResume?: () => void

  constructor(public adapter: Adapter) {
    this.connectUrl = this.adapter.getConnectUrl()

    if (this.adapter.config.heartbeatInterval) {
      const { pause, resume } = useIntervalFn(
        async () => {
          await this.adapter.onHeartbeat()
        },
        this.adapter.config.heartbeatInterval * 1000,
        { immediate: false }
      )
      this.heartbeatPause = pause
      this.heartbeatResume = resume
    }

    useEventListener('beforeunload', () => this.stop())
  }

  async run(): Promise<void> {
    await this.disconnect()
    await this.connect()
  }

  async stop(): Promise<void> {
    await this.disconnect()
  }

  async send(event: Event): Promise<boolean> {
    if (!this.ws) {
      return false
    }
    try {
      await this.ws.send(JSON.stringify(event))
      return true
    } catch (_) {
      return false
    }
  }

  async connect(): Promise<void> {
    if (!this.connectUrl) {
      return
    }

    logger.info(`正在尝试连接到反向 WebSocket 服务器 ${this.connectUrl}`)

    const connectConfig = await this.getConnectConfig()

    try {
      this.ws = await WebSocket.connect(this.connectUrl, connectConfig)
      this.ws.addListener(this.onMessage.bind(this))
      this.heartbeatResume?.()
      this.adapter.state.isConnected = true
      this.connectingError = false
      logger.info(`已连接到反向 WebSocket 服务器 ${this.connectUrl}`)
      toast.success('连接成功', { description: '已连接到反向 WebSocket 服务器' })
    } catch (error) {
      if (this.adapter.config.showError || !this.connectingError) {
        logger.error(`[WebSocket] 连接到反向 WebSocket 服务器 ${this.connectUrl} 失败: ${error}`)
        toast.error('连接错误', { description: `无法连接到 WebSocket 服务器: ${error}` })
        this.connectingError = true
      }
      this.autoReconnection()
    }
  }

  async disconnect(): Promise<void> {
    this.heartbeatPause?.()
    try {
      await this.ws?.disconnect()
    } catch (_) {
      // ignore
    }
    this.ws = null
    this.adapter.state.isConnected = false
  }

  async onMessage(message: Message): Promise<void> {
    switch (message.type) {
      case 'Text':
      case 'Binary': {
        const request: ActionRequest = message.type === 'Text' ? JSON.parse(message.data) : decode(message.data)
        const response = { ...(await this.adapter.actionHandle(request)), echo: request.echo }
        const data =
          message.type === 'Text' ? JSON.stringify(response, this.adapter.JSONEncode) : Array.from(encode(response))
        await this.ws?.send(data)
        break
      }
      case 'Ping':
      case 'Pong':
        break
      case 'Close':
        await this.disconnect()
        toast.error('连接错误', { description: 'WebSocket 服务器的连接被关闭' })
        logger.error(`[WebSocket] 反向 WebSocket 服务器 ${this.connectUrl} 的连接被关闭: ${message.data?.reason}`)
        this.autoReconnection()
        break
      default:
        break
    }
  }

  autoReconnection(): void {
    if (this.adapter.config.reconnectInterval) {
      setTimeout(this.connect.bind(this), this.adapter.config.reconnectInterval * 1000)
    }
  }

  async getConnectConfig(): Promise<ConnectionConfig> {
    const connectConfig = { headers: await this.adapter.getConnectHeaders() }
    if (this.adapter.config.accessToken) {
      connectConfig.headers.Authorization = `Bearer ${this.adapter.config.accessToken}`
    }
    return connectConfig
  }
}
