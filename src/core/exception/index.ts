import { ClsSdkErrorOption, IClsSDKError } from "../typings";

/**
 * SDK异常错误类型
 * @internal
 */
export default class ClsSDKError extends Error implements IClsSDKError {
  /**
   * 请求id
   */
  private clsRequestId?: string;

  get requestId() {
    return this.clsRequestId;
  }

  /**
   * http状态码
   */
  private httpStatus?: number;

  get status() {
    return this.httpStatus;
  }

  /**
   * 接口返回状态码
   */
  private httpCode?: string;

  get code() {
    return this.httpCode;
  }

  constructor(error: string | ClsSdkErrorOption) {
    if (typeof error === 'string') {
      super(error);
    } else {
      super(error.message);
      this.clsRequestId = error.headers?.['x-cls-requestid'] || '';
      this.httpStatus = error.status;
      this.httpCode = error.code;
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
