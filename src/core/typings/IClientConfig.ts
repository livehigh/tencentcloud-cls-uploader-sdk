import { AxiosAdapter } from 'axios';
import { IClsSDKError } from './IClsSdkError';

/**
 * 永久密钥
 * @public
 */
export interface QCloudCredential {
  /**
   * 用户的 SecretId，建议使用子账号密钥，授权遵循最小权限指引，降低使用风险。子账号密钥获取可参见 https://cloud.tencent.com/document/product/598/37140
   */
  SecretId: string;
  /**
   * 用户的 SecretKey，建议使用子账号密钥，授权遵循最小权限指引，降低使用风险。子账号密钥获取可参见 https://cloud.tencent.com/document/product/598/37140
   */
  SecretKey: string;
}

/**
 * 临时密钥
 * @public
 */
export interface QcloudTmpCredential {
  /**
   * 获取回来的临时密钥的 tmpSecretId
   */
  TmpSecretId: string;
  /**
   * 获取回来的临时密钥的 tmpSecretKey
   */
  TmpSecretKey: string;
  /**
   * 获取回来的临时密钥的 Token
   */
  Token: string;
  /**
   * 临时密钥的过期时间
   */
  ExpiredTime: number;
  /**
   * 建议传入sts接口返回的服务器时间作为签名的开始时间，避免用户浏览器本地时间偏差过大导致签名错误
   */
  StartTime: number;
}

/**
 * 获取临时密钥函数
 * @public
 */
export type GetAuthorizationFn = (options: {
  method: string;
  headers: any;
  query: any;
}) => Promise<QcloudTmpCredential>;

/**
 * ClientConfig 参数配置
 * @public
 */
export interface IClientConfig {
  /**
   * cls topicId
   */
  topicId: string;
  /**
   * 要上传的CLS地域
   */
  region: string;
  /**
   * 日志来源，一般使用机器 IP 作为标识
   */
  sourceIp: string;
  /**
   * 永久密钥
   */
  credential?: QCloudCredential;
  /**
   * 获取临时密钥函数
   */
  getAuthorization?: GetAuthorizationFn;
  /**
   * 代理配置
   */
  proxy?: { host: string; port: number; protocol?: string };
  /**
   * 获取代理函数
   */
  getAgent?: () => any;
  /**
   * http 请求适配器
   */
  httpAdapter?: 'xhr' | 'http' | AxiosAdapter;
  /**
   * 未上传的缓存日志超过该时间则上传（单位: s，默认 30s）
   */
  maxRetainDuration?: number;
  /**
   * 未上传的缓存日志数量超过该数值则上传（默认 20 条）
   */
  maxRetainSize?: number;
  /**
   * 本地日志缓存路径，选填（暂未开发）
   */
  logPath?: string;
  /**
   * 本地日志清理时间（单位: day, 默认 7 天）（暂未开发）
   */
  logExpiredDays?: number;
  /**
   * 生命周期：上传器发起请求发生错误（不影响上传器后续使用）
   */
  onError?: (error: IClsSDKError) => void;
}
