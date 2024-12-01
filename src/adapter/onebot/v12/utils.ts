import type { ActionResponse } from './typed'

// eslint-disable-next-line unicorn/no-null
export function response<D>(retcode: number, data: D | null = null, message = ''): ActionResponse<D> {
  const status = retcode === 0 ? 'ok' : 'failed'
  return {
    status,
    retcode,
    data,
    message,
  }
}
