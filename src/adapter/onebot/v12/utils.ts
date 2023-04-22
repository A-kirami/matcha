import type { ActionResponse } from './typed'

export function response<D>(retcode: number, data: D | null = null, message = ''): ActionResponse<D> {
  const status = retcode === 0 ? 'ok' : 'failed'
  return {
    status,
    retcode,
    data,
    message,
  }
}
