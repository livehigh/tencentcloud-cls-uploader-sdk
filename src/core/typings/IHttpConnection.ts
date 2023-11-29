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
}
