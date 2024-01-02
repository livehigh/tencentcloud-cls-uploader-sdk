import ClsSDKError from './exception';
import { GetAuthorizationFn, IClientConfig, IClsSDKError, QCloudCredential } from './typings';
import { isNotEmpty } from './util';

export default class ClientConfig implements IClientConfig {
  private clsTopicId: string = '';

  get topicId() {
    return this.clsTopicId;
  }

  public region: IClientConfig['region'] = undefined;

  public endpoint: IClientConfig['endpoint'] = undefined;

  public api: IClientConfig['api'] = undefined;

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

  public autoFillSourceIp: IClientConfig['autoFillSourceIp'] = undefined;

  public sourceIp: IClientConfig['sourceIp'] = undefined;

  public proxy: IClientConfig['proxy'] = undefined;

  public getAgent: IClientConfig['getAgent'] = undefined;

  constructor(options: IClientConfig) {
    if (!options.topicId || typeof options.topicId !== 'string') {
      throw new ClsSDKError('topicId is required and must be a string');
    }
    if (options.region && isNotEmpty(options.region)) {
      this.region = options.region;
    } else if (options.endpoint && isNotEmpty(options.endpoint)) {
      this.endpoint = options.endpoint;
    } else {
      throw new ClsSDKError('region or endpoint is required');
    }

    if (isNotEmpty(options.api)) {
      this.api = options.api;
    }

    if (isNotEmpty(options.sourceIp)) {
      this.sourceIp = options.sourceIp;
    }

    if (isNotEmpty(options.autoFillSourceIp)) {
      this.autoFillSourceIp = options.autoFillSourceIp;
    }

    if (isNotEmpty(options.credential)) {
      this.clsCredential = options.credential;
    }

    if (isNotEmpty(options.getAuthorization)) {
      this.getAuthorization = options.getAuthorization;
    }

    if (isNotEmpty(options.proxy)) {
      this.proxy = options.proxy;
    }

    if (isNotEmpty(options.getAgent)) {
      this.getAgent = options.getAgent;
    }

    if (isNotEmpty(options.httpAdapter)) {
      this.httpAdapter = options.httpAdapter;
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

    if (options.onError) {
      this.onError = options.onError;
    }

    this.clsTopicId = options.topicId;
  }
}
