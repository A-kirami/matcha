import { invoke } from '@tauri-apps/api/core'
import { appCacheDir, join } from '@tauri-apps/api/path'
import { exists, BaseDirectory } from '@tauri-apps/plugin-fs'

import { CacheFile } from '~/database/model'

interface FileSource {
  str?: string
  binary?: number[]
}

async function getSHA256(buffer: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
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
  const cacheFile = await getCacheFile(file)
  if (cacheFile) {
    return {
      id: cacheFile.id,
      url: await getFile(GetType.URL, cacheFile.id),
    }
  }
  const fileSource: FileSource = {}
  if (file instanceof File) {
    const buffer = await file.arrayBuffer()
    fileSource.binary = Array.from(new Uint8Array(buffer))
  } else {
    fileSource.str = file
  }
  const { size, sha256 } = await invoke<{ size: number; sha256: string }>('create_cache_file', {
    fileSource,
    validateType,
  })
  const fileId = getUUID()
  await db.files.add({ id: fileId, name: file instanceof File ? file.name : sha256, size, sha256 })
  return {
    id: fileId,
    url: await getFile(GetType.URL, fileId),
  }
}

async function getCacheFile(file: string | File): Promise<CacheFile | undefined> {
  if (file instanceof File) {
    const buffer = await file.arrayBuffer()
    const fileSHA256 = await getSHA256(buffer)
    return await db.files.where({ sha256: fileSHA256 }).first()
  } else {
    const cacheFile = await db.files.where({ id: file }).first()
    if (cacheFile && (await exists(`cache/${cacheFile.sha256}`, { baseDir: BaseDirectory.AppCache }))) {
      return cacheFile
    }
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
