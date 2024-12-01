import { defineStore } from 'pinia'

export interface ConnectSettings {
  protocol: 'OneBot.V11.Standard' | 'OneBot.V12.Standard'
  comm: 'http' | 'httpWebhook' | 'websocketServer' | 'websocketClient'
  host: string
  port: number
  url: string
  accessToken?: string
  reconnectInterval: number
  heartbeatInterval: number
  timeout: number
  postSelfEvents: boolean
  showError: boolean
}

export const useConnectSettingsStore = defineStore(
  'connect-settings',

  () => {
    const protocol = $ref<ConnectSettings['protocol']>('OneBot.V11.Standard')
    const comm = $ref<ConnectSettings['comm']>('websocketClient')
    const host = $ref('127.0.0.1')
    const port = $ref(8120)
    const url = $ref('ws://127.0.0.1:8120/onebot/v11/ws')
    const accessToken = $ref<ConnectSettings['accessToken']>()
    const reconnectInterval = $ref(3)
    const heartbeatInterval = $ref(3)
    const timeout = $ref(3)
    const postSelfEvents = $ref(false)
    const showError = $ref(true)

    return $$({
      protocol,
      comm,
      host,
      port,
      url,
      accessToken,
      reconnectInterval,
      heartbeatInterval,
      timeout,
      postSelfEvents,
      showError,
    })
  },

  {
    persist: true,
  },
)
