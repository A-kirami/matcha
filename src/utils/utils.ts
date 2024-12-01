/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 在一定范围内随机获取整数
 * @param min 最小整数
 * @param max 最大整数
 *
 * @returns 随机整数
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * max + min)
}

/**
 * 空值过滤
 * @param x 过滤数据
 *
 * @returns 是否为空值
 */
export function nonNullable<T>(x: T | undefined | null): x is T {
  return x !== undefined || x !== null
}

/**
 * 获取时间戳
 *
 * @returns 当前时间戳（10位）
 */
export function getTimestamp(): number {
  return Math.round(Date.now() / 1000)
}

/**
 * 获取 UUID
 *
 * @returns UUID
 */
export function getUUID(): string {
  return crypto.randomUUID()
}

/** 异步包装器 */
export function asyncWrapper<T>(func: (...param: any[]) => T | Promise<T>): (...param: any[]) => Promise<T> {
  if (func.constructor.name === 'AsyncFunction') {
    return func as (...param: any[]) => Promise<T>
  }
  return async (...args: any[]) => {
    return func(...args)
  }
}

/**
 * @class
 * @classdesc 设置默认值函数，当键不存在时，将调用此函数并将结果设置为对应键的默认值
 */
export class DefaultMap<K, V> extends Map<K, V> {
  constructor(
    private getDefaultValue: (key: K) => V,
    entries?: readonly (readonly [K, V])[] | null,
  ) {
    super(entries)
  }

  /**
   * @method
   * @memberof DefaultMap
   * @instance
   * @param  key - 映射的键
   * @returns  映射的值，如果不存在，则为默认值
   * @description 获取对应键的值，如果不存在则设置默认值。
   */
  got = (key: K): V => {
    if (!this.has(key)) {
      this.set(key, this.getDefaultValue(key))
    }
    return super.get(key)!
  }
}

export function getAssetsUrl(name: string): string {
  return new URL(`../assets/${name}`, import.meta.url).href
}

export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) {
    return '0 Bytes'
  }
  const k = 1024,
    dm = decimals || 2,
    sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
    i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

interface NavigatorUAData {
  getHighEntropyValues(hints: string[]): Promise<{ platformVersion: string }>
  platform: string
}

interface NavigatorUA extends Navigator {
  readonly userAgentData?: NavigatorUAData
}

// https://learn.microsoft.com/en-us/microsoft-edge/web-platform/how-to-detect-win11#sample-code-for-detecting-windows-11
export async function isWindows11(): Promise<boolean> {
  const { userAgentData } = navigator as NavigatorUA

  if (!userAgentData) {
    return false
  }

  try {
    const ua = await userAgentData.getHighEntropyValues(['platformVersion'])
    if (userAgentData.platform === 'Windows') {
      const majorPlatformVersion = Number.parseInt(ua.platformVersion.split('.')[0])
      return majorPlatformVersion >= 13
    }
  } catch {
    return false
  }

  return false
}

export function setTransparentBackground(enable: boolean = true): void {
  if (enable) {
    document.body.classList.add('bg-transparent')
  } else {
    document.body.classList.remove('bg-transparent')
  }
}
