import ClsSDKError from './exception';
import { GetAuthorizationFn, IClientConfig, IClsSDKError, QCloudCredential } from './typings';

export default class ClientConfig implements IClientConfig {
  private clsTopicId: string = '';

  get topicId() {
    return this.clsTopicId;
  }

  private clsRegion: string = '';

  get region() {
    return this.clsRegion;
  }

  private clsCredential: QCloudCredential | undefined = undefined;

  get credential() {
    return this.clsCredential;
  }

  public getAuthorization: GetAuthorizationFn | undefined = undefined;

  public onError(_error: IClsSDKError): void {}

  public maxRetainDuration = 20;

  public maxRetainSize = 30;

  public logExpiredDays = 7;

  public logPath = '';

  public httpAdapter: IClientConfig['httpAdapter'] = undefined;

  private clsSourceIp = '';

  get sourceIp() {
    return this.clsSourceIp;
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
      this.clsSourceIp = options.sourceIp;
    }

    if (options.credential) {
      this.clsCredential = options.credential;
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

    this.clsTopicId = options.topicId;
    this.clsRegion = options.region;
  }
}
