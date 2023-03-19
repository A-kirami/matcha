import { ActionResponse } from './action'

class AdapterError extends Error {}

export class ProtocolError extends AdapterError {
  static message = '协议出现错误'

  constructor(public response: ActionResponse) {
    super(ProtocolError.message)
  }
}

/** 不支持的动作请求 */
export class UnsupportedActionError extends ProtocolError {
  static message = '不支持的动作请求'
}
