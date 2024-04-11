export interface OneBotV11StandardHTTP {
  protocol: 'OneBot.V11.Standard'
  comm: 'http'
  host: string
  port: number
  accessToken: string
  postURL: string
  postTimeout: number
  postSecret: string
  heartbeatInterval: number
}

export interface OneBotV11StandardWebSocketServer {
  protocol: 'OneBot.V11.Standard'
  comm: 'websocketServer'
  host: string
  port: number
  accessToken: string
  heartbeatInterval: number
}

export interface OneBotV11StandardWebSocketClient {
  protocol: 'OneBot.V11.Standard'
  comm: 'websocketClient'
  url: string
  api_url: string
  event_url: string
  accessToken: string
  reconnectInterval: number
  heartbeatInterval: number
}

export type OneBotV11Standard =
  | OneBotV11StandardHTTP
  | OneBotV11StandardWebSocketServer
  | OneBotV11StandardWebSocketClient

export interface OneBotV12StandardHTTP {
  protocol: 'OneBot.V12.Standard'
  comm: 'http'
  host: string
  port: number
  accessToken: string
  eventEnabled: boolean
  eventBufferSize: number
}

export interface OneBotV12StandardHTTPWebhook {
  protocol: 'OneBot.V12.Standard'
  comm: 'httpWebhook'
  url: string
  accessToken: string
  timeout: number
  heartbeatInterval: number
}

export interface OneBotV12StandardWebSocketServer {
  protocol: 'OneBot.V12.Standard'
  comm: 'websocketServer'
  host: string
  port: number
  accessToken: string
  heartbeatInterval: number
}

export interface OneBotV12StandardWebSocketClient {
  protocol: 'OneBot.V12.Standard'
  comm: 'websocketClient'
  url: string
  accessToken: string
  reconnectInterval: number
  heartbeatInterval: number
}

export type OneBotV12Standard =
  | OneBotV12StandardHTTP
  | OneBotV12StandardHTTPWebhook
  | OneBotV12StandardWebSocketServer
  | OneBotV12StandardWebSocketClient
