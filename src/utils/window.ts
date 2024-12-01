import { WebviewWindow, getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow'
import { Effect, EffectState } from '@tauri-apps/api/window'
import { type as getOsType } from '@tauri-apps/plugin-os'

import type { Effects } from '@tauri-apps/api/window'

const screenWidth = window.screen.width
const screenHeight = window.screen.height

const TitleHeight = 28

function getWindowSize(width: number, height: number, scale = 0.5): { width: number, height: number } {
  let windowWidth = width
  let windowHeight = height
  if (windowWidth > screenWidth * scale) {
    windowWidth = screenWidth * scale
    windowHeight = (windowWidth * height) / width
  }
  if (windowHeight > screenHeight * scale) {
    windowHeight = screenHeight * scale
    windowWidth = (windowHeight * width) / height
  }
  return {
    width: Math.ceil(windowWidth),
    height: Math.ceil(windowHeight) + TitleHeight,
  }
}

export async function createPreviewWindow(
  url: string,
  title: string,
  width: number,
  height: number,
  minWidth: number = 706,
  minHeight: number = 564,
): Promise<WebviewWindow> {
  const window = await WebviewWindow.getByLabel('preview')
  if (window) {
    await window.close()
  }
  return new WebviewWindow('preview', {
    title,
    url,
    minWidth,
    minHeight,
    center: true,
    decorations: false,
    ...getWindowSize(width, height),
  })
}

const osEffects = {
  windows: { effects: [Effect.Acrylic, Effect.Blur] },
  macos: { effects: [Effect.HudWindow], state: EffectState.Active },
} as { windows: Effects, macos: Effects, [key: string]: Effects | undefined }

export async function setWindowEffect(enable: boolean = true): Promise<void> {
  const osType = getOsType()
  const appWindow = getCurrentWebviewWindow()

  const effects = osEffects[osType]
  if (enable) {
    if (effects) {
      await appWindow.setEffects(effects)
    }
  } else {
    await appWindow.clearEffects()
  }
  if (osType !== 'linux') {
    setTransparentBackground(enable)
  }
}

export async function setAcrylicWindowEffect(enable: boolean = true): Promise<void> {
  const osType = getOsType()
  if (osType !== 'windows') {
    return
  }
  const appWindow = getCurrentWebviewWindow()
  if (enable) {
    await appWindow.setEffects(osEffects.windows)
    setTransparentBackground(true)
  } else if (await isWindows11()) {
    await appWindow.setEffects({ effects: [Effect.Mica] })
    setTransparentBackground(true)
  } else {
    await appWindow.clearEffects()
    setTransparentBackground(false)
  }
}
