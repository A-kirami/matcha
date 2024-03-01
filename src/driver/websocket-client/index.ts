import { decode, encode } from '@msgpack/msgpack'
import WebSocket from '@tauri-apps/plugin-websocket'

import { Adapter } from '~/adapter/adapter'

import { Driver } from '../driver'

import type { Message, ConnectionConfig } from '@tauri-apps/plugin-websocket'
import type { ActionRequest } from '~/adapter/action'
import type { Event } from '~/adapter/event'

export class websocketClient implements Driver {
  ws: WebSocket | null = null
  static id = ''

  constructor(public adapter: Adapter) {}

  async run(): Promise<void> {
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
    } catch (error) {
      return false
    }
  }

  async connect(): Promise<void> {
    websocketClient.id = getUUID()
    const connectID = websocketClient.id
    const connectUrl = this.adapter.getConnectUrl()
    const connectConfig = await this.getConnectConfig()
    const autoConnect = async () => {
      if (connectID !== websocketClient.id) {
        return
      }
      const wsId = sessionStorage.getItem('ws_id')
      if (wsId) {
        this.ws = new WebSocket(Number(wsId), [])
        await this.disconnect()
        await this.connect()
        return
      }
      try {
        logger.info(`正在尝试连接到反向 WebSocket 服务器 ${connectUrl}`)
        this.ws = await WebSocket.connect(connectUrl, connectConfig)
        sessionStorage.setItem('ws_id', this.ws.id.toString())
        this.ws.addListener(async (message: Message) => {
          switch (message.type) {
            case 'Text':
            case 'Binary': {
              const request: ActionRequest = message.type === 'Text' ? JSON.parse(message.data) : decode(message.data)
              const response = { ...(await this.adapter.actionHandle(request)), echo: request.echo }
              const data =
                message.type === 'Text'
                  ? JSON.stringify(response, this.adapter.JSONEncode)
                  : Array.from(encode(response))
              await this.ws?.send(data)
              break
            }
            case 'Ping':
            case 'Pong':
              break
            default:
              logger.error(`[WebSocket] 反向 WebSocket 服务器 ${connectUrl} 的连接被关闭: ${message.data?.reason}`)
              if (this.adapter.config.reconnectInterval) {
                setTimeout(autoConnect, this.adapter.config.reconnectInterval * 1000)
              }
          }
        })
        logger.info(`已连接到反向 WebSocket 服务器 ${connectUrl}`)
        await this.adapter.onConnect()
        await this.startHeartbeat()
      } catch (error) {
        logger.error(`[WebSocket] 连接到反向 WebSocket 服务器 ${connectUrl} 时出现错误: ${error}`)
        if (this.adapter.config.reconnectInterval) {
          setTimeout(autoConnect, this.adapter.config.reconnectInterval * 1000)
        }
      }
    }
    await autoConnect()
  }

  async disconnect(): Promise<void> {
    sessionStorage.removeItem('ws_id')
    await this.ws?.disconnect()
    this.ws = null
    websocketClient.id = ''
  }

  async getConnectConfig(): Promise<ConnectionConfig> {
    const connectConfig = { headers: await this.adapter.getConnectHeaders() }
    if (this.adapter.config.accessToken) {
      connectConfig.headers.Authorization = `Bearer ${this.adapter.config.accessToken}`
    }
    return connectConfig
  }

  async startHeartbeat(): Promise<void> {
    if (this.ws && this.adapter.config.heartbeatInterval) {
      await this.adapter.onHeartbeat()
      setTimeout(this.startHeartbeat.bind(this), this.adapter.config.heartbeatInterval * 1000)
    }
  }
}
