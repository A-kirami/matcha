import { invoke } from '@tauri-apps/api/core'
import { defineStore } from 'pinia'
import { toast } from 'vue-sonner'

export interface GeneralSettings {
  theme: 'light' | 'dark' | 'auto'
  sendMessageShortcut: 'enter' | 'ctrlEnter'
  autoUpdate: boolean
  enbaleSuperUser: boolean
  showRecallMessage: boolean
  applyAcrylicWindowEffects: boolean
  enableLinkPreview: boolean
  assetsServerAddress: string
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
    const enableLinkPreview = $ref<GeneralSettings['enableLinkPreview']>(true)
    const assetsServerAddress = $ref<GeneralSettings['assetsServerAddress']>('127.0.0.1:8720')

    async function startAssetsServer(address: string): Promise<void> {
      const [host, port] = address.split(':')
      await invoke('start_assets_server', { host, port: Number.parseInt(port) }).catch((error) => {
        toast.error('资源服务器错误', { description: error })
      })
    }

    watch($$(applyAcrylicWindowEffects), async (enable) => {
      await setAcrylicWindowEffect(enable)
    })

    watch($$(assetsServerAddress), async (address) => {
      await startAssetsServer(address)
    })

    return $$({
      theme,
      autoUpdate,
      sendMessageShortcut,
      enbaleSuperUser,
      showRecallMessage,
      applyAcrylicWindowEffects,
      enableLinkPreview,
      assetsServerAddress,
      startAssetsServer,
    })
  },

  {
    persist: true,
  },
)
