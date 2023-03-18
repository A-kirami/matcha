// https://github.com/tauri-apps/tauri-plugin-websocket
// git hash 71ac8ad

import { invoke, transformCallback } from '@tauri-apps/api/tauri'

export interface MessageKind<T, D> {
  type: T
  data: D
}

export interface CloseFrame {
  code: number
  reason: string
}

export type Message =
  | MessageKind<'Text', string>
  | MessageKind<'Binary', number[]>
  | MessageKind<'Ping', number[]>
  | MessageKind<'Pong', number[]>
  | MessageKind<'Close', CloseFrame | null>

export interface ConnectionConfig {
  maxSendQueue?: number
  maxMessageSize?: number
  maxFrameSize?: number
  acceptUnmaskedFrames?: boolean
  extraHeaders: Record<string, string>
}

export default class WebSocket {
  id: number
  private readonly listeners: Array<(arg: Message) => void>

  constructor(id: number, listeners: Array<(arg: Message) => void>) {
    this.id = id
    this.listeners = listeners
  }

  static async connect(url: string, config?: ConnectionConfig): Promise<WebSocket> {
    const listeners: Array<(arg: Message) => void> = []
    const handler = (message: Message): void => {
      listeners.forEach((l) => l(message))
    }

    const id = await invoke<number>('plugin:websocket|connect', {
      url,
      callbackFunction: transformCallback(handler),
      config,
    })
    return new WebSocket(id, listeners)
  }

  addListener(cb: (arg: Message) => void): void {
    this.listeners.push(cb)
  }

  async send(message: Message | string | number[]): Promise<void> {
    let m: Message
    if (typeof message === 'string') {
      m = { type: 'Text', data: message }
    } else if (typeof message === 'object' && 'type' in message) {
      m = message
    } else if (Array.isArray(message)) {
      m = { type: 'Binary', data: message }
    } else {
      throw new Error(
        'invalid `message` type, expected a `{ type: string, data: any }` object, a string or a numeric array'
      )
    }
    await invoke('plugin:websocket|send', {
      id: this.id,
      message: m,
    })
  }

  async disconnect(): Promise<void> {
    try {
      await this.send({
        type: 'Close',
        data: {
          code: 1000,
          reason: 'Disconnected by client',
        },
      })
    } catch (error) {
      //
    }
  }
}
