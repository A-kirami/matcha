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
  return Math.round(new Date().getTime() / 1000)
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
