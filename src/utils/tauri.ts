import { open } from '@tauri-apps/plugin-shell'
import { check } from '@tauri-apps/plugin-updater'
import { toast } from 'vue-sonner'

import type { Update } from '@tauri-apps/plugin-updater'

import { github } from '~build/git'

export async function checkUpdate(): Promise<Update | null> {
  try {
    return await check()
  } catch (error) {
    toast.error('检查更新失败', {
      description: '请尝试手动更新',
      action: {
        label: '前往发布页',
        onClick: () => open(github + '/releases/latest'),
      },
    })
    logger.error(`检查更新失败: ${error}`)
    return null
  }
}
