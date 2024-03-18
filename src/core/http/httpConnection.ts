import axios, { AxiosAdapter, AxiosInstance, AxiosPromise, AxiosRequestConfig, AxiosResponse } from 'axios';
import mpAdapter from 'axios-miniprogram-adapter';

import { CLSLog, QcloudTmpCredential, QCloudCredential, HttpConnectionOptions } from '../typings';
import { isNotEmpty, wait } from '../util';
import systemClock from '../util/systemClock';
import sign, { SignOptions } from '../util/sign';
import ClsSDKError from '../exception';
import handleLogs from '../util/logs';
import ClientConfig from '../ClientConfig';

/**
 * @class HttpConnection
 * @internal
 */
export class HttpConnection {
  /**
   * 临时签名缓存
   */
  private stsCache: QcloudTmpCredential[] = [];

  readonly CLS_HOST = 'cls.tencentcs.com';

  private cancelRequestSource = axios.CancelToken.source();

  public retryTimes = 3; // 默认重试次数

  private topicId = '';

  private autoFillSourceIp = false;

  private api: string | { anony: string; auth: string } = { anony: '/tracklog', auth: '/structuredlog' };

  /**
   * 永久密钥 SecretId、SecretKey
   */
  private credential: QCloudCredential | undefined = undefined;

  /**
   * 获取签名的回调方法
   */
  private getAuthorization: ClientConfig['getAuthorization'] | undefined = undefined;

  /**
   * 需要鉴权
   */
  private get needAuth() {
    return isNotEmpty(this.credential) || isNotEmpty(this.getAuthorization);
  }

  private ins: AxiosInstance | undefined = undefined;

  constructor(options: HttpConnectionOptions) {
    this.topicId = options.topicId;
    this.credential = options.credential;
    this.getAuthorization = options.getAuthorization;
    this.autoFillSourceIp = options.autoFillSourceIp ?? true;
    this.api = options.api ?? { anony: '/tracklog', auth: '/structuredlog' };
    this.ins = this.getIns(options);
  }

  public getIns(options: HttpConnectionOptions) {
    this.retryTimes = options.retry ?? 3;

    let protocol = options.protocol ?? 'https';

    if (!isNotEmpty(options.region) && !isNotEmpty(options.endpoint)) {
      throw new ClsSDKError('region or endpoint are required');
    }

    let host = `${options.region}.${this.CLS_HOST}`;
    if (options.region) {
      host = `${options.region}.${this.CLS_HOST}`;
    } else if (options.endpoint) {
      host = options.endpoint;
    }

    const headers = this.getCommonHeaders(host);

    const axiosConfig: AxiosRequestConfig = {
      baseURL: `${protocol}://${host}`,
      headers,
      timeout: 5000,
      cancelToken: this.cancelRequestSource.token,
      params: {
        topic_id: this.topicId,
      },
    };
    if (options.agent) {
      const { httpAgent, httpsAgent, proxy } = options.agent;
      protocol = options.agent.protocol || protocol;

      httpAgent && (axiosConfig.httpAgent = httpAgent);
      httpsAgent && (axiosConfig.httpsAgent = httpsAgent);
      proxy && (axiosConfig.proxy = proxy);
      options.proxy && (axiosConfig.proxy = proxy); // 直接挂载的代理变量优先级高于函数中获取的代理变量
    }

    const axiosIns = axios.create(axiosConfig);
    this.generateCancelToken(axiosIns);
    this.initMethods(axiosIns);
    this.setReqInterceptors(axiosIns);
    this.setResInterceptors(axiosIns);

    axiosIns.defaults.adapter = mpAdapter;

    return axiosIns;
  }

  private getCommonHeaders(host: string) {
    const headers: Record<string, string> = {
      ...(this.autoFillSourceIp && { 'x-cls-add-source': '1' }),
    };
    if (this.needAuth) {
      headers['Content-Type'] = 'application/x-protobuf';
      headers['Host'] = host;
    } else {
      headers['Content-Type'] = 'application/json';
    }
    return headers;
  }

  public put!: (config: AxiosRequestConfig) => AxiosPromise;
  public post!: (config: AxiosRequestConfig) => AxiosPromise;
  public get!: (config: AxiosRequestConfig) => AxiosPromise;
  public delete!: (config: AxiosRequestConfig) => AxiosPromise;
  public head!: (config: AxiosRequestConfig) => AxiosPromise;
  private initMethods(httpIns: AxiosInstance) {
    ['PUT', 'POST', 'GET', 'DELETE', 'HEAD'].forEach(method => {
      this[method.toLowerCase() as 'put' | 'post' | 'get' | 'delete' | 'head'] = (config: AxiosRequestConfig) => {
        const { url } = config;
        if (!url) throw new Error('url 不能为空');

        return httpIns({
          method,
          ...config,
        });
      };
    });
  }

  /**
   * 修改请求适配器
   * @param adapter
   */
  public changeAdapter(adapter: AxiosAdapter | 'xhr' | 'http') {
    if (!this.ins) {
      throw new ClsSDKError('HttpConnection is not initialized');
    }
    this.ins.defaults.adapter = adapter;
  }

  /**
   * 取消当前所有请求
   */
  public cancelRequest() {
    if (!this.ins) {
      throw new ClsSDKError('HttpConnection is not initialized');
    }
    this.cancelRequestSource.cancel('cancel');
    this.generateCancelToken(this.ins);
  }

