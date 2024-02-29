import { defineStore } from 'pinia'

export interface Config {
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
}

export const useConfigStore = defineStore(
  'config',

  () => {
    const protocol = ref<Config['protocol']>('OneBot.V11.Standard')
    const comm = ref<Config['comm']>('websocketClient')
    const host = ref('127.0.0.1')
    const port = ref(8120)
    const url = ref('ws://127.0.0.1:8120/onebot/v11/ws')
    const accessToken = ref<Config['accessToken']>()
    const reconnectInterval = ref(3)
    const heartbeatInterval = ref(3)
    const timeout = ref(3)
    const postSelfEvents = ref(false)

    return {
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
    }
  },

  {
    persist: true,
  }
)
