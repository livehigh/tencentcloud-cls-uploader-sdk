export * from './IClientConfig';
export * from './IClsSdkError';
export * from './IHttpConnection';

/**
 * Clslog
 * @internal
 */
export interface CLSLog {
  time: number;
  contents: Record<string, any>;
  immediate?: boolean;
}
