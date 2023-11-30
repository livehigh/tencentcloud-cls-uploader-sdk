# tencentcloud-cls-uploader-sdk
日志服务(Cloud Log Service，CLS) 上传 SDK 封装。
  - 支持批量上传，多条日志可合并为一次请求
  - 支持调整并发
  - 支持匿名、永久密钥、临时密钥上报
  - 支持js、nodejs两个版本

> 注意:
在浏览器中使用本 SDK 时，目前暂时只支持匿名上报（不要传入永久密钥/获取临时密钥函数），并且需要在腾讯云 cls 日志服务控制台中将日志主题的**匿名访问**配置项开启。【[匿名日志采集](https://cloud.tencent.com/document/product/614/86669)】

## new ClsClient(options) 构造函数参数说明
|  Property | Type | Description |
|  --- | --- | --- |
|  [region](./tencentcloud-cls-uploader-sdk.iclientconfig.region.md) | string | 要上传的Cls地域 |
|  [sourceIp](./tencentcloud-cls-uploader-sdk.iclientconfig.sourceip.md) | string | 日志来源，一般使用机器 IP 作为标识 |
|  [topicId](./tencentcloud-cls-uploader-sdk.iclientconfig.topicid.md) | string | Cls 日志主题Id |
|  [credential?](./tencentcloud-cls-uploader-sdk.iclientconfig.credential.md) | [QCloudCredential](./tencentcloud-cls-uploader-sdk.qcloudcredential.md) | _(可选)_ 永久密钥 |
|  [getAgent?](./tencentcloud-cls-uploader-sdk.iclientconfig.getagent.md) | () =&gt; any | _(可选)_ 获取代理函数 |
|  [getAuthorization?](./tencentcloud-cls-uploader-sdk.iclientconfig.getauthorization.md) | [GetAuthorizationFn](./tencentcloud-cls-uploader-sdk.getauthorizationfn.md) | _(可选)_ 获取临时密钥函数 |
|  [httpAdapter?](./tencentcloud-cls-uploader-sdk.iclientconfig.httpadapter.md) | 'xhr' \| 'http' \| AxiosAdapter | _(可选)_ http 请求适配器 |
|  [maxRetainDuration?](./tencentcloud-cls-uploader-sdk.iclientconfig.maxretainduration.md) | number | _(可选)_ 未上传的缓存日志超过该时间则上传（单位: s，默认 30s） |
|  [maxRetainSize?](./tencentcloud-cls-uploader-sdk.iclientconfig.maxretainsize.md) | number | _(可选)_ 未上传的缓存日志数量超过该数值则上传（默认 20 条） |
|  [onError?](./tencentcloud-cls-uploader-sdk.iclientconfig.onerror.md) | (error: [IClsSDKError](./tencentcloud-cls-uploader-sdk.iclssdkerror.md)<!-- -->) =&gt; void | _(可选)_ 生命周期：上传器发起请求发生错误（不影响上传器后续使用） |
|  [proxy?](./tencentcloud-cls-uploader-sdk.iclientconfig.proxy.md) | { host: string; port: number; protocol?: string; } | _(可选)_ 代理配置 |

## 使用示例

创建一个 Cls Client SDK 实例，SDK 支持以下格式创建：

- 格式一（推荐）：使用临时密钥进行日志上报。后端通过获取临时密钥给到前端，前端计算签名。
```ts
import ClsClient from 'tencentcloud-cls-uploader-sdk'

const clsClient = new ClsClient({
  topicId: 'xxxx',
  region: 'ap-guangzhou',
  maxRetainDuration: 30, // 默认 30s
  maxRetainSize: 20, // 默认20条
  getAuthorization: function (options, callback) {
    // 初始化时不会调用，只有调用 cos 方法（例如 cos.putObject）时才会进入
    // 异步获取临时密钥
    // 服务端 JS 和 PHP 例子：https://github.com/tencentyun/cos-js-sdk-v5/blob/master/server/
    // 服务端其他语言参考 COS STS SDK ：https://github.com/tencentyun/qcloud-cos-sts-sdk
    // STS 详细文档指引看：https://cloud.tencent.com/document/product/436/14048

    const url = 'http://example.com/server/sts.php'; // url 替换成您自己的后端服务
    const xhr = new XMLHttpRequest();
    let data = null;
    let credentials = null;
    xhr.open('GET', url, true);
    xhr.onload = function (e) {
        try {
          data = JSON.parse(e.target.responseText);
          credentials = data.credentials;
        } catch (e) {
        }
        if (!data || !credentials) {
          return console.error('credentials invalid:\n' + JSON.stringify(data, null, 2))
        };
        callback({
          TmpSecretId: credentials.tmpSecretId,
          TmpSecretKey: credentials.tmpSecretKey,
          SecurityToken: credentials.sessionToken,
          // 建议返回服务器时间作为签名的开始时间，避免用户浏览器本地时间偏差过大导致签名错误
          StartTime: data.startTime, // 时间戳，单位秒，如：1580000000
          ExpiredTime: data.expiredTime, // 时间戳，单位秒，如：1580000000
      });
    };
    xhr.send();
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

- 格式二：匿名上报。
```ts
import ClsClient from 'tencentcloud-cls-uploader-sdk'

const clsClient = new ClsClient({
  topicId: 'xxxx',
  region: 'ap-guangzhou',
  maxRetainDuration: 30, // 默认 30s
  maxRetainSize: 20, // 默认20条
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

- 格式三（不推荐）：使用固定密钥计算签名进行日志上报
```ts
import ClsClient from 'tencentcloud-cls-uploader-sdk'

const clsClient = new ClsClient({
  topicId: 'xxxx',
  region: 'ap-guangzhou',
  maxRetainDuration: 30, // 默认 30s
  maxRetainSize: 20, // 默认20条
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