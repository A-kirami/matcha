import type { ActionResult } from '@/adapter/action'
import type { Scenes } from '@/adapter/scene'

export function result<D, S extends Scenes>(retcode: number, data: D | null = null, scene?: S): ActionResult<D, S> {
  const status = retcode === 0 ? 'ok' : 'failed'
  return {
    response: {
      status,
      retcode,
      data,
    },
    scene,
  }
}
