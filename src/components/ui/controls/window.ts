import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow'
import { ref } from 'vue'

export const appWindow = getCurrentWebviewWindow()
export const isWindowMaximized = ref(false)

appWindow.onResized(async () => {
  isWindowMaximized.value = await appWindow.isMaximized()
})

export const minimizeWindow = async () => {
  await appWindow.minimize()
}

export const maximizeWindow = async () => {
  await appWindow.toggleMaximize()
}

export const fullscreenWindow = async () => {
  if (appWindow) {
    const fullscreen = await appWindow.isFullscreen()
    await appWindow.setFullscreen(!fullscreen)
  }
}

export const closeWindow = async () => {
  await appWindow.close()
}
