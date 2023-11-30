import { AxiosProxyConfig } from 'axios';
import { GetAuthorizationFn, QCloudCredential } from './IClientConfig';

/**
 * @internal
 */
export interface HttpConnectionOptions {
  region: string;
  topicId: string;
  retry?: number;
  protocol?: string;
  agent?: any;
  proxy?: AxiosProxyConfig;
  credential?: QCloudCredential;
  getAuthorization?: GetAuthorizationFn;
  /**
   * 远端cls服务器自动填充sourceIp
   */
  autoFillSourceIp?: boolean;
}
