import { asyncWrapper } from '@/utils'

import type { Scenes } from './scene'
import type { StrKeyObject } from './typed'

export type Event = StrKeyObject

export type EventBuildStrategy<S> = {
  readonly [K in keyof S]?: (scene: S[K]) => Event | Promise<Event>
}

export type EventParseStrategy<E> = {
  readonly [K in keyof E]?: (event: E[K]) => Scenes | Promise<Scenes>
}

interface Strategy<P, R> {
  [key: string]: ((context: P) => R | Promise<R>) | undefined
}

export abstract class AdapterEventHandler<E extends Event> {
  abstract readonly buildStrategy: EventBuildStrategy<unknown>
  abstract readonly parseStrategy: EventParseStrategy<unknown>

  async build(scene: Scenes): Promise<E | undefined> {
    const key = this.getSceneKey(scene)
    const func = (this.buildStrategy as Strategy<Scenes, E>)[key]
    if (func) {
      const asyncFn = asyncWrapper<E>(func)
      return await asyncFn(scene)
    }
  }

  async parse(event: E): Promise<Scenes | undefined> {
    const key = this.getEventKey(event)
    const func = (this.parseStrategy as Strategy<E, Scenes>)[key]
    if (func) {
      const asyncFn = asyncWrapper<Scenes>(func)
      return await asyncFn(event)
    }
  }

  createKey(...args: Array<string | undefined>): string {
    return args.filter(Boolean).join('.')
  }

  getSceneKey(scene: Scenes): string {
    return this.createKey(scene.type, scene.detail_type)
  }

  abstract getEventKey(event: Event): string
}
