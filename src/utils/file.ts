import { appCacheDir, join } from '@tauri-apps/api/path'
import { exists, BaseDirectory } from '@tauri-apps/plugin-fs'

const general = useGeneralSettingsStore()

async function getSHA256(buffer: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
  const hashArray = [...new Uint8Array(hashBuffer)]
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
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
  validateType?: string,
  name?: string,
): Promise<{ id: string, url: string }> {
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
    fileSource.binary = [...new Uint8Array(buffer)]
  } else {
    fileSource.str = file
  }
  const { size, sha256 } = await Commands.createCacheFile(fileSource, validateType)
  const existFile = await db.files.get({ sha256 })
  const fileId = existFile ? existFile.id : getUUID()
  if (!existFile) {
    await db.files.add({ id: fileId, name: name || sha256, size, sha256 })
  }
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
  } else if (/^[a-z,0-9,-]{36,36}$/.test(file)) {
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
    case GetType.URL: {
      return `http://${general.assetsServerAddress}/matcha/cache/${file.sha256}`
    }
    case GetType.PATH:
    case GetType.DATA: {
      const appCacheDirPath = await appCacheDir()
      const path = await join(appCacheDirPath, 'cache', file.sha256)
      if (type === GetType.PATH) {
        return path
      } else {
        const contents = await Commands.readFile(path)
        return new Uint8Array(contents)
      }
    }
    default: {
      throw new Error('无效的获取方式')
    }
  }
}

export interface FileInfo {
  id: string
  name: string
  size: number
  url: string
  path: string
}

export async function getFileInfo(fileId: string): Promise<FileInfo> {
  const appCacheDirPath = await appCacheDir()
  const file = await db.files.get(fileId)
  if (!file) {
    throw new Error('文件不存在')
  }
  const path = await join(appCacheDirPath, 'cache', file.sha256)
  return {
    id: fileId,
    name: file.name,
    size: file.size,
    url: await getFile(GetType.URL, fileId),
    path,
  }
}
