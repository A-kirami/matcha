import { WebviewWindow } from '@tauri-apps/api/webviewWindow'

const screenWidth = window.screen.width
const screenHeight = window.screen.height

const TitleHeight = 28

function getWindowSize(width: number, height: number, scale = 0.5): { width: number; height: number } {
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
  minWidth = 706,
  minHeight = 564
): Promise<WebviewWindow> {
  const window = WebviewWindow.getByLabel('preview')
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
