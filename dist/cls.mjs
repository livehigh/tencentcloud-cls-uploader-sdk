import axios from 'axios';
import crypto from 'crypto-js';

/**
 * SDK异常错误类型
 * @internal
 */
class ClsSDKError extends Error {
    /**
     * 请求id
     */
    clsRequestId;
    get requestId() {
        return this.clsRequestId;
    }
    /**
     * http状态码
     */
    httpStatus;
    get status() {
        return this.httpStatus;
    }
    /**
     * 接口返回状态码
     */
    httpCode;
    get code() {
        return this.httpCode;
    }
    constructor(error) {
        if (typeof error === 'string') {
            super(error);
        }
        else {
            super(error.message);
            this.clsRequestId = error.headers?.['x-cls-requestid'] || '';
            this.httpStatus = error.status;
            this.httpCode = error.code;
        }
    }
    getMessage() {
        return this.message;
    }
    toString() {
        return '[ClsSDKError]' + 'message:' + this.getMessage() + '  requestId:' + this.requestId;
    }
    toLocaleString() {
        return '[ClsSDKError]' + 'message:' + this.getMessage() + '  requestId:' + this.requestId;
    }
}

class ClientConfig {
    clsTopicId = '';
    get topicId() {
        return this.clsTopicId;
    }
    clsRegion = '';
    get region() {
        return this.clsRegion;
    }
    clsCredential = undefined;
    get credential() {
        return this.clsCredential;
    }
    getAuthorization = undefined;
    onError(_error) { }
    maxRetainDuration = 20;
    maxRetainSize = 30;
    logExpiredDays = 7;
    logPath = '';
    httpAdapter = undefined;
    clsSourceIp = '';
    get sourceIp() {
        return this.clsSourceIp;
    }
    proxy = undefined;
    getAgent = undefined;
    constructor(options) {
        if (!options.topicId || typeof options.topicId !== 'string') {
            throw new ClsSDKError('topicId is required and must be a string');
        }
        if (!options.region || typeof options.region !== 'string') {
            throw new ClsSDKError('region is required and must be a string');
        }
        if (options.sourceIp) {
            this.clsSourceIp = options.sourceIp;
        }
        if (options.credential) {
            this.clsCredential = options.credential;
        }
        if (options.getAuthorization) {
            this.getAuthorization = options.getAuthorization;
        }
        if (options.proxy) {
            this.proxy = options.proxy;
        }
        if (options.getAgent) {
            this.getAgent = options.getAgent;
        }
        if (options.maxRetainDuration) {
            this.maxRetainDuration = options.maxRetainDuration;
        }
        if (options.maxRetainSize) {
            this.maxRetainSize = options.maxRetainSize;
        }
        if (options.logExpiredDays) {
            this.logExpiredDays = options.logExpiredDays;
        }
        if (options.logPath) {
            this.logPath = options.logPath;
        }
        if (options.httpAdapter) {
            this.httpAdapter = options.httpAdapter;
        }
        if (options.onError) {
            this.onError = options.onError;
        }
        this.clsTopicId = options.topicId;
        this.clsRegion = options.region;
    }
}

function isString(s) {
    return typeof s === 'string';
}
function wait(time) {
    return new Promise(resolve => {
        setTimeout(resolve, time);
    });
}
function isNotEmpty(value) {
    return value !== undefined && value !== null && value !== '';
}

/**
 * 系统时间校准
 */
class SystemClock {
    // 当前时间与系统时间偏移量
    /**
     * 当前时间与系统时间偏移量
     */
    offset = 0;
    /**
     * 获取时间偏移量
     */
    get systemClockOffset() {
        return this.offset;
    }
    /**
     * 获取当前系统时间
     * @returns
     */
    now() {
        return Date.now() + (this.offset || 0);
    }
    handleOffset(serverDate) {
        const serverTime = Date.parse(serverDate);
        // 本地时间与服务器时间相差大于等于30s则需要进行校准
        if (Math.abs(this.now() - serverTime) >= 30000) {
            this.offset = serverTime - Date.now();
        }
    }
}
var systemClock = new SystemClock();

