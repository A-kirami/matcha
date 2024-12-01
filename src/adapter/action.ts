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

export type ActionStrategy<R = ActionResponse> = Record<string, ((request: ActionRequest['params']) => R | Promise<R>) | undefined>

export abstract class AdapterActionHandler {
  abstract readonly strategy: ActionStrategy

  abstract handle(request: ActionRequest): Promise<ActionResponse>
}
