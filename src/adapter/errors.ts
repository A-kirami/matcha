import type { ActionResponse } from './action'

class AdapterError extends Error {}

export class ProtocolError extends AdapterError {
  static message = '协议出现错误'

  constructor(
    public response: ActionResponse,
    message?: string,
  ) {
    super(message || ProtocolError.message)
  }
}

/** 不支持的动作请求 */
export class UnsupportedActionError extends ProtocolError {
  static message = '不支持的动作请求'

  constructor(response: ActionResponse) {
    super(response, UnsupportedActionError.message)
  }
}

/** 动作处理器运行时抛出异常 */
export class InternalHandlerError extends ProtocolError {
  static message = '动作处理器运行时抛出异常'

  constructor(response: ActionResponse) {
    super(response, InternalHandlerError.message)
  }
}
