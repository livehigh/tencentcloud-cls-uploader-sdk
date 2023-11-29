import crypto from 'crypto-js';

import ClsSDKError from '../exception';

const util = {
  sha1(signStr: string) {
    return crypto.SHA1(signStr).toString();
  },
  sha1_hmac(signStr: string, SecretKey: string) {
    return crypto.HmacSHA1(signStr, SecretKey).toString();
  },
  getSkewTime(offset?: number) {
    return Date.now() + (offset || 0);
  },
  getParamKeylist(obj: Record<string, any>) {
    const list = Object.keys(obj);
    return list.sort(function (a, b) {
      a = a.toLowerCase();
      b = b.toLowerCase();
      return a === b ? 0 : a > b ? 1 : -1;
    });
  },
  getHeaderKeylist(obj: Record<string, any>) {
    const list = [];
    for (const key of Object.keys(obj)) {
      const lowerKey = key.toLowerCase();
      if (
        obj[key] &&
        (lowerKey === 'content-type' || lowerKey === 'content-md5' || lowerKey === 'host' || lowerKey[0] === 'x')
      ) {
        list.push(key);
      }
    }

    return list.sort(function (a, b) {
      a = a.toLowerCase();
      b = b.toLowerCase();
      return a === b ? 0 : a > b ? 1 : -1;
    });
  },
  camSafeUrlEncode(str: string) {
    return encodeURIComponent(str)
      .replace(/!/g, '%21')
      .replace(/'/g, '%27')
      .replace(/\(/g, '%28')
      .replace(/\)/g, '%29')
      .replace(/\*/g, '%2A');
  },
  obj2str(obj: Record<string, any>, getKeylist: (obj: Record<string, any>) => string[]) {
    let i, key, val;
    const list = [];
    const keyList = getKeylist(obj);
    for (i = 0; i < keyList.length; i++) {
      key = keyList[i];
      val = obj[key] === undefined ? '' : '' + obj[key];
      key = key.toLowerCase();
      key = util.camSafeUrlEncode(key);
      val = util.camSafeUrlEncode(val) || '';
      list.push(key + '=' + val);
    }
    return list.join('&');
  },
};

export interface SignOptions {
  SecretId: string;
  SecretKey: string;
  method: string;
  query: any;
  headers: any;
  api?: string;
  expires?: number;
  systemClockOffset?: number;
}

export default function sign(opt: SignOptions) {
  opt = opt || {};

  const { SecretId, SecretKey } = opt;
  const method = (opt.method || 'get').toLowerCase();
  const queryParams = Object.assign({}, opt.query || {});
  const headersParams = Object.assign({}, opt.headers || {});

  if (!SecretId) {
    throw new ClsSDKError('missing param SecretId');
  }
  if (!SecretKey) {
    throw new ClsSDKError('missing param SecretKey');
  }

  // 签名有效起止时间
  const now = Math.floor(util.getSkewTime(opt.systemClockOffset) / 1000) - 1;
  let exp = now;

  const Expires = opt.expires;
  if (Expires === undefined) {
    exp += 900; // 签名过期时间为当前 + 900s
  } else {
    exp += Expires * 1 || 0;
  }

  // 要用到的 Authorization 参数列表
  const SignAlgorithm = 'sha1';
  const SignTime = `${now};${exp}`;
  const KeyTime = `${now};${exp}`;
  const HeaderList = util.getHeaderKeylist(headersParams)?.join(';').toLowerCase();
  const UrlParamList = util.getParamKeylist(queryParams)?.join(';').toLowerCase();

  // 签名算法说明文档：https://cloud.tencent.com/document/product/614/12445
  // 步骤一：拼接 HttpRequestInfo
  const FormatedParameters = util.obj2str(queryParams, util.getParamKeylist);
  const FormatedHeaders = util.obj2str(headersParams, util.getHeaderKeylist);
  const HttpRequestInfo = [method.toLowerCase(), `/${opt.api || ''}`, FormatedParameters, FormatedHeaders, ''].join(
    '\n',
  );

  // 步骤二：拼接 StringToSign
  const StringToSign = ['sha1', KeyTime, util.sha1(HttpRequestInfo), ''].join('\n');

  // 步骤三：生成 SignKey
  const SignKey = util.sha1_hmac(KeyTime, SecretKey);

  // 步骤四：计算 Signature
  const Signature = util.sha1_hmac(StringToSign, SignKey);

  // 步骤五：构造 Authorization
  const authorization = [
    `q-sign-algorithm=${SignAlgorithm}`,
    `q-ak=${SecretId}`,
    `q-sign-time=${SignTime}`,
    `q-key-time=${KeyTime}`,
    'q-header-list=' + HeaderList,
    'q-url-param-list=' + UrlParamList,
    `q-signature=${Signature}`,
  ].join('&');

  return authorization;
}
