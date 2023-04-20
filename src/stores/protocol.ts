import { defineStore } from 'pinia'
import { watch, computed } from 'vue'

import { adapters } from '@/adapter'

import { useConfigStore } from './config'

export const useAdapterStore = defineStore('adapter', () => {
  const config = useConfigStore()

  const bots = adapters.map((Adapter) => new Adapter(config))

  const bot = computed(() => {
    for (const bot of bots) {
      if (bot.protocolId === config.protocol) {
        return bot
      }
    }
    throw new Error('Protocol must be specified.')
  })

  watch(
    () => bot.value,
    async (newBot, oldBot) => {
      await oldBot.shutdown()
      await newBot.startup()
    }
  )

  return {
    bot,
  }
})
