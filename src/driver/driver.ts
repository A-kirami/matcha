import { Adapter } from '@/adapter/adapter'
import { Event } from '@/adapter/event'

export abstract class Driver {
  constructor(public adapter: Adapter) {}
  abstract run(): Promise<void>
  abstract stop(): Promise<void>
  abstract send(event: Event): Promise<boolean>
}
