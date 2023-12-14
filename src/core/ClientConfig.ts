import ClsSDKError from './exception';
import { GetAuthorizationFn, IClientConfig, IClsSDKError, QCloudCredential } from './typings';

export default class ClientConfig implements IClientConfig {
  private _topicId: string = '';

  get topicId() {
    return this._topicId;
  }

  private _region: string = '';

  get region() {
    return this._region;
  }

  private _credential: QCloudCredential | undefined = undefined;

  get credential() {
    return this._credential;
  }

  public getAuthorization: GetAuthorizationFn | undefined = undefined;

  public onError(_error: IClsSDKError): void {}

  public maxRetainDuration = 20;

  public maxRetainSize = 30;

  public logExpiredDays = 7;

  public logPath = '';

  public httpAdapter: IClientConfig['httpAdapter'] = undefined;

  private _sourceIp = '';

  get sourceIp() {
    return this._sourceIp;
  }

  public proxy: IClientConfig['proxy'] = undefined;

  public getAgent: IClientConfig['getAgent'] = undefined;

  constructor(options: IClientConfig) {
    if (!options.topicId || typeof options.topicId !== 'string') {
      throw new ClsSDKError('topicId is required and must be a string');
    }
    if (!options.region || typeof options.region !== 'string') {
      throw new ClsSDKError('region is required and must be a string');
    }

    if (options.sourceIp) {
      this._sourceIp = options.sourceIp;
    }

    if (options.credential) {
      this._credential = options.credential;
    }

    if (options.getAuthorization) {
      this.getAuthorization = options.getAuthorization;
    }

    if (options.proxy) {
      this.proxy = options.proxy;
    }

    if (options.getAgent) {
      this.getAgent = options.getAgent;
    }

    if (options.maxRetainDuration) {
      this.maxRetainDuration = options.maxRetainDuration;
    }
    if (options.maxRetainSize) {
      this.maxRetainSize = options.maxRetainSize;
    }
    if (options.logExpiredDays) {
      this.logExpiredDays = options.logExpiredDays;
    }

    if (options.logPath) {
      this.logPath = options.logPath;
    }

    if (options.httpAdapter) {
      this.httpAdapter = options.httpAdapter;
    }

    if (options.onError) {
      this.onError = options.onError;
    }

    this._topicId = options.topicId;
    this._region = options.region;
  }
}
