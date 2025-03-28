import { decode, encode } from '@msgpack/msgpack'
import WebSocket from '@tauri-apps/plugin-websocket'
import { toast } from 'vue-sonner'

import { Adapter } from '~/adapter/adapter'

import { Driver } from '../driver'

import type { Message, ConnectionConfig } from '@tauri-apps/plugin-websocket'
import type { ActionRequest } from '~/adapter/action'
import type { Event } from '~/adapter/event'

export class websocketClient implements Driver {
  ws?: WebSocket
  connectUrl: string
  connectingError: boolean = false
  explicitlyClosed: boolean = false
  heartbeatPause?: () => void
  heartbeatResume?: () => void
  private reconnectTimer?: number
  private isConnecting: boolean = false

  constructor(public adapter: Adapter) {
    this.connectUrl = this.adapter.getConnectUrl()

    if (this.adapter.config.heartbeatInterval) {
      const { pause, resume } = useIntervalFn(
        () => {
          void this.adapter.onHeartbeat()
        },
        this.adapter.config.heartbeatInterval * 1000,
        { immediate: false },
      )
      this.heartbeatPause = pause
      this.heartbeatResume = resume
    }

    useEventListener('beforeunload', () => this.stop())
  }

  async run(): Promise<void> {
    await this.disconnect()
    this.explicitlyClosed = false
    await this.connect()
  }

  async stop(): Promise<void> {
    this.explicitlyClosed = true
    if (this.reconnectTimer !== undefined) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = undefined
    }
    await this.disconnect()
  }

  async send(event: Event): Promise<boolean> {
    if (!this.ws) {
      return false
    }
    try {
      await this.ws.send(JSON.stringify(event))
      return true
    } catch {
      return false
    }
  }

  async connect(): Promise<void> {
    if (this.explicitlyClosed || !this.connectUrl || this.isConnecting) {
      return
    }

    await this.disconnect()
    this.isConnecting = true
    void logger.info(`正在尝试连接到反向 WebSocket 服务器 ${this.connectUrl}`)

    try {
      const connectConfig = await this.getConnectConfig()
      this.ws = await WebSocket.connect(this.connectUrl, connectConfig)
      this.ws.addListener(this.onMessage.bind(this))
      await this.adapter.onConnect()
      this.heartbeatResume?.()
      this.adapter.state.isConnected = true
      this.connectingError = false
      void logger.info(`已连接到反向 WebSocket 服务器 ${this.connectUrl}`)
      toast.success('连接成功', { description: '已连接到反向 WebSocket 服务器' })
    } catch (error) {
      if (this.adapter.config.showError || !this.connectingError) {
        const errStr = String(error)
        void logger.error(`[WebSocket] 连接到反向 WebSocket 服务器 ${this.connectUrl} 失败: ${errStr}`)
        toast.error('连接错误', { description: `无法连接到 WebSocket 服务器: ${errStr}` })
        this.connectingError = true
      }
      this.autoReconnection()
    } finally {
      this.isConnecting = false
    }
  }

  async disconnect(): Promise<void> {
    this.heartbeatPause?.()
    await this.ws?.disconnect().catch(() => { /* ignore error */ })
    this.ws = undefined
    this.adapter.state.isConnected = false
  }

  async onMessage(message: Message): Promise<void> {
    switch (message.type) {
      case 'Text':
      case 'Binary': {
        const request = (message.type === 'Text' ? JSON.parse(message.data) : decode(message.data)) as ActionRequest
        const response = { ...(await this.adapter.actionHandle(request)), echo: request.echo }
        const data
          = message.type === 'Text' ? JSON.stringify(response, this.adapter.JSONEncode) : [...encode(response)]
        await this.ws?.send(data)
        break
      }
      case 'Ping':
      case 'Pong': {
        break
      }
      case 'Close': {
        await this.disconnect()
        toast.error('连接错误', { description: 'WebSocket 服务器的连接被关闭' })
        void logger.error(`[WebSocket] 反向 WebSocket 服务器 ${this.connectUrl} 的连接被关闭: ${message.data?.reason}`)
        this.autoReconnection()
        break
      }
      default: {
        await this.disconnect()
        toast.error('连接错误', { description: 'WebSocket 服务器出现意外错误' })
        void logger.error(`[WebSocket] 反向 WebSocket 服务器 ${this.connectUrl} 出现意外错误: ${message}`)
        this.autoReconnection()
        break
      }
    }
  }

  autoReconnection(): void {
    if (this.reconnectTimer !== undefined) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = undefined
    }
    if (!this.explicitlyClosed && this.adapter.config.reconnectInterval && this.adapter.config.autoReconnect) {
      this.reconnectTimer = setTimeout(this.connect.bind(this), this.adapter.config.reconnectInterval * 1000) as unknown as number
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
