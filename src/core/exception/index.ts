import { ClsSdkErrorOption, IClsSDKError } from "../typings";

/**
 * SDK异常错误类型
 * @internal
 */
export default class ClsSDKError extends Error implements IClsSDKError {
  /**
   * 请求id
   */
  private _requestId?: string;

  get requestId() {
    return this._requestId;
  }

  /**
   * http状态码
   */
  private _status?: number;

  get status() {
    return this._status;
  }

  /**
   * 接口返回状态码
   */
  private _code?: string;

  get code() {
    return this._code;
  }

  constructor(error: string | ClsSdkErrorOption) {
    if (typeof error === 'string') {
      super(error);
    } else {
      super(error.message);
      this._requestId = error.headers?.['x-cls-requestid'] || '';
      this._status = error.status;
      this._code = error.code;
    }
  }

  public getMessage(): string {
    return this.message;
  }

  public toString(): string {
    return '[ClsSDKError]' + 'message:' + this.getMessage() + '  requestId:' + this.requestId;
  }

  public toLocaleString(): string {
    return '[ClsSDKError]' + 'message:' + this.getMessage() + '  requestId:' + this.requestId;
  }
}
