import { nonNullable, asyncWrapper } from '@/utils'

import type { Contents } from './content'
import type { StrKeyObject } from './typed'

export type Message = { type: string; data: StrKeyObject }

export type MessageBuildStrategy<C> = {
  readonly [K in keyof C]?: (content: C[K]) => Message | Promise<Message>
}

export type MessageParseStrategy<M> = {
  readonly [K in keyof M]?: (message: M[K]) => Contents | Promise<Contents>
}

type Strategy<R> = {
  [key: string]: ((context: object) => R) | undefined
}

export abstract class AdapterMessageHandler<M extends Message> {
  abstract readonly buildStrategy: MessageBuildStrategy<unknown>
  abstract readonly parseStrategy: MessageParseStrategy<unknown>

  async build(contents: Contents[]): Promise<M[]> {
    const collect = contents.map(async (content) => {
      return await this.handle(content, this.buildStrategy)
    })
    const messages = (await Promise.all(collect)).filter(nonNullable)
    return messages
  }

  async parse(messages: M[]): Promise<Contents[]> {
    const collect = messages.map(async (message) => {
      return await this.handle(message, this.parseStrategy)
    })
    const contents = (await Promise.all(collect)).filter(nonNullable)
    return contents
  }

  private async handle(context: Contents, strategy: MessageBuildStrategy<unknown>): Promise<M | undefined>
  private async handle(context: M, strategy: MessageParseStrategy<unknown>): Promise<Contents | undefined>
  private async handle(
    context: Contents | M,
    strategy: MessageBuildStrategy<unknown> | MessageParseStrategy<unknown>
  ): Promise<M | Contents | undefined> {
    const type = context.type
    const func = (strategy as Strategy<M | Contents>)[type]
    if (func) {
      const asyncFn = asyncWrapper<M | Contents>(func)
      return await asyncFn(context)
    }
  }
}
