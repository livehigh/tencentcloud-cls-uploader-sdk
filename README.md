# tencentcloud-cls-uploader-sdk
日志服务(Cloud Log Service，CLS) 上传 SDK 封装。
  - 支持批量上传，多条日志可合并为一次请求
  - 支持调整并发
  - 支持匿名、永久密钥、临时密钥上报
  - 支持js、nodejs两个版本

> 注意:
在浏览器中使用本 SDK 时，目前暂时只支持匿名上报（不要传入永久密钥/获取临时密钥函数），并且需要在腾讯云 cls 日志服务控制台中将日志主题的**匿名访问**配置项开启。

## 使用示例

```ts

import ClsClient from 'tencentcloud-cls-uploader-sdk'

const clsClient = new ClsClient({
  topicId: 'xxxx',
  region: 'ap-guangzhou',
  credential: {
    SecretId: 'xxxx',
    SecretKey: 'xxxx',
  },
  onError(err) {
    console.log('onError:', err);
  },
});

const params = {
  hello: 'hello world',
  world: '2.1.0',
};

// 立即上传
clsClient.log(params, { immediate: true });
```

## API 文档

[API 文档](./docs/tencentcloud-cls-uploader-sdk.md)