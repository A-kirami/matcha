import { defineStore } from 'pinia'

export interface GeneralSettings {
  theme: 'light' | 'dark' | 'auto'
  sendMessageShortcut: 'enter' | 'ctrlEnter'
  autoUpdate: boolean
  enbaleSuperUser: boolean
  showRecallMessage: boolean
  applyAcrylicWindowEffects: boolean
}

export const useGeneralSettingsStore = defineStore(
  'general-settings',

  () => {
    const theme = $ref<GeneralSettings['theme']>('auto')
    const sendMessageShortcut = $ref<GeneralSettings['sendMessageShortcut']>('ctrlEnter')
    const autoUpdate = $ref<GeneralSettings['autoUpdate']>(true)
    const enbaleSuperUser = $ref<GeneralSettings['enbaleSuperUser']>(false)
    const showRecallMessage = $ref<GeneralSettings['showRecallMessage']>(true)
    const applyAcrylicWindowEffects = $ref<GeneralSettings['applyAcrylicWindowEffects']>(false)

    watch($$(applyAcrylicWindowEffects), async (enable) => {
      await setAcrylicWindowEffect(enable)
    })

    return $$({
      theme,
      autoUpdate,
      sendMessageShortcut,
      enbaleSuperUser,
      showRecallMessage,
      applyAcrylicWindowEffects,
    })
  },

  {
    persist: true,
  },
)
