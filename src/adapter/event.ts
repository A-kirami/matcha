import { asyncWrapper } from '@/utils'

import type { Scenes } from './scene'
import type { StrKeyObject } from './typed'

export type Event = StrKeyObject

export type EventStrategy<S> = {
  readonly [K in keyof S]?: (scene: S[K]) => Event | Promise<Event>
}

interface Strategy<P, R> {
  [key: string]: ((context: P) => R | Promise<R>) | undefined
}

export abstract class AdapterEventHandler<E extends Event> {
  abstract readonly strategy: EventStrategy<unknown>

  async handle(scene: Scenes): Promise<E | undefined> {
    const key = this.getSceneKey(scene)
    const func = (this.strategy as Strategy<Scenes, E>)[key]
    if (func) {
      const asyncFn = asyncWrapper<E>(func)
      return await asyncFn(scene)
    }
  }

  createKey(...args: Array<string | undefined>): string {
    return args.filter(Boolean).join('.')
  }

  getSceneKey(scene: Scenes): string {
    return this.createKey(scene.type, scene.detail_type)
  }
}
