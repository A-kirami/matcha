import { defineStore } from 'pinia'

interface GeneralSettings {
  theme: 'light' | 'dark' | 'auto'
  sendMessageShortcut: 'enter' | 'ctrlEnter'
  autoUpdate: boolean
  enbaleSuperUser: boolean
  showRecallMessage: boolean
}

export const useGeneralSettingsStore = defineStore(
  'general-settings',

  () => {
    const theme = ref<GeneralSettings['theme']>('auto')
    const sendMessageShortcut = ref<GeneralSettings['sendMessageShortcut']>('ctrlEnter')
    const autoUpdate = ref<GeneralSettings['autoUpdate']>(true)
    const enbaleSuperUser = ref<GeneralSettings['enbaleSuperUser']>(false)
    const showRecallMessage = ref<GeneralSettings['showRecallMessage']>(true)

    return {
      theme,
      autoUpdate,
      sendMessageShortcut,
      enbaleSuperUser,
      showRecallMessage,
    }
  },

  {
    persist: true,
  }
)
