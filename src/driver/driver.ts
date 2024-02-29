import { Adapter } from '~/adapter/adapter'

import type { Event } from '~/adapter/event'

export abstract class Driver {
  constructor(public adapter: Adapter) {}
  abstract run(): Promise<void>
  abstract stop(): Promise<void>
  abstract send(event: Event): Promise<boolean>
}
