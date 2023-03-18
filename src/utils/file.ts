import { exists } from '@tauri-apps/api/fs'
import { appCacheDir, join } from '@tauri-apps/api/path'
import { invoke } from '@tauri-apps/api/tauri'
import { ArrayBuffer as MD5ArrayBuffer } from 'spark-md5'

import type { InvokeArgs } from '@tauri-apps/api/tauri'

interface CreateFilePayload extends InvokeArgs {
  fileType: 'image' | 'audio' | 'video'
  file?: number[]
  fileOrigin?: string
  validate: boolean
}

/**
 * 创建文件缓存
 * @param type 文件类型
 * @param file 文件
 * @param validate 是否校验文件类型
 *
 * @returns 缓存文件的 URL
 */
export async function createFileCache(
  type: 'image' | 'audio' | 'video',
  file: string | File,
  validate = false
): Promise<{ id: string; url: string }> {
  const payload: CreateFilePayload = { fileType: type, validate }
  if (file instanceof File) {
    const buffer = await file.arrayBuffer()
    const fileName = MD5ArrayBuffer.hash(buffer)
    const appCacheDirPath = await appCacheDir()
    const filePath = await join(appCacheDirPath, type, fileName)
    if (await exists(filePath)) {
      return {
        id: fileName,
        url: `http://127.0.0.1:8720/matcha/cache/${type}/${fileName}`,
      }
    }
    const fileContents = Array.from(new Uint8Array(buffer))
    payload.file = fileContents
  } else {
    payload.fileOrigin = file
  }
  const fileName = await invoke<string>('create_file_cache', payload)
  return {
    id: fileName,
    url: `http://127.0.0.1:8720/matcha/cache/${type}/${fileName}`,
  }
}
