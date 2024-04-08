import { defineStore } from 'pinia'

import { adapters } from '~/adapter'

export const useAdapterStore = defineStore('adapter', () => {
  const connect = useConnectSettingsStore()

  const bots = adapters.map((Adapter) => new Adapter(connect))

  const bot = $computed(() => {
    for (const bot of bots) {
      if (bot.protocolId === connect.protocol) {
        return bot
      }
    }
    throw new Error('Protocol must be specified.')
  })

  watch($$(bot), async (newBot, oldBot) => {
    await oldBot.shutdown()
    await newBot.startup()
  })

  return {
    bot,
  }
})
