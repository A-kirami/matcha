import type { ActionResponse } from '~/adapter/action'

// eslint-disable-next-line unicorn/no-null
export function response<D>(retcode: number, data: D | null = null): ActionResponse<D> {
  const status = retcode === 0 ? 'ok' : 'failed'
  return {
    status,
    retcode,
    data,
  }
}
