export * from './action'
export * from './adapter'
export * from './behav'
export * from './content'
export * from './event'
export * from './message'
export * from './scene'
export * from './typed'

import { OneBotV11 } from './onebot/v11'
import { OneBotV12 } from './onebot/v12'

export const adapters = [OneBotV11, OneBotV12]
