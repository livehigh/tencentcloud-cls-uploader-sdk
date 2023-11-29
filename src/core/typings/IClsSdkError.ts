/**
 * Cls sdk error option
 * @internal
 */
export interface ClsSdkErrorOption {
  status?: number;
  headers?: any;
  code: string;
  message: string;
}

/**
 * CLS SDK异常错误类型
 * @public
 */
export interface IClsSDKError {
  /**
   * cls 返回的 requestId 信息
   */
  requestId?: string;
  /**
   * http状态码
   */
  status?: number;
  /**
   * 接口返回状态码
   */
  code?: string;
  /**
   * 获取请求id
   * @returns 请求id
   */
  getMessage(): string;
  /**
   * 获取字符串形式
   * @returns string
   */
  toString(): string;
  /**
   * 获取当地字符串形式
   * @returns locale string
   */
  toLocaleString(): string;
}