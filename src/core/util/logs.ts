import { CLSLog } from '../typings';
import { cls } from '../../proto/cls';
import { isString } from '../../core/util';
import ClsSDKError from '../../core/exception';

// const lz4 = require('lz4');
// const { lz4, CBuffer } = require('../../lib/lz4');
// const lz4 = require('lz4js');

const handleLogs = {
  formatLogGroup(logs: CLSLog[], options: { source?: string; filename?: string } = {}) {
    const logGroup = new cls.LogGroup();
    if (options.filename) {
      logGroup.filename = options.filename;
    }
    if (options.source) {
      logGroup.source = options.source;
    }

    logs.forEach(log => {
      const logItem = new cls.Log();
      logItem.time = log.time;
      Object.keys(log.contents).forEach(key => {
        const o = log.contents[key];
        const value = isString(o) ? o : JSON.stringify(o);
        logItem.contents.push(new cls.Log.Content({ key, value }));
      });
      logGroup.logs.push(logItem);
    });
    // 校验日志格式是否正确
    const errMsg = cls.LogGroup.verify(logGroup);
    if (errMsg) {
      throw new ClsSDKError(`log format is incorrect: ${errMsg}`);
    }
    return logGroup;
  },
  log2Buffer(logs: CLSLog[], options: { source?: string; filename?: string } = {}) {
    const clsList = new cls.LogGroupList();

    const logGroup = handleLogs.formatLogGroup(logs, options);
    clsList.logGroupList.push(logGroup);

    // 将本地日志转换为 pb 格式
    const buffer = cls.LogGroupList.encode(clsList).finish();
    return buffer;

    // const buffer = Buffer.from(JSON.stringify(logGroupList))

    // const input = new CBuffer(this.toArrayBuffer(buffer));
    // const maxOutputSize = lz4.encodeBound(input.length);

    // const output = new CBuffer(maxOutputSize);
    // const outputSize = lz4.encodeBlock(input, output);
    // let lz4Buffer = output.slice(0, outputSize);
    // lz4Buffer = btoa(encodeURIComponent(lz4Buffer));

    // // 将 pb 格式的日志进行 lz4 压缩
    // let lz4Buffer = Buffer.alloc(lz4.encodeBound(buffer.length));
    // const compressedSize = lz4.encodeBlock(buffer, lz4Buffer);
    // lz4Buffer = lz4Buffer.slice(0, compressedSize);
    // this.write(`./demo/proto_node.lz4`, lz4Buffer);

    // let uncompressed = Buffer.from(buffer.length);
    // const uncompressedSize = lz4.decodeBlock(lz4Buffer, uncompressed)
    // uncompressed = uncompressed.slice(0, uncompressedSize)

    // let lz4Buffer = lz4.compress(buffer, buffer.length);
    // lz4Buffer = this.toBuffer(lz4Buffer);
    // this.write(`./demo/proto_js.lz4`, lz4Buffer);

    // const depress = lz4.decompress(lz4Buffer);

    // this.write(`./demo/depress_js`, depress);

    // return lz4Buffer;
  },
  log2JSON(logs: CLSLog[], options: { source?: string; filename?: string } = {}) {
    const { source, filename } = options;
    const logGroup = {
      ...(filename && { filename }),
      ...(source && { source }),
      logs: logs.map(log => {
        const formatContents = log.contents;
        Object.keys(log.contents).forEach(key => {
          try {
            if (formatContents[key]) {
              formatContents[key] = formatContents[key].toString();
            } else {
              formatContents[key] = '';
            }
          } catch (error) {
            throw new ClsSDKError(`log format is incorrect: ${error.message}`);
          }
        });
        return {
          contents: log.contents,
          time: log.time,
        };
      }),
    };
    return JSON.stringify(logGroup);
  },
  // toArrayBuffer(buf) {
  //   const ab = new ArrayBuffer(buf.length);
  //   const view = new Uint8Array(ab);
  //   for (let i = 0; i < buf.length; ++i) {
  //     view[i] = buf[i];
  //   }
  //   return ab;
  // },
  // toBuffer(ab) {
  //   const buf = Buffer.alloc(ab.byteLength);
  //   const view = new Uint8Array(ab);
  //   for (let i = 0; i < buf.length; ++i) {
  //     buf[i] = view[i];
  //   }
  //   return buf;
  // },
};

export default handleLogs;
