import { invoke } from '@tauri-apps/api/core'

import type { FileURL, FilePath, FileData } from '~/adapter/onebot/v12/typed'

export interface FileSource {
  str?: string
  binary?: number[]
}

export const Commands = {
  /**
   * 获取文件类型
   * @param file 文件信息
   * @returns 文件类型信息
   */
  async getFileType(file: { content?: number[], path?: string }) {
    return await invoke<FileType>('get_file_type', { file })
  },

  /**
   * 复制文件
   * @param source 源文件路径
   * @param target 目标路径
   */
  async copyFile(source: string, target: string) {
    return await invoke<void>('copy_file', { source, target })
  },

  /**
   * 写入文件内容
   * @param contents 文件内容数组
   * @param path 文件路径
   * @param overwrite 是否覆盖
   */
  async writeFile(contents: number[], path: string, overwrite = false) {
    return await invoke<void>('write_file', { contents, path, overwrite })
  },

  /**
   * 启动资源服务器
   * @param host 主机地址
   * @param port 端口号
   */
  async startAssetsServer(host: string, port: number) {
    return await invoke<void>('start_assets_server', { host, port })
  },

  /**
   * 上传文件
   * @param file 文件信息
   * @returns 上传结果
   */
  async uploadFile(file: FileURL<'url'> | FilePath<'path'> | FileData<'data'>) {
    return await invoke<{ size: number, sha256: string }>('upload_file', { file })
  },

  /**
   * 创建文件片段
   * @param fileId 文件ID
   * @param offset 偏移量
   * @param data 片段数据
   */
  async createFileFragment(fileId: string, offset: number, data: string | Uint8Array) {
    return await invoke<void>('create_file_fragment', { fileId, offset, data })
  },

  /**
   * 合并文件片段
   * @param fileId 文件ID
   * @param totalSize 总大小
   * @param sha256 SHA256哈希值
   * @returns 合并结果
   */
  async mergeFileFragment(fileId: string, totalSize: number, sha256: string) {
    return await invoke<string>('merge_file_fragment', { fileId, totalSize, sha256 })
  },

  /**
   * 创建缓存文件
   * @param fileSource 文件源
   * @param validateType 校验的文件类型
   * @returns 文件大小和SHA256哈希
   */
  async createCacheFile(fileSource: FileSource, validateType?: string) {
    return await invoke<{ size: number, sha256: string }>('create_cache_file', {
      fileSource,
      validateType,
    })
  },

  /**
   * 读取文件内容
   * @param path 文件路径
   * @param offset 偏移量（可选）
   * @param size 读取大小（可选）
   * @returns 文件内容的字节数组
   */
  async readFile(path: string, offset?: number, size?: number) {
    return await invoke<number[]>('read_file', { path, offset, size })
  },
}