const util$5 = {
    sha1(signStr) {
        return crypto.SHA1(signStr).toString();
    },
    sha1_hmac(signStr, SecretKey) {
        return crypto.HmacSHA1(signStr, SecretKey).toString();
    },
    getParamKeylist(obj) {
        const list = Object.keys(obj);
        return list.sort(function (a, b) {
            a = a.toLowerCase();
            b = b.toLowerCase();
            return a === b ? 0 : a > b ? 1 : -1;
        });
    },
    getHeaderKeylist(obj) {
        const list = [];
        for (const key of Object.keys(obj)) {
            const lowerKey = key.toLowerCase();
            if (obj[key] &&
                (lowerKey === 'content-type' || lowerKey === 'content-md5' || lowerKey === 'host' || lowerKey[0] === 'x')) {
                list.push(key);
            }
        }
        return list.sort(function (a, b) {
            a = a.toLowerCase();
            b = b.toLowerCase();
            return a === b ? 0 : a > b ? 1 : -1;
        });
    },
    camSafeUrlEncode(str) {
        return encodeURIComponent(str)
            .replace(/!/g, '%21')
            .replace(/'/g, '%27')
            .replace(/\(/g, '%28')
            .replace(/\)/g, '%29')
            .replace(/\*/g, '%2A');
    },
    obj2str(obj, getKeylist) {
        let i, key, val;
        const list = [];
        const keyList = getKeylist(obj);
        for (i = 0; i < keyList.length; i++) {
            key = keyList[i];
            val = obj[key] === undefined ? '' : '' + obj[key];
            key = key.toLowerCase();
            key = util$5.camSafeUrlEncode(key);
            val = util$5.camSafeUrlEncode(val) || '';
            list.push(key + '=' + val);
        }
        return list.join('&');
    },
};
function sign(opt) {
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
    const now = Math.floor(systemClock.now() / 1000) - 1;
    let exp = now;
    const Expires = opt.expires;
    if (Expires === undefined) {
        exp += 900; // 签名过期时间为当前 + 900s
    }
    else {
        exp += Expires * 1 || 0;
    }
    // 要用到的 Authorization 参数列表
    const SignAlgorithm = 'sha1';
    const SignTime = `${now};${exp}`;
    const KeyTime = `${now};${exp}`;
    const HeaderList = util$5.getHeaderKeylist(headersParams)?.join(';').toLowerCase();
    const UrlParamList = util$5.getParamKeylist(queryParams)?.join(';').toLowerCase();
    // 签名算法说明文档：https://cloud.tencent.com/document/product/614/12445
    // 步骤一：拼接 HttpRequestInfo
    const FormatedParameters = util$5.obj2str(queryParams, util$5.getParamKeylist);
    const FormatedHeaders = util$5.obj2str(headersParams, util$5.getHeaderKeylist);
    const HttpRequestInfo = [method.toLowerCase(), `/${opt.api || ''}`, FormatedParameters, FormatedHeaders, ''].join('\n');
    // 步骤二：拼接 StringToSign
    const StringToSign = ['sha1', KeyTime, util$5.sha1(HttpRequestInfo), ''].join('\n');
    // 步骤三：生成 SignKey
    const SignKey = util$5.sha1_hmac(KeyTime, SecretKey);
    // 步骤四：计算 Signature
    const Signature = util$5.sha1_hmac(StringToSign, SignKey);
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

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

var indexMinimal = {};

var minimal$1 = {};

var aspromise;
var hasRequiredAspromise;

function requireAspromise () {
	if (hasRequiredAspromise) return aspromise;
	hasRequiredAspromise = 1;
	aspromise = asPromise;

	/**
	 * Callback as used by {@link util.asPromise}.
	 * @typedef asPromiseCallback
	 * @type {function}
	 * @param {Error|null} error Error, if any
	 * @param {...*} params Additional arguments
	 * @returns {undefined}
	 */

	/**
	 * Returns a promise from a node-style callback function.
	 * @memberof util
	 * @param {asPromiseCallback} fn Function to call
	 * @param {*} ctx Function context
	 * @param {...*} params Function arguments
	 * @returns {Promise<*>} Promisified function
	 */
	function asPromise(fn, ctx/*, varargs */) {
	    var params  = new Array(arguments.length - 1),
	        offset  = 0,
	        index   = 2,
	        pending = true;
	    while (index < arguments.length)
	        params[offset++] = arguments[index++];
	    return new Promise(function executor(resolve, reject) {
	        params[offset] = function callback(err/*, varargs */) {
	            if (pending) {
	                pending = false;
	                if (err)
	                    reject(err);
	                else {
	                    var params = new Array(arguments.length - 1),
	                        offset = 0;
	                    while (offset < params.length)
	                        params[offset++] = arguments[offset];
	                    resolve.apply(null, params);
	                }
	            }
	        };
	        try {
	            fn.apply(ctx || null, params);
	        } catch (err) {
	            if (pending) {
	                pending = false;
	                reject(err);
	            }
	        }
	    });
	}
	return aspromise;
}

var base64$1 = {};

var hasRequiredBase64;

function requireBase64 () {
	if (hasRequiredBase64) return base64$1;
	hasRequiredBase64 = 1;
	(function (exports) {

		/**
		 * A minimal base64 implementation for number arrays.
		 * @memberof util
		 * @namespace
		 */
		var base64 = exports;

		/**
		 * Calculates the byte length of a base64 encoded string.
		 * @param {string} string Base64 encoded string
		 * @returns {number} Byte length
		 */
		base64.length = function length(string) {
		    var p = string.length;
		    if (!p)
		        return 0;
		    var n = 0;
		    while (--p % 4 > 1 && string.charAt(p) === "=")
		        ++n;
		    return Math.ceil(string.length * 3) / 4 - n;
		};

		// Base64 encoding table
		var b64 = new Array(64);

		// Base64 decoding table
		var s64 = new Array(123);

		// 65..90, 97..122, 48..57, 43, 47
		for (var i = 0; i < 64;)
		    s64[b64[i] = i < 26 ? i + 65 : i < 52 ? i + 71 : i < 62 ? i - 4 : i - 59 | 43] = i++;

		/**
		 * Encodes a buffer to a base64 encoded string.
		 * @param {Uint8Array} buffer Source buffer
		 * @param {number} start Source start
		 * @param {number} end Source end
		 * @returns {string} Base64 encoded string
		 */
		base64.encode = function encode(buffer, start, end) {
		    var parts = null,
		        chunk = [];
		    var i = 0, // output index
		        j = 0, // goto index
		        t;     // temporary
		    while (start < end) {
		        var b = buffer[start++];
		        switch (j) {
		            case 0:
		                chunk[i++] = b64[b >> 2];
		                t = (b & 3) << 4;
		                j = 1;
		                break;
		            case 1:
		                chunk[i++] = b64[t | b >> 4];
		                t = (b & 15) << 2;
		                j = 2;
		                break;
		            case 2:
		                chunk[i++] = b64[t | b >> 6];
		                chunk[i++] = b64[b & 63];
		                j = 0;
		                break;
		        }
		        if (i > 8191) {
		            (parts || (parts = [])).push(String.fromCharCode.apply(String, chunk));
		            i = 0;
		        }
		    }
		    if (j) {
		        chunk[i++] = b64[t];
		        chunk[i++] = 61;
		        if (j === 1)
		            chunk[i++] = 61;
		    }
		    if (parts) {
		        if (i)
		            parts.push(String.fromCharCode.apply(String, chunk.slice(0, i)));
		        return parts.join("");
		    }
		    return String.fromCharCode.apply(String, chunk.slice(0, i));
		};

		var invalidEncoding = "invalid encoding";

		/**
		 * Decodes a base64 encoded string to a buffer.
		 * @param {string} string Source string
		 * @param {Uint8Array} buffer Destination buffer
		 * @param {number} offset Destination offset
		 * @returns {number} Number of bytes written
		 * @throws {Error} If encoding is invalid
		 */
		base64.decode = function decode(string, buffer, offset) {
		    var start = offset;
		    var j = 0, // goto index
		        t;     // temporary
		    for (var i = 0; i < string.length;) {
		        var c = string.charCodeAt(i++);
		        if (c === 61 && j > 1)
		            break;
		        if ((c = s64[c]) === undefined)
		            throw Error(invalidEncoding);
		        switch (j) {
		            case 0:
		                t = c;
		                j = 1;
		                break;
		            case 1:
		                buffer[offset++] = t << 2 | (c & 48) >> 4;
		                t = c;
		                j = 2;
		                break;
		            case 2:
		                buffer[offset++] = (t & 15) << 4 | (c & 60) >> 2;
		                t = c;
		                j = 3;
		                break;
		            case 3:
		                buffer[offset++] = (t & 3) << 6 | c;
		                j = 0;
		                break;
		        }
		    }
		    if (j === 1)
		        throw Error(invalidEncoding);
		    return offset - start;
		};

		/**
		 * Tests if the specified string appears to be base64 encoded.
		 * @param {string} string String to test
		 * @returns {boolean} `true` if probably base64 encoded, otherwise false
		 */
		base64.test = function test(string) {
		    return /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(string);
		}; 
	} (base64$1));
	return base64$1;
}

var eventemitter;
var hasRequiredEventemitter;

function requireEventemitter () {
	if (hasRequiredEventemitter) return eventemitter;
	hasRequiredEventemitter = 1;
	eventemitter = EventEmitter;

	/**
	 * Constructs a new event emitter instance.
	 * @classdesc A minimal event emitter.
	 * @memberof util
	 * @constructor
	 */
	function EventEmitter() {

	    /**
	     * Registered listeners.
	     * @type {Object.<string,*>}
	     * @private
	     */
	    this._listeners = {};
	}

	/**
	 * Registers an event listener.
	 * @param {string} evt Event name
	 * @param {function} fn Listener
	 * @param {*} [ctx] Listener context
	 * @returns {util.EventEmitter} `this`
	 */
	EventEmitter.prototype.on = function on(evt, fn, ctx) {
	    (this._listeners[evt] || (this._listeners[evt] = [])).push({
	        fn  : fn,
	        ctx : ctx || this
	    });
	    return this;
	};

	/**
	 * Removes an event listener or any matching listeners if arguments are omitted.
	 * @param {string} [evt] Event name. Removes all listeners if omitted.
	 * @param {function} [fn] Listener to remove. Removes all listeners of `evt` if omitted.
	 * @returns {util.EventEmitter} `this`
	 */
	EventEmitter.prototype.off = function off(evt, fn) {
	    if (evt === undefined)
	        this._listeners = {};
	    else {
	        if (fn === undefined)
	            this._listeners[evt] = [];
	        else {
	            var listeners = this._listeners[evt];
	            for (var i = 0; i < listeners.length;)
	                if (listeners[i].fn === fn)
	                    listeners.splice(i, 1);
	                else
	                    ++i;
	        }
	    }
	    return this;
	};

	/**
	 * Emits an event by calling its listeners with the specified arguments.
	 * @param {string} evt Event name
	 * @param {...*} args Arguments
	 * @returns {util.EventEmitter} `this`
	 */
	EventEmitter.prototype.emit = function emit(evt) {
	    var listeners = this._listeners[evt];
	    if (listeners) {
	        var args = [],
	            i = 1;
	        for (; i < arguments.length;)
	            args.push(arguments[i++]);
	        for (i = 0; i < listeners.length;)
	            listeners[i].fn.apply(listeners[i++].ctx, args);
	    }
	    return this;
	};
	return eventemitter;
}

var float;
var hasRequiredFloat;

function requireFloat () {
	if (hasRequiredFloat) return float;
	hasRequiredFloat = 1;

	float = factory(factory);

	/**
	 * Reads / writes floats / doubles from / to buffers.
	 * @name util.float
	 * @namespace
	 */

	/**
	 * Writes a 32 bit float to a buffer using little endian byte order.
	 * @name util.float.writeFloatLE
	 * @function
	 * @param {number} val Value to write
	 * @param {Uint8Array} buf Target buffer
	 * @param {number} pos Target buffer offset
	 * @returns {undefined}
	 */

	/**
	 * Writes a 32 bit float to a buffer using big endian byte order.
	 * @name util.float.writeFloatBE
	 * @function
	 * @param {number} val Value to write
	 * @param {Uint8Array} buf Target buffer
	 * @param {number} pos Target buffer offset
	 * @returns {undefined}
	 */

	/**
	 * Reads a 32 bit float from a buffer using little endian byte order.
	 * @name util.float.readFloatLE
	 * @function
	 * @param {Uint8Array} buf Source buffer
	 * @param {number} pos Source buffer offset
	 * @returns {number} Value read
	 */

	/**
	 * Reads a 32 bit float from a buffer using big endian byte order.
	 * @name util.float.readFloatBE
	 * @function
	 * @param {Uint8Array} buf Source buffer
	 * @param {number} pos Source buffer offset
	 * @returns {number} Value read
	 */

	/**
	 * Writes a 64 bit double to a buffer using little endian byte order.
	 * @name util.float.writeDoubleLE
	 * @function
	 * @param {number} val Value to write
	 * @param {Uint8Array} buf Target buffer
	 * @param {number} pos Target buffer offset
	 * @returns {undefined}
	 */

	/**
	 * Writes a 64 bit double to a buffer using big endian byte order.
	 * @name util.float.writeDoubleBE
	 * @function
	 * @param {number} val Value to write
	 * @param {Uint8Array} buf Target buffer
	 * @param {number} pos Target buffer offset
	 * @returns {undefined}
	 */

	/**
	 * Reads a 64 bit double from a buffer using little endian byte order.
	 * @name util.float.readDoubleLE
	 * @function
	 * @param {Uint8Array} buf Source buffer
	 * @param {number} pos Source buffer offset
	 * @returns {number} Value read
	 */

	/**
	 * Reads a 64 bit double from a buffer using big endian byte order.
	 * @name util.float.readDoubleBE
	 * @function
	 * @param {Uint8Array} buf Source buffer
	 * @param {number} pos Source buffer offset
	 * @returns {number} Value read
	 */

	// Factory function for the purpose of node-based testing in modified global environments
	function factory(exports) {

	    // float: typed array
	    if (typeof Float32Array !== "undefined") (function() {

	        var f32 = new Float32Array([ -0 ]),
	            f8b = new Uint8Array(f32.buffer),
	            le  = f8b[3] === 128;

	        function writeFloat_f32_cpy(val, buf, pos) {
	            f32[0] = val;
	            buf[pos    ] = f8b[0];
	            buf[pos + 1] = f8b[1];
	            buf[pos + 2] = f8b[2];
	            buf[pos + 3] = f8b[3];
	        }

	        function writeFloat_f32_rev(val, buf, pos) {
	            f32[0] = val;
	            buf[pos    ] = f8b[3];
	            buf[pos + 1] = f8b[2];
	            buf[pos + 2] = f8b[1];
	            buf[pos + 3] = f8b[0];
	        }

	        /* istanbul ignore next */
	        exports.writeFloatLE = le ? writeFloat_f32_cpy : writeFloat_f32_rev;
	        /* istanbul ignore next */
	        exports.writeFloatBE = le ? writeFloat_f32_rev : writeFloat_f32_cpy;

	        function readFloat_f32_cpy(buf, pos) {
	            f8b[0] = buf[pos    ];
	            f8b[1] = buf[pos + 1];
	            f8b[2] = buf[pos + 2];
	            f8b[3] = buf[pos + 3];
	            return f32[0];
	        }

	        function readFloat_f32_rev(buf, pos) {
	            f8b[3] = buf[pos    ];
	            f8b[2] = buf[pos + 1];
	            f8b[1] = buf[pos + 2];
	            f8b[0] = buf[pos + 3];
	            return f32[0];
	        }

	        /* istanbul ignore next */
	        exports.readFloatLE = le ? readFloat_f32_cpy : readFloat_f32_rev;
	        /* istanbul ignore next */
	        exports.readFloatBE = le ? readFloat_f32_rev : readFloat_f32_cpy;

	    // float: ieee754
	    })(); else (function() {

	        function writeFloat_ieee754(writeUint, val, buf, pos) {
	            var sign = val < 0 ? 1 : 0;
	            if (sign)
	                val = -val;
	            if (val === 0)
	                writeUint(1 / val > 0 ? /* positive */ 0 : /* negative 0 */ 2147483648, buf, pos);
	            else if (isNaN(val))
	                writeUint(2143289344, buf, pos);
	            else if (val > 3.4028234663852886e+38) // +-Infinity
	                writeUint((sign << 31 | 2139095040) >>> 0, buf, pos);
	            else if (val < 1.1754943508222875e-38) // denormal
	                writeUint((sign << 31 | Math.round(val / 1.401298464324817e-45)) >>> 0, buf, pos);
	            else {
	                var exponent = Math.floor(Math.log(val) / Math.LN2),
	                    mantissa = Math.round(val * Math.pow(2, -exponent) * 8388608) & 8388607;
	                writeUint((sign << 31 | exponent + 127 << 23 | mantissa) >>> 0, buf, pos);
	            }
	        }

	        exports.writeFloatLE = writeFloat_ieee754.bind(null, writeUintLE);
	        exports.writeFloatBE = writeFloat_ieee754.bind(null, writeUintBE);

	        function readFloat_ieee754(readUint, buf, pos) {
	            var uint = readUint(buf, pos),
	                sign = (uint >> 31) * 2 + 1,
	                exponent = uint >>> 23 & 255,
	                mantissa = uint & 8388607;
	            return exponent === 255
	                ? mantissa
	                ? NaN
	                : sign * Infinity
	                : exponent === 0 // denormal
	                ? sign * 1.401298464324817e-45 * mantissa
	                : sign * Math.pow(2, exponent - 150) * (mantissa + 8388608);
	        }

	        exports.readFloatLE = readFloat_ieee754.bind(null, readUintLE);
	        exports.readFloatBE = readFloat_ieee754.bind(null, readUintBE);

	    })();

	    // double: typed array
	    if (typeof Float64Array !== "undefined") (function() {

	        var f64 = new Float64Array([-0]),
	            f8b = new Uint8Array(f64.buffer),
	            le  = f8b[7] === 128;

	        function writeDouble_f64_cpy(val, buf, pos) {
	            f64[0] = val;
	            buf[pos    ] = f8b[0];
	            buf[pos + 1] = f8b[1];
	            buf[pos + 2] = f8b[2];
	            buf[pos + 3] = f8b[3];
	            buf[pos + 4] = f8b[4];
	            buf[pos + 5] = f8b[5];
	            buf[pos + 6] = f8b[6];
	            buf[pos + 7] = f8b[7];
	        }

	        function writeDouble_f64_rev(val, buf, pos) {
	            f64[0] = val;
	            buf[pos    ] = f8b[7];
	            buf[pos + 1] = f8b[6];
	            buf[pos + 2] = f8b[5];
	            buf[pos + 3] = f8b[4];
	            buf[pos + 4] = f8b[3];
	            buf[pos + 5] = f8b[2];
	            buf[pos + 6] = f8b[1];
	            buf[pos + 7] = f8b[0];
	        }

	        /* istanbul ignore next */
	        exports.writeDoubleLE = le ? writeDouble_f64_cpy : writeDouble_f64_rev;
	        /* istanbul ignore next */
	        exports.writeDoubleBE = le ? writeDouble_f64_rev : writeDouble_f64_cpy;

	        function readDouble_f64_cpy(buf, pos) {
	            f8b[0] = buf[pos    ];
	            f8b[1] = buf[pos + 1];
	            f8b[2] = buf[pos + 2];
	            f8b[3] = buf[pos + 3];
	            f8b[4] = buf[pos + 4];
	            f8b[5] = buf[pos + 5];
	            f8b[6] = buf[pos + 6];
	            f8b[7] = buf[pos + 7];
	            return f64[0];
	        }

	        function readDouble_f64_rev(buf, pos) {
	            f8b[7] = buf[pos    ];
	            f8b[6] = buf[pos + 1];
	            f8b[5] = buf[pos + 2];
	            f8b[4] = buf[pos + 3];
	            f8b[3] = buf[pos + 4];
	            f8b[2] = buf[pos + 5];
	            f8b[1] = buf[pos + 6];
	            f8b[0] = buf[pos + 7];
	            return f64[0];
	        }

	        /* istanbul ignore next */
	        exports.readDoubleLE = le ? readDouble_f64_cpy : readDouble_f64_rev;
	        /* istanbul ignore next */
	        exports.readDoubleBE = le ? readDouble_f64_rev : readDouble_f64_cpy;

	    // double: ieee754
	    })(); else (function() {

	        function writeDouble_ieee754(writeUint, off0, off1, val, buf, pos) {
	            var sign = val < 0 ? 1 : 0;
	            if (sign)
	                val = -val;
	            if (val === 0) {
	                writeUint(0, buf, pos + off0);
	                writeUint(1 / val > 0 ? /* positive */ 0 : /* negative 0 */ 2147483648, buf, pos + off1);
	            } else if (isNaN(val)) {
	                writeUint(0, buf, pos + off0);
	                writeUint(2146959360, buf, pos + off1);
	            } else if (val > 1.7976931348623157e+308) { // +-Infinity
	                writeUint(0, buf, pos + off0);
	                writeUint((sign << 31 | 2146435072) >>> 0, buf, pos + off1);
	            } else {
	                var mantissa;
	                if (val < 2.2250738585072014e-308) { // denormal
	                    mantissa = val / 5e-324;
	                    writeUint(mantissa >>> 0, buf, pos + off0);
	                    writeUint((sign << 31 | mantissa / 4294967296) >>> 0, buf, pos + off1);
	                } else {
	                    var exponent = Math.floor(Math.log(val) / Math.LN2);
	                    if (exponent === 1024)
	                        exponent = 1023;
	                    mantissa = val * Math.pow(2, -exponent);
	                    writeUint(mantissa * 4503599627370496 >>> 0, buf, pos + off0);
	                    writeUint((sign << 31 | exponent + 1023 << 20 | mantissa * 1048576 & 1048575) >>> 0, buf, pos + off1);
	                }
	            }
	        }

	        exports.writeDoubleLE = writeDouble_ieee754.bind(null, writeUintLE, 0, 4);
	        exports.writeDoubleBE = writeDouble_ieee754.bind(null, writeUintBE, 4, 0);

	        function readDouble_ieee754(readUint, off0, off1, buf, pos) {
	            var lo = readUint(buf, pos + off0),
	                hi = readUint(buf, pos + off1);
	            var sign = (hi >> 31) * 2 + 1,
	                exponent = hi >>> 20 & 2047,
	                mantissa = 4294967296 * (hi & 1048575) + lo;
	            return exponent === 2047
	                ? mantissa
	                ? NaN
	                : sign * Infinity
	                : exponent === 0 // denormal
	                ? sign * 5e-324 * mantissa
	                : sign * Math.pow(2, exponent - 1075) * (mantissa + 4503599627370496);
	        }

	        exports.readDoubleLE = readDouble_ieee754.bind(null, readUintLE, 0, 4);
	        exports.readDoubleBE = readDouble_ieee754.bind(null, readUintBE, 4, 0);

	    })();

	    return exports;
	}

	// uint helpers

	function writeUintLE(val, buf, pos) {
	    buf[pos    ] =  val        & 255;
	    buf[pos + 1] =  val >>> 8  & 255;
	    buf[pos + 2] =  val >>> 16 & 255;
	    buf[pos + 3] =  val >>> 24;
	}

	function writeUintBE(val, buf, pos) {
	    buf[pos    ] =  val >>> 24;
	    buf[pos + 1] =  val >>> 16 & 255;
	    buf[pos + 2] =  val >>> 8  & 255;
	    buf[pos + 3] =  val        & 255;
	}

	function readUintLE(buf, pos) {
	    return (buf[pos    ]
	          | buf[pos + 1] << 8
	          | buf[pos + 2] << 16
	          | buf[pos + 3] << 24) >>> 0;
	}

	function readUintBE(buf, pos) {
	    return (buf[pos    ] << 24
	          | buf[pos + 1] << 16
	          | buf[pos + 2] << 8
	          | buf[pos + 3]) >>> 0;
	}
	return float;
}

var inquire_1;
var hasRequiredInquire;

function requireInquire () {
	if (hasRequiredInquire) return inquire_1;
	hasRequiredInquire = 1;
	inquire_1 = inquire;

	/**
	 * Requires a module only if available.
	 * @memberof util
	 * @param {string} moduleName Module to require
	 * @returns {?Object} Required module if available and not empty, otherwise `null`
	 */
	function inquire(moduleName) {
	    try {
	        var mod = eval("quire".replace(/^/,"re"))(moduleName); // eslint-disable-line no-eval
	        if (mod && (mod.length || Object.keys(mod).length))
	            return mod;
	    } catch (e) {} // eslint-disable-line no-empty
	    return null;
	}
	return inquire_1;
}

var utf8$2 = {};

var hasRequiredUtf8;

function requireUtf8 () {
	if (hasRequiredUtf8) return utf8$2;
	hasRequiredUtf8 = 1;
	(function (exports) {

		/**
		 * A minimal UTF8 implementation for number arrays.
		 * @memberof util
		 * @namespace
		 */
		var utf8 = exports;

		/**
		 * Calculates the UTF8 byte length of a string.
		 * @param {string} string String
		 * @returns {number} Byte length
		 */
		utf8.length = function utf8_length(string) {
		    var len = 0,
		        c = 0;
		    for (var i = 0; i < string.length; ++i) {
		        c = string.charCodeAt(i);
		        if (c < 128)
		            len += 1;
		        else if (c < 2048)
		            len += 2;
		        else if ((c & 0xFC00) === 0xD800 && (string.charCodeAt(i + 1) & 0xFC00) === 0xDC00) {
		            ++i;
		            len += 4;
		        } else
		            len += 3;
		    }
		    return len;
		};

		/**
		 * Reads UTF8 bytes as a string.
		 * @param {Uint8Array} buffer Source buffer
		 * @param {number} start Source start
		 * @param {number} end Source end
		 * @returns {string} String read
		 */
		utf8.read = function utf8_read(buffer, start, end) {
		    var len = end - start;
		    if (len < 1)
		        return "";
		    var parts = null,
		        chunk = [],
		        i = 0, // char offset
		        t;     // temporary
		    while (start < end) {
		        t = buffer[start++];
		        if (t < 128)
		            chunk[i++] = t;
		        else if (t > 191 && t < 224)
		            chunk[i++] = (t & 31) << 6 | buffer[start++] & 63;
		        else if (t > 239 && t < 365) {
		            t = ((t & 7) << 18 | (buffer[start++] & 63) << 12 | (buffer[start++] & 63) << 6 | buffer[start++] & 63) - 0x10000;
		            chunk[i++] = 0xD800 + (t >> 10);
		            chunk[i++] = 0xDC00 + (t & 1023);
		        } else
		            chunk[i++] = (t & 15) << 12 | (buffer[start++] & 63) << 6 | buffer[start++] & 63;
		        if (i > 8191) {
		            (parts || (parts = [])).push(String.fromCharCode.apply(String, chunk));
		            i = 0;
		        }
		    }
		    if (parts) {
		        if (i)
		            parts.push(String.fromCharCode.apply(String, chunk.slice(0, i)));
		        return parts.join("");
		    }
		    return String.fromCharCode.apply(String, chunk.slice(0, i));
		};

		/**
		 * Writes a string as UTF8 bytes.
		 * @param {string} string Source string
		 * @param {Uint8Array} buffer Destination buffer
		 * @param {number} offset Destination offset
		 * @returns {number} Bytes written
		 */
		utf8.write = function utf8_write(string, buffer, offset) {
		    var start = offset,
		        c1, // character 1
		        c2; // character 2
		    for (var i = 0; i < string.length; ++i) {
		        c1 = string.charCodeAt(i);
		        if (c1 < 128) {
		            buffer[offset++] = c1;
		        } else if (c1 < 2048) {
		            buffer[offset++] = c1 >> 6       | 192;
		            buffer[offset++] = c1       & 63 | 128;
		        } else if ((c1 & 0xFC00) === 0xD800 && ((c2 = string.charCodeAt(i + 1)) & 0xFC00) === 0xDC00) {
		            c1 = 0x10000 + ((c1 & 0x03FF) << 10) + (c2 & 0x03FF);
		            ++i;
		            buffer[offset++] = c1 >> 18      | 240;
		            buffer[offset++] = c1 >> 12 & 63 | 128;
		            buffer[offset++] = c1 >> 6  & 63 | 128;
		            buffer[offset++] = c1       & 63 | 128;
		        } else {
		            buffer[offset++] = c1 >> 12      | 224;
		            buffer[offset++] = c1 >> 6  & 63 | 128;
		            buffer[offset++] = c1       & 63 | 128;
		        }
		    }
		    return offset - start;
		}; 
	} (utf8$2));
	return utf8$2;
}

var pool_1;
var hasRequiredPool;

function requirePool () {
	if (hasRequiredPool) return pool_1;
	hasRequiredPool = 1;
	pool_1 = pool;

	/**
	 * An allocator as used by {@link util.pool}.
	 * @typedef PoolAllocator
	 * @type {function}
	 * @param {number} size Buffer size
	 * @returns {Uint8Array} Buffer
	 */

	/**
	 * A slicer as used by {@link util.pool}.
	 * @typedef PoolSlicer
	 * @type {function}
	 * @param {number} start Start offset
	 * @param {number} end End offset
	 * @returns {Uint8Array} Buffer slice
	 * @this {Uint8Array}
	 */

	/**
	 * A general purpose buffer pool.
	 * @memberof util
	 * @function
	 * @param {PoolAllocator} alloc Allocator
	 * @param {PoolSlicer} slice Slicer
	 * @param {number} [size=8192] Slab size
	 * @returns {PoolAllocator} Pooled allocator
	 */
	function pool(alloc, slice, size) {
	    var SIZE   = size || 8192;
	    var MAX    = SIZE >>> 1;
	    var slab   = null;
	    var offset = SIZE;
	    return function pool_alloc(size) {
	        if (size < 1 || size > MAX)
	            return alloc(size);
	        if (offset + size > SIZE) {
	            slab = alloc(SIZE);
	            offset = 0;
	        }
	        var buf = slice.call(slab, offset, offset += size);
	        if (offset & 7) // align to 32 bit
	            offset = (offset | 7) + 1;
	        return buf;
	    };
	}
	return pool_1;
}

var longbits;
var hasRequiredLongbits;

function requireLongbits () {
	if (hasRequiredLongbits) return longbits;
	hasRequiredLongbits = 1;
	longbits = LongBits;

	var util = requireMinimal();

	/**
	 * Constructs new long bits.
	 * @classdesc Helper class for working with the low and high bits of a 64 bit value.
	 * @memberof util
	 * @constructor
	 * @param {number} lo Low 32 bits, unsigned
	 * @param {number} hi High 32 bits, unsigned
	 */
	function LongBits(lo, hi) {

	    // note that the casts below are theoretically unnecessary as of today, but older statically
	    // generated converter code might still call the ctor with signed 32bits. kept for compat.

	    /**
	     * Low bits.
	     * @type {number}
	     */
	    this.lo = lo >>> 0;

	    /**
	     * High bits.
	     * @type {number}
	     */
	    this.hi = hi >>> 0;
	}

	/**
	 * Zero bits.
	 * @memberof util.LongBits
	 * @type {util.LongBits}
	 */
	var zero = LongBits.zero = new LongBits(0, 0);

	zero.toNumber = function() { return 0; };
	zero.zzEncode = zero.zzDecode = function() { return this; };
	zero.length = function() { return 1; };

	/**
	 * Zero hash.
	 * @memberof util.LongBits
	 * @type {string}
	 */
	var zeroHash = LongBits.zeroHash = "\0\0\0\0\0\0\0\0";

	/**
	 * Constructs new long bits from the specified number.
	 * @param {number} value Value
	 * @returns {util.LongBits} Instance
	 */
	LongBits.fromNumber = function fromNumber(value) {
	    if (value === 0)
	        return zero;
	    var sign = value < 0;
	    if (sign)
	        value = -value;
	    var lo = value >>> 0,
	        hi = (value - lo) / 4294967296 >>> 0;
	    if (sign) {
	        hi = ~hi >>> 0;
	        lo = ~lo >>> 0;
	        if (++lo > 4294967295) {
	            lo = 0;
	            if (++hi > 4294967295)
	                hi = 0;
	        }
	    }
	    return new LongBits(lo, hi);
	};

	/**
	 * Constructs new long bits from a number, long or string.
	 * @param {Long|number|string} value Value
	 * @returns {util.LongBits} Instance
	 */
	LongBits.from = function from(value) {
	    if (typeof value === "number")
	        return LongBits.fromNumber(value);
	    if (util.isString(value)) {
	        /* istanbul ignore else */
	        if (util.Long)
	            value = util.Long.fromString(value);
	        else
	            return LongBits.fromNumber(parseInt(value, 10));
	    }
	    return value.low || value.high ? new LongBits(value.low >>> 0, value.high >>> 0) : zero;
	};

	/**
	 * Converts this long bits to a possibly unsafe JavaScript number.
	 * @param {boolean} [unsigned=false] Whether unsigned or not
	 * @returns {number} Possibly unsafe number
	 */
	LongBits.prototype.toNumber = function toNumber(unsigned) {
	    if (!unsigned && this.hi >>> 31) {
	        var lo = ~this.lo + 1 >>> 0,
	            hi = ~this.hi     >>> 0;
	        if (!lo)
	            hi = hi + 1 >>> 0;
	        return -(lo + hi * 4294967296);
	    }
	    return this.lo + this.hi * 4294967296;
	};

	/**
	 * Converts this long bits to a long.
	 * @param {boolean} [unsigned=false] Whether unsigned or not
	 * @returns {Long} Long
	 */
	LongBits.prototype.toLong = function toLong(unsigned) {
	    return util.Long
	        ? new util.Long(this.lo | 0, this.hi | 0, Boolean(unsigned))
	        /* istanbul ignore next */
	        : { low: this.lo | 0, high: this.hi | 0, unsigned: Boolean(unsigned) };
	};

	var charCodeAt = String.prototype.charCodeAt;

	/**
	 * Constructs new long bits from the specified 8 characters long hash.
	 * @param {string} hash Hash
	 * @returns {util.LongBits} Bits
	 */
	LongBits.fromHash = function fromHash(hash) {
	    if (hash === zeroHash)
	        return zero;
	    return new LongBits(
	        ( charCodeAt.call(hash, 0)
	        | charCodeAt.call(hash, 1) << 8
	        | charCodeAt.call(hash, 2) << 16
	        | charCodeAt.call(hash, 3) << 24) >>> 0
	    ,
	        ( charCodeAt.call(hash, 4)
	        | charCodeAt.call(hash, 5) << 8
	        | charCodeAt.call(hash, 6) << 16
	        | charCodeAt.call(hash, 7) << 24) >>> 0
	    );
	};

	/**
	 * Converts this long bits to a 8 characters long hash.
	 * @returns {string} Hash
	 */
	LongBits.prototype.toHash = function toHash() {
	    return String.fromCharCode(
	        this.lo        & 255,
	        this.lo >>> 8  & 255,
	        this.lo >>> 16 & 255,
	        this.lo >>> 24      ,
	        this.hi        & 255,
	        this.hi >>> 8  & 255,
	        this.hi >>> 16 & 255,
	        this.hi >>> 24
	    );
	};

	/**
	 * Zig-zag encodes this long bits.
	 * @returns {util.LongBits} `this`
	 */
	LongBits.prototype.zzEncode = function zzEncode() {
	    var mask =   this.hi >> 31;
	    this.hi  = ((this.hi << 1 | this.lo >>> 31) ^ mask) >>> 0;
	    this.lo  = ( this.lo << 1                   ^ mask) >>> 0;
	    return this;
	};

	/**
	 * Zig-zag decodes this long bits.
	 * @returns {util.LongBits} `this`
	 */
	LongBits.prototype.zzDecode = function zzDecode() {
	    var mask = -(this.lo & 1);
	    this.lo  = ((this.lo >>> 1 | this.hi << 31) ^ mask) >>> 0;
	    this.hi  = ( this.hi >>> 1                  ^ mask) >>> 0;
	    return this;
	};

	/**
	 * Calculates the length of this longbits when encoded as a varint.
	 * @returns {number} Length
	 */
	LongBits.prototype.length = function length() {
	    var part0 =  this.lo,
	        part1 = (this.lo >>> 28 | this.hi << 4) >>> 0,
	        part2 =  this.hi >>> 24;
	    return part2 === 0
	         ? part1 === 0
	           ? part0 < 16384
	             ? part0 < 128 ? 1 : 2
	             : part0 < 2097152 ? 3 : 4
	           : part1 < 16384
	             ? part1 < 128 ? 5 : 6
	             : part1 < 2097152 ? 7 : 8
	         : part2 < 128 ? 9 : 10;
	};
	return longbits;
}

var hasRequiredMinimal;

function requireMinimal () {
	if (hasRequiredMinimal) return minimal$1;
	hasRequiredMinimal = 1;
	(function (exports) {
		var util = exports;

		// used to return a Promise where callback is omitted
		util.asPromise = requireAspromise();

		// converts to / from base64 encoded strings
		util.base64 = requireBase64();

		// base class of rpc.Service
		util.EventEmitter = requireEventemitter();

		// float handling accross browsers
		util.float = requireFloat();

		// requires modules optionally and hides the call from bundlers
		util.inquire = requireInquire();

		// converts to / from utf8 encoded strings
		util.utf8 = requireUtf8();

		// provides a node-like buffer pool in the browser
		util.pool = requirePool();

		// utility to work with the low and high bits of a 64 bit value
		util.LongBits = requireLongbits();

		/**
		 * Whether running within node or not.
		 * @memberof util
		 * @type {boolean}
		 */
		util.isNode = Boolean(typeof commonjsGlobal !== "undefined"
		                   && commonjsGlobal
		                   && commonjsGlobal.process
		                   && commonjsGlobal.process.versions
		                   && commonjsGlobal.process.versions.node);

		/**
		 * Global object reference.
		 * @memberof util
		 * @type {Object}
		 */
		util.global = util.isNode && commonjsGlobal
		           || typeof window !== "undefined" && window
		           || typeof self   !== "undefined" && self
		           || commonjsGlobal; // eslint-disable-line no-invalid-this

		/**
		 * An immuable empty array.
		 * @memberof util
		 * @type {Array.<*>}
		 * @const
		 */
		util.emptyArray = Object.freeze ? Object.freeze([]) : /* istanbul ignore next */ []; // used on prototypes

		/**
		 * An immutable empty object.
		 * @type {Object}
		 * @const
		 */
		util.emptyObject = Object.freeze ? Object.freeze({}) : /* istanbul ignore next */ {}; // used on prototypes

		/**
		 * Tests if the specified value is an integer.
		 * @function
		 * @param {*} value Value to test
		 * @returns {boolean} `true` if the value is an integer
		 */
		util.isInteger = Number.isInteger || /* istanbul ignore next */ function isInteger(value) {
		    return typeof value === "number" && isFinite(value) && Math.floor(value) === value;
		};

		/**
		 * Tests if the specified value is a string.
		 * @param {*} value Value to test
		 * @returns {boolean} `true` if the value is a string
		 */
		util.isString = function isString(value) {
		    return typeof value === "string" || value instanceof String;
		};

		/**
		 * Tests if the specified value is a non-null object.
		 * @param {*} value Value to test
		 * @returns {boolean} `true` if the value is a non-null object
		 */
		util.isObject = function isObject(value) {
		    return value && typeof value === "object";
		};

		/**
		 * Checks if a property on a message is considered to be present.
		 * This is an alias of {@link util.isSet}.
		 * @function
		 * @param {Object} obj Plain object or message instance
		 * @param {string} prop Property name
		 * @returns {boolean} `true` if considered to be present, otherwise `false`
		 */
		util.isset =

		/**
		 * Checks if a property on a message is considered to be present.
		 * @param {Object} obj Plain object or message instance
		 * @param {string} prop Property name
		 * @returns {boolean} `true` if considered to be present, otherwise `false`
		 */
		util.isSet = function isSet(obj, prop) {
		    var value = obj[prop];
		    if (value != null && obj.hasOwnProperty(prop)) // eslint-disable-line eqeqeq, no-prototype-builtins
		        return typeof value !== "object" || (Array.isArray(value) ? value.length : Object.keys(value).length) > 0;
		    return false;
		};

		/**
		 * Any compatible Buffer instance.
		 * This is a minimal stand-alone definition of a Buffer instance. The actual type is that exported by node's typings.
		 * @interface Buffer
		 * @extends Uint8Array
		 */

		/**
		 * Node's Buffer class if available.
		 * @type {Constructor<Buffer>}
		 */
		util.Buffer = (function() {
		    try {
		        var Buffer = util.inquire("buffer").Buffer;
		        // refuse to use non-node buffers if not explicitly assigned (perf reasons):
		        return Buffer.prototype.utf8Write ? Buffer : /* istanbul ignore next */ null;
		    } catch (e) {
		        /* istanbul ignore next */
		        return null;
		    }
		})();

		// Internal alias of or polyfull for Buffer.from.
		util._Buffer_from = null;

		// Internal alias of or polyfill for Buffer.allocUnsafe.
		util._Buffer_allocUnsafe = null;

		/**
		 * Creates a new buffer of whatever type supported by the environment.
		 * @param {number|number[]} [sizeOrArray=0] Buffer size or number array
		 * @returns {Uint8Array|Buffer} Buffer
		 */
		util.newBuffer = function newBuffer(sizeOrArray) {
		    /* istanbul ignore next */
		    return typeof sizeOrArray === "number"
		        ? util.Buffer
		            ? util._Buffer_allocUnsafe(sizeOrArray)
		            : new util.Array(sizeOrArray)
		        : util.Buffer
		            ? util._Buffer_from(sizeOrArray)
		            : typeof Uint8Array === "undefined"
		                ? sizeOrArray
		                : new Uint8Array(sizeOrArray);
		};

		/**
		 * Array implementation used in the browser. `Uint8Array` if supported, otherwise `Array`.
		 * @type {Constructor<Uint8Array>}
		 */
		util.Array = typeof Uint8Array !== "undefined" ? Uint8Array /* istanbul ignore next */ : Array;

		/**
		 * Any compatible Long instance.
		 * This is a minimal stand-alone definition of a Long instance. The actual type is that exported by long.js.
		 * @interface Long
		 * @property {number} low Low bits
		 * @property {number} high High bits
		 * @property {boolean} unsigned Whether unsigned or not
		 */

		/**
		 * Long.js's Long class if available.
		 * @type {Constructor<Long>}
		 */
		util.Long = /* istanbul ignore next */ util.global.dcodeIO && /* istanbul ignore next */ util.global.dcodeIO.Long
		         || /* istanbul ignore next */ util.global.Long
		         || util.inquire("long");

		/**
		 * Regular expression used to verify 2 bit (`bool`) map keys.
		 * @type {RegExp}
		 * @const
		 */
		util.key2Re = /^true|false|0|1$/;

		/**
		 * Regular expression used to verify 32 bit (`int32` etc.) map keys.
		 * @type {RegExp}
		 * @const
		 */
		util.key32Re = /^-?(?:0|[1-9][0-9]*)$/;

		/**
		 * Regular expression used to verify 64 bit (`int64` etc.) map keys.
		 * @type {RegExp}
		 * @const
		 */
		util.key64Re = /^(?:[\\x00-\\xff]{8}|-?(?:0|[1-9][0-9]*))$/;

		/**
		 * Converts a number or long to an 8 characters long hash string.
		 * @param {Long|number} value Value to convert
		 * @returns {string} Hash
		 */
		util.longToHash = function longToHash(value) {
		    return value
		        ? util.LongBits.from(value).toHash()
		        : util.LongBits.zeroHash;
		};

		/**
		 * Converts an 8 characters long hash string to a long or number.
		 * @param {string} hash Hash
		 * @param {boolean} [unsigned=false] Whether unsigned or not
		 * @returns {Long|number} Original value
		 */
		util.longFromHash = function longFromHash(hash, unsigned) {
		    var bits = util.LongBits.fromHash(hash);
		    if (util.Long)
		        return util.Long.fromBits(bits.lo, bits.hi, unsigned);
		    return bits.toNumber(Boolean(unsigned));
		};

		/**
		 * Merges the properties of the source object into the destination object.
		 * @memberof util
		 * @param {Object.<string,*>} dst Destination object
		 * @param {Object.<string,*>} src Source object
		 * @param {boolean} [ifNotSet=false] Merges only if the key is not already set
		 * @returns {Object.<string,*>} Destination object
		 */
		function merge(dst, src, ifNotSet) { // used by converters
		    for (var keys = Object.keys(src), i = 0; i < keys.length; ++i)
		        if (dst[keys[i]] === undefined || !ifNotSet)
		            dst[keys[i]] = src[keys[i]];
		    return dst;
		}

		util.merge = merge;

		/**
		 * Converts the first character of a string to lower case.
		 * @param {string} str String to convert
		 * @returns {string} Converted string
		 */
		util.lcFirst = function lcFirst(str) {
		    return str.charAt(0).toLowerCase() + str.substring(1);
		};

		/**
		 * Creates a custom error constructor.
		 * @memberof util
		 * @param {string} name Error name
		 * @returns {Constructor<Error>} Custom error constructor
		 */
		function newError(name) {

		    function CustomError(message, properties) {

		        if (!(this instanceof CustomError))
		            return new CustomError(message, properties);

		        // Error.call(this, message);
		        // ^ just returns a new error instance because the ctor can be called as a function

		        Object.defineProperty(this, "message", { get: function() { return message; } });

		        /* istanbul ignore next */
		        if (Error.captureStackTrace) // node
		            Error.captureStackTrace(this, CustomError);
		        else
		            Object.defineProperty(this, "stack", { value: new Error().stack || "" });

		        if (properties)
		            merge(this, properties);
		    }

		    (CustomError.prototype = Object.create(Error.prototype)).constructor = CustomError;

		    Object.defineProperty(CustomError.prototype, "name", { get: function() { return name; } });

		    CustomError.prototype.toString = function toString() {
		        return this.name + ": " + this.message;
		    };

		    return CustomError;
		}

		util.newError = newError;

		/**
		 * Constructs a new protocol error.
		 * @classdesc Error subclass indicating a protocol specifc error.
		 * @memberof util
		 * @extends Error
		 * @template T extends Message<T>
		 * @constructor
		 * @param {string} message Error message
		 * @param {Object.<string,*>} [properties] Additional properties
		 * @example
		 * try {
		 *     MyMessage.decode(someBuffer); // throws if required fields are missing
		 * } catch (e) {
		 *     if (e instanceof ProtocolError && e.instance)
		 *         console.log("decoded so far: " + JSON.stringify(e.instance));
		 * }
		 */
		util.ProtocolError = newError("ProtocolError");

		/**
		 * So far decoded message instance.
		 * @name util.ProtocolError#instance
		 * @type {Message<T>}
		 */

		/**
		 * A OneOf getter as returned by {@link util.oneOfGetter}.
		 * @typedef OneOfGetter
		 * @type {function}
		 * @returns {string|undefined} Set field name, if any
		 */

		/**
		 * Builds a getter for a oneof's present field name.
		 * @param {string[]} fieldNames Field names
		 * @returns {OneOfGetter} Unbound getter
		 */
		util.oneOfGetter = function getOneOf(fieldNames) {
		    var fieldMap = {};
		    for (var i = 0; i < fieldNames.length; ++i)
		        fieldMap[fieldNames[i]] = 1;

		    /**
		     * @returns {string|undefined} Set field name, if any
		     * @this Object
		     * @ignore
		     */
		    return function() { // eslint-disable-line consistent-return
		        for (var keys = Object.keys(this), i = keys.length - 1; i > -1; --i)
		            if (fieldMap[keys[i]] === 1 && this[keys[i]] !== undefined && this[keys[i]] !== null)
		                return keys[i];
		    };
		};

		/**
		 * A OneOf setter as returned by {@link util.oneOfSetter}.
		 * @typedef OneOfSetter
		 * @type {function}
		 * @param {string|undefined} value Field name
		 * @returns {undefined}
		 */

		/**
		 * Builds a setter for a oneof's present field name.
		 * @param {string[]} fieldNames Field names
		 * @returns {OneOfSetter} Unbound setter
		 */
		util.oneOfSetter = function setOneOf(fieldNames) {

		    /**
		     * @param {string} name Field name
		     * @returns {undefined}
		     * @this Object
		     * @ignore
		     */
		    return function(name) {
		        for (var i = 0; i < fieldNames.length; ++i)
		            if (fieldNames[i] !== name)
		                delete this[fieldNames[i]];
		    };
		};

		/**
		 * Default conversion options used for {@link Message#toJSON} implementations.
		 *
		 * These options are close to proto3's JSON mapping with the exception that internal types like Any are handled just like messages. More precisely:
		 *
		 * - Longs become strings
		 * - Enums become string keys
		 * - Bytes become base64 encoded strings
		 * - (Sub-)Messages become plain objects
		 * - Maps become plain objects with all string keys
		 * - Repeated fields become arrays
		 * - NaN and Infinity for float and double fields become strings
		 *
		 * @type {IConversionOptions}
		 * @see https://developers.google.com/protocol-buffers/docs/proto3?hl=en#json
		 */
		util.toJSONOptions = {
		    longs: String,
		    enums: String,
		    bytes: String,
		    json: true
		};

		// Sets up buffer utility according to the environment (called in index-minimal)
		util._configure = function() {
		    var Buffer = util.Buffer;
		    /* istanbul ignore if */
		    if (!Buffer) {
		        util._Buffer_from = util._Buffer_allocUnsafe = null;
		        return;
		    }
		    // because node 4.x buffers are incompatible & immutable
		    // see: https://github.com/dcodeIO/protobuf.js/pull/665
		    util._Buffer_from = Buffer.from !== Uint8Array.from && Buffer.from ||
		        /* istanbul ignore next */
		        function Buffer_from(value, encoding) {
		            return new Buffer(value, encoding);
		        };
		    util._Buffer_allocUnsafe = Buffer.allocUnsafe ||
		        /* istanbul ignore next */
		        function Buffer_allocUnsafe(size) {
		            return new Buffer(size);
		        };
		}; 
	} (minimal$1));
	return minimal$1;
}

var writer = Writer$1;

var util$4      = requireMinimal();

var BufferWriter$1; // cyclic

var LongBits$1  = util$4.LongBits,
    base64    = util$4.base64,
    utf8$1      = util$4.utf8;

/**
 * Constructs a new writer operation instance.
 * @classdesc Scheduled writer operation.
 * @constructor
 * @param {function(*, Uint8Array, number)} fn Function to call
 * @param {number} len Value byte length
 * @param {*} val Value to write
 * @ignore
 */
function Op(fn, len, val) {

    /**
     * Function to call.
     * @type {function(Uint8Array, number, *)}
     */
    this.fn = fn;

    /**
     * Value byte length.
     * @type {number}
     */
    this.len = len;

    /**
     * Next operation.
     * @type {Writer.Op|undefined}
     */
    this.next = undefined;

    /**
     * Value to write.
     * @type {*}
     */
    this.val = val; // type varies
}

/* istanbul ignore next */
function noop() {} // eslint-disable-line no-empty-function

/**
 * Constructs a new writer state instance.
 * @classdesc Copied writer state.
 * @memberof Writer
 * @constructor
 * @param {Writer} writer Writer to copy state from
 * @ignore
 */
function State(writer) {

    /**
     * Current head.
     * @type {Writer.Op}
     */
    this.head = writer.head;

    /**
     * Current tail.
     * @type {Writer.Op}
     */
    this.tail = writer.tail;

    /**
     * Current buffer length.
     * @type {number}
     */
    this.len = writer.len;

    /**
     * Next state.
     * @type {State|null}
     */
    this.next = writer.states;
}

/**
 * Constructs a new writer instance.
 * @classdesc Wire format writer using `Uint8Array` if available, otherwise `Array`.
 * @constructor
 */
function Writer$1() {

    /**
     * Current length.
     * @type {number}
     */
    this.len = 0;

    /**
     * Operations head.
     * @type {Object}
     */
    this.head = new Op(noop, 0, 0);

    /**
     * Operations tail
     * @type {Object}
     */
    this.tail = this.head;

    /**
     * Linked forked states.
     * @type {Object|null}
     */
    this.states = null;

    // When a value is written, the writer calculates its byte length and puts it into a linked
    // list of operations to perform when finish() is called. This both allows us to allocate
    // buffers of the exact required size and reduces the amount of work we have to do compared
    // to first calculating over objects and then encoding over objects. In our case, the encoding
    // part is just a linked list walk calling operations with already prepared values.
}

var create$1 = function create() {
    return util$4.Buffer
        ? function create_buffer_setup() {
            return (Writer$1.create = function create_buffer() {
                return new BufferWriter$1();
            })();
        }
        /* istanbul ignore next */
        : function create_array() {
            return new Writer$1();
        };
};

/**
 * Creates a new writer.
 * @function
 * @returns {BufferWriter|Writer} A {@link BufferWriter} when Buffers are supported, otherwise a {@link Writer}
 */
Writer$1.create = create$1();

/**
 * Allocates a buffer of the specified size.
 * @param {number} size Buffer size
 * @returns {Uint8Array} Buffer
 */
Writer$1.alloc = function alloc(size) {
    return new util$4.Array(size);
};

// Use Uint8Array buffer pool in the browser, just like node does with buffers
/* istanbul ignore else */
if (util$4.Array !== Array)
    Writer$1.alloc = util$4.pool(Writer$1.alloc, util$4.Array.prototype.subarray);

/**
 * Pushes a new operation to the queue.
 * @param {function(Uint8Array, number, *)} fn Function to call
 * @param {number} len Value byte length
 * @param {number} val Value to write
 * @returns {Writer} `this`
 * @private
 */
Writer$1.prototype._push = function push(fn, len, val) {
    this.tail = this.tail.next = new Op(fn, len, val);
    this.len += len;
    return this;
};

function writeByte(val, buf, pos) {
    buf[pos] = val & 255;
}

function writeVarint32(val, buf, pos) {
    while (val > 127) {
        buf[pos++] = val & 127 | 128;
        val >>>= 7;
    }
    buf[pos] = val;
}

/**
 * Constructs a new varint writer operation instance.
 * @classdesc Scheduled varint writer operation.
 * @extends Op
 * @constructor
 * @param {number} len Value byte length
 * @param {number} val Value to write
 * @ignore
 */
function VarintOp(len, val) {
    this.len = len;
    this.next = undefined;
    this.val = val;
}

VarintOp.prototype = Object.create(Op.prototype);
VarintOp.prototype.fn = writeVarint32;

/**
 * Writes an unsigned 32 bit value as a varint.
 * @param {number} value Value to write
 * @returns {Writer} `this`
 */
Writer$1.prototype.uint32 = function write_uint32(value) {
    // here, the call to this.push has been inlined and a varint specific Op subclass is used.
    // uint32 is by far the most frequently used operation and benefits significantly from this.
    this.len += (this.tail = this.tail.next = new VarintOp(
        (value = value >>> 0)
                < 128       ? 1
        : value < 16384     ? 2
        : value < 2097152   ? 3
        : value < 268435456 ? 4
        :                     5,
    value)).len;
    return this;
};

/**
 * Writes a signed 32 bit value as a varint.
 * @function
 * @param {number} value Value to write
 * @returns {Writer} `this`
 */
Writer$1.prototype.int32 = function write_int32(value) {
    return value < 0
        ? this._push(writeVarint64, 10, LongBits$1.fromNumber(value)) // 10 bytes per spec
        : this.uint32(value);
};

/**
 * Writes a 32 bit value as a varint, zig-zag encoded.
 * @param {number} value Value to write
 * @returns {Writer} `this`
 */
Writer$1.prototype.sint32 = function write_sint32(value) {
    return this.uint32((value << 1 ^ value >> 31) >>> 0);
};

function writeVarint64(val, buf, pos) {
    while (val.hi) {
        buf[pos++] = val.lo & 127 | 128;
        val.lo = (val.lo >>> 7 | val.hi << 25) >>> 0;
        val.hi >>>= 7;
    }
    while (val.lo > 127) {
        buf[pos++] = val.lo & 127 | 128;
        val.lo = val.lo >>> 7;
    }
    buf[pos++] = val.lo;
}

/**
 * Writes an unsigned 64 bit value as a varint.
 * @param {Long|number|string} value Value to write
 * @returns {Writer} `this`
 * @throws {TypeError} If `value` is a string and no long library is present.
 */
Writer$1.prototype.uint64 = function write_uint64(value) {
    var bits = LongBits$1.from(value);
    return this._push(writeVarint64, bits.length(), bits);
};

/**
 * Writes a signed 64 bit value as a varint.
 * @function
 * @param {Long|number|string} value Value to write
 * @returns {Writer} `this`
 * @throws {TypeError} If `value` is a string and no long library is present.
 */
Writer$1.prototype.int64 = Writer$1.prototype.uint64;

/**
 * Writes a signed 64 bit value as a varint, zig-zag encoded.
 * @param {Long|number|string} value Value to write
 * @returns {Writer} `this`
 * @throws {TypeError} If `value` is a string and no long library is present.
 */
Writer$1.prototype.sint64 = function write_sint64(value) {
    var bits = LongBits$1.from(value).zzEncode();
    return this._push(writeVarint64, bits.length(), bits);
};

/**
 * Writes a boolish value as a varint.
 * @param {boolean} value Value to write
 * @returns {Writer} `this`
 */
Writer$1.prototype.bool = function write_bool(value) {
    return this._push(writeByte, 1, value ? 1 : 0);
};

function writeFixed32(val, buf, pos) {
    buf[pos    ] =  val         & 255;
    buf[pos + 1] =  val >>> 8   & 255;
    buf[pos + 2] =  val >>> 16  & 255;
    buf[pos + 3] =  val >>> 24;
}

/**
 * Writes an unsigned 32 bit value as fixed 32 bits.
 * @param {number} value Value to write
 * @returns {Writer} `this`
 */
Writer$1.prototype.fixed32 = function write_fixed32(value) {
    return this._push(writeFixed32, 4, value >>> 0);
};

/**
 * Writes a signed 32 bit value as fixed 32 bits.
 * @function
 * @param {number} value Value to write
 * @returns {Writer} `this`
 */
Writer$1.prototype.sfixed32 = Writer$1.prototype.fixed32;

/**
 * Writes an unsigned 64 bit value as fixed 64 bits.
 * @param {Long|number|string} value Value to write
 * @returns {Writer} `this`
 * @throws {TypeError} If `value` is a string and no long library is present.
 */
Writer$1.prototype.fixed64 = function write_fixed64(value) {
    var bits = LongBits$1.from(value);
    return this._push(writeFixed32, 4, bits.lo)._push(writeFixed32, 4, bits.hi);
};

/**
 * Writes a signed 64 bit value as fixed 64 bits.
 * @function
 * @param {Long|number|string} value Value to write
 * @returns {Writer} `this`
 * @throws {TypeError} If `value` is a string and no long library is present.
 */
Writer$1.prototype.sfixed64 = Writer$1.prototype.fixed64;

/**
 * Writes a float (32 bit).
 * @function
 * @param {number} value Value to write
 * @returns {Writer} `this`
 */
Writer$1.prototype.float = function write_float(value) {
    return this._push(util$4.float.writeFloatLE, 4, value);
};

/**
 * Writes a double (64 bit float).
 * @function
 * @param {number} value Value to write
 * @returns {Writer} `this`
 */
Writer$1.prototype.double = function write_double(value) {
    return this._push(util$4.float.writeDoubleLE, 8, value);
};

var writeBytes = util$4.Array.prototype.set
    ? function writeBytes_set(val, buf, pos) {
        buf.set(val, pos); // also works for plain array values
    }
    /* istanbul ignore next */
    : function writeBytes_for(val, buf, pos) {
        for (var i = 0; i < val.length; ++i)
            buf[pos + i] = val[i];
    };

/**
 * Writes a sequence of bytes.
 * @param {Uint8Array|string} value Buffer or base64 encoded string to write
 * @returns {Writer} `this`
 */
Writer$1.prototype.bytes = function write_bytes(value) {
    var len = value.length >>> 0;
    if (!len)
        return this._push(writeByte, 1, 0);
    if (util$4.isString(value)) {
        var buf = Writer$1.alloc(len = base64.length(value));
        base64.decode(value, buf, 0);
        value = buf;
    }
    return this.uint32(len)._push(writeBytes, len, value);
};

/**
 * Writes a string.
 * @param {string} value Value to write
 * @returns {Writer} `this`
 */
Writer$1.prototype.string = function write_string(value) {
    var len = utf8$1.length(value);
    return len
        ? this.uint32(len)._push(utf8$1.write, len, value)
        : this._push(writeByte, 1, 0);
};

/**
 * Forks this writer's state by pushing it to a stack.
 * Calling {@link Writer#reset|reset} or {@link Writer#ldelim|ldelim} resets the writer to the previous state.
 * @returns {Writer} `this`
 */
Writer$1.prototype.fork = function fork() {
    this.states = new State(this);
    this.head = this.tail = new Op(noop, 0, 0);
    this.len = 0;
    return this;
};

/**
 * Resets this instance to the last state.
 * @returns {Writer} `this`
 */
Writer$1.prototype.reset = function reset() {
    if (this.states) {
        this.head   = this.states.head;
        this.tail   = this.states.tail;
        this.len    = this.states.len;
        this.states = this.states.next;
    } else {
        this.head = this.tail = new Op(noop, 0, 0);
        this.len  = 0;
    }
    return this;
};

/**
 * Resets to the last state and appends the fork state's current write length as a varint followed by its operations.
 * @returns {Writer} `this`
 */
Writer$1.prototype.ldelim = function ldelim() {
    var head = this.head,
        tail = this.tail,
        len  = this.len;
    this.reset().uint32(len);
    if (len) {
        this.tail.next = head.next; // skip noop
        this.tail = tail;
        this.len += len;
    }
    return this;
};

/**
 * Finishes the write operation.
 * @returns {Uint8Array} Finished buffer
 */
Writer$1.prototype.finish = function finish() {
    var head = this.head.next, // skip noop
        buf  = this.constructor.alloc(this.len),
        pos  = 0;
    while (head) {
        head.fn(head.val, buf, pos);
        pos += head.len;
        head = head.next;
    }
    // this.head = this.tail = null;
    return buf;
};

Writer$1._configure = function(BufferWriter_) {
    BufferWriter$1 = BufferWriter_;
    Writer$1.create = create$1();
    BufferWriter$1._configure();
};

var writer_buffer = BufferWriter;

// extends Writer
var Writer = writer;
(BufferWriter.prototype = Object.create(Writer.prototype)).constructor = BufferWriter;

var util$3 = requireMinimal();

/**
 * Constructs a new buffer writer instance.
 * @classdesc Wire format writer using node buffers.
 * @extends Writer
 * @constructor
 */
function BufferWriter() {
    Writer.call(this);
}

BufferWriter._configure = function () {
    /**
     * Allocates a buffer of the specified size.
     * @function
     * @param {number} size Buffer size
     * @returns {Buffer} Buffer
     */
    BufferWriter.alloc = util$3._Buffer_allocUnsafe;

    BufferWriter.writeBytesBuffer = util$3.Buffer && util$3.Buffer.prototype instanceof Uint8Array && util$3.Buffer.prototype.set.name === "set"
        ? function writeBytesBuffer_set(val, buf, pos) {
          buf.set(val, pos); // faster than copy (requires node >= 4 where Buffers extend Uint8Array and set is properly inherited)
          // also works for plain array values
        }
        /* istanbul ignore next */
        : function writeBytesBuffer_copy(val, buf, pos) {
          if (val.copy) // Buffer values
            val.copy(buf, pos, 0, val.length);
          else for (var i = 0; i < val.length;) // plain array values
            buf[pos++] = val[i++];
        };
};


/**
 * @override
 */
BufferWriter.prototype.bytes = function write_bytes_buffer(value) {
    if (util$3.isString(value))
        value = util$3._Buffer_from(value, "base64");
    var len = value.length >>> 0;
    this.uint32(len);
    if (len)
        this._push(BufferWriter.writeBytesBuffer, len, value);
    return this;
};

function writeStringBuffer(val, buf, pos) {
    if (val.length < 40) // plain js is faster for short strings (probably due to redundant assertions)
        util$3.utf8.write(val, buf, pos);
    else if (buf.utf8Write)
        buf.utf8Write(val, pos);
    else
        buf.write(val, pos);
}

/**
 * @override
 */
BufferWriter.prototype.string = function write_string_buffer(value) {
    var len = util$3.Buffer.byteLength(value);
    this.uint32(len);
    if (len)
        this._push(writeStringBuffer, len, value);
    return this;
};


/**
 * Finishes the write operation.
 * @name BufferWriter#finish
 * @function
 * @returns {Buffer} Finished buffer
 */

BufferWriter._configure();

var reader = Reader$1;

var util$2      = requireMinimal();

var BufferReader$1; // cyclic

var LongBits  = util$2.LongBits,
    utf8      = util$2.utf8;

/* istanbul ignore next */
function indexOutOfRange(reader, writeLength) {
    return RangeError("index out of range: " + reader.pos + " + " + (writeLength || 1) + " > " + reader.len);
}

/**
 * Constructs a new reader instance using the specified buffer.
 * @classdesc Wire format reader using `Uint8Array` if available, otherwise `Array`.
 * @constructor
 * @param {Uint8Array} buffer Buffer to read from
 */
function Reader$1(buffer) {

    /**
     * Read buffer.
     * @type {Uint8Array}
     */
    this.buf = buffer;

    /**
     * Read buffer position.
     * @type {number}
     */
    this.pos = 0;

    /**
     * Read buffer length.
     * @type {number}
     */
    this.len = buffer.length;
}

var create_array = typeof Uint8Array !== "undefined"
    ? function create_typed_array(buffer) {
        if (buffer instanceof Uint8Array || Array.isArray(buffer))
            return new Reader$1(buffer);
        throw Error("illegal buffer");
    }
    /* istanbul ignore next */
    : function create_array(buffer) {
        if (Array.isArray(buffer))
            return new Reader$1(buffer);
        throw Error("illegal buffer");
    };

var create = function create() {
    return util$2.Buffer
        ? function create_buffer_setup(buffer) {
            return (Reader$1.create = function create_buffer(buffer) {
                return util$2.Buffer.isBuffer(buffer)
                    ? new BufferReader$1(buffer)
                    /* istanbul ignore next */
                    : create_array(buffer);
            })(buffer);
        }
        /* istanbul ignore next */
        : create_array;
};

/**
 * Creates a new reader using the specified buffer.
 * @function
 * @param {Uint8Array|Buffer} buffer Buffer to read from
 * @returns {Reader|BufferReader} A {@link BufferReader} if `buffer` is a Buffer, otherwise a {@link Reader}
 * @throws {Error} If `buffer` is not a valid buffer
 */
Reader$1.create = create();

Reader$1.prototype._slice = util$2.Array.prototype.subarray || /* istanbul ignore next */ util$2.Array.prototype.slice;

/**
 * Reads a varint as an unsigned 32 bit value.
 * @function
 * @returns {number} Value read
 */
Reader$1.prototype.uint32 = (function read_uint32_setup() {
    var value = 4294967295; // optimizer type-hint, tends to deopt otherwise (?!)
    return function read_uint32() {
        value = (         this.buf[this.pos] & 127       ) >>> 0; if (this.buf[this.pos++] < 128) return value;
        value = (value | (this.buf[this.pos] & 127) <<  7) >>> 0; if (this.buf[this.pos++] < 128) return value;
        value = (value | (this.buf[this.pos] & 127) << 14) >>> 0; if (this.buf[this.pos++] < 128) return value;
        value = (value | (this.buf[this.pos] & 127) << 21) >>> 0; if (this.buf[this.pos++] < 128) return value;
        value = (value | (this.buf[this.pos] &  15) << 28) >>> 0; if (this.buf[this.pos++] < 128) return value;

        /* istanbul ignore if */
        if ((this.pos += 5) > this.len) {
            this.pos = this.len;
            throw indexOutOfRange(this, 10);
        }
        return value;
    };
})();

/**
 * Reads a varint as a signed 32 bit value.
 * @returns {number} Value read
 */
Reader$1.prototype.int32 = function read_int32() {
    return this.uint32() | 0;
};

/**
 * Reads a zig-zag encoded varint as a signed 32 bit value.
 * @returns {number} Value read
 */
Reader$1.prototype.sint32 = function read_sint32() {
    var value = this.uint32();
    return value >>> 1 ^ -(value & 1) | 0;
};

/* eslint-disable no-invalid-this */

function readLongVarint() {
    // tends to deopt with local vars for octet etc.
    var bits = new LongBits(0, 0);
    var i = 0;
    if (this.len - this.pos > 4) { // fast route (lo)
        for (; i < 4; ++i) {
            // 1st..4th
            bits.lo = (bits.lo | (this.buf[this.pos] & 127) << i * 7) >>> 0;
            if (this.buf[this.pos++] < 128)
                return bits;
        }
        // 5th
        bits.lo = (bits.lo | (this.buf[this.pos] & 127) << 28) >>> 0;
        bits.hi = (bits.hi | (this.buf[this.pos] & 127) >>  4) >>> 0;
        if (this.buf[this.pos++] < 128)
            return bits;
        i = 0;
    } else {
        for (; i < 3; ++i) {
            /* istanbul ignore if */
            if (this.pos >= this.len)
                throw indexOutOfRange(this);
            // 1st..3th
            bits.lo = (bits.lo | (this.buf[this.pos] & 127) << i * 7) >>> 0;
            if (this.buf[this.pos++] < 128)
                return bits;
        }
        // 4th
        bits.lo = (bits.lo | (this.buf[this.pos++] & 127) << i * 7) >>> 0;
        return bits;
    }
    if (this.len - this.pos > 4) { // fast route (hi)
        for (; i < 5; ++i) {
            // 6th..10th
            bits.hi = (bits.hi | (this.buf[this.pos] & 127) << i * 7 + 3) >>> 0;
            if (this.buf[this.pos++] < 128)
                return bits;
        }
    } else {
        for (; i < 5; ++i) {
            /* istanbul ignore if */
            if (this.pos >= this.len)
                throw indexOutOfRange(this);
            // 6th..10th
            bits.hi = (bits.hi | (this.buf[this.pos] & 127) << i * 7 + 3) >>> 0;
            if (this.buf[this.pos++] < 128)
                return bits;
        }
    }
    /* istanbul ignore next */
    throw Error("invalid varint encoding");
}

/* eslint-enable no-invalid-this */

/**
 * Reads a varint as a signed 64 bit value.
 * @name Reader#int64
 * @function
 * @returns {Long} Value read
 */

/**
 * Reads a varint as an unsigned 64 bit value.
 * @name Reader#uint64
 * @function
 * @returns {Long} Value read
 */

/**
 * Reads a zig-zag encoded varint as a signed 64 bit value.
 * @name Reader#sint64
 * @function
 * @returns {Long} Value read
 */

/**
 * Reads a varint as a boolean.
 * @returns {boolean} Value read
 */
Reader$1.prototype.bool = function read_bool() {
    return this.uint32() !== 0;
};

function readFixed32_end(buf, end) { // note that this uses `end`, not `pos`
    return (buf[end - 4]
          | buf[end - 3] << 8
          | buf[end - 2] << 16
          | buf[end - 1] << 24) >>> 0;
}

/**
 * Reads fixed 32 bits as an unsigned 32 bit integer.
 * @returns {number} Value read
 */
Reader$1.prototype.fixed32 = function read_fixed32() {

    /* istanbul ignore if */
    if (this.pos + 4 > this.len)
        throw indexOutOfRange(this, 4);

    return readFixed32_end(this.buf, this.pos += 4);
};

/**
 * Reads fixed 32 bits as a signed 32 bit integer.
 * @returns {number} Value read
 */
Reader$1.prototype.sfixed32 = function read_sfixed32() {

    /* istanbul ignore if */
    if (this.pos + 4 > this.len)
        throw indexOutOfRange(this, 4);

    return readFixed32_end(this.buf, this.pos += 4) | 0;
};

/* eslint-disable no-invalid-this */

function readFixed64(/* this: Reader */) {

    /* istanbul ignore if */
    if (this.pos + 8 > this.len)
        throw indexOutOfRange(this, 8);

    return new LongBits(readFixed32_end(this.buf, this.pos += 4), readFixed32_end(this.buf, this.pos += 4));
}

/* eslint-enable no-invalid-this */

/**
 * Reads fixed 64 bits.
 * @name Reader#fixed64
 * @function
 * @returns {Long} Value read
 */

/**
 * Reads zig-zag encoded fixed 64 bits.
 * @name Reader#sfixed64
 * @function
 * @returns {Long} Value read
 */

/**
 * Reads a float (32 bit) as a number.
 * @function
 * @returns {number} Value read
 */
Reader$1.prototype.float = function read_float() {

    /* istanbul ignore if */
    if (this.pos + 4 > this.len)
        throw indexOutOfRange(this, 4);

    var value = util$2.float.readFloatLE(this.buf, this.pos);
    this.pos += 4;
    return value;
};

/**
 * Reads a double (64 bit float) as a number.
 * @function
 * @returns {number} Value read
 */
Reader$1.prototype.double = function read_double() {

    /* istanbul ignore if */
    if (this.pos + 8 > this.len)
        throw indexOutOfRange(this, 4);

    var value = util$2.float.readDoubleLE(this.buf, this.pos);
    this.pos += 8;
    return value;
};

/**
 * Reads a sequence of bytes preceeded by its length as a varint.
 * @returns {Uint8Array} Value read
 */
Reader$1.prototype.bytes = function read_bytes() {
    var length = this.uint32(),
        start  = this.pos,
        end    = this.pos + length;

    /* istanbul ignore if */
    if (end > this.len)
        throw indexOutOfRange(this, length);

    this.pos += length;
    if (Array.isArray(this.buf)) // plain array
        return this.buf.slice(start, end);
    return start === end // fix for IE 10/Win8 and others' subarray returning array of size 1
        ? new this.buf.constructor(0)
        : this._slice.call(this.buf, start, end);
};

/**
 * Reads a string preceeded by its byte length as a varint.
 * @returns {string} Value read
 */
Reader$1.prototype.string = function read_string() {
    var bytes = this.bytes();
    return utf8.read(bytes, 0, bytes.length);
};

/**
 * Skips the specified number of bytes if specified, otherwise skips a varint.
 * @param {number} [length] Length if known, otherwise a varint is assumed
 * @returns {Reader} `this`
 */
Reader$1.prototype.skip = function skip(length) {
    if (typeof length === "number") {
        /* istanbul ignore if */
        if (this.pos + length > this.len)
            throw indexOutOfRange(this, length);
        this.pos += length;
    } else {
        do {
            /* istanbul ignore if */
            if (this.pos >= this.len)
                throw indexOutOfRange(this);
        } while (this.buf[this.pos++] & 128);
    }
    return this;
};

/**
 * Skips the next element of the specified wire type.
 * @param {number} wireType Wire type received
 * @returns {Reader} `this`
 */
Reader$1.prototype.skipType = function(wireType) {
    switch (wireType) {
        case 0:
            this.skip();
            break;
        case 1:
            this.skip(8);
            break;
        case 2:
            this.skip(this.uint32());
            break;
        case 3:
            while ((wireType = this.uint32() & 7) !== 4) {
                this.skipType(wireType);
            }
            break;
        case 5:
            this.skip(4);
            break;

        /* istanbul ignore next */
        default:
            throw Error("invalid wire type " + wireType + " at offset " + this.pos);
    }
    return this;
};

Reader$1._configure = function(BufferReader_) {
    BufferReader$1 = BufferReader_;
    Reader$1.create = create();
    BufferReader$1._configure();

    var fn = util$2.Long ? "toLong" : /* istanbul ignore next */ "toNumber";
    util$2.merge(Reader$1.prototype, {

        int64: function read_int64() {
            return readLongVarint.call(this)[fn](false);
        },

        uint64: function read_uint64() {
            return readLongVarint.call(this)[fn](true);
        },

        sint64: function read_sint64() {
            return readLongVarint.call(this).zzDecode()[fn](false);
        },

        fixed64: function read_fixed64() {
            return readFixed64.call(this)[fn](true);
        },

        sfixed64: function read_sfixed64() {
            return readFixed64.call(this)[fn](false);
        }

    });
};

var reader_buffer = BufferReader;

// extends Reader
var Reader = reader;
(BufferReader.prototype = Object.create(Reader.prototype)).constructor = BufferReader;

var util$1 = requireMinimal();

/**
 * Constructs a new buffer reader instance.
 * @classdesc Wire format reader using node buffers.
 * @extends Reader
 * @constructor
 * @param {Buffer} buffer Buffer to read from
 */
function BufferReader(buffer) {
    Reader.call(this, buffer);

    /**
     * Read buffer.
     * @name BufferReader#buf
     * @type {Buffer}
     */
}

BufferReader._configure = function () {
    /* istanbul ignore else */
    if (util$1.Buffer)
        BufferReader.prototype._slice = util$1.Buffer.prototype.slice;
};


/**
 * @override
 */
BufferReader.prototype.string = function read_string_buffer() {
    var len = this.uint32(); // modifies pos
    return this.buf.utf8Slice
        ? this.buf.utf8Slice(this.pos, this.pos = Math.min(this.pos + len, this.len))
        : this.buf.toString("utf-8", this.pos, this.pos = Math.min(this.pos + len, this.len));
};

/**
 * Reads a sequence of bytes preceeded by its length as a varint.
 * @name BufferReader#bytes
 * @function
 * @returns {Buffer} Value read
 */

BufferReader._configure();

var rpc = {};

var service = Service;

var util = requireMinimal();

// Extends EventEmitter
(Service.prototype = Object.create(util.EventEmitter.prototype)).constructor = Service;

/**
 * A service method callback as used by {@link rpc.ServiceMethod|ServiceMethod}.
 *
 * Differs from {@link RPCImplCallback} in that it is an actual callback of a service method which may not return `response = null`.
 * @typedef rpc.ServiceMethodCallback
 * @template TRes extends Message<TRes>
 * @type {function}
 * @param {Error|null} error Error, if any
 * @param {TRes} [response] Response message
 * @returns {undefined}
 */

/**
 * A service method part of a {@link rpc.Service} as created by {@link Service.create}.
 * @typedef rpc.ServiceMethod
 * @template TReq extends Message<TReq>
 * @template TRes extends Message<TRes>
 * @type {function}
 * @param {TReq|Properties<TReq>} request Request message or plain object
 * @param {rpc.ServiceMethodCallback<TRes>} [callback] Node-style callback called with the error, if any, and the response message
 * @returns {Promise<Message<TRes>>} Promise if `callback` has been omitted, otherwise `undefined`
 */

/**
 * Constructs a new RPC service instance.
 * @classdesc An RPC service as returned by {@link Service#create}.
 * @exports rpc.Service
 * @extends util.EventEmitter
 * @constructor
 * @param {RPCImpl} rpcImpl RPC implementation
 * @param {boolean} [requestDelimited=false] Whether requests are length-delimited
 * @param {boolean} [responseDelimited=false] Whether responses are length-delimited
 */
function Service(rpcImpl, requestDelimited, responseDelimited) {

    if (typeof rpcImpl !== "function")
        throw TypeError("rpcImpl must be a function");

    util.EventEmitter.call(this);

    /**
     * RPC implementation. Becomes `null` once the service is ended.
     * @type {RPCImpl|null}
     */
    this.rpcImpl = rpcImpl;

    /**
     * Whether requests are length-delimited.
     * @type {boolean}
     */
    this.requestDelimited = Boolean(requestDelimited);

    /**
     * Whether responses are length-delimited.
     * @type {boolean}
     */
    this.responseDelimited = Boolean(responseDelimited);
}

/**
 * Calls a service method through {@link rpc.Service#rpcImpl|rpcImpl}.
 * @param {Method|rpc.ServiceMethod<TReq,TRes>} method Reflected or static method
 * @param {Constructor<TReq>} requestCtor Request constructor
 * @param {Constructor<TRes>} responseCtor Response constructor
 * @param {TReq|Properties<TReq>} request Request message or plain object
 * @param {rpc.ServiceMethodCallback<TRes>} callback Service callback
 * @returns {undefined}
 * @template TReq extends Message<TReq>
 * @template TRes extends Message<TRes>
 */
Service.prototype.rpcCall = function rpcCall(method, requestCtor, responseCtor, request, callback) {

    if (!request)
        throw TypeError("request must be specified");

    var self = this;
    if (!callback)
        return util.asPromise(rpcCall, self, method, requestCtor, responseCtor, request);

    if (!self.rpcImpl) {
        setTimeout(function() { callback(Error("already ended")); }, 0);
        return undefined;
    }

    try {
        return self.rpcImpl(
            method,
            requestCtor[self.requestDelimited ? "encodeDelimited" : "encode"](request).finish(),
            function rpcCallback(err, response) {

                if (err) {
                    self.emit("error", err, method);
                    return callback(err);
                }

                if (response === null) {
                    self.end(/* endedByRPC */ true);
                    return undefined;
                }

                if (!(response instanceof responseCtor)) {
                    try {
                        response = responseCtor[self.responseDelimited ? "decodeDelimited" : "decode"](response);
                    } catch (err) {
                        self.emit("error", err, method);
                        return callback(err);
                    }
                }

                self.emit("data", response, method);
                return callback(null, response);
            }
        );
    } catch (err) {
        self.emit("error", err, method);
        setTimeout(function() { callback(err); }, 0);
        return undefined;
    }
};

/**
 * Ends this service and emits the `end` event.
 * @param {boolean} [endedByRPC=false] Whether the service has been ended by the RPC implementation.
 * @returns {rpc.Service} `this`
 */
Service.prototype.end = function end(endedByRPC) {
    if (this.rpcImpl) {
        if (!endedByRPC) // signal end to rpcImpl
            this.rpcImpl(null, null, null);
        this.rpcImpl = null;
        this.emit("end").off();
    }
    return this;
};

(function (exports) {

	/**
	 * Streaming RPC helpers.
	 * @namespace
	 */
	var rpc = exports;

	/**
	 * RPC implementation passed to {@link Service#create} performing a service request on network level, i.e. by utilizing http requests or websockets.
	 * @typedef RPCImpl
	 * @type {function}
	 * @param {Method|rpc.ServiceMethod<Message<{}>,Message<{}>>} method Reflected or static method being called
	 * @param {Uint8Array} requestData Request data
	 * @param {RPCImplCallback} callback Callback function
	 * @returns {undefined}
	 * @example
	 * function rpcImpl(method, requestData, callback) {
	 *     if (protobuf.util.lcFirst(method.name) !== "myMethod") // compatible with static code
	 *         throw Error("no such method");
	 *     asynchronouslyObtainAResponse(requestData, function(err, responseData) {
	 *         callback(err, responseData);
	 *     });
	 * }
	 */

	/**
	 * Node-style callback as used by {@link RPCImpl}.
	 * @typedef RPCImplCallback
	 * @type {function}
	 * @param {Error|null} error Error, if any, otherwise `null`
	 * @param {Uint8Array|null} [response] Response data or `null` to signal end of stream, if there hasn't been an error
	 * @returns {undefined}
	 */

	rpc.Service = service; 
} (rpc));

var roots = {};

(function (exports) {
	var protobuf = exports;

	/**
	 * Build type, one of `"full"`, `"light"` or `"minimal"`.
	 * @name build
	 * @type {string}
	 * @const
	 */
	protobuf.build = "minimal";

	// Serialization
	protobuf.Writer       = writer;
	protobuf.BufferWriter = writer_buffer;
	protobuf.Reader       = reader;
	protobuf.BufferReader = reader_buffer;

	// Utility
	protobuf.util         = requireMinimal();
	protobuf.rpc          = rpc;
	protobuf.roots        = roots;
	protobuf.configure    = configure;

	/* istanbul ignore next */
	/**
	 * Reconfigures the library according to the environment.
	 * @returns {undefined}
	 */
	function configure() {
	    protobuf.util._configure();
	    protobuf.Writer._configure(protobuf.BufferWriter);
	    protobuf.Reader._configure(protobuf.BufferReader);
	}

	// Set up buffer utility according to the environment
	configure(); 
} (indexMinimal));

var minimal = indexMinimal;

/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/

var $protobuf = minimal;

// Common aliases
var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

$root.cls = (function() {

    /**
     * Namespace cls.
     * @exports cls
     * @namespace
     */
    var cls = {};

    cls.Log = (function() {

        /**
         * Properties of a Log.
         * @memberof cls
         * @interface ILog
         * @property {number|Long} time Log time
         * @property {Array.<cls.Log.IContent>|null} [contents] Log contents
         */

        /**
         * Constructs a new Log.
         * @memberof cls
         * @classdesc Represents a Log.
         * @implements ILog
         * @constructor
         * @param {cls.ILog=} [properties] Properties to set
         */
        function Log(properties) {
            this.contents = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Log time.
         * @member {number|Long} time
         * @memberof cls.Log
         * @instance
         */
        Log.prototype.time = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * Log contents.
         * @member {Array.<cls.Log.IContent>} contents
         * @memberof cls.Log
         * @instance
         */
        Log.prototype.contents = $util.emptyArray;

        /**
         * Creates a new Log instance using the specified properties.
         * @function create
         * @memberof cls.Log
         * @static
         * @param {cls.ILog=} [properties] Properties to set
         * @returns {cls.Log} Log instance
         */
        Log.create = function create(properties) {
            return new Log(properties);
        };

        /**
         * Encodes the specified Log message. Does not implicitly {@link cls.Log.verify|verify} messages.
         * @function encode
         * @memberof cls.Log
         * @static
         * @param {cls.ILog} message Log message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Log.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            writer.uint32(/* id 1, wireType 0 =*/8).int64(message.time);
            if (message.contents != null && message.contents.length)
                for (var i = 0; i < message.contents.length; ++i)
                    $root.cls.Log.Content.encode(message.contents[i], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified Log message, length delimited. Does not implicitly {@link cls.Log.verify|verify} messages.
         * @function encodeDelimited
         * @memberof cls.Log
         * @static
         * @param {cls.ILog} message Log message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Log.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Log message from the specified reader or buffer.
         * @function decode
         * @memberof cls.Log
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {cls.Log} Log
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Log.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.cls.Log();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.time = reader.int64();
                    break;
                case 2:
                    if (!(message.contents && message.contents.length))
                        message.contents = [];
                    message.contents.push($root.cls.Log.Content.decode(reader, reader.uint32()));
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("time"))
                throw $util.ProtocolError("missing required 'time'", { instance: message });
            return message;
        };

        /**
         * Decodes a Log message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof cls.Log
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {cls.Log} Log
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Log.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Log message.
         * @function verify
         * @memberof cls.Log
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Log.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (!$util.isInteger(message.time) && !(message.time && $util.isInteger(message.time.low) && $util.isInteger(message.time.high)))
                return "time: integer|Long expected";
            if (message.contents != null && message.hasOwnProperty("contents")) {
                if (!Array.isArray(message.contents))
                    return "contents: array expected";
                for (var i = 0; i < message.contents.length; ++i) {
                    var error = $root.cls.Log.Content.verify(message.contents[i]);
                    if (error)
                        return "contents." + error;
                }
            }
            return null;
        };

        /**
         * Creates a Log message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof cls.Log
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {cls.Log} Log
         */
        Log.fromObject = function fromObject(object) {
            if (object instanceof $root.cls.Log)
                return object;
            var message = new $root.cls.Log();
            if (object.time != null)
                if ($util.Long)
                    (message.time = $util.Long.fromValue(object.time)).unsigned = false;
                else if (typeof object.time === "string")
                    message.time = parseInt(object.time, 10);
                else if (typeof object.time === "number")
                    message.time = object.time;
                else if (typeof object.time === "object")
                    message.time = new $util.LongBits(object.time.low >>> 0, object.time.high >>> 0).toNumber();
            if (object.contents) {
                if (!Array.isArray(object.contents))
                    throw TypeError(".cls.Log.contents: array expected");
                message.contents = [];
                for (var i = 0; i < object.contents.length; ++i) {
                    if (typeof object.contents[i] !== "object")
                        throw TypeError(".cls.Log.contents: object expected");
                    message.contents[i] = $root.cls.Log.Content.fromObject(object.contents[i]);
                }
            }
            return message;
        };

        /**
         * Creates a plain object from a Log message. Also converts values to other types if specified.
         * @function toObject
         * @memberof cls.Log
         * @static
         * @param {cls.Log} message Log
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Log.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.contents = [];
            if (options.defaults)
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.time = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.time = options.longs === String ? "0" : 0;
            if (message.time != null && message.hasOwnProperty("time"))
                if (typeof message.time === "number")
                    object.time = options.longs === String ? String(message.time) : message.time;
                else
                    object.time = options.longs === String ? $util.Long.prototype.toString.call(message.time) : options.longs === Number ? new $util.LongBits(message.time.low >>> 0, message.time.high >>> 0).toNumber() : message.time;
            if (message.contents && message.contents.length) {
                object.contents = [];
                for (var j = 0; j < message.contents.length; ++j)
                    object.contents[j] = $root.cls.Log.Content.toObject(message.contents[j], options);
            }
            return object;
        };

        /**
         * Converts this Log to JSON.
         * @function toJSON
         * @memberof cls.Log
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Log.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Log
         * @function getTypeUrl
         * @memberof cls.Log
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Log.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/cls.Log";
        };

        Log.Content = (function() {

            /**
             * Properties of a Content.
             * @memberof cls.Log
             * @interface IContent
             * @property {string} key Content key
             * @property {string} value Content value
             */

            /**
             * Constructs a new Content.
             * @memberof cls.Log
             * @classdesc Represents a Content.
             * @implements IContent
             * @constructor
             * @param {cls.Log.IContent=} [properties] Properties to set
             */
            function Content(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Content key.
             * @member {string} key
             * @memberof cls.Log.Content
             * @instance
             */
            Content.prototype.key = "";

            /**
             * Content value.
             * @member {string} value
             * @memberof cls.Log.Content
             * @instance
             */
            Content.prototype.value = "";

            /**
             * Creates a new Content instance using the specified properties.
             * @function create
             * @memberof cls.Log.Content
             * @static
             * @param {cls.Log.IContent=} [properties] Properties to set
             * @returns {cls.Log.Content} Content instance
             */
            Content.create = function create(properties) {
                return new Content(properties);
            };

            /**
             * Encodes the specified Content message. Does not implicitly {@link cls.Log.Content.verify|verify} messages.
             * @function encode
             * @memberof cls.Log.Content
             * @static
             * @param {cls.Log.IContent} message Content message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Content.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.key);
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.value);
                return writer;
            };

            /**
             * Encodes the specified Content message, length delimited. Does not implicitly {@link cls.Log.Content.verify|verify} messages.
             * @function encodeDelimited
             * @memberof cls.Log.Content
             * @static
             * @param {cls.Log.IContent} message Content message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Content.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Content message from the specified reader or buffer.
             * @function decode
             * @memberof cls.Log.Content
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {cls.Log.Content} Content
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Content.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.cls.Log.Content();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.key = reader.string();
                        break;
                    case 2:
                        message.value = reader.string();
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                if (!message.hasOwnProperty("key"))
                    throw $util.ProtocolError("missing required 'key'", { instance: message });
                if (!message.hasOwnProperty("value"))
                    throw $util.ProtocolError("missing required 'value'", { instance: message });
                return message;
            };

            /**
             * Decodes a Content message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof cls.Log.Content
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {cls.Log.Content} Content
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Content.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Content message.
             * @function verify
             * @memberof cls.Log.Content
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Content.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (!$util.isString(message.key))
                    return "key: string expected";
                if (!$util.isString(message.value))
                    return "value: string expected";
                return null;
            };

            /**
             * Creates a Content message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof cls.Log.Content
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {cls.Log.Content} Content
             */
            Content.fromObject = function fromObject(object) {
                if (object instanceof $root.cls.Log.Content)
                    return object;
                var message = new $root.cls.Log.Content();
                if (object.key != null)
                    message.key = String(object.key);
                if (object.value != null)
                    message.value = String(object.value);
                return message;
            };

            /**
             * Creates a plain object from a Content message. Also converts values to other types if specified.
             * @function toObject
             * @memberof cls.Log.Content
             * @static
             * @param {cls.Log.Content} message Content
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Content.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.key = "";
                    object.value = "";
                }
                if (message.key != null && message.hasOwnProperty("key"))
                    object.key = message.key;
                if (message.value != null && message.hasOwnProperty("value"))
                    object.value = message.value;
                return object;
            };

            /**
             * Converts this Content to JSON.
             * @function toJSON
             * @memberof cls.Log.Content
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Content.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for Content
             * @function getTypeUrl
             * @memberof cls.Log.Content
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Content.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/cls.Log.Content";
            };

            return Content;
        })();

        return Log;
    })();

    cls.LogTag = (function() {

        /**
         * Properties of a LogTag.
         * @memberof cls
         * @interface ILogTag
         * @property {string} key LogTag key
         * @property {string} value LogTag value
         */

        /**
         * Constructs a new LogTag.
         * @memberof cls
         * @classdesc Represents a LogTag.
         * @implements ILogTag
         * @constructor
         * @param {cls.ILogTag=} [properties] Properties to set
         */
        function LogTag(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * LogTag key.
         * @member {string} key
         * @memberof cls.LogTag
         * @instance
         */
        LogTag.prototype.key = "";

        /**
         * LogTag value.
         * @member {string} value
         * @memberof cls.LogTag
         * @instance
         */
        LogTag.prototype.value = "";

        /**
         * Creates a new LogTag instance using the specified properties.
         * @function create
         * @memberof cls.LogTag
         * @static
         * @param {cls.ILogTag=} [properties] Properties to set
         * @returns {cls.LogTag} LogTag instance
         */
        LogTag.create = function create(properties) {
            return new LogTag(properties);
        };

        /**
         * Encodes the specified LogTag message. Does not implicitly {@link cls.LogTag.verify|verify} messages.
         * @function encode
         * @memberof cls.LogTag
         * @static
         * @param {cls.ILogTag} message LogTag message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        LogTag.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            writer.uint32(/* id 1, wireType 2 =*/10).string(message.key);
            writer.uint32(/* id 2, wireType 2 =*/18).string(message.value);
            return writer;
        };

        /**
         * Encodes the specified LogTag message, length delimited. Does not implicitly {@link cls.LogTag.verify|verify} messages.
         * @function encodeDelimited
         * @memberof cls.LogTag
         * @static
         * @param {cls.ILogTag} message LogTag message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        LogTag.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a LogTag message from the specified reader or buffer.
         * @function decode
         * @memberof cls.LogTag
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {cls.LogTag} LogTag
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        LogTag.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.cls.LogTag();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.key = reader.string();
                    break;
                case 2:
                    message.value = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("key"))
                throw $util.ProtocolError("missing required 'key'", { instance: message });
            if (!message.hasOwnProperty("value"))
                throw $util.ProtocolError("missing required 'value'", { instance: message });
            return message;
        };

        /**
         * Decodes a LogTag message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof cls.LogTag
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {cls.LogTag} LogTag
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        LogTag.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a LogTag message.
         * @function verify
         * @memberof cls.LogTag
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        LogTag.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (!$util.isString(message.key))
                return "key: string expected";
            if (!$util.isString(message.value))
                return "value: string expected";
            return null;
        };

        /**
         * Creates a LogTag message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof cls.LogTag
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {cls.LogTag} LogTag
         */
        LogTag.fromObject = function fromObject(object) {
            if (object instanceof $root.cls.LogTag)
                return object;
            var message = new $root.cls.LogTag();
            if (object.key != null)
                message.key = String(object.key);
            if (object.value != null)
                message.value = String(object.value);
            return message;
        };

        /**
         * Creates a plain object from a LogTag message. Also converts values to other types if specified.
         * @function toObject
         * @memberof cls.LogTag
         * @static
         * @param {cls.LogTag} message LogTag
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        LogTag.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.key = "";
                object.value = "";
            }
            if (message.key != null && message.hasOwnProperty("key"))
                object.key = message.key;
            if (message.value != null && message.hasOwnProperty("value"))
                object.value = message.value;
            return object;
        };

        /**
         * Converts this LogTag to JSON.
         * @function toJSON
         * @memberof cls.LogTag
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        LogTag.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for LogTag
         * @function getTypeUrl
         * @memberof cls.LogTag
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        LogTag.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/cls.LogTag";
        };

        return LogTag;
    })();

    cls.LogGroup = (function() {

        /**
         * Properties of a LogGroup.
         * @memberof cls
         * @interface ILogGroup
         * @property {Array.<cls.ILog>|null} [logs] LogGroup logs
         * @property {string|null} [contextFlow] LogGroup contextFlow
         * @property {string|null} [filename] LogGroup filename
         * @property {string|null} [source] LogGroup source
         * @property {Array.<cls.ILogTag>|null} [logTags] LogGroup logTags
         */

        /**
         * Constructs a new LogGroup.
         * @memberof cls
         * @classdesc Represents a LogGroup.
         * @implements ILogGroup
         * @constructor
         * @param {cls.ILogGroup=} [properties] Properties to set
         */
        function LogGroup(properties) {
            this.logs = [];
            this.logTags = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * LogGroup logs.
         * @member {Array.<cls.ILog>} logs
         * @memberof cls.LogGroup
         * @instance
         */
        LogGroup.prototype.logs = $util.emptyArray;

        /**
         * LogGroup contextFlow.
         * @member {string} contextFlow
         * @memberof cls.LogGroup
         * @instance
         */
        LogGroup.prototype.contextFlow = "";

        /**
         * LogGroup filename.
         * @member {string} filename
         * @memberof cls.LogGroup
         * @instance
         */
        LogGroup.prototype.filename = "";

        /**
         * LogGroup source.
         * @member {string} source
         * @memberof cls.LogGroup
         * @instance
         */
        LogGroup.prototype.source = "";

        /**
         * LogGroup logTags.
         * @member {Array.<cls.ILogTag>} logTags
         * @memberof cls.LogGroup
         * @instance
         */
        LogGroup.prototype.logTags = $util.emptyArray;

        /**
         * Creates a new LogGroup instance using the specified properties.
         * @function create
         * @memberof cls.LogGroup
         * @static
         * @param {cls.ILogGroup=} [properties] Properties to set
         * @returns {cls.LogGroup} LogGroup instance
         */
        LogGroup.create = function create(properties) {
            return new LogGroup(properties);
        };

        /**
         * Encodes the specified LogGroup message. Does not implicitly {@link cls.LogGroup.verify|verify} messages.
         * @function encode
         * @memberof cls.LogGroup
         * @static
         * @param {cls.ILogGroup} message LogGroup message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        LogGroup.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.logs != null && message.logs.length)
                for (var i = 0; i < message.logs.length; ++i)
                    $root.cls.Log.encode(message.logs[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.contextFlow != null && Object.hasOwnProperty.call(message, "contextFlow"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.contextFlow);
            if (message.filename != null && Object.hasOwnProperty.call(message, "filename"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.filename);
            if (message.source != null && Object.hasOwnProperty.call(message, "source"))
                writer.uint32(/* id 4, wireType 2 =*/34).string(message.source);
            if (message.logTags != null && message.logTags.length)
                for (var i = 0; i < message.logTags.length; ++i)
                    $root.cls.LogTag.encode(message.logTags[i], writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified LogGroup message, length delimited. Does not implicitly {@link cls.LogGroup.verify|verify} messages.
         * @function encodeDelimited
         * @memberof cls.LogGroup
         * @static
         * @param {cls.ILogGroup} message LogGroup message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        LogGroup.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a LogGroup message from the specified reader or buffer.
         * @function decode
         * @memberof cls.LogGroup
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {cls.LogGroup} LogGroup
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        LogGroup.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.cls.LogGroup();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    if (!(message.logs && message.logs.length))
                        message.logs = [];
                    message.logs.push($root.cls.Log.decode(reader, reader.uint32()));
                    break;
                case 2:
                    message.contextFlow = reader.string();
                    break;
                case 3:
                    message.filename = reader.string();
                    break;
                case 4:
                    message.source = reader.string();
                    break;
                case 5:
                    if (!(message.logTags && message.logTags.length))
                        message.logTags = [];
                    message.logTags.push($root.cls.LogTag.decode(reader, reader.uint32()));
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a LogGroup message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof cls.LogGroup
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {cls.LogGroup} LogGroup
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        LogGroup.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a LogGroup message.
         * @function verify
         * @memberof cls.LogGroup
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        LogGroup.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.logs != null && message.hasOwnProperty("logs")) {
                if (!Array.isArray(message.logs))
                    return "logs: array expected";
                for (var i = 0; i < message.logs.length; ++i) {
                    var error = $root.cls.Log.verify(message.logs[i]);
                    if (error)
                        return "logs." + error;
                }
            }
            if (message.contextFlow != null && message.hasOwnProperty("contextFlow"))
                if (!$util.isString(message.contextFlow))
                    return "contextFlow: string expected";
            if (message.filename != null && message.hasOwnProperty("filename"))
                if (!$util.isString(message.filename))
                    return "filename: string expected";
            if (message.source != null && message.hasOwnProperty("source"))
                if (!$util.isString(message.source))
                    return "source: string expected";
            if (message.logTags != null && message.hasOwnProperty("logTags")) {
                if (!Array.isArray(message.logTags))
                    return "logTags: array expected";
                for (var i = 0; i < message.logTags.length; ++i) {
                    var error = $root.cls.LogTag.verify(message.logTags[i]);
                    if (error)
                        return "logTags." + error;
                }
            }
            return null;
        };

        /**
         * Creates a LogGroup message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof cls.LogGroup
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {cls.LogGroup} LogGroup
         */
        LogGroup.fromObject = function fromObject(object) {
            if (object instanceof $root.cls.LogGroup)
                return object;
            var message = new $root.cls.LogGroup();
            if (object.logs) {
                if (!Array.isArray(object.logs))
                    throw TypeError(".cls.LogGroup.logs: array expected");
                message.logs = [];
                for (var i = 0; i < object.logs.length; ++i) {
                    if (typeof object.logs[i] !== "object")
                        throw TypeError(".cls.LogGroup.logs: object expected");
                    message.logs[i] = $root.cls.Log.fromObject(object.logs[i]);
                }
            }
            if (object.contextFlow != null)
                message.contextFlow = String(object.contextFlow);
            if (object.filename != null)
                message.filename = String(object.filename);
            if (object.source != null)
                message.source = String(object.source);
            if (object.logTags) {
                if (!Array.isArray(object.logTags))
                    throw TypeError(".cls.LogGroup.logTags: array expected");
                message.logTags = [];
                for (var i = 0; i < object.logTags.length; ++i) {
                    if (typeof object.logTags[i] !== "object")
                        throw TypeError(".cls.LogGroup.logTags: object expected");
                    message.logTags[i] = $root.cls.LogTag.fromObject(object.logTags[i]);
                }
            }
            return message;
        };

        /**
         * Creates a plain object from a LogGroup message. Also converts values to other types if specified.
         * @function toObject
         * @memberof cls.LogGroup
         * @static
         * @param {cls.LogGroup} message LogGroup
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        LogGroup.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults) {
                object.logs = [];
                object.logTags = [];
            }
            if (options.defaults) {
                object.contextFlow = "";
                object.filename = "";
                object.source = "";
            }
            if (message.logs && message.logs.length) {
                object.logs = [];
                for (var j = 0; j < message.logs.length; ++j)
                    object.logs[j] = $root.cls.Log.toObject(message.logs[j], options);
            }
            if (message.contextFlow != null && message.hasOwnProperty("contextFlow"))
                object.contextFlow = message.contextFlow;
            if (message.filename != null && message.hasOwnProperty("filename"))
                object.filename = message.filename;
            if (message.source != null && message.hasOwnProperty("source"))
                object.source = message.source;
            if (message.logTags && message.logTags.length) {
                object.logTags = [];
                for (var j = 0; j < message.logTags.length; ++j)
                    object.logTags[j] = $root.cls.LogTag.toObject(message.logTags[j], options);
            }
            return object;
        };

        /**
         * Converts this LogGroup to JSON.
         * @function toJSON
         * @memberof cls.LogGroup
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        LogGroup.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for LogGroup
         * @function getTypeUrl
         * @memberof cls.LogGroup
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        LogGroup.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/cls.LogGroup";
        };

        return LogGroup;
    })();

    cls.LogGroupList = (function() {

        /**
         * Properties of a LogGroupList.
         * @memberof cls
         * @interface ILogGroupList
         * @property {Array.<cls.ILogGroup>|null} [logGroupList] LogGroupList logGroupList
         */

        /**
         * Constructs a new LogGroupList.
         * @memberof cls
         * @classdesc Represents a LogGroupList.
         * @implements ILogGroupList
         * @constructor
         * @param {cls.ILogGroupList=} [properties] Properties to set
         */
        function LogGroupList(properties) {
            this.logGroupList = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * LogGroupList logGroupList.
         * @member {Array.<cls.ILogGroup>} logGroupList
         * @memberof cls.LogGroupList
         * @instance
         */
        LogGroupList.prototype.logGroupList = $util.emptyArray;

        /**
         * Creates a new LogGroupList instance using the specified properties.
         * @function create
         * @memberof cls.LogGroupList
         * @static
         * @param {cls.ILogGroupList=} [properties] Properties to set
         * @returns {cls.LogGroupList} LogGroupList instance
         */
        LogGroupList.create = function create(properties) {
            return new LogGroupList(properties);
        };

        /**
         * Encodes the specified LogGroupList message. Does not implicitly {@link cls.LogGroupList.verify|verify} messages.
         * @function encode
         * @memberof cls.LogGroupList
         * @static
         * @param {cls.ILogGroupList} message LogGroupList message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        LogGroupList.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.logGroupList != null && message.logGroupList.length)
                for (var i = 0; i < message.logGroupList.length; ++i)
                    $root.cls.LogGroup.encode(message.logGroupList[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified LogGroupList message, length delimited. Does not implicitly {@link cls.LogGroupList.verify|verify} messages.
         * @function encodeDelimited
         * @memberof cls.LogGroupList
         * @static
         * @param {cls.ILogGroupList} message LogGroupList message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        LogGroupList.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a LogGroupList message from the specified reader or buffer.
         * @function decode
         * @memberof cls.LogGroupList
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {cls.LogGroupList} LogGroupList
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        LogGroupList.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.cls.LogGroupList();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    if (!(message.logGroupList && message.logGroupList.length))
                        message.logGroupList = [];
                    message.logGroupList.push($root.cls.LogGroup.decode(reader, reader.uint32()));
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a LogGroupList message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof cls.LogGroupList
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {cls.LogGroupList} LogGroupList
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        LogGroupList.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a LogGroupList message.
         * @function verify
         * @memberof cls.LogGroupList
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        LogGroupList.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.logGroupList != null && message.hasOwnProperty("logGroupList")) {
                if (!Array.isArray(message.logGroupList))
                    return "logGroupList: array expected";
                for (var i = 0; i < message.logGroupList.length; ++i) {
                    var error = $root.cls.LogGroup.verify(message.logGroupList[i]);
                    if (error)
                        return "logGroupList." + error;
                }
            }
            return null;
        };

        /**
         * Creates a LogGroupList message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof cls.LogGroupList
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {cls.LogGroupList} LogGroupList
         */
        LogGroupList.fromObject = function fromObject(object) {
            if (object instanceof $root.cls.LogGroupList)
                return object;
            var message = new $root.cls.LogGroupList();
            if (object.logGroupList) {
                if (!Array.isArray(object.logGroupList))
                    throw TypeError(".cls.LogGroupList.logGroupList: array expected");
                message.logGroupList = [];
                for (var i = 0; i < object.logGroupList.length; ++i) {
                    if (typeof object.logGroupList[i] !== "object")
                        throw TypeError(".cls.LogGroupList.logGroupList: object expected");
                    message.logGroupList[i] = $root.cls.LogGroup.fromObject(object.logGroupList[i]);
                }
            }
            return message;
        };

        /**
         * Creates a plain object from a LogGroupList message. Also converts values to other types if specified.
         * @function toObject
         * @memberof cls.LogGroupList
         * @static
         * @param {cls.LogGroupList} message LogGroupList
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        LogGroupList.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.logGroupList = [];
            if (message.logGroupList && message.logGroupList.length) {
                object.logGroupList = [];
                for (var j = 0; j < message.logGroupList.length; ++j)
                    object.logGroupList[j] = $root.cls.LogGroup.toObject(message.logGroupList[j], options);
            }
            return object;
        };

        /**
         * Converts this LogGroupList to JSON.
         * @function toJSON
         * @memberof cls.LogGroupList
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        LogGroupList.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for LogGroupList
         * @function getTypeUrl
         * @memberof cls.LogGroupList
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        LogGroupList.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/cls.LogGroupList";
        };

        return LogGroupList;
    })();

    return cls;
})();

var cls = $root;

// const lz4 = require('lz4');
// const { lz4, CBuffer } = require('../../lib/lz4');
// const lz4 = require('lz4js');
const handleLogs = {
    formatLogGroup(logs, options = {}) {
        const logGroup = new cls.cls.LogGroup();
        if (options.filename) {
            logGroup.filename = options.filename;
        }
        if (options.source) {
            logGroup.source = options.source;
        }
        logs.forEach(log => {
            const logItem = new cls.cls.Log();
            logItem.time = log.time;
            Object.keys(log.contents).forEach(key => {
                const o = log.contents[key];
                const value = isString(o) ? o : JSON.stringify(o);
                logItem.contents.push(new cls.cls.Log.Content({ key, value }));
            });
            logGroup.logs.push(logItem);
        });
        // 校验日志格式是否正确
        const errMsg = cls.cls.LogGroup.verify(logGroup);
        if (errMsg) {
            throw new ClsSDKError(`log format is incorrect: ${errMsg}`);
        }
        return logGroup;
    },
    log2Buffer(logs, options = {}) {
        const clsList = new cls.cls.LogGroupList();
        const logGroup = handleLogs.formatLogGroup(logs, options);
        clsList.logGroupList.push(logGroup);
        // 将本地日志转换为 pb 格式
        const buffer = cls.cls.LogGroupList.encode(clsList).finish();
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
    log2JSON(logs, options = {}) {
        const { source, filename } = options;
        const logGroup = {
            ...(filename && { filename }),
            ...(source && { source }),
            logs: logs.map(log => {
                const formatContents = log.contents;
                Object.keys(log.contents).forEach(key => {
                    try {
                        if (typeof formatContents[key] !== 'undefined') {
                            formatContents[key] = formatContents[key].toString();
                        }
                        else {
                            formatContents[key] = '';
                        }
                    }
                    catch (error) {
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

/**
 * @class HttpConnection
 * @internal
 */
class HttpConnection {
    /**
     * 临时签名缓存
     */
    stsCache = [];
    CLS_HOST = 'cls.tencentcs.com';
    cancelRequestSource = axios.CancelToken.source();
    retryTimes = 3; // 默认重试次数
    topicId = '';
    autoFillSourceIp = true;
    /**
     * 永久密钥 SecretId、SecretKey
     */
    credential = undefined;
    /**
     * 获取签名的回调方法
     */
    getAuthorization = undefined;
    /**
     * 需要鉴权
     */
    get needAuth() {
        return isNotEmpty(this.credential) || isNotEmpty(this.getAuthorization);
    }
    ins = undefined;
    constructor(options) {
        this.topicId = options.topicId;
        this.credential = options.credential;
        this.getAuthorization = options.getAuthorization;
        this.autoFillSourceIp = options.autoFillSourceIp ?? true;
        this.ins = this.getIns(options);
    }
    getIns(options) {
        this.retryTimes = options.retry ?? 3;
        let protocol = options.protocol ?? 'http';
        const host = `${options.region}.${this.CLS_HOST}`;
        const headers = this.getCommonHeaders(host);
        const axiosConfig = {
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
        return axiosIns;
    }
    getCommonHeaders(host) {
        const headers = {
            ...(this.autoFillSourceIp && { 'x-cls-add-source': '1' }),
        };
        if (this.needAuth) {
            headers['Content-Type'] = 'application/x-protobuf';
            headers['Host'] = host;
        }
        else {
            headers['Content-Type'] = 'application/json';
        }
        return headers;
    }
    put;
    post;
    get;
    delete;
    head;
    initMethods(httpIns) {
        ['PUT', 'POST', 'GET', 'DELETE', 'HEAD'].forEach(method => {
            this[method.toLowerCase()] = (config) => {
                const { url } = config;
                if (!url)
                    throw new Error('url 不能为空');
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
    changeAdapter(adapter) {
        if (!this.ins) {
            throw new ClsSDKError('HttpConnection is not initialized');
        }
        this.ins.defaults.adapter = adapter;
    }
    /**
     * 取消当前所有请求
     */
    cancelRequest() {
        if (!this.ins) {
            throw new ClsSDKError('HttpConnection is not initialized');
        }
        this.cancelRequestSource.cancel('cancel');
        this.generateCancelToken(this.ins);
    }
    /**
     * 通用请求拦截器
     */
    setReqInterceptors(httpIns) {
        httpIns.interceptors.request.use(async (config) => {
            const { headers, params, url, method } = config;
            const authData = await this._getAuthorization({
                method: method,
                headers,
                query: params,
                api: url?.replace(/^\//g, '') || '',
            });
            if (authData) {
                config.headers.Authorization = authData.Authorization;
                authData.SecurityToken && (config.headers['x-cls-token'] = authData.SecurityToken);
            }
            return config;
        }, error => Promise.resolve(error));
    }
    /**
     * 通用响应拦截器
     */
    setResInterceptors(httpIns) {
        httpIns.interceptors.response.use((response) => {
            systemClock.handleOffset(response.headers.date);
            return response;
        }, async (error) => {
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
                }
                else {
                    throw new ClsSDKError({ status, headers, code: data.errorcode, message: data.errormessage });
                }
            }
            throw new ClsSDKError({ code: error.code || error.message, message: error.message });
        });
    }
    /**
     * 上传日志
     * @param logs
     * @returns  AxiosPromise
     */
    putLogs(logs) {
        if (!this.ins) {
            throw new ClsSDKError('HttpConnection is not initialized');
        }
        if (this.needAuth) {
            const data = handleLogs.log2Buffer(logs);
            return this.post({
                url: `/structuredlog`,
                data,
            });
        }
        else {
            const data = handleLogs.log2JSON(logs);
            return this.post({
                url: `/tracklog`,
                data,
            });
        }
    }
    /**
     * 生成取消请求的token种子
     * @param ins
     */
    generateCancelToken(ins) {
        this.cancelRequestSource = axios.CancelToken.source();
        ins.defaults.cancelToken = this.cancelRequestSource.token;
    }
    async _getAuthorization(params) {
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
        let stsData = undefined;
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
        }
        else if (this.getAuthorization) {
            // 外部计算签名或获取临时密钥
            const authData = await this.getAuthorization({
                method: params.method,
                query: params.query,
                headers: headers,
            });
            if (typeof authData === 'string') {
                return { Authorization: authData };
            }
            else if (authData.StartTime &&
                authData.TmpSecretId &&
                authData.TmpSecretKey &&
                authData.Token &&
                authData.ExpiredTime) {
                stsData = authData;
                this.stsCache.push(stsData);
                return HttpConnection.calcAuth({
                    ...params,
                    headers,
                    ...stsData,
                    SecretId: stsData.TmpSecretId,
                    SecretKey: stsData.TmpSecretKey,
                });
            }
            else {
                throw new ClsSDKError('getAuthorization return value is not standardized.');
            }
        }
    }
    static formatHeader(headers) {
        const commonHeaders = {};
        const CommonHeaderSet = new Set(['Content-Type', 'Host', 'Content-Length']);
        Object.keys(headers).forEach(key => {
            if (CommonHeaderSet.has(key)) {
                commonHeaders[key] = headers[key];
            }
        });
        return commonHeaders;
    }
    static calcAuth(options) {
        const Authorization = sign(options);
        const authData = {
            Authorization,
            SecurityToken: options.SecurityToken || '',
        };
        return authData;
    }
}

var UploadState;
(function (UploadState) {
    UploadState[UploadState["start"] = 0] = "start";
    UploadState[UploadState["waiting"] = 1] = "waiting";
    UploadState[UploadState["running"] = 2] = "running";
    UploadState[UploadState["stop"] = 3] = "stop";
})(UploadState || (UploadState = {}));
class Uploader {
    queue = [];
    config;
    http;
    state = UploadState.stop;
    constructor({ config }) {
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
    start() {
        this.state = UploadState.start;
        this.startNextBatch();
    }
    /**
     * 将要上传的日志添加至队列
     * @param logs
     */
    add(logs) {
        const item = {
            index: this.queue.length,
            logs,
        };
        this.queue.push(item);
        this.startNextBatch();
    }
    async startNextBatch() {
        if (this.state === UploadState.running)
            return;
        this.state = UploadState.running;
        while (this.queue.length > 0 && this.isStart()) {
            const uploadItem = this.queue.shift();
            if (uploadItem) {
                try {
                    await this.http.putLogs(uploadItem.logs);
                }
                catch (err) {
                    this.config.onError(err);
                }
            }
        }
        this.state = UploadState.waiting;
    }
    isStart() {
        return this.state !== UploadState.stop;
    }
    stop() {
        this.http.cancelRequest();
        this.state = UploadState.stop;
    }
}

/**
 * CLS上传客户端
 * @public
 */
class ClsClient {
    /**
     * 内部检查缓存日志定时器
     */
    logTimer = undefined;
    checkCacheLocked = false;
    /**
     * 日志缓存队列(缓存写入时间按从小到大的顺序)
     */
    logList = [];
    /**
     * 标志cls上传器是否初始化
     */
    initTag = false;
    config;
    uploader;
    /**
     * Creates an instance of clsclient.
     * @param options - 可选参数，不传则必须调用 init 函数进行初始化
     */
    constructor(options) {
        if (options) {
            this.init(options);
        }
    }
    /**
     * clsclient 初始化函数
     * @param options - 参数配置
     */
    init(options) {
        this.config = new ClientConfig(options);
        this.uploader = new Uploader({
            config: this.config,
        });
        this.initTag = true;
    }
    /**
     * 检查当前日志缓存，满足上传条件则加入队列
     */
    async checkLogCaches() {
        if (this.checkCacheLocked) {
            return;
        }
        const currCacheSize = this.logList.length;
        if (currCacheSize === 0)
            return;
        // 清理掉之前正在执行的定时器
        clearTimeout(this.logTimer);
        this.checkCacheLocked = true;
        const immediate = this.logList.some(log => log.immediate);
        if (!immediate && currCacheSize < this.config.maxRetainSize) {
            // 判断日志缓存里最早的一条日志的时间间隔是否已达到最大缓存间隔
            const firstLog = this.logList[0];
            const { time: latestLogTime } = firstLog;
            const now = systemClock.now();
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
    log(log, _immediate) {
        if (!this.initTag) {
            // 未调用初始化方法禁止日志上传
            throw new ClsSDKError('ClsClient initialization method not called!');
        }
        const immediate = _immediate ?? false;
        // TODO: 此处的时间使用本地时间可能会不正确，需要校准
        const clsLog = { contents: log, time: Date.now(), immediate };
        this.logList.push(clsLog);
        this.checkLogCaches();
    }
    /**
     * Destorys clsclient
     */
    destory() {
        clearTimeout(this.logTimer);
        this.uploader.stop();
        this.initTag = false;
    }
}

export { ClsClient as default };
