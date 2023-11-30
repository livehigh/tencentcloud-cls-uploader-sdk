import { CLSLog } from './typings';
import UploadConfig from './ClientConfig';
import { HttpConnection } from './http/httpConnection';
import { isNotEmpty } from './util';

enum UploadState {
  start,
  waiting,
  running,
  stop,
}

interface UploadItem {
  index: number;
  logs: CLSLog[];
}

export default class Uploader {
  private queue: UploadItem[] = [];

  private config!: UploadConfig;

  private http!: HttpConnection;

  private state: UploadState = UploadState.stop;

  constructor({ config }: { config: UploadConfig }) {
    this.config = config;
    this.http = new HttpConnection({
      region: this.config.region,
      topicId: this.config.topicId,
      agent: this.config.getAgent?.(),
      proxy: this.config.proxy,
      credential: this.config.credential,
      getAuthorization: this.config.getAuthorization,
      autoFillSourceIp: !isNotEmpty(this.config.sourceIp),
    });
  }

  public start() {
    this.state = UploadState.start;
    this.startNextBatch();
  }

  /**
   * 将要上传的日志添加至队列
   * @param logs
   */
  public add(logs: CLSLog[]) {
    const item = {
      index: this.queue.length,
      logs,
    };

    this.queue.push(item);
    this.startNextBatch();
  }

  private async startNextBatch() {
    if (this.state === UploadState.running) return;

    this.state = UploadState.running;
    while (this.queue.length > 0 && this.isStart()) {
      const uploadItem = this.queue.shift();
      if (uploadItem) {
        try {
          await this.http.putLogs(uploadItem.logs);
        } catch (err) {
          this.config.onError(err);
        }
      }
    }
    this.state = UploadState.waiting;
  }

  private isStart() {
    return this.state !== UploadState.stop;
  }

  public stop() {
    this.http.cancelRequest();
    this.state = UploadState.stop;
  }
}
