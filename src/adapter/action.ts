import type { Scenes } from './scene'

export interface ActionRequest {
  action: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: any
  echo?: string
}

export interface ActionResponse<D = unknown> {
  status: 'ok' | 'failed'
  retcode: number
  data: D | null
  echo?: string
}

export interface ActionResult<R = unknown, S extends Scenes = Scenes> {
  response: ActionResponse<R>
  scene?: S
}

export interface ActionStrategy {
  [key: string]: ((request: ActionRequest['params']) => ActionResult | Promise<ActionResult>) | undefined
}

export abstract class AdapterActionHandler {
  abstract readonly strategy: ActionStrategy

  abstract handle(request: ActionRequest): Promise<ActionResult>
}
