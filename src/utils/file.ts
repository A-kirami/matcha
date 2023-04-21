import { appCacheDir, join } from '@tauri-apps/api/path'
import { invoke } from '@tauri-apps/api/tauri'

import { db } from '@/database'

import { getUUID } from './utils'

interface FileSource {
  Str?: string
  Binary?: number[]
}

/**
 * 计算文件的 SHA256
 * @param file 文件二进制
 */
async function getFileSHA256(buffer: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}

/**
 * 创建文件缓存
 * @param file 文件
 * @param validateType 校验的文件类型
 *
 * @returns 缓存文件的 URL
 */
export async function createFileCache(
  file: string | File,
  validateType: string | null = null
): Promise<{ id: string; url: string }> {
  const fileSource: FileSource = {}
  if (file instanceof File) {
    const buffer = await file.arrayBuffer()
    const fileSHA256 = await getFileSHA256(buffer)
    const cacheFile = await db.files.where({ sha256: fileSHA256 }).first()
    if (cacheFile) {
      return {
        id: cacheFile.id,
        url: await getFile(GetType.URL, cacheFile.id),
      }
    }
    fileSource.Binary = Array.from(new Uint8Array(buffer))
  } else {
    fileSource.Str = file
  }
  const fileId = getUUID()
  const { size, sha256 } = await invoke<{ size: number; sha256: string }>('create_cache_file', {
    fileSource,
    validateType,
  })
  await db.files.add({ id: fileId, name: file instanceof File ? file.name : sha256, size, sha256 })
  return {
    id: fileId,
    url: await getFile(GetType.URL, fileId),
  }
}

export const enum GetType {
  URL = 'url',
  PATH = 'path',
  DATA = 'data',
}

export async function getFile(type: GetType.URL | GetType.PATH, fileId: string): Promise<string>
export async function getFile(type: GetType.DATA, fileId: string): Promise<Uint8Array>
export async function getFile(type: GetType, fileId: string): Promise<string | Uint8Array> {
  const file = await db.files.get(fileId)
  if (!file) {
    throw new Error('文件不存在')
  }
  switch (type) {
    case GetType.URL:
      return `http://127.0.0.1:8720/matcha/cache/${file.sha256}`
    case GetType.PATH:
    case GetType.DATA: {
      const appCacheDirPath = await appCacheDir()
      const path = await join(appCacheDirPath, 'cache', file.sha256)
      if (type === GetType.PATH) {
        return path
      } else {
        return await invoke<Uint8Array>('read_file', { path })
      }
    }
    default:
      throw new Error('无效的获取方式')
  }
}
