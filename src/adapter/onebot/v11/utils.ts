import { StrKeyObject } from '@/adapter/typed'

import type { ActionResponse } from '@/adapter/action'

export function response<D extends StrKeyObject>(retcode: number, data: D | null = null): ActionResponse<D> {
  const status = retcode === 0 ? 'ok' : 'failed'
  return {
    status,
    retcode,
    data,
  }
}