  /**
   * 通用请求拦截器
   */
  private setReqInterceptors(httpIns: AxiosInstance): void {
    httpIns.interceptors.request.use(
      async config => {
        const { headers, params, url, method } = config;
        const authData = await this._getAuthorization({
          method: method as string,
          headers,
          query: params,
          api: url?.replace(/^\//g, '') || '',
        });
        if (authData) {
          config.headers.Authorization = authData.Authorization;
          authData.SecurityToken && (config.headers['x-cls-token'] = authData.SecurityToken);
        }
        return config;
      },
      error => Promise.resolve(error),
    );
  }
  /**
   * 通用响应拦截器
   */
  private setResInterceptors(httpIns: AxiosInstance): void {
    httpIns.interceptors.response.use(
      (response): AxiosResponse => {
        systemClock.handleOffset(response.headers.date);
        return response;
      },
      async error => {
        if (axios.isCancel(error)) {
          const error = {
            code: 'canceled',
            message: 'Operation canceled by the user.',
          };
          throw new ClsSDKError(error);
        }

        if (!error.config.retryTimes) {
          error.config.retryTimes = 0;
        }

        if (error.response) {
          systemClock.handleOffset(error.response.headers.date);
          // 请求已发出，但服务器响应的状态码不在 2xx 范围内
          const { status, headers, config, data } = error.response;
          if (status !== 413 && config.retryTimes < this.retryTimes) {
            config.retryTimes++;
            // TODO: 需要校准时间
            await wait(1000);
            return httpIns(config);
          } else {
            throw new ClsSDKError({ status, headers, code: data.errorcode, message: data.errormessage });
          }
        }

        throw new ClsSDKError({ code: error.code || error.message, message: error.message });
      },
    );
  }

  /**
   * 上传日志
   * @param logs
   * @returns  AxiosPromise
   */
  public putLogs(logs: CLSLog[]) {
    if (!this.ins) {
      throw new ClsSDKError('HttpConnection is not initialized');
    }
    const authApi = typeof this.api === 'string' ? this.api : this.api.auth;
    const anonyApi = typeof this.api === 'string' ? this.api : this.api.anony;
    if (this.needAuth) {
      const data = handleLogs.log2Buffer(logs);
      return this.post({
        url: authApi,
        data,
      });
    } else {
      const data = handleLogs.log2JSON(logs);
      return this.post({
        url: anonyApi,
        data,
      });
    }
  }

  public putZhiyanLogs(logs: CLSLog[]) {
    if (!this.ins) {
      throw new ClsSDKError('HttpConnection is not initialized');
    }
    const data = handleLogs.log2ZhiyanJSON(logs, this.topicId);
    const anonyApi = typeof this.api === 'string' ? this.api : this.api.anony;
    return this.post({
      url: anonyApi,
      data,
    });

  }

  /**
   * 生成取消请求的token种子
   * @param ins
   */
  private generateCancelToken(ins: AxiosInstance) {
    this.cancelRequestSource = axios.CancelToken.source();
    ins.defaults.cancelToken = this.cancelRequestSource.token;
  }

  private async _getAuthorization(params: {
    method: string;
    headers: any;
    query: any;
    api: string;
  }): Promise<{ Authorization: string; SecurityToken?: string } | undefined> {
    const headers = HttpConnection.formatHeader(params.headers);

    // 有永久密钥则直接签名
    if (this.credential) {
      // 内部计算获取签名
      return HttpConnection.calcAuth({
        ...this.credential,
        ...params,
        headers,
      });
    }

    let stsData: QcloudTmpCredential | undefined = undefined;
    // 从缓存中取可用的签名 sts
    (() => {
      let i;
      let AuthData;
      for (i = this.stsCache.length - 1; i >= 0; i--) {
        AuthData = this.stsCache[i];
        const compareTime = Math.round(systemClock.now() / 1000) + 30;
        if ((AuthData.StartTime && compareTime < AuthData.StartTime) || compareTime >= AuthData.ExpiredTime) {
          this.stsCache.splice(i, 1);
          continue;
        }
        stsData = AuthData;
        break;
      }
    })();
    // 判断是否有缓存过可以使用的临时密钥
    if (stsData?.ExpiredTime && stsData.ExpiredTime - systemClock.now() / 1000 > 60) {
      // 如果缓存的临时密钥有效，并还有超过60秒有效期就直接使用
      return HttpConnection.calcAuth({
        ...params,
        headers,
        ...stsData,
        SecretId: stsData.TmpSecretId,
        SecretKey: stsData.TmpSecretKey,
      });
    } else if (this.getAuthorization) {
      // 外部计算签名或获取临时密钥
      const authData = await this.getAuthorization({
        method: params.method,
        query: params.query,
        headers: headers,
      });

      if (typeof authData === 'string') {
        return { Authorization: authData };
      } else if (
        authData.StartTime &&
        authData.TmpSecretId &&
        authData.TmpSecretKey &&
        authData.Token &&
        authData.ExpiredTime
      ) {
        stsData = authData;
        this.stsCache.push(stsData);
        return HttpConnection.calcAuth({
          ...params,
          headers,
          ...stsData,
          SecretId: stsData.TmpSecretId,
          SecretKey: stsData.TmpSecretKey,
        });
      } else {
        throw new ClsSDKError('getAuthorization return value is not standardized.');
      }
    }
  }

  private static formatHeader(headers: Record<string, any>) {
    const commonHeaders: Record<string, any> = {};
    const CommonHeaderSet = new Set(['Content-Type', 'Host', 'Content-Length']);
    Object.keys(headers).forEach(key => {
      if (CommonHeaderSet.has(key)) {
        commonHeaders[key] = headers[key];
      }
    });
    return commonHeaders;
  }

  private static calcAuth(options: SignOptions & { SecurityToken?: string }) {
    const Authorization = sign(options);
    const authData = {
      Authorization,
      SecurityToken: options.SecurityToken || '',
    };
    return authData;
  }
}
