import { CLSLog, IClientConfig } from './typings';
import ClientConfig from './ClientConfig';
import ClsSDKError from './exception';
import Uploader from './Uploader';

/**
 * CLS上传客户端
 * @public
 */
export default class ClsClient {
  /**
   * 内部检查缓存日志定时器
   */
  private logTimer: number | NodeJS.Timeout | undefined = undefined;

  private checkCacheLocked = false;

  /**
   * 日志缓存队列(缓存写入时间按从小到大的顺序)
   */
  private logList: CLSLog[] = [];

  /**
   * 标志cls上传器是否初始化
   */
  private initTag: boolean = false;

  private config: ClientConfig;

  private uploader: Uploader;

  /**
   * Creates an instance of clsclient.
   * @param options - 可选参数，不传则必须调用 init 函数进行初始化
   */
  constructor(options?: IClientConfig) {
    if (options) {
      this.init(options);
    }
  }

  /**
   * clsclient 初始化函数
   * @param options - 参数配置
   */
  public init(options: IClientConfig) {
    this.config = new ClientConfig(options);

    this.uploader = new Uploader({
      config: this.config,
    });
    this.initTag = true;
  }

  /**
   * 检查当前日志缓存，满足上传条件则加入队列
   */
  private async checkLogCaches() {
    if (this.checkCacheLocked) {
      return;
    }
    const currCacheSize = this.logList.length;
    if (currCacheSize === 0) return;

    // 清理掉之前正在执行的定时器
    clearTimeout(this.logTimer);
    this.checkCacheLocked = true;
    const immediate = this.logList.some(log => log.immediate);

    if (!immediate && currCacheSize < this.config.maxRetainSize) {
      // 判断日志缓存里最早的一条日志的时间间隔是否已达到最大缓存间隔
      const firstLog = this.logList[0];
      const { time: latestLogTime } = firstLog;
      const now = Date.now();
      const offsetTime = (now - latestLogTime) / 1000;

      if (offsetTime < this.config.maxRetainDuration) {
        const delayTime = this.config.maxRetainDuration - offsetTime + 1;
        this.checkCacheLocked = false;
        this.logTimer = setTimeout(this.checkLogCaches.bind(this), delayTime * 1000);
        return;
      }
    }

    this.checkCacheLocked = false;
    // 立即将日志加入上传任务队列中
    this.uploader.add(this.logList.splice(0, currCacheSize));
    this.checkLogCaches();
  }

  /**
   * 写入日志
   * @param log - 要上传的日志键值对
   * @param options - 可选参数
   *    immediate 是否立即上传
   * @example
   * ```
   *  立即上报：clsclient.log({ key: 'value' }, true);
   *  客户端控制上报：clsclient.log({ key: 'value' });
   * ```
   */
  public log(log: Record<string, any>, _immediate?: boolean) {
    if (!this.initTag) {
      // 未调用初始化方法禁止日志上传
      throw new ClsSDKError('ClsClient initialization method not called!');
    }

    const immediate = _immediate ?? false;
    // TODO: 此处的时间使用本地时间可能会不正确，需要校准
    const clsLog: CLSLog = { contents: log, time: Date.now(), immediate };
    this.logList.push(clsLog);
    this.checkLogCaches();
  }

  /**
   * Destorys clsclient
   */
  public destory() {
    clearTimeout(this.logTimer);
    this.uploader.stop();
    this.initTag = false;
  }
}
