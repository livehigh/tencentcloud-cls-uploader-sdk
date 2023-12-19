(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.ClsClient = factory());
})(this, (function () { 'use strict';

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

    function bind(fn, thisArg) {
      return function wrap() {
        return fn.apply(thisArg, arguments);
      };
    }

    // utils is a library of generic helper functions non-specific to axios

    const {toString} = Object.prototype;
    const {getPrototypeOf} = Object;

    const kindOf = (cache => thing => {
        const str = toString.call(thing);
        return cache[str] || (cache[str] = str.slice(8, -1).toLowerCase());
    })(Object.create(null));

    const kindOfTest = (type) => {
      type = type.toLowerCase();
      return (thing) => kindOf(thing) === type
    };

    const typeOfTest = type => thing => typeof thing === type;

    /**
     * Determine if a value is an Array
     *
     * @param {Object} val The value to test
     *
     * @returns {boolean} True if value is an Array, otherwise false
     */
    const {isArray} = Array;

    /**
     * Determine if a value is undefined
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if the value is undefined, otherwise false
     */
    const isUndefined = typeOfTest('undefined');

    /**
     * Determine if a value is a Buffer
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if value is a Buffer, otherwise false
     */
    function isBuffer(val) {
      return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
        && isFunction(val.constructor.isBuffer) && val.constructor.isBuffer(val);
    }

    /**
     * Determine if a value is an ArrayBuffer
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if value is an ArrayBuffer, otherwise false
     */
    const isArrayBuffer = kindOfTest('ArrayBuffer');


    /**
     * Determine if a value is a view on an ArrayBuffer
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
     */
    function isArrayBufferView(val) {
      let result;
      if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
        result = ArrayBuffer.isView(val);
      } else {
        result = (val) && (val.buffer) && (isArrayBuffer(val.buffer));
      }
      return result;
    }

    /**
     * Determine if a value is a String
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if value is a String, otherwise false
     */
    const isString$1 = typeOfTest('string');

    /**
     * Determine if a value is a Function
     *
     * @param {*} val The value to test
     * @returns {boolean} True if value is a Function, otherwise false
     */
    const isFunction = typeOfTest('function');

    /**
     * Determine if a value is a Number
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if value is a Number, otherwise false
     */
    const isNumber = typeOfTest('number');

    /**
     * Determine if a value is an Object
     *
     * @param {*} thing The value to test
     *
     * @returns {boolean} True if value is an Object, otherwise false
     */
    const isObject = (thing) => thing !== null && typeof thing === 'object';

    /**
     * Determine if a value is a Boolean
     *
     * @param {*} thing The value to test
     * @returns {boolean} True if value is a Boolean, otherwise false
     */
    const isBoolean = thing => thing === true || thing === false;

    /**
     * Determine if a value is a plain Object
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if value is a plain Object, otherwise false
     */
    const isPlainObject = (val) => {
      if (kindOf(val) !== 'object') {
        return false;
      }

      const prototype = getPrototypeOf(val);
      return (prototype === null || prototype === Object.prototype || Object.getPrototypeOf(prototype) === null) && !(Symbol.toStringTag in val) && !(Symbol.iterator in val);
    };

    /**
     * Determine if a value is a Date
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if value is a Date, otherwise false
     */
    const isDate = kindOfTest('Date');

    /**
     * Determine if a value is a File
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if value is a File, otherwise false
     */
    const isFile = kindOfTest('File');

    /**
     * Determine if a value is a Blob
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if value is a Blob, otherwise false
     */
    const isBlob = kindOfTest('Blob');

    /**
     * Determine if a value is a FileList
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if value is a File, otherwise false
     */
    const isFileList = kindOfTest('FileList');

    /**
     * Determine if a value is a Stream
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if value is a Stream, otherwise false
     */
    const isStream = (val) => isObject(val) && isFunction(val.pipe);

    /**
     * Determine if a value is a FormData
     *
     * @param {*} thing The value to test
     *
     * @returns {boolean} True if value is an FormData, otherwise false
     */
    const isFormData = (thing) => {
      let kind;
      return thing && (
        (typeof FormData === 'function' && thing instanceof FormData) || (
          isFunction(thing.append) && (
            (kind = kindOf(thing)) === 'formdata' ||
            // detect form-data instance
            (kind === 'object' && isFunction(thing.toString) && thing.toString() === '[object FormData]')
          )
        )
      )
    };

    /**
     * Determine if a value is a URLSearchParams object
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if value is a URLSearchParams object, otherwise false
     */
    const isURLSearchParams = kindOfTest('URLSearchParams');

    /**
     * Trim excess whitespace off the beginning and end of a string
     *
     * @param {String} str The String to trim
     *
     * @returns {String} The String freed of excess whitespace
     */
    const trim = (str) => str.trim ?
      str.trim() : str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');

    /**
     * Iterate over an Array or an Object invoking a function for each item.
     *
     * If `obj` is an Array callback will be called passing
     * the value, index, and complete array for each item.
     *
     * If 'obj' is an Object callback will be called passing
     * the value, key, and complete object for each property.
     *
     * @param {Object|Array} obj The object to iterate
     * @param {Function} fn The callback to invoke for each item
     *
     * @param {Boolean} [allOwnKeys = false]
     * @returns {any}
     */
    function forEach(obj, fn, {allOwnKeys = false} = {}) {
      // Don't bother if no value provided
      if (obj === null || typeof obj === 'undefined') {
        return;
      }

      let i;
      let l;

      // Force an array if not already something iterable
      if (typeof obj !== 'object') {
        /*eslint no-param-reassign:0*/
        obj = [obj];
      }

      if (isArray(obj)) {
        // Iterate over array values
        for (i = 0, l = obj.length; i < l; i++) {
          fn.call(null, obj[i], i, obj);
        }
      } else {
        // Iterate over object keys
        const keys = allOwnKeys ? Object.getOwnPropertyNames(obj) : Object.keys(obj);
        const len = keys.length;
        let key;

        for (i = 0; i < len; i++) {
          key = keys[i];
          fn.call(null, obj[key], key, obj);
        }
      }
    }

    function findKey(obj, key) {
      key = key.toLowerCase();
      const keys = Object.keys(obj);
      let i = keys.length;
      let _key;
      while (i-- > 0) {
        _key = keys[i];
        if (key === _key.toLowerCase()) {
          return _key;
        }
      }
      return null;
    }

    const _global = (() => {
      /*eslint no-undef:0*/
      if (typeof globalThis !== "undefined") return globalThis;
      return typeof self !== "undefined" ? self : (typeof window !== 'undefined' ? window : global)
    })();

    const isContextDefined = (context) => !isUndefined(context) && context !== _global;

    /**
     * Accepts varargs expecting each argument to be an object, then
     * immutably merges the properties of each object and returns result.
     *
     * When multiple objects contain the same key the later object in
     * the arguments list will take precedence.
     *
     * Example:
     *
     * ```js
     * var result = merge({foo: 123}, {foo: 456});
     * console.log(result.foo); // outputs 456
     * ```
     *
     * @param {Object} obj1 Object to merge
     *
     * @returns {Object} Result of all merge properties
     */
    function merge(/* obj1, obj2, obj3, ... */) {
      const {caseless} = isContextDefined(this) && this || {};
      const result = {};
      const assignValue = (val, key) => {
        const targetKey = caseless && findKey(result, key) || key;
        if (isPlainObject(result[targetKey]) && isPlainObject(val)) {
          result[targetKey] = merge(result[targetKey], val);
        } else if (isPlainObject(val)) {
          result[targetKey] = merge({}, val);
        } else if (isArray(val)) {
          result[targetKey] = val.slice();
        } else {
          result[targetKey] = val;
        }
      };

      for (let i = 0, l = arguments.length; i < l; i++) {
        arguments[i] && forEach(arguments[i], assignValue);
      }
      return result;
    }

    /**
     * Extends object a by mutably adding to it the properties of object b.
     *
     * @param {Object} a The object to be extended
     * @param {Object} b The object to copy properties from
     * @param {Object} thisArg The object to bind function to
     *
     * @param {Boolean} [allOwnKeys]
     * @returns {Object} The resulting value of object a
     */
    const extend = (a, b, thisArg, {allOwnKeys}= {}) => {
      forEach(b, (val, key) => {
        if (thisArg && isFunction(val)) {
          a[key] = bind(val, thisArg);
        } else {
          a[key] = val;
        }
      }, {allOwnKeys});
      return a;
    };

    /**
     * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
     *
     * @param {string} content with BOM
     *
     * @returns {string} content value without BOM
     */
    const stripBOM = (content) => {
      if (content.charCodeAt(0) === 0xFEFF) {
        content = content.slice(1);
      }
      return content;
    };

    /**
     * Inherit the prototype methods from one constructor into another
     * @param {function} constructor
     * @param {function} superConstructor
     * @param {object} [props]
     * @param {object} [descriptors]
     *
     * @returns {void}
     */
    const inherits = (constructor, superConstructor, props, descriptors) => {
      constructor.prototype = Object.create(superConstructor.prototype, descriptors);
      constructor.prototype.constructor = constructor;
      Object.defineProperty(constructor, 'super', {
        value: superConstructor.prototype
      });
      props && Object.assign(constructor.prototype, props);
    };

    /**
     * Resolve object with deep prototype chain to a flat object
     * @param {Object} sourceObj source object
     * @param {Object} [destObj]
     * @param {Function|Boolean} [filter]
     * @param {Function} [propFilter]
     *
     * @returns {Object}
     */
    const toFlatObject = (sourceObj, destObj, filter, propFilter) => {
      let props;
      let i;
      let prop;
      const merged = {};

      destObj = destObj || {};
      // eslint-disable-next-line no-eq-null,eqeqeq
      if (sourceObj == null) return destObj;

      do {
        props = Object.getOwnPropertyNames(sourceObj);
        i = props.length;
        while (i-- > 0) {
          prop = props[i];
          if ((!propFilter || propFilter(prop, sourceObj, destObj)) && !merged[prop]) {
            destObj[prop] = sourceObj[prop];
            merged[prop] = true;
          }
        }
        sourceObj = filter !== false && getPrototypeOf(sourceObj);
      } while (sourceObj && (!filter || filter(sourceObj, destObj)) && sourceObj !== Object.prototype);

      return destObj;
    };

    /**
     * Determines whether a string ends with the characters of a specified string
     *
     * @param {String} str
     * @param {String} searchString
     * @param {Number} [position= 0]
     *
     * @returns {boolean}
     */
    const endsWith = (str, searchString, position) => {
      str = String(str);
      if (position === undefined || position > str.length) {
        position = str.length;
      }
      position -= searchString.length;
      const lastIndex = str.indexOf(searchString, position);
      return lastIndex !== -1 && lastIndex === position;
    };


    /**
     * Returns new array from array like object or null if failed
     *
     * @param {*} [thing]
     *
     * @returns {?Array}
     */
    const toArray = (thing) => {
      if (!thing) return null;
      if (isArray(thing)) return thing;
      let i = thing.length;
      if (!isNumber(i)) return null;
      const arr = new Array(i);
      while (i-- > 0) {
        arr[i] = thing[i];
      }
      return arr;
    };

    /**
     * Checking if the Uint8Array exists and if it does, it returns a function that checks if the
     * thing passed in is an instance of Uint8Array
     *
     * @param {TypedArray}
     *
     * @returns {Array}
     */
    // eslint-disable-next-line func-names
    const isTypedArray = (TypedArray => {
      // eslint-disable-next-line func-names
      return thing => {
        return TypedArray && thing instanceof TypedArray;
      };
    })(typeof Uint8Array !== 'undefined' && getPrototypeOf(Uint8Array));

    /**
     * For each entry in the object, call the function with the key and value.
     *
     * @param {Object<any, any>} obj - The object to iterate over.
     * @param {Function} fn - The function to call for each entry.
     *
     * @returns {void}
     */
    const forEachEntry = (obj, fn) => {
      const generator = obj && obj[Symbol.iterator];

      const iterator = generator.call(obj);

      let result;

      while ((result = iterator.next()) && !result.done) {
        const pair = result.value;
        fn.call(obj, pair[0], pair[1]);
      }
    };

    /**
     * It takes a regular expression and a string, and returns an array of all the matches
     *
     * @param {string} regExp - The regular expression to match against.
     * @param {string} str - The string to search.
     *
     * @returns {Array<boolean>}
     */
    const matchAll = (regExp, str) => {
      let matches;
      const arr = [];

      while ((matches = regExp.exec(str)) !== null) {
        arr.push(matches);
      }

      return arr;
    };

    /* Checking if the kindOfTest function returns true when passed an HTMLFormElement. */
    const isHTMLForm = kindOfTest('HTMLFormElement');

    const toCamelCase = str => {
      return str.toLowerCase().replace(/[-_\s]([a-z\d])(\w*)/g,
        function replacer(m, p1, p2) {
          return p1.toUpperCase() + p2;
        }
      );
    };

    /* Creating a function that will check if an object has a property. */
    const hasOwnProperty = (({hasOwnProperty}) => (obj, prop) => hasOwnProperty.call(obj, prop))(Object.prototype);

    /**
     * Determine if a value is a RegExp object
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if value is a RegExp object, otherwise false
     */
    const isRegExp = kindOfTest('RegExp');

    const reduceDescriptors = (obj, reducer) => {
      const descriptors = Object.getOwnPropertyDescriptors(obj);
      const reducedDescriptors = {};

      forEach(descriptors, (descriptor, name) => {
        let ret;
        if ((ret = reducer(descriptor, name, obj)) !== false) {
          reducedDescriptors[name] = ret || descriptor;
        }
      });

      Object.defineProperties(obj, reducedDescriptors);
    };

    /**
     * Makes all methods read-only
     * @param {Object} obj
     */

    const freezeMethods = (obj) => {
      reduceDescriptors(obj, (descriptor, name) => {
        // skip restricted props in strict mode
        if (isFunction(obj) && ['arguments', 'caller', 'callee'].indexOf(name) !== -1) {
          return false;
        }

        const value = obj[name];

        if (!isFunction(value)) return;

        descriptor.enumerable = false;

        if ('writable' in descriptor) {
          descriptor.writable = false;
          return;
        }

        if (!descriptor.set) {
          descriptor.set = () => {
            throw Error('Can not rewrite read-only method \'' + name + '\'');
          };
        }
      });
    };

    const toObjectSet = (arrayOrString, delimiter) => {
      const obj = {};

      const define = (arr) => {
        arr.forEach(value => {
          obj[value] = true;
        });
      };

      isArray(arrayOrString) ? define(arrayOrString) : define(String(arrayOrString).split(delimiter));

      return obj;
    };

    const noop$1 = () => {};

    const toFiniteNumber = (value, defaultValue) => {
      value = +value;
      return Number.isFinite(value) ? value : defaultValue;
    };

    const ALPHA = 'abcdefghijklmnopqrstuvwxyz';

    const DIGIT = '0123456789';

    const ALPHABET = {
      DIGIT,
      ALPHA,
      ALPHA_DIGIT: ALPHA + ALPHA.toUpperCase() + DIGIT
    };

    const generateString = (size = 16, alphabet = ALPHABET.ALPHA_DIGIT) => {
      let str = '';
      const {length} = alphabet;
      while (size--) {
        str += alphabet[Math.random() * length|0];
      }

      return str;
    };

    /**
     * If the thing is a FormData object, return true, otherwise return false.
     *
     * @param {unknown} thing - The thing to check.
     *
     * @returns {boolean}
     */
    function isSpecCompliantForm(thing) {
      return !!(thing && isFunction(thing.append) && thing[Symbol.toStringTag] === 'FormData' && thing[Symbol.iterator]);
    }

    const toJSONObject = (obj) => {
      const stack = new Array(10);

      const visit = (source, i) => {

        if (isObject(source)) {
          if (stack.indexOf(source) >= 0) {
            return;
          }

          if(!('toJSON' in source)) {
            stack[i] = source;
            const target = isArray(source) ? [] : {};

            forEach(source, (value, key) => {
              const reducedValue = visit(value, i + 1);
              !isUndefined(reducedValue) && (target[key] = reducedValue);
            });

            stack[i] = undefined;

            return target;
          }
        }

        return source;
      };

      return visit(obj, 0);
    };

    const isAsyncFn = kindOfTest('AsyncFunction');

    const isThenable = (thing) =>
      thing && (isObject(thing) || isFunction(thing)) && isFunction(thing.then) && isFunction(thing.catch);

    var utils$1 = {
      isArray,
      isArrayBuffer,
      isBuffer,
      isFormData,
      isArrayBufferView,
      isString: isString$1,
      isNumber,
      isBoolean,
      isObject,
      isPlainObject,
      isUndefined,
      isDate,
      isFile,
      isBlob,
      isRegExp,
      isFunction,
      isStream,
      isURLSearchParams,
      isTypedArray,
      isFileList,
      forEach,
      merge,
      extend,
      trim,
      stripBOM,
      inherits,
      toFlatObject,
      kindOf,
      kindOfTest,
      endsWith,
      toArray,
      forEachEntry,
      matchAll,
      isHTMLForm,
      hasOwnProperty,
      hasOwnProp: hasOwnProperty, // an alias to avoid ESLint no-prototype-builtins detection
      reduceDescriptors,
      freezeMethods,
      toObjectSet,
      toCamelCase,
      noop: noop$1,
      toFiniteNumber,
      findKey,
      global: _global,
      isContextDefined,
      ALPHABET,
      generateString,
      isSpecCompliantForm,
      toJSONObject,
      isAsyncFn,
      isThenable
    };

    /**
     * Create an Error with the specified message, config, error code, request and response.
     *
     * @param {string} message The error message.
     * @param {string} [code] The error code (for example, 'ECONNABORTED').
     * @param {Object} [config] The config.
     * @param {Object} [request] The request.
     * @param {Object} [response] The response.
     *
     * @returns {Error} The created error.
     */
    function AxiosError(message, code, config, request, response) {
      Error.call(this);

      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, this.constructor);
      } else {
        this.stack = (new Error()).stack;
      }

      this.message = message;
      this.name = 'AxiosError';
      code && (this.code = code);
      config && (this.config = config);
      request && (this.request = request);
      response && (this.response = response);
    }

    utils$1.inherits(AxiosError, Error, {
      toJSON: function toJSON() {
        return {
          // Standard
          message: this.message,
          name: this.name,
          // Microsoft
          description: this.description,
          number: this.number,
          // Mozilla
          fileName: this.fileName,
          lineNumber: this.lineNumber,
          columnNumber: this.columnNumber,
          stack: this.stack,
          // Axios
          config: utils$1.toJSONObject(this.config),
          code: this.code,
          status: this.response && this.response.status ? this.response.status : null
        };
      }
    });

    const prototype$1 = AxiosError.prototype;
    const descriptors = {};

    [
      'ERR_BAD_OPTION_VALUE',
      'ERR_BAD_OPTION',
      'ECONNABORTED',
      'ETIMEDOUT',
      'ERR_NETWORK',
      'ERR_FR_TOO_MANY_REDIRECTS',
      'ERR_DEPRECATED',
      'ERR_BAD_RESPONSE',
      'ERR_BAD_REQUEST',
      'ERR_CANCELED',
      'ERR_NOT_SUPPORT',
      'ERR_INVALID_URL'
    // eslint-disable-next-line func-names
    ].forEach(code => {
      descriptors[code] = {value: code};
    });

    Object.defineProperties(AxiosError, descriptors);
    Object.defineProperty(prototype$1, 'isAxiosError', {value: true});

    // eslint-disable-next-line func-names
    AxiosError.from = (error, code, config, request, response, customProps) => {
      const axiosError = Object.create(prototype$1);

      utils$1.toFlatObject(error, axiosError, function filter(obj) {
        return obj !== Error.prototype;
      }, prop => {
        return prop !== 'isAxiosError';
      });

      AxiosError.call(axiosError, error.message, code, config, request, response);

      axiosError.cause = error;

      axiosError.name = error.name;

      customProps && Object.assign(axiosError, customProps);

      return axiosError;
    };

    // eslint-disable-next-line strict
    var httpAdapter = null;

    /**
     * Determines if the given thing is a array or js object.
     *
     * @param {string} thing - The object or array to be visited.
     *
     * @returns {boolean}
     */
    function isVisitable(thing) {
      return utils$1.isPlainObject(thing) || utils$1.isArray(thing);
    }

    /**
     * It removes the brackets from the end of a string
     *
     * @param {string} key - The key of the parameter.
     *
     * @returns {string} the key without the brackets.
     */
    function removeBrackets(key) {
      return utils$1.endsWith(key, '[]') ? key.slice(0, -2) : key;
    }

    /**
     * It takes a path, a key, and a boolean, and returns a string
     *
     * @param {string} path - The path to the current key.
     * @param {string} key - The key of the current object being iterated over.
     * @param {string} dots - If true, the key will be rendered with dots instead of brackets.
     *
     * @returns {string} The path to the current key.
     */
    function renderKey(path, key, dots) {
      if (!path) return key;
      return path.concat(key).map(function each(token, i) {
        // eslint-disable-next-line no-param-reassign
        token = removeBrackets(token);
        return !dots && i ? '[' + token + ']' : token;
      }).join(dots ? '.' : '');
    }

    /**
     * If the array is an array and none of its elements are visitable, then it's a flat array.
     *
     * @param {Array<any>} arr - The array to check
     *
     * @returns {boolean}
     */
    function isFlatArray(arr) {
      return utils$1.isArray(arr) && !arr.some(isVisitable);
    }

    const predicates = utils$1.toFlatObject(utils$1, {}, null, function filter(prop) {
      return /^is[A-Z]/.test(prop);
    });

    /**
     * Convert a data object to FormData
     *
     * @param {Object} obj
     * @param {?Object} [formData]
     * @param {?Object} [options]
     * @param {Function} [options.visitor]
     * @param {Boolean} [options.metaTokens = true]
     * @param {Boolean} [options.dots = false]
     * @param {?Boolean} [options.indexes = false]
     *
     * @returns {Object}
     **/

    /**
     * It converts an object into a FormData object
     *
     * @param {Object<any, any>} obj - The object to convert to form data.
     * @param {string} formData - The FormData object to append to.
     * @param {Object<string, any>} options
     *
     * @returns
     */
    function toFormData(obj, formData, options) {
      if (!utils$1.isObject(obj)) {
        throw new TypeError('target must be an object');
      }

      // eslint-disable-next-line no-param-reassign
      formData = formData || new (FormData)();

      // eslint-disable-next-line no-param-reassign
      options = utils$1.toFlatObject(options, {
        metaTokens: true,
        dots: false,
        indexes: false
      }, false, function defined(option, source) {
        // eslint-disable-next-line no-eq-null,eqeqeq
        return !utils$1.isUndefined(source[option]);
      });

      const metaTokens = options.metaTokens;
      // eslint-disable-next-line no-use-before-define
      const visitor = options.visitor || defaultVisitor;
      const dots = options.dots;
      const indexes = options.indexes;
      const _Blob = options.Blob || typeof Blob !== 'undefined' && Blob;
      const useBlob = _Blob && utils$1.isSpecCompliantForm(formData);

      if (!utils$1.isFunction(visitor)) {
        throw new TypeError('visitor must be a function');
      }

      function convertValue(value) {
        if (value === null) return '';

        if (utils$1.isDate(value)) {
          return value.toISOString();
        }

        if (!useBlob && utils$1.isBlob(value)) {
          throw new AxiosError('Blob is not supported. Use a Buffer instead.');
        }

        if (utils$1.isArrayBuffer(value) || utils$1.isTypedArray(value)) {
          return useBlob && typeof Blob === 'function' ? new Blob([value]) : Buffer.from(value);
        }

        return value;
      }

      /**
       * Default visitor.
       *
       * @param {*} value
       * @param {String|Number} key
       * @param {Array<String|Number>} path
       * @this {FormData}
       *
       * @returns {boolean} return true to visit the each prop of the value recursively
       */
      function defaultVisitor(value, key, path) {
        let arr = value;

        if (value && !path && typeof value === 'object') {
          if (utils$1.endsWith(key, '{}')) {
            // eslint-disable-next-line no-param-reassign
            key = metaTokens ? key : key.slice(0, -2);
            // eslint-disable-next-line no-param-reassign
            value = JSON.stringify(value);
          } else if (
            (utils$1.isArray(value) && isFlatArray(value)) ||
            ((utils$1.isFileList(value) || utils$1.endsWith(key, '[]')) && (arr = utils$1.toArray(value))
            )) {
            // eslint-disable-next-line no-param-reassign
            key = removeBrackets(key);

            arr.forEach(function each(el, index) {
              !(utils$1.isUndefined(el) || el === null) && formData.append(
                // eslint-disable-next-line no-nested-ternary
                indexes === true ? renderKey([key], index, dots) : (indexes === null ? key : key + '[]'),
                convertValue(el)
              );
            });
            return false;
          }
        }

        if (isVisitable(value)) {
          return true;
        }

        formData.append(renderKey(path, key, dots), convertValue(value));

        return false;
      }

      const stack = [];

      const exposedHelpers = Object.assign(predicates, {
        defaultVisitor,
        convertValue,
        isVisitable
      });

      function build(value, path) {
        if (utils$1.isUndefined(value)) return;

        if (stack.indexOf(value) !== -1) {
          throw Error('Circular reference detected in ' + path.join('.'));
        }

        stack.push(value);

        utils$1.forEach(value, function each(el, key) {
          const result = !(utils$1.isUndefined(el) || el === null) && visitor.call(
            formData, el, utils$1.isString(key) ? key.trim() : key, path, exposedHelpers
          );

          if (result === true) {
            build(el, path ? path.concat(key) : [key]);
          }
        });

        stack.pop();
      }

      if (!utils$1.isObject(obj)) {
        throw new TypeError('data must be an object');
      }

      build(obj);

      return formData;
    }

    /**
     * It encodes a string by replacing all characters that are not in the unreserved set with
     * their percent-encoded equivalents
     *
     * @param {string} str - The string to encode.
     *
     * @returns {string} The encoded string.
     */
    function encode$1(str) {
      const charMap = {
        '!': '%21',
        "'": '%27',
        '(': '%28',
        ')': '%29',
        '~': '%7E',
        '%20': '+',
        '%00': '\x00'
      };
      return encodeURIComponent(str).replace(/[!'()~]|%20|%00/g, function replacer(match) {
        return charMap[match];
      });
    }

    /**
     * It takes a params object and converts it to a FormData object
     *
     * @param {Object<string, any>} params - The parameters to be converted to a FormData object.
     * @param {Object<string, any>} options - The options object passed to the Axios constructor.
     *
     * @returns {void}
     */
    function AxiosURLSearchParams(params, options) {
      this._pairs = [];

      params && toFormData(params, this, options);
    }

    const prototype = AxiosURLSearchParams.prototype;

    prototype.append = function append(name, value) {
      this._pairs.push([name, value]);
    };

    prototype.toString = function toString(encoder) {
      const _encode = encoder ? function(value) {
        return encoder.call(this, value, encode$1);
      } : encode$1;

      return this._pairs.map(function each(pair) {
        return _encode(pair[0]) + '=' + _encode(pair[1]);
      }, '').join('&');
    };

    /**
     * It replaces all instances of the characters `:`, `$`, `,`, `+`, `[`, and `]` with their
     * URI encoded counterparts
     *
     * @param {string} val The value to be encoded.
     *
     * @returns {string} The encoded value.
     */
    function encode(val) {
      return encodeURIComponent(val).
        replace(/%3A/gi, ':').
        replace(/%24/g, '$').
        replace(/%2C/gi, ',').
        replace(/%20/g, '+').
        replace(/%5B/gi, '[').
        replace(/%5D/gi, ']');
    }

    /**
     * Build a URL by appending params to the end
     *
     * @param {string} url The base of the url (e.g., http://www.google.com)
     * @param {object} [params] The params to be appended
     * @param {?object} options
     *
     * @returns {string} The formatted url
     */
    function buildURL(url, params, options) {
      /*eslint no-param-reassign:0*/
      if (!params) {
        return url;
      }
      
      const _encode = options && options.encode || encode;

      const serializeFn = options && options.serialize;

      let serializedParams;

      if (serializeFn) {
        serializedParams = serializeFn(params, options);
      } else {
        serializedParams = utils$1.isURLSearchParams(params) ?
          params.toString() :
          new AxiosURLSearchParams(params, options).toString(_encode);
      }

      if (serializedParams) {
        const hashmarkIndex = url.indexOf("#");

        if (hashmarkIndex !== -1) {
          url = url.slice(0, hashmarkIndex);
        }
        url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
      }

      return url;
    }

    class InterceptorManager {
      constructor() {
        this.handlers = [];
      }

      /**
       * Add a new interceptor to the stack
       *
       * @param {Function} fulfilled The function to handle `then` for a `Promise`
       * @param {Function} rejected The function to handle `reject` for a `Promise`
       *
       * @return {Number} An ID used to remove interceptor later
       */
      use(fulfilled, rejected, options) {
        this.handlers.push({
          fulfilled,
          rejected,
          synchronous: options ? options.synchronous : false,
          runWhen: options ? options.runWhen : null
        });
        return this.handlers.length - 1;
      }

      /**
       * Remove an interceptor from the stack
       *
       * @param {Number} id The ID that was returned by `use`
       *
       * @returns {Boolean} `true` if the interceptor was removed, `false` otherwise
       */
      eject(id) {
        if (this.handlers[id]) {
          this.handlers[id] = null;
        }
      }

      /**
       * Clear all interceptors from the stack
       *
       * @returns {void}
       */
      clear() {
        if (this.handlers) {
          this.handlers = [];
        }
      }

      /**
       * Iterate over all the registered interceptors
       *
       * This method is particularly useful for skipping over any
       * interceptors that may have become `null` calling `eject`.
       *
       * @param {Function} fn The function to call for each interceptor
       *
       * @returns {void}
       */
      forEach(fn) {
        utils$1.forEach(this.handlers, function forEachHandler(h) {
          if (h !== null) {
            fn(h);
          }
        });
      }
    }

    var InterceptorManager$1 = InterceptorManager;

    var transitionalDefaults = {
      silentJSONParsing: true,
      forcedJSONParsing: true,
      clarifyTimeoutError: false
    };

    var URLSearchParams$1 = typeof URLSearchParams !== 'undefined' ? URLSearchParams : AxiosURLSearchParams;

    var FormData$1 = typeof FormData !== 'undefined' ? FormData : null;

    var Blob$1 = typeof Blob !== 'undefined' ? Blob : null;

    var platform$1 = {
      isBrowser: true,
      classes: {
        URLSearchParams: URLSearchParams$1,
        FormData: FormData$1,
        Blob: Blob$1
      },
      protocols: ['http', 'https', 'file', 'blob', 'url', 'data']
    };

    const hasBrowserEnv = typeof window !== 'undefined' && typeof document !== 'undefined';

    /**
     * Determine if we're running in a standard browser environment
     *
     * This allows axios to run in a web worker, and react-native.
     * Both environments support XMLHttpRequest, but not fully standard globals.
     *
     * web workers:
     *  typeof window -> undefined
     *  typeof document -> undefined
     *
     * react-native:
     *  navigator.product -> 'ReactNative'
     * nativescript
     *  navigator.product -> 'NativeScript' or 'NS'
     *
     * @returns {boolean}
     */
    const hasStandardBrowserEnv = (
      (product) => {
        return hasBrowserEnv && ['ReactNative', 'NativeScript', 'NS'].indexOf(product) < 0
      })(typeof navigator !== 'undefined' && navigator.product);

    /**
     * Determine if we're running in a standard browser webWorker environment
     *
     * Although the `isStandardBrowserEnv` method indicates that
     * `allows axios to run in a web worker`, the WebWorker will still be
     * filtered out due to its judgment standard
     * `typeof window !== 'undefined' && typeof document !== 'undefined'`.
     * This leads to a problem when axios post `FormData` in webWorker
     */
    const hasStandardBrowserWebWorkerEnv = (() => {
      return (
        typeof WorkerGlobalScope !== 'undefined' &&
        // eslint-disable-next-line no-undef
        self instanceof WorkerGlobalScope &&
        typeof self.importScripts === 'function'
      );
    })();

    var utils = /*#__PURE__*/Object.freeze({
        __proto__: null,
        hasBrowserEnv: hasBrowserEnv,
        hasStandardBrowserEnv: hasStandardBrowserEnv,
        hasStandardBrowserWebWorkerEnv: hasStandardBrowserWebWorkerEnv
    });

    var platform = {
      ...utils,
      ...platform$1
    };

    function toURLEncodedForm(data, options) {
      return toFormData(data, new platform.classes.URLSearchParams(), Object.assign({
        visitor: function(value, key, path, helpers) {
          if (platform.isNode && utils$1.isBuffer(value)) {
            this.append(key, value.toString('base64'));
            return false;
          }

          return helpers.defaultVisitor.apply(this, arguments);
        }
      }, options));
    }

    /**
     * It takes a string like `foo[x][y][z]` and returns an array like `['foo', 'x', 'y', 'z']
     *
     * @param {string} name - The name of the property to get.
     *
     * @returns An array of strings.
     */
    function parsePropPath(name) {
      // foo[x][y][z]
      // foo.x.y.z
      // foo-x-y-z
      // foo x y z
      return utils$1.matchAll(/\w+|\[(\w*)]/g, name).map(match => {
        return match[0] === '[]' ? '' : match[1] || match[0];
      });
    }

    /**
     * Convert an array to an object.
     *
     * @param {Array<any>} arr - The array to convert to an object.
     *
     * @returns An object with the same keys and values as the array.
     */
    function arrayToObject(arr) {
      const obj = {};
      const keys = Object.keys(arr);
      let i;
      const len = keys.length;
      let key;
      for (i = 0; i < len; i++) {
        key = keys[i];
        obj[key] = arr[key];
      }
      return obj;
    }

    /**
     * It takes a FormData object and returns a JavaScript object
     *
     * @param {string} formData The FormData object to convert to JSON.
     *
     * @returns {Object<string, any> | null} The converted object.
     */
    function formDataToJSON(formData) {
      function buildPath(path, value, target, index) {
        let name = path[index++];
        const isNumericKey = Number.isFinite(+name);
        const isLast = index >= path.length;
        name = !name && utils$1.isArray(target) ? target.length : name;

        if (isLast) {
          if (utils$1.hasOwnProp(target, name)) {
            target[name] = [target[name], value];
          } else {
            target[name] = value;
          }

          return !isNumericKey;
        }

        if (!target[name] || !utils$1.isObject(target[name])) {
          target[name] = [];
        }

        const result = buildPath(path, value, target[name], index);

        if (result && utils$1.isArray(target[name])) {
          target[name] = arrayToObject(target[name]);
        }

        return !isNumericKey;
      }

      if (utils$1.isFormData(formData) && utils$1.isFunction(formData.entries)) {
        const obj = {};

        utils$1.forEachEntry(formData, (name, value) => {
          buildPath(parsePropPath(name), value, obj, 0);
        });

        return obj;
      }

      return null;
    }

    /**
     * It takes a string, tries to parse it, and if it fails, it returns the stringified version
     * of the input
     *
     * @param {any} rawValue - The value to be stringified.
     * @param {Function} parser - A function that parses a string into a JavaScript object.
     * @param {Function} encoder - A function that takes a value and returns a string.
     *
     * @returns {string} A stringified version of the rawValue.
     */
    function stringifySafely(rawValue, parser, encoder) {
      if (utils$1.isString(rawValue)) {
        try {
          (parser || JSON.parse)(rawValue);
          return utils$1.trim(rawValue);
        } catch (e) {
          if (e.name !== 'SyntaxError') {
            throw e;
          }
        }
      }

      return (encoder || JSON.stringify)(rawValue);
    }

    const defaults = {

      transitional: transitionalDefaults,

      adapter: ['xhr', 'http'],

      transformRequest: [function transformRequest(data, headers) {
        const contentType = headers.getContentType() || '';
        const hasJSONContentType = contentType.indexOf('application/json') > -1;
        const isObjectPayload = utils$1.isObject(data);

        if (isObjectPayload && utils$1.isHTMLForm(data)) {
          data = new FormData(data);
        }

        const isFormData = utils$1.isFormData(data);

        if (isFormData) {
          if (!hasJSONContentType) {
            return data;
          }
          return hasJSONContentType ? JSON.stringify(formDataToJSON(data)) : data;
        }

        if (utils$1.isArrayBuffer(data) ||
          utils$1.isBuffer(data) ||
          utils$1.isStream(data) ||
          utils$1.isFile(data) ||
          utils$1.isBlob(data)
        ) {
          return data;
        }
        if (utils$1.isArrayBufferView(data)) {
          return data.buffer;
        }
        if (utils$1.isURLSearchParams(data)) {
          headers.setContentType('application/x-www-form-urlencoded;charset=utf-8', false);
          return data.toString();
        }

        let isFileList;

        if (isObjectPayload) {
          if (contentType.indexOf('application/x-www-form-urlencoded') > -1) {
            return toURLEncodedForm(data, this.formSerializer).toString();
          }

          if ((isFileList = utils$1.isFileList(data)) || contentType.indexOf('multipart/form-data') > -1) {
            const _FormData = this.env && this.env.FormData;

            return toFormData(
              isFileList ? {'files[]': data} : data,
              _FormData && new _FormData(),
              this.formSerializer
            );
          }
        }

        if (isObjectPayload || hasJSONContentType ) {
          headers.setContentType('application/json', false);
          return stringifySafely(data);
        }

        return data;
      }],

      transformResponse: [function transformResponse(data) {
        const transitional = this.transitional || defaults.transitional;
        const forcedJSONParsing = transitional && transitional.forcedJSONParsing;
        const JSONRequested = this.responseType === 'json';

        if (data && utils$1.isString(data) && ((forcedJSONParsing && !this.responseType) || JSONRequested)) {
          const silentJSONParsing = transitional && transitional.silentJSONParsing;
          const strictJSONParsing = !silentJSONParsing && JSONRequested;

          try {
            return JSON.parse(data);
          } catch (e) {
            if (strictJSONParsing) {
              if (e.name === 'SyntaxError') {
                throw AxiosError.from(e, AxiosError.ERR_BAD_RESPONSE, this, null, this.response);
              }
              throw e;
            }
          }
        }

        return data;
      }],

      /**
       * A timeout in milliseconds to abort a request. If set to 0 (default) a
       * timeout is not created.
       */
      timeout: 0,

      xsrfCookieName: 'XSRF-TOKEN',
      xsrfHeaderName: 'X-XSRF-TOKEN',

      maxContentLength: -1,
      maxBodyLength: -1,

      env: {
        FormData: platform.classes.FormData,
        Blob: platform.classes.Blob
      },

      validateStatus: function validateStatus(status) {
        return status >= 200 && status < 300;
      },

      headers: {
        common: {
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': undefined
        }
      }
    };

    utils$1.forEach(['delete', 'get', 'head', 'post', 'put', 'patch'], (method) => {
      defaults.headers[method] = {};
    });

    var defaults$1 = defaults;

    // RawAxiosHeaders whose duplicates are ignored by node
    // c.f. https://nodejs.org/api/http.html#http_message_headers
    const ignoreDuplicateOf = utils$1.toObjectSet([
      'age', 'authorization', 'content-length', 'content-type', 'etag',
      'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
      'last-modified', 'location', 'max-forwards', 'proxy-authorization',
      'referer', 'retry-after', 'user-agent'
    ]);

    /**
     * Parse headers into an object
     *
     * ```
     * Date: Wed, 27 Aug 2014 08:58:49 GMT
     * Content-Type: application/json
     * Connection: keep-alive
     * Transfer-Encoding: chunked
     * ```
     *
     * @param {String} rawHeaders Headers needing to be parsed
     *
     * @returns {Object} Headers parsed into an object
     */
    var parseHeaders = rawHeaders => {
      const parsed = {};
      let key;
      let val;
      let i;

      rawHeaders && rawHeaders.split('\n').forEach(function parser(line) {
        i = line.indexOf(':');
        key = line.substring(0, i).trim().toLowerCase();
        val = line.substring(i + 1).trim();

        if (!key || (parsed[key] && ignoreDuplicateOf[key])) {
          return;
        }

        if (key === 'set-cookie') {
          if (parsed[key]) {
            parsed[key].push(val);
          } else {
            parsed[key] = [val];
          }
        } else {
          parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
        }
      });

      return parsed;
    };

    const $internals = Symbol('internals');

    function normalizeHeader(header) {
      return header && String(header).trim().toLowerCase();
    }

    function normalizeValue(value) {
      if (value === false || value == null) {
        return value;
      }

      return utils$1.isArray(value) ? value.map(normalizeValue) : String(value);
    }

    function parseTokens(str) {
      const tokens = Object.create(null);
      const tokensRE = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
      let match;

      while ((match = tokensRE.exec(str))) {
        tokens[match[1]] = match[2];
      }

      return tokens;
    }

    const isValidHeaderName = (str) => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(str.trim());

    function matchHeaderValue(context, value, header, filter, isHeaderNameFilter) {
      if (utils$1.isFunction(filter)) {
        return filter.call(this, value, header);
      }

      if (isHeaderNameFilter) {
        value = header;
      }

      if (!utils$1.isString(value)) return;

      if (utils$1.isString(filter)) {
        return value.indexOf(filter) !== -1;
      }

      if (utils$1.isRegExp(filter)) {
        return filter.test(value);
      }
    }

    function formatHeader(header) {
      return header.trim()
        .toLowerCase().replace(/([a-z\d])(\w*)/g, (w, char, str) => {
          return char.toUpperCase() + str;
        });
    }

    function buildAccessors(obj, header) {
      const accessorName = utils$1.toCamelCase(' ' + header);

      ['get', 'set', 'has'].forEach(methodName => {
        Object.defineProperty(obj, methodName + accessorName, {
          value: function(arg1, arg2, arg3) {
            return this[methodName].call(this, header, arg1, arg2, arg3);
          },
          configurable: true
        });
      });
    }

    class AxiosHeaders {
      constructor(headers) {
        headers && this.set(headers);
      }

      set(header, valueOrRewrite, rewrite) {
        const self = this;

        function setHeader(_value, _header, _rewrite) {
          const lHeader = normalizeHeader(_header);

          if (!lHeader) {
            throw new Error('header name must be a non-empty string');
          }

          const key = utils$1.findKey(self, lHeader);

          if(!key || self[key] === undefined || _rewrite === true || (_rewrite === undefined && self[key] !== false)) {
            self[key || _header] = normalizeValue(_value);
          }
        }

        const setHeaders = (headers, _rewrite) =>
          utils$1.forEach(headers, (_value, _header) => setHeader(_value, _header, _rewrite));

        if (utils$1.isPlainObject(header) || header instanceof this.constructor) {
          setHeaders(header, valueOrRewrite);
        } else if(utils$1.isString(header) && (header = header.trim()) && !isValidHeaderName(header)) {
          setHeaders(parseHeaders(header), valueOrRewrite);
        } else {
          header != null && setHeader(valueOrRewrite, header, rewrite);
        }

        return this;
      }

      get(header, parser) {
        header = normalizeHeader(header);

        if (header) {
          const key = utils$1.findKey(this, header);

          if (key) {
            const value = this[key];

            if (!parser) {
              return value;
            }

            if (parser === true) {
              return parseTokens(value);
            }

            if (utils$1.isFunction(parser)) {
              return parser.call(this, value, key);
            }

            if (utils$1.isRegExp(parser)) {
              return parser.exec(value);
            }

            throw new TypeError('parser must be boolean|regexp|function');
          }
        }
      }

      has(header, matcher) {
        header = normalizeHeader(header);

        if (header) {
          const key = utils$1.findKey(this, header);

          return !!(key && this[key] !== undefined && (!matcher || matchHeaderValue(this, this[key], key, matcher)));
        }

        return false;
      }

      delete(header, matcher) {
        const self = this;
        let deleted = false;

        function deleteHeader(_header) {
          _header = normalizeHeader(_header);

          if (_header) {
            const key = utils$1.findKey(self, _header);

            if (key && (!matcher || matchHeaderValue(self, self[key], key, matcher))) {
              delete self[key];

              deleted = true;
            }
          }
        }

        if (utils$1.isArray(header)) {
          header.forEach(deleteHeader);
        } else {
          deleteHeader(header);
        }

        return deleted;
      }

      clear(matcher) {
        const keys = Object.keys(this);
        let i = keys.length;
        let deleted = false;

        while (i--) {
          const key = keys[i];
          if(!matcher || matchHeaderValue(this, this[key], key, matcher, true)) {
            delete this[key];
            deleted = true;
          }
        }

        return deleted;
      }

      normalize(format) {
        const self = this;
        const headers = {};

        utils$1.forEach(this, (value, header) => {
          const key = utils$1.findKey(headers, header);

          if (key) {
            self[key] = normalizeValue(value);
            delete self[header];
            return;
          }

          const normalized = format ? formatHeader(header) : String(header).trim();

          if (normalized !== header) {
            delete self[header];
          }

          self[normalized] = normalizeValue(value);

          headers[normalized] = true;
        });

        return this;
      }

      concat(...targets) {
        return this.constructor.concat(this, ...targets);
      }

      toJSON(asStrings) {
        const obj = Object.create(null);

        utils$1.forEach(this, (value, header) => {
          value != null && value !== false && (obj[header] = asStrings && utils$1.isArray(value) ? value.join(', ') : value);
        });

        return obj;
      }

      [Symbol.iterator]() {
        return Object.entries(this.toJSON())[Symbol.iterator]();
      }

      toString() {
        return Object.entries(this.toJSON()).map(([header, value]) => header + ': ' + value).join('\n');
      }

      get [Symbol.toStringTag]() {
        return 'AxiosHeaders';
      }

      static from(thing) {
        return thing instanceof this ? thing : new this(thing);
      }

      static concat(first, ...targets) {
        const computed = new this(first);

        targets.forEach((target) => computed.set(target));

        return computed;
      }

      static accessor(header) {
        const internals = this[$internals] = (this[$internals] = {
          accessors: {}
        });

        const accessors = internals.accessors;
        const prototype = this.prototype;

        function defineAccessor(_header) {
          const lHeader = normalizeHeader(_header);

          if (!accessors[lHeader]) {
            buildAccessors(prototype, _header);
            accessors[lHeader] = true;
          }
        }

        utils$1.isArray(header) ? header.forEach(defineAccessor) : defineAccessor(header);

        return this;
      }
    }

    AxiosHeaders.accessor(['Content-Type', 'Content-Length', 'Accept', 'Accept-Encoding', 'User-Agent', 'Authorization']);

    // reserved names hotfix
    utils$1.reduceDescriptors(AxiosHeaders.prototype, ({value}, key) => {
      let mapped = key[0].toUpperCase() + key.slice(1); // map `set` => `Set`
      return {
        get: () => value,
        set(headerValue) {
          this[mapped] = headerValue;
        }
      }
    });

    utils$1.freezeMethods(AxiosHeaders);

    var AxiosHeaders$1 = AxiosHeaders;

    /**
     * Transform the data for a request or a response
     *
     * @param {Array|Function} fns A single function or Array of functions
     * @param {?Object} response The response object
     *
     * @returns {*} The resulting transformed data
     */
    function transformData(fns, response) {
      const config = this || defaults$1;
      const context = response || config;
      const headers = AxiosHeaders$1.from(context.headers);
      let data = context.data;

      utils$1.forEach(fns, function transform(fn) {
        data = fn.call(config, data, headers.normalize(), response ? response.status : undefined);
      });

      headers.normalize();

      return data;
    }

    function isCancel(value) {
      return !!(value && value.__CANCEL__);
    }

    /**
     * A `CanceledError` is an object that is thrown when an operation is canceled.
     *
     * @param {string=} message The message.
     * @param {Object=} config The config.
     * @param {Object=} request The request.
     *
     * @returns {CanceledError} The created error.
     */
    function CanceledError(message, config, request) {
      // eslint-disable-next-line no-eq-null,eqeqeq
      AxiosError.call(this, message == null ? 'canceled' : message, AxiosError.ERR_CANCELED, config, request);
      this.name = 'CanceledError';
    }

    utils$1.inherits(CanceledError, AxiosError, {
      __CANCEL__: true
    });

    /**
     * Resolve or reject a Promise based on response status.
     *
     * @param {Function} resolve A function that resolves the promise.
     * @param {Function} reject A function that rejects the promise.
     * @param {object} response The response.
     *
     * @returns {object} The response.
     */
    function settle(resolve, reject, response) {
      const validateStatus = response.config.validateStatus;
      if (!response.status || !validateStatus || validateStatus(response.status)) {
        resolve(response);
      } else {
        reject(new AxiosError(
          'Request failed with status code ' + response.status,
          [AxiosError.ERR_BAD_REQUEST, AxiosError.ERR_BAD_RESPONSE][Math.floor(response.status / 100) - 4],
          response.config,
          response.request,
          response
        ));
      }
    }

    var cookies = platform.hasStandardBrowserEnv ?

      // Standard browser envs support document.cookie
      {
        write(name, value, expires, path, domain, secure) {
          const cookie = [name + '=' + encodeURIComponent(value)];

          utils$1.isNumber(expires) && cookie.push('expires=' + new Date(expires).toGMTString());

          utils$1.isString(path) && cookie.push('path=' + path);

          utils$1.isString(domain) && cookie.push('domain=' + domain);

          secure === true && cookie.push('secure');

          document.cookie = cookie.join('; ');
        },

        read(name) {
          const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
          return (match ? decodeURIComponent(match[3]) : null);
        },

        remove(name) {
          this.write(name, '', Date.now() - 86400000);
        }
      }

      :

      // Non-standard browser env (web workers, react-native) lack needed support.
      {
        write() {},
        read() {
          return null;
        },
        remove() {}
      };

    /**
     * Determines whether the specified URL is absolute
     *
     * @param {string} url The URL to test
     *
     * @returns {boolean} True if the specified URL is absolute, otherwise false
     */
    function isAbsoluteURL(url) {
      // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
      // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
      // by any combination of letters, digits, plus, period, or hyphen.
      return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);
    }

    /**
     * Creates a new URL by combining the specified URLs
     *
     * @param {string} baseURL The base URL
     * @param {string} relativeURL The relative URL
     *
     * @returns {string} The combined URL
     */
    function combineURLs(baseURL, relativeURL) {
      return relativeURL
        ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
        : baseURL;
    }

    /**
     * Creates a new URL by combining the baseURL with the requestedURL,
     * only when the requestedURL is not already an absolute URL.
     * If the requestURL is absolute, this function returns the requestedURL untouched.
     *
     * @param {string} baseURL The base URL
     * @param {string} requestedURL Absolute or relative URL to combine
     *
     * @returns {string} The combined full path
     */
    function buildFullPath(baseURL, requestedURL) {
      if (baseURL && !isAbsoluteURL(requestedURL)) {
        return combineURLs(baseURL, requestedURL);
      }
      return requestedURL;
    }

    var isURLSameOrigin = platform.hasStandardBrowserEnv ?

    // Standard browser envs have full support of the APIs needed to test
    // whether the request URL is of the same origin as current location.
      (function standardBrowserEnv() {
        const msie = /(msie|trident)/i.test(navigator.userAgent);
        const urlParsingNode = document.createElement('a');
        let originURL;

        /**
        * Parse a URL to discover its components
        *
        * @param {String} url The URL to be parsed
        * @returns {Object}
        */
        function resolveURL(url) {
          let href = url;

          if (msie) {
            // IE needs attribute set twice to normalize properties
            urlParsingNode.setAttribute('href', href);
            href = urlParsingNode.href;
          }

          urlParsingNode.setAttribute('href', href);

          // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
          return {
            href: urlParsingNode.href,
            protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
            host: urlParsingNode.host,
            search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
            hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
            hostname: urlParsingNode.hostname,
            port: urlParsingNode.port,
            pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
              urlParsingNode.pathname :
              '/' + urlParsingNode.pathname
          };
        }

        originURL = resolveURL(window.location.href);

        /**
        * Determine if a URL shares the same origin as the current location
        *
        * @param {String} requestURL The URL to test
        * @returns {boolean} True if URL shares the same origin, otherwise false
        */
        return function isURLSameOrigin(requestURL) {
          const parsed = (utils$1.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
          return (parsed.protocol === originURL.protocol &&
              parsed.host === originURL.host);
        };
      })() :

      // Non standard browser envs (web workers, react-native) lack needed support.
      (function nonStandardBrowserEnv() {
        return function isURLSameOrigin() {
          return true;
        };
      })();

    function parseProtocol(url) {
      const match = /^([-+\w]{1,25})(:?\/\/|:)/.exec(url);
      return match && match[1] || '';
    }

    /**
     * Calculate data maxRate
     * @param {Number} [samplesCount= 10]
     * @param {Number} [min= 1000]
     * @returns {Function}
     */
    function speedometer(samplesCount, min) {
      samplesCount = samplesCount || 10;
      const bytes = new Array(samplesCount);
      const timestamps = new Array(samplesCount);
      let head = 0;
      let tail = 0;
      let firstSampleTS;

      min = min !== undefined ? min : 1000;

      return function push(chunkLength) {
        const now = Date.now();

        const startedAt = timestamps[tail];

        if (!firstSampleTS) {
          firstSampleTS = now;
        }

        bytes[head] = chunkLength;
        timestamps[head] = now;

        let i = tail;
        let bytesCount = 0;

        while (i !== head) {
          bytesCount += bytes[i++];
          i = i % samplesCount;
        }

        head = (head + 1) % samplesCount;

        if (head === tail) {
          tail = (tail + 1) % samplesCount;
        }

        if (now - firstSampleTS < min) {
          return;
        }

        const passed = startedAt && now - startedAt;

        return passed ? Math.round(bytesCount * 1000 / passed) : undefined;
      };
    }

    function progressEventReducer(listener, isDownloadStream) {
      let bytesNotified = 0;
      const _speedometer = speedometer(50, 250);

      return e => {
        const loaded = e.loaded;
        const total = e.lengthComputable ? e.total : undefined;
        const progressBytes = loaded - bytesNotified;
        const rate = _speedometer(progressBytes);
        const inRange = loaded <= total;

        bytesNotified = loaded;

        const data = {
          loaded,
          total,
          progress: total ? (loaded / total) : undefined,
          bytes: progressBytes,
          rate: rate ? rate : undefined,
          estimated: rate && total && inRange ? (total - loaded) / rate : undefined,
          event: e
        };

        data[isDownloadStream ? 'download' : 'upload'] = true;

        listener(data);
      };
    }

    const isXHRAdapterSupported = typeof XMLHttpRequest !== 'undefined';

    var xhrAdapter = isXHRAdapterSupported && function (config) {
      return new Promise(function dispatchXhrRequest(resolve, reject) {
        let requestData = config.data;
        const requestHeaders = AxiosHeaders$1.from(config.headers).normalize();
        let {responseType, withXSRFToken} = config;
        let onCanceled;
        function done() {
          if (config.cancelToken) {
            config.cancelToken.unsubscribe(onCanceled);
          }

          if (config.signal) {
            config.signal.removeEventListener('abort', onCanceled);
          }
        }

        let contentType;

        if (utils$1.isFormData(requestData)) {
          if (platform.hasStandardBrowserEnv || platform.hasStandardBrowserWebWorkerEnv) {
            requestHeaders.setContentType(false); // Let the browser set it
          } else if ((contentType = requestHeaders.getContentType()) !== false) {
            // fix semicolon duplication issue for ReactNative FormData implementation
            const [type, ...tokens] = contentType ? contentType.split(';').map(token => token.trim()).filter(Boolean) : [];
            requestHeaders.setContentType([type || 'multipart/form-data', ...tokens].join('; '));
          }
        }

        let request = new XMLHttpRequest();

        // HTTP basic authentication
        if (config.auth) {
          const username = config.auth.username || '';
          const password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : '';
          requestHeaders.set('Authorization', 'Basic ' + btoa(username + ':' + password));
        }

        const fullPath = buildFullPath(config.baseURL, config.url);

        request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);

        // Set the request timeout in MS
        request.timeout = config.timeout;

        function onloadend() {
          if (!request) {
            return;
          }
          // Prepare the response
          const responseHeaders = AxiosHeaders$1.from(
            'getAllResponseHeaders' in request && request.getAllResponseHeaders()
          );
          const responseData = !responseType || responseType === 'text' || responseType === 'json' ?
            request.responseText : request.response;
          const response = {
            data: responseData,
            status: request.status,
            statusText: request.statusText,
            headers: responseHeaders,
            config,
            request
          };

          settle(function _resolve(value) {
            resolve(value);
            done();
          }, function _reject(err) {
            reject(err);
            done();
          }, response);

          // Clean up request
          request = null;
        }

        if ('onloadend' in request) {
          // Use onloadend if available
          request.onloadend = onloadend;
        } else {
          // Listen for ready state to emulate onloadend
          request.onreadystatechange = function handleLoad() {
            if (!request || request.readyState !== 4) {
              return;
            }

            // The request errored out and we didn't get a response, this will be
            // handled by onerror instead
            // With one exception: request that using file: protocol, most browsers
            // will return status as 0 even though it's a successful request
            if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
              return;
            }
            // readystate handler is calling before onerror or ontimeout handlers,
            // so we should call onloadend on the next 'tick'
            setTimeout(onloadend);
          };
        }

        // Handle browser request cancellation (as opposed to a manual cancellation)
        request.onabort = function handleAbort() {
          if (!request) {
            return;
          }

          reject(new AxiosError('Request aborted', AxiosError.ECONNABORTED, config, request));

          // Clean up request
          request = null;
        };

        // Handle low level network errors
        request.onerror = function handleError() {
          // Real errors are hidden from us by the browser
          // onerror should only fire if it's a network error
          reject(new AxiosError('Network Error', AxiosError.ERR_NETWORK, config, request));

          // Clean up request
          request = null;
        };

        // Handle timeout
        request.ontimeout = function handleTimeout() {
          let timeoutErrorMessage = config.timeout ? 'timeout of ' + config.timeout + 'ms exceeded' : 'timeout exceeded';
          const transitional = config.transitional || transitionalDefaults;
          if (config.timeoutErrorMessage) {
            timeoutErrorMessage = config.timeoutErrorMessage;
          }
          reject(new AxiosError(
            timeoutErrorMessage,
            transitional.clarifyTimeoutError ? AxiosError.ETIMEDOUT : AxiosError.ECONNABORTED,
            config,
            request));

          // Clean up request
          request = null;
        };

        // Add xsrf header
        // This is only done if running in a standard browser environment.
        // Specifically not if we're in a web worker, or react-native.
        if(platform.hasStandardBrowserEnv) {
          withXSRFToken && utils$1.isFunction(withXSRFToken) && (withXSRFToken = withXSRFToken(config));

          if (withXSRFToken || (withXSRFToken !== false && isURLSameOrigin(fullPath))) {
            // Add xsrf header
            const xsrfValue = config.xsrfHeaderName && config.xsrfCookieName && cookies.read(config.xsrfCookieName);

            if (xsrfValue) {
              requestHeaders.set(config.xsrfHeaderName, xsrfValue);
            }
          }
        }

        // Remove Content-Type if data is undefined
        requestData === undefined && requestHeaders.setContentType(null);

        // Add headers to the request
        if ('setRequestHeader' in request) {
          utils$1.forEach(requestHeaders.toJSON(), function setRequestHeader(val, key) {
            request.setRequestHeader(key, val);
          });
        }

        // Add withCredentials to request if needed
        if (!utils$1.isUndefined(config.withCredentials)) {
          request.withCredentials = !!config.withCredentials;
        }

        // Add responseType to request if needed
        if (responseType && responseType !== 'json') {
          request.responseType = config.responseType;
        }

        // Handle progress if needed
        if (typeof config.onDownloadProgress === 'function') {
          request.addEventListener('progress', progressEventReducer(config.onDownloadProgress, true));
        }

        // Not all browsers support upload events
        if (typeof config.onUploadProgress === 'function' && request.upload) {
          request.upload.addEventListener('progress', progressEventReducer(config.onUploadProgress));
        }

        if (config.cancelToken || config.signal) {
          // Handle cancellation
          // eslint-disable-next-line func-names
          onCanceled = cancel => {
            if (!request) {
              return;
            }
            reject(!cancel || cancel.type ? new CanceledError(null, config, request) : cancel);
            request.abort();
            request = null;
          };

          config.cancelToken && config.cancelToken.subscribe(onCanceled);
          if (config.signal) {
            config.signal.aborted ? onCanceled() : config.signal.addEventListener('abort', onCanceled);
          }
        }

        const protocol = parseProtocol(fullPath);

        if (protocol && platform.protocols.indexOf(protocol) === -1) {
          reject(new AxiosError('Unsupported protocol ' + protocol + ':', AxiosError.ERR_BAD_REQUEST, config));
          return;
        }


        // Send the request
        request.send(requestData || null);
      });
    };

    const knownAdapters = {
      http: httpAdapter,
      xhr: xhrAdapter
    };

    utils$1.forEach(knownAdapters, (fn, value) => {
      if (fn) {
        try {
          Object.defineProperty(fn, 'name', {value});
        } catch (e) {
          // eslint-disable-next-line no-empty
        }
        Object.defineProperty(fn, 'adapterName', {value});
      }
    });

    const renderReason = (reason) => `- ${reason}`;

    const isResolvedHandle = (adapter) => utils$1.isFunction(adapter) || adapter === null || adapter === false;

    var adapters = {
      getAdapter: (adapters) => {
        adapters = utils$1.isArray(adapters) ? adapters : [adapters];

        const {length} = adapters;
        let nameOrAdapter;
        let adapter;

        const rejectedReasons = {};

        for (let i = 0; i < length; i++) {
          nameOrAdapter = adapters[i];
          let id;

          adapter = nameOrAdapter;

          if (!isResolvedHandle(nameOrAdapter)) {
            adapter = knownAdapters[(id = String(nameOrAdapter)).toLowerCase()];

            if (adapter === undefined) {
              throw new AxiosError(`Unknown adapter '${id}'`);
            }
          }

          if (adapter) {
            break;
          }

          rejectedReasons[id || '#' + i] = adapter;
        }

        if (!adapter) {

          const reasons = Object.entries(rejectedReasons)
            .map(([id, state]) => `adapter ${id} ` +
              (state === false ? 'is not supported by the environment' : 'is not available in the build')
            );

          let s = length ?
            (reasons.length > 1 ? 'since :\n' + reasons.map(renderReason).join('\n') : ' ' + renderReason(reasons[0])) :
            'as no adapter specified';

          throw new AxiosError(
            `There is no suitable adapter to dispatch the request ` + s,
            'ERR_NOT_SUPPORT'
          );
        }

        return adapter;
      },
      adapters: knownAdapters
    };

    /**
     * Throws a `CanceledError` if cancellation has been requested.
     *
     * @param {Object} config The config that is to be used for the request
     *
     * @returns {void}
     */
    function throwIfCancellationRequested(config) {
      if (config.cancelToken) {
        config.cancelToken.throwIfRequested();
      }

      if (config.signal && config.signal.aborted) {
        throw new CanceledError(null, config);
      }
    }

    /**
     * Dispatch a request to the server using the configured adapter.
     *
     * @param {object} config The config that is to be used for the request
     *
     * @returns {Promise} The Promise to be fulfilled
     */
    function dispatchRequest(config) {
      throwIfCancellationRequested(config);

      config.headers = AxiosHeaders$1.from(config.headers);

      // Transform request data
      config.data = transformData.call(
        config,
        config.transformRequest
      );

      if (['post', 'put', 'patch'].indexOf(config.method) !== -1) {
        config.headers.setContentType('application/x-www-form-urlencoded', false);
      }

      const adapter = adapters.getAdapter(config.adapter || defaults$1.adapter);

      return adapter(config).then(function onAdapterResolution(response) {
        throwIfCancellationRequested(config);

        // Transform response data
        response.data = transformData.call(
          config,
          config.transformResponse,
          response
        );

        response.headers = AxiosHeaders$1.from(response.headers);

        return response;
      }, function onAdapterRejection(reason) {
        if (!isCancel(reason)) {
          throwIfCancellationRequested(config);

          // Transform response data
          if (reason && reason.response) {
            reason.response.data = transformData.call(
              config,
              config.transformResponse,
              reason.response
            );
            reason.response.headers = AxiosHeaders$1.from(reason.response.headers);
          }
        }

        return Promise.reject(reason);
      });
    }

    const headersToObject = (thing) => thing instanceof AxiosHeaders$1 ? thing.toJSON() : thing;

    /**
     * Config-specific merge-function which creates a new config-object
     * by merging two configuration objects together.
     *
     * @param {Object} config1
     * @param {Object} config2
     *
     * @returns {Object} New object resulting from merging config2 to config1
     */
    function mergeConfig(config1, config2) {
      // eslint-disable-next-line no-param-reassign
      config2 = config2 || {};
      const config = {};

      function getMergedValue(target, source, caseless) {
        if (utils$1.isPlainObject(target) && utils$1.isPlainObject(source)) {
          return utils$1.merge.call({caseless}, target, source);
        } else if (utils$1.isPlainObject(source)) {
          return utils$1.merge({}, source);
        } else if (utils$1.isArray(source)) {
          return source.slice();
        }
        return source;
      }

      // eslint-disable-next-line consistent-return
      function mergeDeepProperties(a, b, caseless) {
        if (!utils$1.isUndefined(b)) {
          return getMergedValue(a, b, caseless);
        } else if (!utils$1.isUndefined(a)) {
          return getMergedValue(undefined, a, caseless);
        }
      }

      // eslint-disable-next-line consistent-return
      function valueFromConfig2(a, b) {
        if (!utils$1.isUndefined(b)) {
          return getMergedValue(undefined, b);
        }
      }

      // eslint-disable-next-line consistent-return
      function defaultToConfig2(a, b) {
        if (!utils$1.isUndefined(b)) {
          return getMergedValue(undefined, b);
        } else if (!utils$1.isUndefined(a)) {
          return getMergedValue(undefined, a);
        }
      }

      // eslint-disable-next-line consistent-return
      function mergeDirectKeys(a, b, prop) {
        if (prop in config2) {
          return getMergedValue(a, b);
        } else if (prop in config1) {
          return getMergedValue(undefined, a);
        }
      }

      const mergeMap = {
        url: valueFromConfig2,
        method: valueFromConfig2,
        data: valueFromConfig2,
        baseURL: defaultToConfig2,
        transformRequest: defaultToConfig2,
        transformResponse: defaultToConfig2,
        paramsSerializer: defaultToConfig2,
        timeout: defaultToConfig2,
        timeoutMessage: defaultToConfig2,
        withCredentials: defaultToConfig2,
        withXSRFToken: defaultToConfig2,
        adapter: defaultToConfig2,
        responseType: defaultToConfig2,
        xsrfCookieName: defaultToConfig2,
        xsrfHeaderName: defaultToConfig2,
        onUploadProgress: defaultToConfig2,
        onDownloadProgress: defaultToConfig2,
        decompress: defaultToConfig2,
        maxContentLength: defaultToConfig2,
        maxBodyLength: defaultToConfig2,
        beforeRedirect: defaultToConfig2,
        transport: defaultToConfig2,
        httpAgent: defaultToConfig2,
        httpsAgent: defaultToConfig2,
        cancelToken: defaultToConfig2,
        socketPath: defaultToConfig2,
        responseEncoding: defaultToConfig2,
        validateStatus: mergeDirectKeys,
        headers: (a, b) => mergeDeepProperties(headersToObject(a), headersToObject(b), true)
      };

      utils$1.forEach(Object.keys(Object.assign({}, config1, config2)), function computeConfigValue(prop) {
        const merge = mergeMap[prop] || mergeDeepProperties;
        const configValue = merge(config1[prop], config2[prop], prop);
        (utils$1.isUndefined(configValue) && merge !== mergeDirectKeys) || (config[prop] = configValue);
      });

      return config;
    }

    const VERSION = "1.6.2";

    const validators$1 = {};

    // eslint-disable-next-line func-names
    ['object', 'boolean', 'number', 'function', 'string', 'symbol'].forEach((type, i) => {
      validators$1[type] = function validator(thing) {
        return typeof thing === type || 'a' + (i < 1 ? 'n ' : ' ') + type;
      };
    });

    const deprecatedWarnings = {};

    /**
     * Transitional option validator
     *
     * @param {function|boolean?} validator - set to false if the transitional option has been removed
     * @param {string?} version - deprecated version / removed since version
     * @param {string?} message - some message with additional info
     *
     * @returns {function}
     */
    validators$1.transitional = function transitional(validator, version, message) {
      function formatMessage(opt, desc) {
        return '[Axios v' + VERSION + '] Transitional option \'' + opt + '\'' + desc + (message ? '. ' + message : '');
      }

      // eslint-disable-next-line func-names
      return (value, opt, opts) => {
        if (validator === false) {
          throw new AxiosError(
            formatMessage(opt, ' has been removed' + (version ? ' in ' + version : '')),
            AxiosError.ERR_DEPRECATED
          );
        }

        if (version && !deprecatedWarnings[opt]) {
          deprecatedWarnings[opt] = true;
          // eslint-disable-next-line no-console
          console.warn(
            formatMessage(
              opt,
              ' has been deprecated since v' + version + ' and will be removed in the near future'
            )
          );
        }

        return validator ? validator(value, opt, opts) : true;
      };
    };

    /**
     * Assert object's properties type
     *
     * @param {object} options
     * @param {object} schema
     * @param {boolean?} allowUnknown
     *
     * @returns {object}
     */

    function assertOptions(options, schema, allowUnknown) {
      if (typeof options !== 'object') {
        throw new AxiosError('options must be an object', AxiosError.ERR_BAD_OPTION_VALUE);
      }
      const keys = Object.keys(options);
      let i = keys.length;
      while (i-- > 0) {
        const opt = keys[i];
        const validator = schema[opt];
        if (validator) {
          const value = options[opt];
          const result = value === undefined || validator(value, opt, options);
          if (result !== true) {
            throw new AxiosError('option ' + opt + ' must be ' + result, AxiosError.ERR_BAD_OPTION_VALUE);
          }
          continue;
        }
        if (allowUnknown !== true) {
          throw new AxiosError('Unknown option ' + opt, AxiosError.ERR_BAD_OPTION);
        }
      }
    }

    var validator = {
      assertOptions,
      validators: validators$1
    };

    const validators = validator.validators;

    /**
     * Create a new instance of Axios
     *
     * @param {Object} instanceConfig The default config for the instance
     *
     * @return {Axios} A new instance of Axios
     */
    class Axios {
      constructor(instanceConfig) {
        this.defaults = instanceConfig;
        this.interceptors = {
          request: new InterceptorManager$1(),
          response: new InterceptorManager$1()
        };
      }

      /**
       * Dispatch a request
       *
       * @param {String|Object} configOrUrl The config specific for this request (merged with this.defaults)
       * @param {?Object} config
       *
       * @returns {Promise} The Promise to be fulfilled
       */
      request(configOrUrl, config) {
        /*eslint no-param-reassign:0*/
        // Allow for axios('example/url'[, config]) a la fetch API
        if (typeof configOrUrl === 'string') {
          config = config || {};
          config.url = configOrUrl;
        } else {
          config = configOrUrl || {};
        }

        config = mergeConfig(this.defaults, config);

        const {transitional, paramsSerializer, headers} = config;

        if (transitional !== undefined) {
          validator.assertOptions(transitional, {
            silentJSONParsing: validators.transitional(validators.boolean),
            forcedJSONParsing: validators.transitional(validators.boolean),
            clarifyTimeoutError: validators.transitional(validators.boolean)
          }, false);
        }

        if (paramsSerializer != null) {
          if (utils$1.isFunction(paramsSerializer)) {
            config.paramsSerializer = {
              serialize: paramsSerializer
            };
          } else {
            validator.assertOptions(paramsSerializer, {
              encode: validators.function,
              serialize: validators.function
            }, true);
          }
        }

        // Set config.method
        config.method = (config.method || this.defaults.method || 'get').toLowerCase();

        // Flatten headers
        let contextHeaders = headers && utils$1.merge(
          headers.common,
          headers[config.method]
        );

        headers && utils$1.forEach(
          ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
          (method) => {
            delete headers[method];
          }
        );

        config.headers = AxiosHeaders$1.concat(contextHeaders, headers);

        // filter out skipped interceptors
        const requestInterceptorChain = [];
        let synchronousRequestInterceptors = true;
        this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
          if (typeof interceptor.runWhen === 'function' && interceptor.runWhen(config) === false) {
            return;
          }

          synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;

          requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
        });

        const responseInterceptorChain = [];
        this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
          responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
        });

        let promise;
        let i = 0;
        let len;

        if (!synchronousRequestInterceptors) {
          const chain = [dispatchRequest.bind(this), undefined];
          chain.unshift.apply(chain, requestInterceptorChain);
          chain.push.apply(chain, responseInterceptorChain);
          len = chain.length;

          promise = Promise.resolve(config);

          while (i < len) {
            promise = promise.then(chain[i++], chain[i++]);
          }

          return promise;
        }

        len = requestInterceptorChain.length;

        let newConfig = config;

        i = 0;

        while (i < len) {
          const onFulfilled = requestInterceptorChain[i++];
          const onRejected = requestInterceptorChain[i++];
          try {
            newConfig = onFulfilled(newConfig);
          } catch (error) {
            onRejected.call(this, error);
            break;
          }
        }

        try {
          promise = dispatchRequest.call(this, newConfig);
        } catch (error) {
          return Promise.reject(error);
        }

        i = 0;
        len = responseInterceptorChain.length;

        while (i < len) {
          promise = promise.then(responseInterceptorChain[i++], responseInterceptorChain[i++]);
        }

        return promise;
      }

      getUri(config) {
        config = mergeConfig(this.defaults, config);
        const fullPath = buildFullPath(config.baseURL, config.url);
        return buildURL(fullPath, config.params, config.paramsSerializer);
      }
    }

    // Provide aliases for supported request methods
    utils$1.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
      /*eslint func-names:0*/
      Axios.prototype[method] = function(url, config) {
        return this.request(mergeConfig(config || {}, {
          method,
          url,
          data: (config || {}).data
        }));
      };
    });

    utils$1.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
      /*eslint func-names:0*/

      function generateHTTPMethod(isForm) {
        return function httpMethod(url, data, config) {
          return this.request(mergeConfig(config || {}, {
            method,
            headers: isForm ? {
              'Content-Type': 'multipart/form-data'
            } : {},
            url,
            data
          }));
        };
      }

      Axios.prototype[method] = generateHTTPMethod();

      Axios.prototype[method + 'Form'] = generateHTTPMethod(true);
    });

    var Axios$1 = Axios;

    /**
     * A `CancelToken` is an object that can be used to request cancellation of an operation.
     *
     * @param {Function} executor The executor function.
     *
     * @returns {CancelToken}
     */
    class CancelToken {
      constructor(executor) {
        if (typeof executor !== 'function') {
          throw new TypeError('executor must be a function.');
        }

        let resolvePromise;

        this.promise = new Promise(function promiseExecutor(resolve) {
          resolvePromise = resolve;
        });

        const token = this;

        // eslint-disable-next-line func-names
        this.promise.then(cancel => {
          if (!token._listeners) return;

          let i = token._listeners.length;

          while (i-- > 0) {
            token._listeners[i](cancel);
          }
          token._listeners = null;
        });

        // eslint-disable-next-line func-names
        this.promise.then = onfulfilled => {
          let _resolve;
          // eslint-disable-next-line func-names
          const promise = new Promise(resolve => {
            token.subscribe(resolve);
            _resolve = resolve;
          }).then(onfulfilled);

          promise.cancel = function reject() {
            token.unsubscribe(_resolve);
          };

          return promise;
        };

        executor(function cancel(message, config, request) {
          if (token.reason) {
            // Cancellation has already been requested
            return;
          }

          token.reason = new CanceledError(message, config, request);
          resolvePromise(token.reason);
        });
      }

      /**
       * Throws a `CanceledError` if cancellation has been requested.
       */
      throwIfRequested() {
        if (this.reason) {
          throw this.reason;
        }
      }

      /**
       * Subscribe to the cancel signal
       */

      subscribe(listener) {
        if (this.reason) {
          listener(this.reason);
          return;
        }

        if (this._listeners) {
          this._listeners.push(listener);
        } else {
          this._listeners = [listener];
        }
      }

      /**
       * Unsubscribe from the cancel signal
       */

      unsubscribe(listener) {
        if (!this._listeners) {
          return;
        }
        const index = this._listeners.indexOf(listener);
        if (index !== -1) {
          this._listeners.splice(index, 1);
        }
      }

      /**
       * Returns an object that contains a new `CancelToken` and a function that, when called,
       * cancels the `CancelToken`.
       */
      static source() {
        let cancel;
        const token = new CancelToken(function executor(c) {
          cancel = c;
        });
        return {
          token,
          cancel
        };
      }
    }

    var CancelToken$1 = CancelToken;

    /**
     * Syntactic sugar for invoking a function and expanding an array for arguments.
     *
     * Common use case would be to use `Function.prototype.apply`.
     *
     *  ```js
     *  function f(x, y, z) {}
     *  var args = [1, 2, 3];
     *  f.apply(null, args);
     *  ```
     *
     * With `spread` this example can be re-written.
     *
     *  ```js
     *  spread(function(x, y, z) {})([1, 2, 3]);
     *  ```
     *
     * @param {Function} callback
     *
     * @returns {Function}
     */
    function spread(callback) {
      return function wrap(arr) {
        return callback.apply(null, arr);
      };
    }

    /**
     * Determines whether the payload is an error thrown by Axios
     *
     * @param {*} payload The value to test
     *
     * @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
     */
    function isAxiosError(payload) {
      return utils$1.isObject(payload) && (payload.isAxiosError === true);
    }

    const HttpStatusCode = {
      Continue: 100,
      SwitchingProtocols: 101,
      Processing: 102,
      EarlyHints: 103,
      Ok: 200,
      Created: 201,
      Accepted: 202,
      NonAuthoritativeInformation: 203,
      NoContent: 204,
      ResetContent: 205,
      PartialContent: 206,
      MultiStatus: 207,
      AlreadyReported: 208,
      ImUsed: 226,
      MultipleChoices: 300,
      MovedPermanently: 301,
      Found: 302,
      SeeOther: 303,
      NotModified: 304,
      UseProxy: 305,
      Unused: 306,
      TemporaryRedirect: 307,
      PermanentRedirect: 308,
      BadRequest: 400,
      Unauthorized: 401,
      PaymentRequired: 402,
      Forbidden: 403,
      NotFound: 404,
      MethodNotAllowed: 405,
      NotAcceptable: 406,
      ProxyAuthenticationRequired: 407,
      RequestTimeout: 408,
      Conflict: 409,
      Gone: 410,
      LengthRequired: 411,
      PreconditionFailed: 412,
      PayloadTooLarge: 413,
      UriTooLong: 414,
      UnsupportedMediaType: 415,
      RangeNotSatisfiable: 416,
      ExpectationFailed: 417,
      ImATeapot: 418,
      MisdirectedRequest: 421,
      UnprocessableEntity: 422,
      Locked: 423,
      FailedDependency: 424,
      TooEarly: 425,
      UpgradeRequired: 426,
      PreconditionRequired: 428,
      TooManyRequests: 429,
      RequestHeaderFieldsTooLarge: 431,
      UnavailableForLegalReasons: 451,
      InternalServerError: 500,
      NotImplemented: 501,
      BadGateway: 502,
      ServiceUnavailable: 503,
      GatewayTimeout: 504,
      HttpVersionNotSupported: 505,
      VariantAlsoNegotiates: 506,
      InsufficientStorage: 507,
      LoopDetected: 508,
      NotExtended: 510,
      NetworkAuthenticationRequired: 511,
    };

    Object.entries(HttpStatusCode).forEach(([key, value]) => {
      HttpStatusCode[value] = key;
    });

    var HttpStatusCode$1 = HttpStatusCode;

    /**
     * Create an instance of Axios
     *
     * @param {Object} defaultConfig The default config for the instance
     *
     * @returns {Axios} A new instance of Axios
     */
    function createInstance(defaultConfig) {
      const context = new Axios$1(defaultConfig);
      const instance = bind(Axios$1.prototype.request, context);

      // Copy axios.prototype to instance
      utils$1.extend(instance, Axios$1.prototype, context, {allOwnKeys: true});

      // Copy context to instance
      utils$1.extend(instance, context, null, {allOwnKeys: true});

      // Factory for creating new instances
      instance.create = function create(instanceConfig) {
        return createInstance(mergeConfig(defaultConfig, instanceConfig));
      };

      return instance;
    }

    // Create the default instance to be exported
    const axios = createInstance(defaults$1);

    // Expose Axios class to allow class inheritance
    axios.Axios = Axios$1;

    // Expose Cancel & CancelToken
    axios.CanceledError = CanceledError;
    axios.CancelToken = CancelToken$1;
    axios.isCancel = isCancel;
    axios.VERSION = VERSION;
    axios.toFormData = toFormData;

    // Expose AxiosError class
    axios.AxiosError = AxiosError;

    // alias for CanceledError for backward compatibility
    axios.Cancel = axios.CanceledError;

    // Expose all/spread
    axios.all = function all(promises) {
      return Promise.all(promises);
    };

    axios.spread = spread;

    // Expose isAxiosError
    axios.isAxiosError = isAxiosError;

    // Expose mergeConfig
    axios.mergeConfig = mergeConfig;

    axios.AxiosHeaders = AxiosHeaders$1;

    axios.formToJSON = thing => formDataToJSON(utils$1.isHTMLForm(thing) ? new FormData(thing) : thing);

    axios.getAdapter = adapters.getAdapter;

    axios.HttpStatusCode = HttpStatusCode$1;

    axios.default = axios;

    // this module should only have a default export
    var axios$1 = axios;

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

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function getDefaultExportFromCjs (x) {
    	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
    }

    function getAugmentedNamespace(n) {
      if (n.__esModule) return n;
      var f = n.default;
    	if (typeof f == "function") {
    		var a = function a () {
    			if (this instanceof a) {
            return Reflect.construct(f, arguments, this.constructor);
    			}
    			return f.apply(this, arguments);
    		};
    		a.prototype = f.prototype;
      } else a = {};
      Object.defineProperty(a, '__esModule', {value: true});
    	Object.keys(n).forEach(function (k) {
    		var d = Object.getOwnPropertyDescriptor(n, k);
    		Object.defineProperty(a, k, d.get ? d : {
    			enumerable: true,
    			get: function () {
    				return n[k];
    			}
    		});
    	});
    	return a;
    }

    var cryptoJs = {exports: {}};

    function commonjsRequire(path) {
    	throw new Error('Could not dynamically require "' + path + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
    }

    var core = {exports: {}};

    var _nodeResolve_empty = {};

    var _nodeResolve_empty$1 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        default: _nodeResolve_empty
    });

    var require$$0 = /*@__PURE__*/getAugmentedNamespace(_nodeResolve_empty$1);

    var hasRequiredCore;

    function requireCore () {
    	if (hasRequiredCore) return core.exports;
    	hasRequiredCore = 1;
    	(function (module, exports) {
    (function (root, factory) {
    			{
    				// CommonJS
    				module.exports = factory();
    			}
    		}(commonjsGlobal, function () {

    			/*globals window, global, require*/

    			/**
    			 * CryptoJS core components.
    			 */
    			var CryptoJS = CryptoJS || (function (Math, undefined$1) {

    			    var crypto;

    			    // Native crypto from window (Browser)
    			    if (typeof window !== 'undefined' && window.crypto) {
    			        crypto = window.crypto;
    			    }

    			    // Native crypto in web worker (Browser)
    			    if (typeof self !== 'undefined' && self.crypto) {
    			        crypto = self.crypto;
    			    }

    			    // Native crypto from worker
    			    if (typeof globalThis !== 'undefined' && globalThis.crypto) {
    			        crypto = globalThis.crypto;
    			    }

    			    // Native (experimental IE 11) crypto from window (Browser)
    			    if (!crypto && typeof window !== 'undefined' && window.msCrypto) {
    			        crypto = window.msCrypto;
    			    }

    			    // Native crypto from global (NodeJS)
    			    if (!crypto && typeof commonjsGlobal !== 'undefined' && commonjsGlobal.crypto) {
    			        crypto = commonjsGlobal.crypto;
    			    }

    			    // Native crypto import via require (NodeJS)
    			    if (!crypto && typeof commonjsRequire === 'function') {
    			        try {
    			            crypto = require$$0;
    			        } catch (err) {}
    			    }

    			    /*
    			     * Cryptographically secure pseudorandom number generator
    			     *
    			     * As Math.random() is cryptographically not safe to use
    			     */
    			    var cryptoSecureRandomInt = function () {
    			        if (crypto) {
    			            // Use getRandomValues method (Browser)
    			            if (typeof crypto.getRandomValues === 'function') {
    			                try {
    			                    return crypto.getRandomValues(new Uint32Array(1))[0];
    			                } catch (err) {}
    			            }

    			            // Use randomBytes method (NodeJS)
    			            if (typeof crypto.randomBytes === 'function') {
    			                try {
    			                    return crypto.randomBytes(4).readInt32LE();
    			                } catch (err) {}
    			            }
    			        }

    			        throw new Error('Native crypto module could not be used to get secure random number.');
    			    };

    			    /*
    			     * Local polyfill of Object.create

    			     */
    			    var create = Object.create || (function () {
    			        function F() {}

    			        return function (obj) {
    			            var subtype;

    			            F.prototype = obj;

    			            subtype = new F();

    			            F.prototype = null;

    			            return subtype;
    			        };
    			    }());

    			    /**
    			     * CryptoJS namespace.
    			     */
    			    var C = {};

    			    /**
    			     * Library namespace.
    			     */
    			    var C_lib = C.lib = {};

    			    /**
    			     * Base object for prototypal inheritance.
    			     */
    			    var Base = C_lib.Base = (function () {


    			        return {
    			            /**
    			             * Creates a new object that inherits from this object.
    			             *
    			             * @param {Object} overrides Properties to copy into the new object.
    			             *
    			             * @return {Object} The new object.
    			             *
    			             * @static
    			             *
    			             * @example
    			             *
    			             *     var MyType = CryptoJS.lib.Base.extend({
    			             *         field: 'value',
    			             *
    			             *         method: function () {
    			             *         }
    			             *     });
    			             */
    			            extend: function (overrides) {
    			                // Spawn
    			                var subtype = create(this);

    			                // Augment
    			                if (overrides) {
    			                    subtype.mixIn(overrides);
    			                }

    			                // Create default initializer
    			                if (!subtype.hasOwnProperty('init') || this.init === subtype.init) {
    			                    subtype.init = function () {
    			                        subtype.$super.init.apply(this, arguments);
    			                    };
    			                }

    			                // Initializer's prototype is the subtype object
    			                subtype.init.prototype = subtype;

    			                // Reference supertype
    			                subtype.$super = this;

    			                return subtype;
    			            },

    			            /**
    			             * Extends this object and runs the init method.
    			             * Arguments to create() will be passed to init().
    			             *
    			             * @return {Object} The new object.
    			             *
    			             * @static
    			             *
    			             * @example
    			             *
    			             *     var instance = MyType.create();
    			             */
    			            create: function () {
    			                var instance = this.extend();
    			                instance.init.apply(instance, arguments);

    			                return instance;
    			            },

    			            /**
    			             * Initializes a newly created object.
    			             * Override this method to add some logic when your objects are created.
    			             *
    			             * @example
    			             *
    			             *     var MyType = CryptoJS.lib.Base.extend({
    			             *         init: function () {
    			             *             // ...
    			             *         }
    			             *     });
    			             */
    			            init: function () {
    			            },

    			            /**
    			             * Copies properties into this object.
    			             *
    			             * @param {Object} properties The properties to mix in.
    			             *
    			             * @example
    			             *
    			             *     MyType.mixIn({
    			             *         field: 'value'
    			             *     });
    			             */
    			            mixIn: function (properties) {
    			                for (var propertyName in properties) {
    			                    if (properties.hasOwnProperty(propertyName)) {
    			                        this[propertyName] = properties[propertyName];
    			                    }
    			                }

    			                // IE won't copy toString using the loop above
    			                if (properties.hasOwnProperty('toString')) {
    			                    this.toString = properties.toString;
    			                }
    			            },

    			            /**
    			             * Creates a copy of this object.
    			             *
    			             * @return {Object} The clone.
    			             *
    			             * @example
    			             *
    			             *     var clone = instance.clone();
    			             */
    			            clone: function () {
    			                return this.init.prototype.extend(this);
    			            }
    			        };
    			    }());

    			    /**
    			     * An array of 32-bit words.
    			     *
    			     * @property {Array} words The array of 32-bit words.
    			     * @property {number} sigBytes The number of significant bytes in this word array.
    			     */
    			    var WordArray = C_lib.WordArray = Base.extend({
    			        /**
    			         * Initializes a newly created word array.
    			         *
    			         * @param {Array} words (Optional) An array of 32-bit words.
    			         * @param {number} sigBytes (Optional) The number of significant bytes in the words.
    			         *
    			         * @example
    			         *
    			         *     var wordArray = CryptoJS.lib.WordArray.create();
    			         *     var wordArray = CryptoJS.lib.WordArray.create([0x00010203, 0x04050607]);
    			         *     var wordArray = CryptoJS.lib.WordArray.create([0x00010203, 0x04050607], 6);
    			         */
    			        init: function (words, sigBytes) {
    			            words = this.words = words || [];

    			            if (sigBytes != undefined$1) {
    			                this.sigBytes = sigBytes;
    			            } else {
    			                this.sigBytes = words.length * 4;
    			            }
    			        },

    			        /**
    			         * Converts this word array to a string.
    			         *
    			         * @param {Encoder} encoder (Optional) The encoding strategy to use. Default: CryptoJS.enc.Hex
    			         *
    			         * @return {string} The stringified word array.
    			         *
    			         * @example
    			         *
    			         *     var string = wordArray + '';
    			         *     var string = wordArray.toString();
    			         *     var string = wordArray.toString(CryptoJS.enc.Utf8);
    			         */
    			        toString: function (encoder) {
    			            return (encoder || Hex).stringify(this);
    			        },

    			        /**
    			         * Concatenates a word array to this word array.
    			         *
    			         * @param {WordArray} wordArray The word array to append.
    			         *
    			         * @return {WordArray} This word array.
    			         *
    			         * @example
    			         *
    			         *     wordArray1.concat(wordArray2);
    			         */
    			        concat: function (wordArray) {
    			            // Shortcuts
    			            var thisWords = this.words;
    			            var thatWords = wordArray.words;
    			            var thisSigBytes = this.sigBytes;
    			            var thatSigBytes = wordArray.sigBytes;

    			            // Clamp excess bits
    			            this.clamp();

    			            // Concat
    			            if (thisSigBytes % 4) {
    			                // Copy one byte at a time
    			                for (var i = 0; i < thatSigBytes; i++) {
    			                    var thatByte = (thatWords[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
    			                    thisWords[(thisSigBytes + i) >>> 2] |= thatByte << (24 - ((thisSigBytes + i) % 4) * 8);
    			                }
    			            } else {
    			                // Copy one word at a time
    			                for (var j = 0; j < thatSigBytes; j += 4) {
    			                    thisWords[(thisSigBytes + j) >>> 2] = thatWords[j >>> 2];
    			                }
    			            }
    			            this.sigBytes += thatSigBytes;

    			            // Chainable
    			            return this;
    			        },

    			        /**
    			         * Removes insignificant bits.
    			         *
    			         * @example
    			         *
    			         *     wordArray.clamp();
    			         */
    			        clamp: function () {
    			            // Shortcuts
    			            var words = this.words;
    			            var sigBytes = this.sigBytes;

    			            // Clamp
    			            words[sigBytes >>> 2] &= 0xffffffff << (32 - (sigBytes % 4) * 8);
    			            words.length = Math.ceil(sigBytes / 4);
    			        },

    			        /**
    			         * Creates a copy of this word array.
    			         *
    			         * @return {WordArray} The clone.
    			         *
    			         * @example
    			         *
    			         *     var clone = wordArray.clone();
    			         */
    			        clone: function () {
    			            var clone = Base.clone.call(this);
    			            clone.words = this.words.slice(0);

    			            return clone;
    			        },

    			        /**
    			         * Creates a word array filled with random bytes.
    			         *
    			         * @param {number} nBytes The number of random bytes to generate.
    			         *
    			         * @return {WordArray} The random word array.
    			         *
    			         * @static
    			         *
    			         * @example
    			         *
    			         *     var wordArray = CryptoJS.lib.WordArray.random(16);
    			         */
    			        random: function (nBytes) {
    			            var words = [];

    			            for (var i = 0; i < nBytes; i += 4) {
    			                words.push(cryptoSecureRandomInt());
    			            }

    			            return new WordArray.init(words, nBytes);
    			        }
    			    });

    			    /**
    			     * Encoder namespace.
    			     */
    			    var C_enc = C.enc = {};

    			    /**
    			     * Hex encoding strategy.
    			     */
    			    var Hex = C_enc.Hex = {
    			        /**
    			         * Converts a word array to a hex string.
    			         *
    			         * @param {WordArray} wordArray The word array.
    			         *
    			         * @return {string} The hex string.
    			         *
    			         * @static
    			         *
    			         * @example
    			         *
    			         *     var hexString = CryptoJS.enc.Hex.stringify(wordArray);
    			         */
    			        stringify: function (wordArray) {
    			            // Shortcuts
    			            var words = wordArray.words;
    			            var sigBytes = wordArray.sigBytes;

    			            // Convert
    			            var hexChars = [];
    			            for (var i = 0; i < sigBytes; i++) {
    			                var bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
    			                hexChars.push((bite >>> 4).toString(16));
    			                hexChars.push((bite & 0x0f).toString(16));
    			            }

    			            return hexChars.join('');
    			        },

    			        /**
    			         * Converts a hex string to a word array.
    			         *
    			         * @param {string} hexStr The hex string.
    			         *
    			         * @return {WordArray} The word array.
    			         *
    			         * @static
    			         *
    			         * @example
    			         *
    			         *     var wordArray = CryptoJS.enc.Hex.parse(hexString);
    			         */
    			        parse: function (hexStr) {
    			            // Shortcut
    			            var hexStrLength = hexStr.length;

    			            // Convert
    			            var words = [];
    			            for (var i = 0; i < hexStrLength; i += 2) {
    			                words[i >>> 3] |= parseInt(hexStr.substr(i, 2), 16) << (24 - (i % 8) * 4);
    			            }

    			            return new WordArray.init(words, hexStrLength / 2);
    			        }
    			    };

    			    /**
    			     * Latin1 encoding strategy.
    			     */
    			    var Latin1 = C_enc.Latin1 = {
    			        /**
    			         * Converts a word array to a Latin1 string.
    			         *
    			         * @param {WordArray} wordArray The word array.
    			         *
    			         * @return {string} The Latin1 string.
    			         *
    			         * @static
    			         *
    			         * @example
    			         *
    			         *     var latin1String = CryptoJS.enc.Latin1.stringify(wordArray);
    			         */
    			        stringify: function (wordArray) {
    			            // Shortcuts
    			            var words = wordArray.words;
    			            var sigBytes = wordArray.sigBytes;

    			            // Convert
    			            var latin1Chars = [];
    			            for (var i = 0; i < sigBytes; i++) {
    			                var bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
    			                latin1Chars.push(String.fromCharCode(bite));
    			            }

    			            return latin1Chars.join('');
    			        },

    			        /**
    			         * Converts a Latin1 string to a word array.
    			         *
    			         * @param {string} latin1Str The Latin1 string.
    			         *
    			         * @return {WordArray} The word array.
    			         *
    			         * @static
    			         *
    			         * @example
    			         *
    			         *     var wordArray = CryptoJS.enc.Latin1.parse(latin1String);
    			         */
    			        parse: function (latin1Str) {
    			            // Shortcut
    			            var latin1StrLength = latin1Str.length;

    			            // Convert
    			            var words = [];
    			            for (var i = 0; i < latin1StrLength; i++) {
    			                words[i >>> 2] |= (latin1Str.charCodeAt(i) & 0xff) << (24 - (i % 4) * 8);
    			            }

    			            return new WordArray.init(words, latin1StrLength);
    			        }
    			    };

    			    /**
    			     * UTF-8 encoding strategy.
    			     */
    			    var Utf8 = C_enc.Utf8 = {
    			        /**
    			         * Converts a word array to a UTF-8 string.
    			         *
    			         * @param {WordArray} wordArray The word array.
    			         *
    			         * @return {string} The UTF-8 string.
    			         *
    			         * @static
    			         *
    			         * @example
    			         *
    			         *     var utf8String = CryptoJS.enc.Utf8.stringify(wordArray);
    			         */
    			        stringify: function (wordArray) {
    			            try {
    			                return decodeURIComponent(escape(Latin1.stringify(wordArray)));
    			            } catch (e) {
    			                throw new Error('Malformed UTF-8 data');
    			            }
    			        },

    			        /**
    			         * Converts a UTF-8 string to a word array.
    			         *
    			         * @param {string} utf8Str The UTF-8 string.
    			         *
    			         * @return {WordArray} The word array.
    			         *
    			         * @static
    			         *
    			         * @example
    			         *
    			         *     var wordArray = CryptoJS.enc.Utf8.parse(utf8String);
    			         */
    			        parse: function (utf8Str) {
    			            return Latin1.parse(unescape(encodeURIComponent(utf8Str)));
    			        }
    			    };

    			    /**
    			     * Abstract buffered block algorithm template.
    			     *
    			     * The property blockSize must be implemented in a concrete subtype.
    			     *
    			     * @property {number} _minBufferSize The number of blocks that should be kept unprocessed in the buffer. Default: 0
    			     */
    			    var BufferedBlockAlgorithm = C_lib.BufferedBlockAlgorithm = Base.extend({
    			        /**
    			         * Resets this block algorithm's data buffer to its initial state.
    			         *
    			         * @example
    			         *
    			         *     bufferedBlockAlgorithm.reset();
    			         */
    			        reset: function () {
    			            // Initial values
    			            this._data = new WordArray.init();
    			            this._nDataBytes = 0;
    			        },

    			        /**
    			         * Adds new data to this block algorithm's buffer.
    			         *
    			         * @param {WordArray|string} data The data to append. Strings are converted to a WordArray using UTF-8.
    			         *
    			         * @example
    			         *
    			         *     bufferedBlockAlgorithm._append('data');
    			         *     bufferedBlockAlgorithm._append(wordArray);
    			         */
    			        _append: function (data) {
    			            // Convert string to WordArray, else assume WordArray already
    			            if (typeof data == 'string') {
    			                data = Utf8.parse(data);
    			            }

    			            // Append
    			            this._data.concat(data);
    			            this._nDataBytes += data.sigBytes;
    			        },

    			        /**
    			         * Processes available data blocks.
    			         *
    			         * This method invokes _doProcessBlock(offset), which must be implemented by a concrete subtype.
    			         *
    			         * @param {boolean} doFlush Whether all blocks and partial blocks should be processed.
    			         *
    			         * @return {WordArray} The processed data.
    			         *
    			         * @example
    			         *
    			         *     var processedData = bufferedBlockAlgorithm._process();
    			         *     var processedData = bufferedBlockAlgorithm._process(!!'flush');
    			         */
    			        _process: function (doFlush) {
    			            var processedWords;

    			            // Shortcuts
    			            var data = this._data;
    			            var dataWords = data.words;
    			            var dataSigBytes = data.sigBytes;
    			            var blockSize = this.blockSize;
    			            var blockSizeBytes = blockSize * 4;

    			            // Count blocks ready
    			            var nBlocksReady = dataSigBytes / blockSizeBytes;
    			            if (doFlush) {
    			                // Round up to include partial blocks
    			                nBlocksReady = Math.ceil(nBlocksReady);
    			            } else {
    			                // Round down to include only full blocks,
    			                // less the number of blocks that must remain in the buffer
    			                nBlocksReady = Math.max((nBlocksReady | 0) - this._minBufferSize, 0);
    			            }

    			            // Count words ready
    			            var nWordsReady = nBlocksReady * blockSize;

    			            // Count bytes ready
    			            var nBytesReady = Math.min(nWordsReady * 4, dataSigBytes);

    			            // Process blocks
    			            if (nWordsReady) {
    			                for (var offset = 0; offset < nWordsReady; offset += blockSize) {
    			                    // Perform concrete-algorithm logic
    			                    this._doProcessBlock(dataWords, offset);
    			                }

    			                // Remove processed words
    			                processedWords = dataWords.splice(0, nWordsReady);
    			                data.sigBytes -= nBytesReady;
    			            }

    			            // Return processed words
    			            return new WordArray.init(processedWords, nBytesReady);
    			        },

    			        /**
    			         * Creates a copy of this object.
    			         *
    			         * @return {Object} The clone.
    			         *
    			         * @example
    			         *
    			         *     var clone = bufferedBlockAlgorithm.clone();
    			         */
    			        clone: function () {
    			            var clone = Base.clone.call(this);
    			            clone._data = this._data.clone();

    			            return clone;
    			        },

    			        _minBufferSize: 0
    			    });

    			    /**
    			     * Abstract hasher template.
    			     *
    			     * @property {number} blockSize The number of 32-bit words this hasher operates on. Default: 16 (512 bits)
    			     */
    			    C_lib.Hasher = BufferedBlockAlgorithm.extend({
    			        /**
    			         * Configuration options.
    			         */
    			        cfg: Base.extend(),

    			        /**
    			         * Initializes a newly created hasher.
    			         *
    			         * @param {Object} cfg (Optional) The configuration options to use for this hash computation.
    			         *
    			         * @example
    			         *
    			         *     var hasher = CryptoJS.algo.SHA256.create();
    			         */
    			        init: function (cfg) {
    			            // Apply config defaults
    			            this.cfg = this.cfg.extend(cfg);

    			            // Set initial values
    			            this.reset();
    			        },

    			        /**
    			         * Resets this hasher to its initial state.
    			         *
    			         * @example
    			         *
    			         *     hasher.reset();
    			         */
    			        reset: function () {
    			            // Reset data buffer
    			            BufferedBlockAlgorithm.reset.call(this);

    			            // Perform concrete-hasher logic
    			            this._doReset();
    			        },

    			        /**
    			         * Updates this hasher with a message.
    			         *
    			         * @param {WordArray|string} messageUpdate The message to append.
    			         *
    			         * @return {Hasher} This hasher.
    			         *
    			         * @example
    			         *
    			         *     hasher.update('message');
    			         *     hasher.update(wordArray);
    			         */
    			        update: function (messageUpdate) {
    			            // Append
    			            this._append(messageUpdate);

    			            // Update the hash
    			            this._process();

    			            // Chainable
    			            return this;
    			        },

    			        /**
    			         * Finalizes the hash computation.
    			         * Note that the finalize operation is effectively a destructive, read-once operation.
    			         *
    			         * @param {WordArray|string} messageUpdate (Optional) A final message update.
    			         *
    			         * @return {WordArray} The hash.
    			         *
    			         * @example
    			         *
    			         *     var hash = hasher.finalize();
    			         *     var hash = hasher.finalize('message');
    			         *     var hash = hasher.finalize(wordArray);
    			         */
    			        finalize: function (messageUpdate) {
    			            // Final message update
    			            if (messageUpdate) {
    			                this._append(messageUpdate);
    			            }

    			            // Perform concrete-hasher logic
    			            var hash = this._doFinalize();

    			            return hash;
    			        },

    			        blockSize: 512/32,

    			        /**
    			         * Creates a shortcut function to a hasher's object interface.
    			         *
    			         * @param {Hasher} hasher The hasher to create a helper for.
    			         *
    			         * @return {Function} The shortcut function.
    			         *
    			         * @static
    			         *
    			         * @example
    			         *
    			         *     var SHA256 = CryptoJS.lib.Hasher._createHelper(CryptoJS.algo.SHA256);
    			         */
    			        _createHelper: function (hasher) {
    			            return function (message, cfg) {
    			                return new hasher.init(cfg).finalize(message);
    			            };
    			        },

    			        /**
    			         * Creates a shortcut function to the HMAC's object interface.
    			         *
    			         * @param {Hasher} hasher The hasher to use in this HMAC helper.
    			         *
    			         * @return {Function} The shortcut function.
    			         *
    			         * @static
    			         *
    			         * @example
    			         *
    			         *     var HmacSHA256 = CryptoJS.lib.Hasher._createHmacHelper(CryptoJS.algo.SHA256);
    			         */
    			        _createHmacHelper: function (hasher) {
    			            return function (message, key) {
    			                return new C_algo.HMAC.init(hasher, key).finalize(message);
    			            };
    			        }
    			    });

    			    /**
    			     * Algorithm namespace.
    			     */
    			    var C_algo = C.algo = {};

    			    return C;
    			}(Math));


    			return CryptoJS;

    		})); 
    	} (core));
    	return core.exports;
    }

    var x64Core = {exports: {}};

    var hasRequiredX64Core;

    function requireX64Core () {
    	if (hasRequiredX64Core) return x64Core.exports;
    	hasRequiredX64Core = 1;
    	(function (module, exports) {
    (function (root, factory) {
    			{
    				// CommonJS
    				module.exports = factory(requireCore());
    			}
    		}(commonjsGlobal, function (CryptoJS) {

    			(function (undefined$1) {
    			    // Shortcuts
    			    var C = CryptoJS;
    			    var C_lib = C.lib;
    			    var Base = C_lib.Base;
    			    var X32WordArray = C_lib.WordArray;

    			    /**
    			     * x64 namespace.
    			     */
    			    var C_x64 = C.x64 = {};

    			    /**
    			     * A 64-bit word.
    			     */
    			    C_x64.Word = Base.extend({
    			        /**
    			         * Initializes a newly created 64-bit word.
    			         *
    			         * @param {number} high The high 32 bits.
    			         * @param {number} low The low 32 bits.
    			         *
    			         * @example
    			         *
    			         *     var x64Word = CryptoJS.x64.Word.create(0x00010203, 0x04050607);
    			         */
    			        init: function (high, low) {
    			            this.high = high;
    			            this.low = low;
    			        }

    			        /**
    			         * Bitwise NOTs this word.
    			         *
    			         * @return {X64Word} A new x64-Word object after negating.
    			         *
    			         * @example
    			         *
    			         *     var negated = x64Word.not();
    			         */
    			        // not: function () {
    			            // var high = ~this.high;
    			            // var low = ~this.low;

    			            // return X64Word.create(high, low);
    			        // },

    			        /**
    			         * Bitwise ANDs this word with the passed word.
    			         *
    			         * @param {X64Word} word The x64-Word to AND with this word.
    			         *
    			         * @return {X64Word} A new x64-Word object after ANDing.
    			         *
    			         * @example
    			         *
    			         *     var anded = x64Word.and(anotherX64Word);
    			         */
    			        // and: function (word) {
    			            // var high = this.high & word.high;
    			            // var low = this.low & word.low;

    			            // return X64Word.create(high, low);
    			        // },

    			        /**
    			         * Bitwise ORs this word with the passed word.
    			         *
    			         * @param {X64Word} word The x64-Word to OR with this word.
    			         *
    			         * @return {X64Word} A new x64-Word object after ORing.
    			         *
    			         * @example
    			         *
    			         *     var ored = x64Word.or(anotherX64Word);
    			         */
    			        // or: function (word) {
    			            // var high = this.high | word.high;
    			            // var low = this.low | word.low;

    			            // return X64Word.create(high, low);
    			        // },

    			        /**
    			         * Bitwise XORs this word with the passed word.
    			         *
    			         * @param {X64Word} word The x64-Word to XOR with this word.
    			         *
    			         * @return {X64Word} A new x64-Word object after XORing.
    			         *
    			         * @example
    			         *
    			         *     var xored = x64Word.xor(anotherX64Word);
    			         */
    			        // xor: function (word) {
    			            // var high = this.high ^ word.high;
    			            // var low = this.low ^ word.low;

    			            // return X64Word.create(high, low);
    			        // },

    			        /**
    			         * Shifts this word n bits to the left.
    			         *
    			         * @param {number} n The number of bits to shift.
    			         *
    			         * @return {X64Word} A new x64-Word object after shifting.
    			         *
    			         * @example
    			         *
    			         *     var shifted = x64Word.shiftL(25);
    			         */
    			        // shiftL: function (n) {
    			            // if (n < 32) {
    			                // var high = (this.high << n) | (this.low >>> (32 - n));
    			                // var low = this.low << n;
    			            // } else {
    			                // var high = this.low << (n - 32);
    			                // var low = 0;
    			            // }

    			            // return X64Word.create(high, low);
    			        // },

    			        /**
    			         * Shifts this word n bits to the right.
    			         *
    			         * @param {number} n The number of bits to shift.
    			         *
    			         * @return {X64Word} A new x64-Word object after shifting.
    			         *
    			         * @example
    			         *
    			         *     var shifted = x64Word.shiftR(7);
    			         */
    			        // shiftR: function (n) {
    			            // if (n < 32) {
    			                // var low = (this.low >>> n) | (this.high << (32 - n));
    			                // var high = this.high >>> n;
    			            // } else {
    			                // var low = this.high >>> (n - 32);
    			                // var high = 0;
    			            // }

    			            // return X64Word.create(high, low);
    			        // },

    			        /**
    			         * Rotates this word n bits to the left.
    			         *
    			         * @param {number} n The number of bits to rotate.
    			         *
    			         * @return {X64Word} A new x64-Word object after rotating.
    			         *
    			         * @example
    			         *
    			         *     var rotated = x64Word.rotL(25);
    			         */
    			        // rotL: function (n) {
    			            // return this.shiftL(n).or(this.shiftR(64 - n));
    			        // },

    			        /**
    			         * Rotates this word n bits to the right.
    			         *
    			         * @param {number} n The number of bits to rotate.
    			         *
    			         * @return {X64Word} A new x64-Word object after rotating.
    			         *
    			         * @example
    			         *
    			         *     var rotated = x64Word.rotR(7);
    			         */
    			        // rotR: function (n) {
    			            // return this.shiftR(n).or(this.shiftL(64 - n));
    			        // },

    			        /**
    			         * Adds this word with the passed word.
    			         *
    			         * @param {X64Word} word The x64-Word to add with this word.
    			         *
    			         * @return {X64Word} A new x64-Word object after adding.
    			         *
    			         * @example
    			         *
    			         *     var added = x64Word.add(anotherX64Word);
    			         */
    			        // add: function (word) {
    			            // var low = (this.low + word.low) | 0;
    			            // var carry = (low >>> 0) < (this.low >>> 0) ? 1 : 0;
    			            // var high = (this.high + word.high + carry) | 0;

    			            // return X64Word.create(high, low);
    			        // }
    			    });

    			    /**
    			     * An array of 64-bit words.
    			     *
    			     * @property {Array} words The array of CryptoJS.x64.Word objects.
    			     * @property {number} sigBytes The number of significant bytes in this word array.
    			     */
    			    C_x64.WordArray = Base.extend({
    			        /**
    			         * Initializes a newly created word array.
    			         *
    			         * @param {Array} words (Optional) An array of CryptoJS.x64.Word objects.
    			         * @param {number} sigBytes (Optional) The number of significant bytes in the words.
    			         *
    			         * @example
    			         *
    			         *     var wordArray = CryptoJS.x64.WordArray.create();
    			         *
    			         *     var wordArray = CryptoJS.x64.WordArray.create([
    			         *         CryptoJS.x64.Word.create(0x00010203, 0x04050607),
    			         *         CryptoJS.x64.Word.create(0x18191a1b, 0x1c1d1e1f)
    			         *     ]);
    			         *
    			         *     var wordArray = CryptoJS.x64.WordArray.create([
    			         *         CryptoJS.x64.Word.create(0x00010203, 0x04050607),
    			         *         CryptoJS.x64.Word.create(0x18191a1b, 0x1c1d1e1f)
    			         *     ], 10);
    			         */
    			        init: function (words, sigBytes) {
    			            words = this.words = words || [];

    			            if (sigBytes != undefined$1) {
    			                this.sigBytes = sigBytes;
    			            } else {
    			                this.sigBytes = words.length * 8;
    			            }
    			        },

    			        /**
    			         * Converts this 64-bit word array to a 32-bit word array.
    			         *
    			         * @return {CryptoJS.lib.WordArray} This word array's data as a 32-bit word array.
    			         *
    			         * @example
    			         *
    			         *     var x32WordArray = x64WordArray.toX32();
    			         */
    			        toX32: function () {
    			            // Shortcuts
    			            var x64Words = this.words;
    			            var x64WordsLength = x64Words.length;

    			            // Convert
    			            var x32Words = [];
    			            for (var i = 0; i < x64WordsLength; i++) {
    			                var x64Word = x64Words[i];
    			                x32Words.push(x64Word.high);
    			                x32Words.push(x64Word.low);
    			            }

    			            return X32WordArray.create(x32Words, this.sigBytes);
    			        },

    			        /**
    			         * Creates a copy of this word array.
    			         *
    			         * @return {X64WordArray} The clone.
    			         *
    			         * @example
    			         *
    			         *     var clone = x64WordArray.clone();
    			         */
    			        clone: function () {
    			            var clone = Base.clone.call(this);

    			            // Clone "words" array
    			            var words = clone.words = this.words.slice(0);

    			            // Clone each X64Word object
    			            var wordsLength = words.length;
    			            for (var i = 0; i < wordsLength; i++) {
    			                words[i] = words[i].clone();
    			            }

    			            return clone;
    			        }
    			    });
    			}());


    			return CryptoJS;

    		})); 
    	} (x64Core));
    	return x64Core.exports;
    }

    var libTypedarrays = {exports: {}};

    var hasRequiredLibTypedarrays;

    function requireLibTypedarrays () {
    	if (hasRequiredLibTypedarrays) return libTypedarrays.exports;
    	hasRequiredLibTypedarrays = 1;
    	(function (module, exports) {
    (function (root, factory) {
    			{
    				// CommonJS
    				module.exports = factory(requireCore());
    			}
    		}(commonjsGlobal, function (CryptoJS) {

    			(function () {
    			    // Check if typed arrays are supported
    			    if (typeof ArrayBuffer != 'function') {
    			        return;
    			    }

    			    // Shortcuts
    			    var C = CryptoJS;
    			    var C_lib = C.lib;
    			    var WordArray = C_lib.WordArray;

    			    // Reference original init
    			    var superInit = WordArray.init;

    			    // Augment WordArray.init to handle typed arrays
    			    var subInit = WordArray.init = function (typedArray) {
    			        // Convert buffers to uint8
    			        if (typedArray instanceof ArrayBuffer) {
    			            typedArray = new Uint8Array(typedArray);
    			        }

    			        // Convert other array views to uint8
    			        if (
    			            typedArray instanceof Int8Array ||
    			            (typeof Uint8ClampedArray !== "undefined" && typedArray instanceof Uint8ClampedArray) ||
    			            typedArray instanceof Int16Array ||
    			            typedArray instanceof Uint16Array ||
    			            typedArray instanceof Int32Array ||
    			            typedArray instanceof Uint32Array ||
    			            typedArray instanceof Float32Array ||
    			            typedArray instanceof Float64Array
    			        ) {
    			            typedArray = new Uint8Array(typedArray.buffer, typedArray.byteOffset, typedArray.byteLength);
    			        }

    			        // Handle Uint8Array
    			        if (typedArray instanceof Uint8Array) {
    			            // Shortcut
    			            var typedArrayByteLength = typedArray.byteLength;

    			            // Extract bytes
    			            var words = [];
    			            for (var i = 0; i < typedArrayByteLength; i++) {
    			                words[i >>> 2] |= typedArray[i] << (24 - (i % 4) * 8);
    			            }

    			            // Initialize this word array
    			            superInit.call(this, words, typedArrayByteLength);
    			        } else {
    			            // Else call normal init
    			            superInit.apply(this, arguments);
    			        }
    			    };

    			    subInit.prototype = WordArray;
    			}());


    			return CryptoJS.lib.WordArray;

    		})); 
    	} (libTypedarrays));
    	return libTypedarrays.exports;
    }

    var encUtf16 = {exports: {}};

    var hasRequiredEncUtf16;

    function requireEncUtf16 () {
    	if (hasRequiredEncUtf16) return encUtf16.exports;
    	hasRequiredEncUtf16 = 1;
    	(function (module, exports) {
    (function (root, factory) {
    			{
    				// CommonJS
    				module.exports = factory(requireCore());
    			}
    		}(commonjsGlobal, function (CryptoJS) {

    			(function () {
    			    // Shortcuts
    			    var C = CryptoJS;
    			    var C_lib = C.lib;
    			    var WordArray = C_lib.WordArray;
    			    var C_enc = C.enc;

    			    /**
    			     * UTF-16 BE encoding strategy.
    			     */
    			    C_enc.Utf16 = C_enc.Utf16BE = {
    			        /**
    			         * Converts a word array to a UTF-16 BE string.
    			         *
    			         * @param {WordArray} wordArray The word array.
    			         *
    			         * @return {string} The UTF-16 BE string.
    			         *
    			         * @static
    			         *
    			         * @example
    			         *
    			         *     var utf16String = CryptoJS.enc.Utf16.stringify(wordArray);
    			         */
    			        stringify: function (wordArray) {
    			            // Shortcuts
    			            var words = wordArray.words;
    			            var sigBytes = wordArray.sigBytes;

    			            // Convert
    			            var utf16Chars = [];
    			            for (var i = 0; i < sigBytes; i += 2) {
    			                var codePoint = (words[i >>> 2] >>> (16 - (i % 4) * 8)) & 0xffff;
    			                utf16Chars.push(String.fromCharCode(codePoint));
    			            }

    			            return utf16Chars.join('');
    			        },

    			        /**
    			         * Converts a UTF-16 BE string to a word array.
    			         *
    			         * @param {string} utf16Str The UTF-16 BE string.
    			         *
    			         * @return {WordArray} The word array.
    			         *
    			         * @static
    			         *
    			         * @example
    			         *
    			         *     var wordArray = CryptoJS.enc.Utf16.parse(utf16String);
    			         */
    			        parse: function (utf16Str) {
    			            // Shortcut
    			            var utf16StrLength = utf16Str.length;

    			            // Convert
    			            var words = [];
    			            for (var i = 0; i < utf16StrLength; i++) {
    			                words[i >>> 1] |= utf16Str.charCodeAt(i) << (16 - (i % 2) * 16);
    			            }

    			            return WordArray.create(words, utf16StrLength * 2);
    			        }
    			    };

    			    /**
    			     * UTF-16 LE encoding strategy.
    			     */
    			    C_enc.Utf16LE = {
    			        /**
    			         * Converts a word array to a UTF-16 LE string.
    			         *
    			         * @param {WordArray} wordArray The word array.
    			         *
    			         * @return {string} The UTF-16 LE string.
    			         *
    			         * @static
    			         *
    			         * @example
    			         *
    			         *     var utf16Str = CryptoJS.enc.Utf16LE.stringify(wordArray);
    			         */
    			        stringify: function (wordArray) {
    			            // Shortcuts
    			            var words = wordArray.words;
    			            var sigBytes = wordArray.sigBytes;

    			            // Convert
    			            var utf16Chars = [];
    			            for (var i = 0; i < sigBytes; i += 2) {
    			                var codePoint = swapEndian((words[i >>> 2] >>> (16 - (i % 4) * 8)) & 0xffff);
    			                utf16Chars.push(String.fromCharCode(codePoint));
    			            }

    			            return utf16Chars.join('');
    			        },

    			        /**
    			         * Converts a UTF-16 LE string to a word array.
    			         *
    			         * @param {string} utf16Str The UTF-16 LE string.
    			         *
    			         * @return {WordArray} The word array.
    			         *
    			         * @static
    			         *
    			         * @example
    			         *
    			         *     var wordArray = CryptoJS.enc.Utf16LE.parse(utf16Str);
    			         */
    			        parse: function (utf16Str) {
    			            // Shortcut
    			            var utf16StrLength = utf16Str.length;

    			            // Convert
    			            var words = [];
    			            for (var i = 0; i < utf16StrLength; i++) {
    			                words[i >>> 1] |= swapEndian(utf16Str.charCodeAt(i) << (16 - (i % 2) * 16));
    			            }

    			            return WordArray.create(words, utf16StrLength * 2);
    			        }
    			    };

    			    function swapEndian(word) {
    			        return ((word << 8) & 0xff00ff00) | ((word >>> 8) & 0x00ff00ff);
    			    }
    			}());


    			return CryptoJS.enc.Utf16;

    		})); 
    	} (encUtf16));
    	return encUtf16.exports;
    }

    var encBase64 = {exports: {}};

    var hasRequiredEncBase64;

    function requireEncBase64 () {
    	if (hasRequiredEncBase64) return encBase64.exports;
    	hasRequiredEncBase64 = 1;
    	(function (module, exports) {
    (function (root, factory) {
    			{
    				// CommonJS
    				module.exports = factory(requireCore());
    			}
    		}(commonjsGlobal, function (CryptoJS) {

    			(function () {
    			    // Shortcuts
    			    var C = CryptoJS;
    			    var C_lib = C.lib;
    			    var WordArray = C_lib.WordArray;
    			    var C_enc = C.enc;

    			    /**
    			     * Base64 encoding strategy.
    			     */
    			    C_enc.Base64 = {
    			        /**
    			         * Converts a word array to a Base64 string.
    			         *
    			         * @param {WordArray} wordArray The word array.
    			         *
    			         * @return {string} The Base64 string.
    			         *
    			         * @static
    			         *
    			         * @example
    			         *
    			         *     var base64String = CryptoJS.enc.Base64.stringify(wordArray);
    			         */
    			        stringify: function (wordArray) {
    			            // Shortcuts
    			            var words = wordArray.words;
    			            var sigBytes = wordArray.sigBytes;
    			            var map = this._map;

    			            // Clamp excess bits
    			            wordArray.clamp();

    			            // Convert
    			            var base64Chars = [];
    			            for (var i = 0; i < sigBytes; i += 3) {
    			                var byte1 = (words[i >>> 2]       >>> (24 - (i % 4) * 8))       & 0xff;
    			                var byte2 = (words[(i + 1) >>> 2] >>> (24 - ((i + 1) % 4) * 8)) & 0xff;
    			                var byte3 = (words[(i + 2) >>> 2] >>> (24 - ((i + 2) % 4) * 8)) & 0xff;

    			                var triplet = (byte1 << 16) | (byte2 << 8) | byte3;

    			                for (var j = 0; (j < 4) && (i + j * 0.75 < sigBytes); j++) {
    			                    base64Chars.push(map.charAt((triplet >>> (6 * (3 - j))) & 0x3f));
    			                }
    			            }

    			            // Add padding
    			            var paddingChar = map.charAt(64);
    			            if (paddingChar) {
    			                while (base64Chars.length % 4) {
    			                    base64Chars.push(paddingChar);
    			                }
    			            }

    			            return base64Chars.join('');
    			        },

    			        /**
    			         * Converts a Base64 string to a word array.
    			         *
    			         * @param {string} base64Str The Base64 string.
    			         *
    			         * @return {WordArray} The word array.
    			         *
    			         * @static
    			         *
    			         * @example
    			         *
    			         *     var wordArray = CryptoJS.enc.Base64.parse(base64String);
    			         */
    			        parse: function (base64Str) {
    			            // Shortcuts
    			            var base64StrLength = base64Str.length;
    			            var map = this._map;
    			            var reverseMap = this._reverseMap;

    			            if (!reverseMap) {
    			                    reverseMap = this._reverseMap = [];
    			                    for (var j = 0; j < map.length; j++) {
    			                        reverseMap[map.charCodeAt(j)] = j;
    			                    }
    			            }

    			            // Ignore padding
    			            var paddingChar = map.charAt(64);
    			            if (paddingChar) {
    			                var paddingIndex = base64Str.indexOf(paddingChar);
    			                if (paddingIndex !== -1) {
    			                    base64StrLength = paddingIndex;
    			                }
    			            }

    			            // Convert
    			            return parseLoop(base64Str, base64StrLength, reverseMap);

    			        },

    			        _map: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
    			    };

    			    function parseLoop(base64Str, base64StrLength, reverseMap) {
    			      var words = [];
    			      var nBytes = 0;
    			      for (var i = 0; i < base64StrLength; i++) {
    			          if (i % 4) {
    			              var bits1 = reverseMap[base64Str.charCodeAt(i - 1)] << ((i % 4) * 2);
    			              var bits2 = reverseMap[base64Str.charCodeAt(i)] >>> (6 - (i % 4) * 2);
    			              var bitsCombined = bits1 | bits2;
    			              words[nBytes >>> 2] |= bitsCombined << (24 - (nBytes % 4) * 8);
    			              nBytes++;
    			          }
    			      }
    			      return WordArray.create(words, nBytes);
    			    }
    			}());


    			return CryptoJS.enc.Base64;

    		})); 
    	} (encBase64));
    	return encBase64.exports;
    }

    var encBase64url = {exports: {}};

    var hasRequiredEncBase64url;

    function requireEncBase64url () {
    	if (hasRequiredEncBase64url) return encBase64url.exports;
    	hasRequiredEncBase64url = 1;
    	(function (module, exports) {
    (function (root, factory) {
    			{
    				// CommonJS
    				module.exports = factory(requireCore());
    			}
    		}(commonjsGlobal, function (CryptoJS) {

    			(function () {
    			    // Shortcuts
    			    var C = CryptoJS;
    			    var C_lib = C.lib;
    			    var WordArray = C_lib.WordArray;
    			    var C_enc = C.enc;

    			    /**
    			     * Base64url encoding strategy.
    			     */
    			    C_enc.Base64url = {
    			        /**
    			         * Converts a word array to a Base64url string.
    			         *
    			         * @param {WordArray} wordArray The word array.
    			         *
    			         * @param {boolean} urlSafe Whether to use url safe
    			         *
    			         * @return {string} The Base64url string.
    			         *
    			         * @static
    			         *
    			         * @example
    			         *
    			         *     var base64String = CryptoJS.enc.Base64url.stringify(wordArray);
    			         */
    			        stringify: function (wordArray, urlSafe) {
    			            if (urlSafe === undefined) {
    			                urlSafe = true;
    			            }
    			            // Shortcuts
    			            var words = wordArray.words;
    			            var sigBytes = wordArray.sigBytes;
    			            var map = urlSafe ? this._safe_map : this._map;

    			            // Clamp excess bits
    			            wordArray.clamp();

    			            // Convert
    			            var base64Chars = [];
    			            for (var i = 0; i < sigBytes; i += 3) {
    			                var byte1 = (words[i >>> 2]       >>> (24 - (i % 4) * 8))       & 0xff;
    			                var byte2 = (words[(i + 1) >>> 2] >>> (24 - ((i + 1) % 4) * 8)) & 0xff;
    			                var byte3 = (words[(i + 2) >>> 2] >>> (24 - ((i + 2) % 4) * 8)) & 0xff;

    			                var triplet = (byte1 << 16) | (byte2 << 8) | byte3;

    			                for (var j = 0; (j < 4) && (i + j * 0.75 < sigBytes); j++) {
    			                    base64Chars.push(map.charAt((triplet >>> (6 * (3 - j))) & 0x3f));
    			                }
    			            }

    			            // Add padding
    			            var paddingChar = map.charAt(64);
    			            if (paddingChar) {
    			                while (base64Chars.length % 4) {
    			                    base64Chars.push(paddingChar);
    			                }
    			            }

    			            return base64Chars.join('');
    			        },

    			        /**
    			         * Converts a Base64url string to a word array.
    			         *
    			         * @param {string} base64Str The Base64url string.
    			         *
    			         * @param {boolean} urlSafe Whether to use url safe
    			         *
    			         * @return {WordArray} The word array.
    			         *
    			         * @static
    			         *
    			         * @example
    			         *
    			         *     var wordArray = CryptoJS.enc.Base64url.parse(base64String);
    			         */
    			        parse: function (base64Str, urlSafe) {
    			            if (urlSafe === undefined) {
    			                urlSafe = true;
    			            }

    			            // Shortcuts
    			            var base64StrLength = base64Str.length;
    			            var map = urlSafe ? this._safe_map : this._map;
    			            var reverseMap = this._reverseMap;

    			            if (!reverseMap) {
    			                reverseMap = this._reverseMap = [];
    			                for (var j = 0; j < map.length; j++) {
    			                    reverseMap[map.charCodeAt(j)] = j;
    			                }
    			            }

    			            // Ignore padding
    			            var paddingChar = map.charAt(64);
    			            if (paddingChar) {
    			                var paddingIndex = base64Str.indexOf(paddingChar);
    			                if (paddingIndex !== -1) {
    			                    base64StrLength = paddingIndex;
    			                }
    			            }

    			            // Convert
    			            return parseLoop(base64Str, base64StrLength, reverseMap);

    			        },

    			        _map: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',
    			        _safe_map: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_',
    			    };

    			    function parseLoop(base64Str, base64StrLength, reverseMap) {
    			        var words = [];
    			        var nBytes = 0;
    			        for (var i = 0; i < base64StrLength; i++) {
    			            if (i % 4) {
    			                var bits1 = reverseMap[base64Str.charCodeAt(i - 1)] << ((i % 4) * 2);
    			                var bits2 = reverseMap[base64Str.charCodeAt(i)] >>> (6 - (i % 4) * 2);
    			                var bitsCombined = bits1 | bits2;
    			                words[nBytes >>> 2] |= bitsCombined << (24 - (nBytes % 4) * 8);
    			                nBytes++;
    			            }
    			        }
    			        return WordArray.create(words, nBytes);
    			    }
    			}());


    			return CryptoJS.enc.Base64url;

    		})); 
    	} (encBase64url));
    	return encBase64url.exports;
    }

    var md5 = {exports: {}};

    var hasRequiredMd5;

    function requireMd5 () {
    	if (hasRequiredMd5) return md5.exports;
    	hasRequiredMd5 = 1;
    	(function (module, exports) {
    (function (root, factory) {
    			{
    				// CommonJS
    				module.exports = factory(requireCore());
    			}
    		}(commonjsGlobal, function (CryptoJS) {

    			(function (Math) {
    			    // Shortcuts
    			    var C = CryptoJS;
    			    var C_lib = C.lib;
    			    var WordArray = C_lib.WordArray;
    			    var Hasher = C_lib.Hasher;
    			    var C_algo = C.algo;

    			    // Constants table
    			    var T = [];

    			    // Compute constants
    			    (function () {
    			        for (var i = 0; i < 64; i++) {
    			            T[i] = (Math.abs(Math.sin(i + 1)) * 0x100000000) | 0;
    			        }
    			    }());

    			    /**
    			     * MD5 hash algorithm.
    			     */
    			    var MD5 = C_algo.MD5 = Hasher.extend({
    			        _doReset: function () {
    			            this._hash = new WordArray.init([
    			                0x67452301, 0xefcdab89,
    			                0x98badcfe, 0x10325476
    			            ]);
    			        },

    			        _doProcessBlock: function (M, offset) {
    			            // Swap endian
    			            for (var i = 0; i < 16; i++) {
    			                // Shortcuts
    			                var offset_i = offset + i;
    			                var M_offset_i = M[offset_i];

    			                M[offset_i] = (
    			                    (((M_offset_i << 8)  | (M_offset_i >>> 24)) & 0x00ff00ff) |
    			                    (((M_offset_i << 24) | (M_offset_i >>> 8))  & 0xff00ff00)
    			                );
    			            }

    			            // Shortcuts
    			            var H = this._hash.words;

    			            var M_offset_0  = M[offset + 0];
    			            var M_offset_1  = M[offset + 1];
    			            var M_offset_2  = M[offset + 2];
    			            var M_offset_3  = M[offset + 3];
    			            var M_offset_4  = M[offset + 4];
    			            var M_offset_5  = M[offset + 5];
    			            var M_offset_6  = M[offset + 6];
    			            var M_offset_7  = M[offset + 7];
    			            var M_offset_8  = M[offset + 8];
    			            var M_offset_9  = M[offset + 9];
    			            var M_offset_10 = M[offset + 10];
    			            var M_offset_11 = M[offset + 11];
    			            var M_offset_12 = M[offset + 12];
    			            var M_offset_13 = M[offset + 13];
    			            var M_offset_14 = M[offset + 14];
    			            var M_offset_15 = M[offset + 15];

    			            // Working variables
    			            var a = H[0];
    			            var b = H[1];
    			            var c = H[2];
    			            var d = H[3];

    			            // Computation
    			            a = FF(a, b, c, d, M_offset_0,  7,  T[0]);
    			            d = FF(d, a, b, c, M_offset_1,  12, T[1]);
    			            c = FF(c, d, a, b, M_offset_2,  17, T[2]);
    			            b = FF(b, c, d, a, M_offset_3,  22, T[3]);
    			            a = FF(a, b, c, d, M_offset_4,  7,  T[4]);
    			            d = FF(d, a, b, c, M_offset_5,  12, T[5]);
    			            c = FF(c, d, a, b, M_offset_6,  17, T[6]);
    			            b = FF(b, c, d, a, M_offset_7,  22, T[7]);
    			            a = FF(a, b, c, d, M_offset_8,  7,  T[8]);
    			            d = FF(d, a, b, c, M_offset_9,  12, T[9]);
    			            c = FF(c, d, a, b, M_offset_10, 17, T[10]);
    			            b = FF(b, c, d, a, M_offset_11, 22, T[11]);
    			            a = FF(a, b, c, d, M_offset_12, 7,  T[12]);
    			            d = FF(d, a, b, c, M_offset_13, 12, T[13]);
    			            c = FF(c, d, a, b, M_offset_14, 17, T[14]);
    			            b = FF(b, c, d, a, M_offset_15, 22, T[15]);

    			            a = GG(a, b, c, d, M_offset_1,  5,  T[16]);
    			            d = GG(d, a, b, c, M_offset_6,  9,  T[17]);
    			            c = GG(c, d, a, b, M_offset_11, 14, T[18]);
    			            b = GG(b, c, d, a, M_offset_0,  20, T[19]);
    			            a = GG(a, b, c, d, M_offset_5,  5,  T[20]);
    			            d = GG(d, a, b, c, M_offset_10, 9,  T[21]);
    			            c = GG(c, d, a, b, M_offset_15, 14, T[22]);
    			            b = GG(b, c, d, a, M_offset_4,  20, T[23]);
    			            a = GG(a, b, c, d, M_offset_9,  5,  T[24]);
    			            d = GG(d, a, b, c, M_offset_14, 9,  T[25]);
    			            c = GG(c, d, a, b, M_offset_3,  14, T[26]);
    			            b = GG(b, c, d, a, M_offset_8,  20, T[27]);
    			            a = GG(a, b, c, d, M_offset_13, 5,  T[28]);
    			            d = GG(d, a, b, c, M_offset_2,  9,  T[29]);
    			            c = GG(c, d, a, b, M_offset_7,  14, T[30]);
    			            b = GG(b, c, d, a, M_offset_12, 20, T[31]);

    			            a = HH(a, b, c, d, M_offset_5,  4,  T[32]);
    			            d = HH(d, a, b, c, M_offset_8,  11, T[33]);
    			            c = HH(c, d, a, b, M_offset_11, 16, T[34]);
    			            b = HH(b, c, d, a, M_offset_14, 23, T[35]);
    			            a = HH(a, b, c, d, M_offset_1,  4,  T[36]);
    			            d = HH(d, a, b, c, M_offset_4,  11, T[37]);
    			            c = HH(c, d, a, b, M_offset_7,  16, T[38]);
    			            b = HH(b, c, d, a, M_offset_10, 23, T[39]);
    			            a = HH(a, b, c, d, M_offset_13, 4,  T[40]);
    			            d = HH(d, a, b, c, M_offset_0,  11, T[41]);
    			            c = HH(c, d, a, b, M_offset_3,  16, T[42]);
    			            b = HH(b, c, d, a, M_offset_6,  23, T[43]);
    			            a = HH(a, b, c, d, M_offset_9,  4,  T[44]);
    			            d = HH(d, a, b, c, M_offset_12, 11, T[45]);
    			            c = HH(c, d, a, b, M_offset_15, 16, T[46]);
    			            b = HH(b, c, d, a, M_offset_2,  23, T[47]);

    			            a = II(a, b, c, d, M_offset_0,  6,  T[48]);
    			            d = II(d, a, b, c, M_offset_7,  10, T[49]);
    			            c = II(c, d, a, b, M_offset_14, 15, T[50]);
    			            b = II(b, c, d, a, M_offset_5,  21, T[51]);
    			            a = II(a, b, c, d, M_offset_12, 6,  T[52]);
    			            d = II(d, a, b, c, M_offset_3,  10, T[53]);
    			            c = II(c, d, a, b, M_offset_10, 15, T[54]);
    			            b = II(b, c, d, a, M_offset_1,  21, T[55]);
    			            a = II(a, b, c, d, M_offset_8,  6,  T[56]);
    			            d = II(d, a, b, c, M_offset_15, 10, T[57]);
    			            c = II(c, d, a, b, M_offset_6,  15, T[58]);
    			            b = II(b, c, d, a, M_offset_13, 21, T[59]);
    			            a = II(a, b, c, d, M_offset_4,  6,  T[60]);
    			            d = II(d, a, b, c, M_offset_11, 10, T[61]);
    			            c = II(c, d, a, b, M_offset_2,  15, T[62]);
    			            b = II(b, c, d, a, M_offset_9,  21, T[63]);

    			            // Intermediate hash value
    			            H[0] = (H[0] + a) | 0;
    			            H[1] = (H[1] + b) | 0;
    			            H[2] = (H[2] + c) | 0;
    			            H[3] = (H[3] + d) | 0;
    			        },

    			        _doFinalize: function () {
    			            // Shortcuts
    			            var data = this._data;
    			            var dataWords = data.words;

    			            var nBitsTotal = this._nDataBytes * 8;
    			            var nBitsLeft = data.sigBytes * 8;

    			            // Add padding
    			            dataWords[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32);

    			            var nBitsTotalH = Math.floor(nBitsTotal / 0x100000000);
    			            var nBitsTotalL = nBitsTotal;
    			            dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 15] = (
    			                (((nBitsTotalH << 8)  | (nBitsTotalH >>> 24)) & 0x00ff00ff) |
    			                (((nBitsTotalH << 24) | (nBitsTotalH >>> 8))  & 0xff00ff00)
    			            );
    			            dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 14] = (
    			                (((nBitsTotalL << 8)  | (nBitsTotalL >>> 24)) & 0x00ff00ff) |
    			                (((nBitsTotalL << 24) | (nBitsTotalL >>> 8))  & 0xff00ff00)
    			            );

    			            data.sigBytes = (dataWords.length + 1) * 4;

    			            // Hash final blocks
    			            this._process();

    			            // Shortcuts
    			            var hash = this._hash;
    			            var H = hash.words;

    			            // Swap endian
    			            for (var i = 0; i < 4; i++) {
    			                // Shortcut
    			                var H_i = H[i];

    			                H[i] = (((H_i << 8)  | (H_i >>> 24)) & 0x00ff00ff) |
    			                       (((H_i << 24) | (H_i >>> 8))  & 0xff00ff00);
    			            }

    			            // Return final computed hash
    			            return hash;
    			        },

    			        clone: function () {
    			            var clone = Hasher.clone.call(this);
    			            clone._hash = this._hash.clone();

    			            return clone;
    			        }
    			    });

    			    function FF(a, b, c, d, x, s, t) {
    			        var n = a + ((b & c) | (~b & d)) + x + t;
    			        return ((n << s) | (n >>> (32 - s))) + b;
    			    }

    			    function GG(a, b, c, d, x, s, t) {
    			        var n = a + ((b & d) | (c & ~d)) + x + t;
    			        return ((n << s) | (n >>> (32 - s))) + b;
    			    }

    			    function HH(a, b, c, d, x, s, t) {
    			        var n = a + (b ^ c ^ d) + x + t;
    			        return ((n << s) | (n >>> (32 - s))) + b;
    			    }

    			    function II(a, b, c, d, x, s, t) {
    			        var n = a + (c ^ (b | ~d)) + x + t;
    			        return ((n << s) | (n >>> (32 - s))) + b;
    			    }

    			    /**
    			     * Shortcut function to the hasher's object interface.
    			     *
    			     * @param {WordArray|string} message The message to hash.
    			     *
    			     * @return {WordArray} The hash.
    			     *
    			     * @static
    			     *
    			     * @example
    			     *
    			     *     var hash = CryptoJS.MD5('message');
    			     *     var hash = CryptoJS.MD5(wordArray);
    			     */
    			    C.MD5 = Hasher._createHelper(MD5);

    			    /**
    			     * Shortcut function to the HMAC's object interface.
    			     *
    			     * @param {WordArray|string} message The message to hash.
    			     * @param {WordArray|string} key The secret key.
    			     *
    			     * @return {WordArray} The HMAC.
    			     *
    			     * @static
    			     *
    			     * @example
    			     *
    			     *     var hmac = CryptoJS.HmacMD5(message, key);
    			     */
    			    C.HmacMD5 = Hasher._createHmacHelper(MD5);
    			}(Math));


    			return CryptoJS.MD5;

    		})); 
    	} (md5));
    	return md5.exports;
    }

    var sha1 = {exports: {}};

    var hasRequiredSha1;

    function requireSha1 () {
    	if (hasRequiredSha1) return sha1.exports;
    	hasRequiredSha1 = 1;
    	(function (module, exports) {
    (function (root, factory) {
    			{
    				// CommonJS
    				module.exports = factory(requireCore());
    			}
    		}(commonjsGlobal, function (CryptoJS) {

    			(function () {
    			    // Shortcuts
    			    var C = CryptoJS;
    			    var C_lib = C.lib;
    			    var WordArray = C_lib.WordArray;
    			    var Hasher = C_lib.Hasher;
    			    var C_algo = C.algo;

    			    // Reusable object
    			    var W = [];

    			    /**
    			     * SHA-1 hash algorithm.
    			     */
    			    var SHA1 = C_algo.SHA1 = Hasher.extend({
    			        _doReset: function () {
    			            this._hash = new WordArray.init([
    			                0x67452301, 0xefcdab89,
    			                0x98badcfe, 0x10325476,
    			                0xc3d2e1f0
    			            ]);
    			        },

    			        _doProcessBlock: function (M, offset) {
    			            // Shortcut
    			            var H = this._hash.words;

    			            // Working variables
    			            var a = H[0];
    			            var b = H[1];
    			            var c = H[2];
    			            var d = H[3];
    			            var e = H[4];

    			            // Computation
    			            for (var i = 0; i < 80; i++) {
    			                if (i < 16) {
    			                    W[i] = M[offset + i] | 0;
    			                } else {
    			                    var n = W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16];
    			                    W[i] = (n << 1) | (n >>> 31);
    			                }

    			                var t = ((a << 5) | (a >>> 27)) + e + W[i];
    			                if (i < 20) {
    			                    t += ((b & c) | (~b & d)) + 0x5a827999;
    			                } else if (i < 40) {
    			                    t += (b ^ c ^ d) + 0x6ed9eba1;
    			                } else if (i < 60) {
    			                    t += ((b & c) | (b & d) | (c & d)) - 0x70e44324;
    			                } else /* if (i < 80) */ {
    			                    t += (b ^ c ^ d) - 0x359d3e2a;
    			                }

    			                e = d;
    			                d = c;
    			                c = (b << 30) | (b >>> 2);
    			                b = a;
    			                a = t;
    			            }

    			            // Intermediate hash value
    			            H[0] = (H[0] + a) | 0;
    			            H[1] = (H[1] + b) | 0;
    			            H[2] = (H[2] + c) | 0;
    			            H[3] = (H[3] + d) | 0;
    			            H[4] = (H[4] + e) | 0;
    			        },

    			        _doFinalize: function () {
    			            // Shortcuts
    			            var data = this._data;
    			            var dataWords = data.words;

    			            var nBitsTotal = this._nDataBytes * 8;
    			            var nBitsLeft = data.sigBytes * 8;

    			            // Add padding
    			            dataWords[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32);
    			            dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 14] = Math.floor(nBitsTotal / 0x100000000);
    			            dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 15] = nBitsTotal;
    			            data.sigBytes = dataWords.length * 4;

    			            // Hash final blocks
    			            this._process();

    			            // Return final computed hash
    			            return this._hash;
    			        },

    			        clone: function () {
    			            var clone = Hasher.clone.call(this);
    			            clone._hash = this._hash.clone();

    			            return clone;
    			        }
    			    });

    			    /**
    			     * Shortcut function to the hasher's object interface.
    			     *
    			     * @param {WordArray|string} message The message to hash.
    			     *
    			     * @return {WordArray} The hash.
    			     *
    			     * @static
    			     *
    			     * @example
    			     *
    			     *     var hash = CryptoJS.SHA1('message');
    			     *     var hash = CryptoJS.SHA1(wordArray);
    			     */
    			    C.SHA1 = Hasher._createHelper(SHA1);

    			    /**
    			     * Shortcut function to the HMAC's object interface.
    			     *
    			     * @param {WordArray|string} message The message to hash.
    			     * @param {WordArray|string} key The secret key.
    			     *
    			     * @return {WordArray} The HMAC.
    			     *
    			     * @static
    			     *
    			     * @example
    			     *
    			     *     var hmac = CryptoJS.HmacSHA1(message, key);
    			     */
    			    C.HmacSHA1 = Hasher._createHmacHelper(SHA1);
    			}());


    			return CryptoJS.SHA1;

    		})); 
    	} (sha1));
    	return sha1.exports;
    }

    var sha256 = {exports: {}};

    var hasRequiredSha256;

    function requireSha256 () {
    	if (hasRequiredSha256) return sha256.exports;
    	hasRequiredSha256 = 1;
    	(function (module, exports) {
    (function (root, factory) {
    			{
    				// CommonJS
    				module.exports = factory(requireCore());
    			}
    		}(commonjsGlobal, function (CryptoJS) {

    			(function (Math) {
    			    // Shortcuts
    			    var C = CryptoJS;
    			    var C_lib = C.lib;
    			    var WordArray = C_lib.WordArray;
    			    var Hasher = C_lib.Hasher;
    			    var C_algo = C.algo;

    			    // Initialization and round constants tables
    			    var H = [];
    			    var K = [];

    			    // Compute constants
    			    (function () {
    			        function isPrime(n) {
    			            var sqrtN = Math.sqrt(n);
    			            for (var factor = 2; factor <= sqrtN; factor++) {
    			                if (!(n % factor)) {
    			                    return false;
    			                }
    			            }

    			            return true;
    			        }

    			        function getFractionalBits(n) {
    			            return ((n - (n | 0)) * 0x100000000) | 0;
    			        }

    			        var n = 2;
    			        var nPrime = 0;
    			        while (nPrime < 64) {
    			            if (isPrime(n)) {
    			                if (nPrime < 8) {
    			                    H[nPrime] = getFractionalBits(Math.pow(n, 1 / 2));
    			                }
    			                K[nPrime] = getFractionalBits(Math.pow(n, 1 / 3));

    			                nPrime++;
    			            }

    			            n++;
    			        }
    			    }());

    			    // Reusable object
    			    var W = [];

    			    /**
    			     * SHA-256 hash algorithm.
    			     */
    			    var SHA256 = C_algo.SHA256 = Hasher.extend({
    			        _doReset: function () {
    			            this._hash = new WordArray.init(H.slice(0));
    			        },

    			        _doProcessBlock: function (M, offset) {
    			            // Shortcut
    			            var H = this._hash.words;

    			            // Working variables
    			            var a = H[0];
    			            var b = H[1];
    			            var c = H[2];
    			            var d = H[3];
    			            var e = H[4];
    			            var f = H[5];
    			            var g = H[6];
    			            var h = H[7];

    			            // Computation
    			            for (var i = 0; i < 64; i++) {
    			                if (i < 16) {
    			                    W[i] = M[offset + i] | 0;
    			                } else {
    			                    var gamma0x = W[i - 15];
    			                    var gamma0  = ((gamma0x << 25) | (gamma0x >>> 7))  ^
    			                                  ((gamma0x << 14) | (gamma0x >>> 18)) ^
    			                                   (gamma0x >>> 3);

    			                    var gamma1x = W[i - 2];
    			                    var gamma1  = ((gamma1x << 15) | (gamma1x >>> 17)) ^
    			                                  ((gamma1x << 13) | (gamma1x >>> 19)) ^
    			                                   (gamma1x >>> 10);

    			                    W[i] = gamma0 + W[i - 7] + gamma1 + W[i - 16];
    			                }

    			                var ch  = (e & f) ^ (~e & g);
    			                var maj = (a & b) ^ (a & c) ^ (b & c);

    			                var sigma0 = ((a << 30) | (a >>> 2)) ^ ((a << 19) | (a >>> 13)) ^ ((a << 10) | (a >>> 22));
    			                var sigma1 = ((e << 26) | (e >>> 6)) ^ ((e << 21) | (e >>> 11)) ^ ((e << 7)  | (e >>> 25));

    			                var t1 = h + sigma1 + ch + K[i] + W[i];
    			                var t2 = sigma0 + maj;

    			                h = g;
    			                g = f;
    			                f = e;
    			                e = (d + t1) | 0;
    			                d = c;
    			                c = b;
    			                b = a;
    			                a = (t1 + t2) | 0;
    			            }

    			            // Intermediate hash value
    			            H[0] = (H[0] + a) | 0;
    			            H[1] = (H[1] + b) | 0;
    			            H[2] = (H[2] + c) | 0;
    			            H[3] = (H[3] + d) | 0;
    			            H[4] = (H[4] + e) | 0;
    			            H[5] = (H[5] + f) | 0;
    			            H[6] = (H[6] + g) | 0;
    			            H[7] = (H[7] + h) | 0;
    			        },

    			        _doFinalize: function () {
    			            // Shortcuts
    			            var data = this._data;
    			            var dataWords = data.words;

    			            var nBitsTotal = this._nDataBytes * 8;
    			            var nBitsLeft = data.sigBytes * 8;

    			            // Add padding
    			            dataWords[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32);
    			            dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 14] = Math.floor(nBitsTotal / 0x100000000);
    			            dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 15] = nBitsTotal;
    			            data.sigBytes = dataWords.length * 4;

    			            // Hash final blocks
    			            this._process();

    			            // Return final computed hash
    			            return this._hash;
    			        },

    			        clone: function () {
    			            var clone = Hasher.clone.call(this);
    			            clone._hash = this._hash.clone();

    			            return clone;
    			        }
    			    });

    			    /**
    			     * Shortcut function to the hasher's object interface.
    			     *
    			     * @param {WordArray|string} message The message to hash.
    			     *
    			     * @return {WordArray} The hash.
    			     *
    			     * @static
    			     *
    			     * @example
    			     *
    			     *     var hash = CryptoJS.SHA256('message');
    			     *     var hash = CryptoJS.SHA256(wordArray);
    			     */
    			    C.SHA256 = Hasher._createHelper(SHA256);

    			    /**
    			     * Shortcut function to the HMAC's object interface.
    			     *
    			     * @param {WordArray|string} message The message to hash.
    			     * @param {WordArray|string} key The secret key.
    			     *
    			     * @return {WordArray} The HMAC.
    			     *
    			     * @static
    			     *
    			     * @example
    			     *
    			     *     var hmac = CryptoJS.HmacSHA256(message, key);
    			     */
    			    C.HmacSHA256 = Hasher._createHmacHelper(SHA256);
    			}(Math));


    			return CryptoJS.SHA256;

    		})); 
    	} (sha256));
    	return sha256.exports;
    }

    var sha224 = {exports: {}};

    var hasRequiredSha224;

    function requireSha224 () {
    	if (hasRequiredSha224) return sha224.exports;
    	hasRequiredSha224 = 1;
    	(function (module, exports) {
    (function (root, factory, undef) {
    			{
    				// CommonJS
    				module.exports = factory(requireCore(), requireSha256());
    			}
    		}(commonjsGlobal, function (CryptoJS) {

    			(function () {
    			    // Shortcuts
    			    var C = CryptoJS;
    			    var C_lib = C.lib;
    			    var WordArray = C_lib.WordArray;
    			    var C_algo = C.algo;
    			    var SHA256 = C_algo.SHA256;

    			    /**
    			     * SHA-224 hash algorithm.
    			     */
    			    var SHA224 = C_algo.SHA224 = SHA256.extend({
    			        _doReset: function () {
    			            this._hash = new WordArray.init([
    			                0xc1059ed8, 0x367cd507, 0x3070dd17, 0xf70e5939,
    			                0xffc00b31, 0x68581511, 0x64f98fa7, 0xbefa4fa4
    			            ]);
    			        },

    			        _doFinalize: function () {
    			            var hash = SHA256._doFinalize.call(this);

    			            hash.sigBytes -= 4;

    			            return hash;
    			        }
    			    });

    			    /**
    			     * Shortcut function to the hasher's object interface.
    			     *
    			     * @param {WordArray|string} message The message to hash.
    			     *
    			     * @return {WordArray} The hash.
    			     *
    			     * @static
    			     *
    			     * @example
    			     *
    			     *     var hash = CryptoJS.SHA224('message');
    			     *     var hash = CryptoJS.SHA224(wordArray);
    			     */
    			    C.SHA224 = SHA256._createHelper(SHA224);

    			    /**
    			     * Shortcut function to the HMAC's object interface.
    			     *
    			     * @param {WordArray|string} message The message to hash.
    			     * @param {WordArray|string} key The secret key.
    			     *
    			     * @return {WordArray} The HMAC.
    			     *
    			     * @static
    			     *
    			     * @example
    			     *
    			     *     var hmac = CryptoJS.HmacSHA224(message, key);
    			     */
    			    C.HmacSHA224 = SHA256._createHmacHelper(SHA224);
    			}());


    			return CryptoJS.SHA224;

    		})); 
    	} (sha224));
    	return sha224.exports;
    }

    var sha512 = {exports: {}};

    var hasRequiredSha512;

    function requireSha512 () {
    	if (hasRequiredSha512) return sha512.exports;
    	hasRequiredSha512 = 1;
    	(function (module, exports) {
    (function (root, factory, undef) {
    			{
    				// CommonJS
    				module.exports = factory(requireCore(), requireX64Core());
    			}
    		}(commonjsGlobal, function (CryptoJS) {

    			(function () {
    			    // Shortcuts
    			    var C = CryptoJS;
    			    var C_lib = C.lib;
    			    var Hasher = C_lib.Hasher;
    			    var C_x64 = C.x64;
    			    var X64Word = C_x64.Word;
    			    var X64WordArray = C_x64.WordArray;
    			    var C_algo = C.algo;

    			    function X64Word_create() {
    			        return X64Word.create.apply(X64Word, arguments);
    			    }

    			    // Constants
    			    var K = [
    			        X64Word_create(0x428a2f98, 0xd728ae22), X64Word_create(0x71374491, 0x23ef65cd),
    			        X64Word_create(0xb5c0fbcf, 0xec4d3b2f), X64Word_create(0xe9b5dba5, 0x8189dbbc),
    			        X64Word_create(0x3956c25b, 0xf348b538), X64Word_create(0x59f111f1, 0xb605d019),
    			        X64Word_create(0x923f82a4, 0xaf194f9b), X64Word_create(0xab1c5ed5, 0xda6d8118),
    			        X64Word_create(0xd807aa98, 0xa3030242), X64Word_create(0x12835b01, 0x45706fbe),
    			        X64Word_create(0x243185be, 0x4ee4b28c), X64Word_create(0x550c7dc3, 0xd5ffb4e2),
    			        X64Word_create(0x72be5d74, 0xf27b896f), X64Word_create(0x80deb1fe, 0x3b1696b1),
    			        X64Word_create(0x9bdc06a7, 0x25c71235), X64Word_create(0xc19bf174, 0xcf692694),
    			        X64Word_create(0xe49b69c1, 0x9ef14ad2), X64Word_create(0xefbe4786, 0x384f25e3),
    			        X64Word_create(0x0fc19dc6, 0x8b8cd5b5), X64Word_create(0x240ca1cc, 0x77ac9c65),
    			        X64Word_create(0x2de92c6f, 0x592b0275), X64Word_create(0x4a7484aa, 0x6ea6e483),
    			        X64Word_create(0x5cb0a9dc, 0xbd41fbd4), X64Word_create(0x76f988da, 0x831153b5),
    			        X64Word_create(0x983e5152, 0xee66dfab), X64Word_create(0xa831c66d, 0x2db43210),
    			        X64Word_create(0xb00327c8, 0x98fb213f), X64Word_create(0xbf597fc7, 0xbeef0ee4),
    			        X64Word_create(0xc6e00bf3, 0x3da88fc2), X64Word_create(0xd5a79147, 0x930aa725),
    			        X64Word_create(0x06ca6351, 0xe003826f), X64Word_create(0x14292967, 0x0a0e6e70),
    			        X64Word_create(0x27b70a85, 0x46d22ffc), X64Word_create(0x2e1b2138, 0x5c26c926),
    			        X64Word_create(0x4d2c6dfc, 0x5ac42aed), X64Word_create(0x53380d13, 0x9d95b3df),
    			        X64Word_create(0x650a7354, 0x8baf63de), X64Word_create(0x766a0abb, 0x3c77b2a8),
    			        X64Word_create(0x81c2c92e, 0x47edaee6), X64Word_create(0x92722c85, 0x1482353b),
    			        X64Word_create(0xa2bfe8a1, 0x4cf10364), X64Word_create(0xa81a664b, 0xbc423001),
    			        X64Word_create(0xc24b8b70, 0xd0f89791), X64Word_create(0xc76c51a3, 0x0654be30),
    			        X64Word_create(0xd192e819, 0xd6ef5218), X64Word_create(0xd6990624, 0x5565a910),
    			        X64Word_create(0xf40e3585, 0x5771202a), X64Word_create(0x106aa070, 0x32bbd1b8),
    			        X64Word_create(0x19a4c116, 0xb8d2d0c8), X64Word_create(0x1e376c08, 0x5141ab53),
    			        X64Word_create(0x2748774c, 0xdf8eeb99), X64Word_create(0x34b0bcb5, 0xe19b48a8),
    			        X64Word_create(0x391c0cb3, 0xc5c95a63), X64Word_create(0x4ed8aa4a, 0xe3418acb),
    			        X64Word_create(0x5b9cca4f, 0x7763e373), X64Word_create(0x682e6ff3, 0xd6b2b8a3),
    			        X64Word_create(0x748f82ee, 0x5defb2fc), X64Word_create(0x78a5636f, 0x43172f60),
    			        X64Word_create(0x84c87814, 0xa1f0ab72), X64Word_create(0x8cc70208, 0x1a6439ec),
    			        X64Word_create(0x90befffa, 0x23631e28), X64Word_create(0xa4506ceb, 0xde82bde9),
    			        X64Word_create(0xbef9a3f7, 0xb2c67915), X64Word_create(0xc67178f2, 0xe372532b),
    			        X64Word_create(0xca273ece, 0xea26619c), X64Word_create(0xd186b8c7, 0x21c0c207),
    			        X64Word_create(0xeada7dd6, 0xcde0eb1e), X64Word_create(0xf57d4f7f, 0xee6ed178),
    			        X64Word_create(0x06f067aa, 0x72176fba), X64Word_create(0x0a637dc5, 0xa2c898a6),
    			        X64Word_create(0x113f9804, 0xbef90dae), X64Word_create(0x1b710b35, 0x131c471b),
    			        X64Word_create(0x28db77f5, 0x23047d84), X64Word_create(0x32caab7b, 0x40c72493),
    			        X64Word_create(0x3c9ebe0a, 0x15c9bebc), X64Word_create(0x431d67c4, 0x9c100d4c),
    			        X64Word_create(0x4cc5d4be, 0xcb3e42b6), X64Word_create(0x597f299c, 0xfc657e2a),
    			        X64Word_create(0x5fcb6fab, 0x3ad6faec), X64Word_create(0x6c44198c, 0x4a475817)
    			    ];

    			    // Reusable objects
    			    var W = [];
    			    (function () {
    			        for (var i = 0; i < 80; i++) {
    			            W[i] = X64Word_create();
    			        }
    			    }());

    			    /**
    			     * SHA-512 hash algorithm.
    			     */
    			    var SHA512 = C_algo.SHA512 = Hasher.extend({
    			        _doReset: function () {
    			            this._hash = new X64WordArray.init([
    			                new X64Word.init(0x6a09e667, 0xf3bcc908), new X64Word.init(0xbb67ae85, 0x84caa73b),
    			                new X64Word.init(0x3c6ef372, 0xfe94f82b), new X64Word.init(0xa54ff53a, 0x5f1d36f1),
    			                new X64Word.init(0x510e527f, 0xade682d1), new X64Word.init(0x9b05688c, 0x2b3e6c1f),
    			                new X64Word.init(0x1f83d9ab, 0xfb41bd6b), new X64Word.init(0x5be0cd19, 0x137e2179)
    			            ]);
    			        },

    			        _doProcessBlock: function (M, offset) {
    			            // Shortcuts
    			            var H = this._hash.words;

    			            var H0 = H[0];
    			            var H1 = H[1];
    			            var H2 = H[2];
    			            var H3 = H[3];
    			            var H4 = H[4];
    			            var H5 = H[5];
    			            var H6 = H[6];
    			            var H7 = H[7];

    			            var H0h = H0.high;
    			            var H0l = H0.low;
    			            var H1h = H1.high;
    			            var H1l = H1.low;
    			            var H2h = H2.high;
    			            var H2l = H2.low;
    			            var H3h = H3.high;
    			            var H3l = H3.low;
    			            var H4h = H4.high;
    			            var H4l = H4.low;
    			            var H5h = H5.high;
    			            var H5l = H5.low;
    			            var H6h = H6.high;
    			            var H6l = H6.low;
    			            var H7h = H7.high;
    			            var H7l = H7.low;

    			            // Working variables
    			            var ah = H0h;
    			            var al = H0l;
    			            var bh = H1h;
    			            var bl = H1l;
    			            var ch = H2h;
    			            var cl = H2l;
    			            var dh = H3h;
    			            var dl = H3l;
    			            var eh = H4h;
    			            var el = H4l;
    			            var fh = H5h;
    			            var fl = H5l;
    			            var gh = H6h;
    			            var gl = H6l;
    			            var hh = H7h;
    			            var hl = H7l;

    			            // Rounds
    			            for (var i = 0; i < 80; i++) {
    			                var Wil;
    			                var Wih;

    			                // Shortcut
    			                var Wi = W[i];

    			                // Extend message
    			                if (i < 16) {
    			                    Wih = Wi.high = M[offset + i * 2]     | 0;
    			                    Wil = Wi.low  = M[offset + i * 2 + 1] | 0;
    			                } else {
    			                    // Gamma0
    			                    var gamma0x  = W[i - 15];
    			                    var gamma0xh = gamma0x.high;
    			                    var gamma0xl = gamma0x.low;
    			                    var gamma0h  = ((gamma0xh >>> 1) | (gamma0xl << 31)) ^ ((gamma0xh >>> 8) | (gamma0xl << 24)) ^ (gamma0xh >>> 7);
    			                    var gamma0l  = ((gamma0xl >>> 1) | (gamma0xh << 31)) ^ ((gamma0xl >>> 8) | (gamma0xh << 24)) ^ ((gamma0xl >>> 7) | (gamma0xh << 25));

    			                    // Gamma1
    			                    var gamma1x  = W[i - 2];
    			                    var gamma1xh = gamma1x.high;
    			                    var gamma1xl = gamma1x.low;
    			                    var gamma1h  = ((gamma1xh >>> 19) | (gamma1xl << 13)) ^ ((gamma1xh << 3) | (gamma1xl >>> 29)) ^ (gamma1xh >>> 6);
    			                    var gamma1l  = ((gamma1xl >>> 19) | (gamma1xh << 13)) ^ ((gamma1xl << 3) | (gamma1xh >>> 29)) ^ ((gamma1xl >>> 6) | (gamma1xh << 26));

    			                    // W[i] = gamma0 + W[i - 7] + gamma1 + W[i - 16]
    			                    var Wi7  = W[i - 7];
    			                    var Wi7h = Wi7.high;
    			                    var Wi7l = Wi7.low;

    			                    var Wi16  = W[i - 16];
    			                    var Wi16h = Wi16.high;
    			                    var Wi16l = Wi16.low;

    			                    Wil = gamma0l + Wi7l;
    			                    Wih = gamma0h + Wi7h + ((Wil >>> 0) < (gamma0l >>> 0) ? 1 : 0);
    			                    Wil = Wil + gamma1l;
    			                    Wih = Wih + gamma1h + ((Wil >>> 0) < (gamma1l >>> 0) ? 1 : 0);
    			                    Wil = Wil + Wi16l;
    			                    Wih = Wih + Wi16h + ((Wil >>> 0) < (Wi16l >>> 0) ? 1 : 0);

    			                    Wi.high = Wih;
    			                    Wi.low  = Wil;
    			                }

    			                var chh  = (eh & fh) ^ (~eh & gh);
    			                var chl  = (el & fl) ^ (~el & gl);
    			                var majh = (ah & bh) ^ (ah & ch) ^ (bh & ch);
    			                var majl = (al & bl) ^ (al & cl) ^ (bl & cl);

    			                var sigma0h = ((ah >>> 28) | (al << 4))  ^ ((ah << 30)  | (al >>> 2)) ^ ((ah << 25) | (al >>> 7));
    			                var sigma0l = ((al >>> 28) | (ah << 4))  ^ ((al << 30)  | (ah >>> 2)) ^ ((al << 25) | (ah >>> 7));
    			                var sigma1h = ((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9));
    			                var sigma1l = ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9));

    			                // t1 = h + sigma1 + ch + K[i] + W[i]
    			                var Ki  = K[i];
    			                var Kih = Ki.high;
    			                var Kil = Ki.low;

    			                var t1l = hl + sigma1l;
    			                var t1h = hh + sigma1h + ((t1l >>> 0) < (hl >>> 0) ? 1 : 0);
    			                var t1l = t1l + chl;
    			                var t1h = t1h + chh + ((t1l >>> 0) < (chl >>> 0) ? 1 : 0);
    			                var t1l = t1l + Kil;
    			                var t1h = t1h + Kih + ((t1l >>> 0) < (Kil >>> 0) ? 1 : 0);
    			                var t1l = t1l + Wil;
    			                var t1h = t1h + Wih + ((t1l >>> 0) < (Wil >>> 0) ? 1 : 0);

    			                // t2 = sigma0 + maj
    			                var t2l = sigma0l + majl;
    			                var t2h = sigma0h + majh + ((t2l >>> 0) < (sigma0l >>> 0) ? 1 : 0);

    			                // Update working variables
    			                hh = gh;
    			                hl = gl;
    			                gh = fh;
    			                gl = fl;
    			                fh = eh;
    			                fl = el;
    			                el = (dl + t1l) | 0;
    			                eh = (dh + t1h + ((el >>> 0) < (dl >>> 0) ? 1 : 0)) | 0;
    			                dh = ch;
    			                dl = cl;
    			                ch = bh;
    			                cl = bl;
    			                bh = ah;
    			                bl = al;
    			                al = (t1l + t2l) | 0;
    			                ah = (t1h + t2h + ((al >>> 0) < (t1l >>> 0) ? 1 : 0)) | 0;
    			            }

    			            // Intermediate hash value
    			            H0l = H0.low  = (H0l + al);
    			            H0.high = (H0h + ah + ((H0l >>> 0) < (al >>> 0) ? 1 : 0));
    			            H1l = H1.low  = (H1l + bl);
    			            H1.high = (H1h + bh + ((H1l >>> 0) < (bl >>> 0) ? 1 : 0));
    			            H2l = H2.low  = (H2l + cl);
    			            H2.high = (H2h + ch + ((H2l >>> 0) < (cl >>> 0) ? 1 : 0));
    			            H3l = H3.low  = (H3l + dl);
    			            H3.high = (H3h + dh + ((H3l >>> 0) < (dl >>> 0) ? 1 : 0));
    			            H4l = H4.low  = (H4l + el);
    			            H4.high = (H4h + eh + ((H4l >>> 0) < (el >>> 0) ? 1 : 0));
    			            H5l = H5.low  = (H5l + fl);
    			            H5.high = (H5h + fh + ((H5l >>> 0) < (fl >>> 0) ? 1 : 0));
    			            H6l = H6.low  = (H6l + gl);
    			            H6.high = (H6h + gh + ((H6l >>> 0) < (gl >>> 0) ? 1 : 0));
    			            H7l = H7.low  = (H7l + hl);
    			            H7.high = (H7h + hh + ((H7l >>> 0) < (hl >>> 0) ? 1 : 0));
    			        },

    			        _doFinalize: function () {
    			            // Shortcuts
    			            var data = this._data;
    			            var dataWords = data.words;

    			            var nBitsTotal = this._nDataBytes * 8;
    			            var nBitsLeft = data.sigBytes * 8;

    			            // Add padding
    			            dataWords[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32);
    			            dataWords[(((nBitsLeft + 128) >>> 10) << 5) + 30] = Math.floor(nBitsTotal / 0x100000000);
    			            dataWords[(((nBitsLeft + 128) >>> 10) << 5) + 31] = nBitsTotal;
    			            data.sigBytes = dataWords.length * 4;

    			            // Hash final blocks
    			            this._process();

    			            // Convert hash to 32-bit word array before returning
    			            var hash = this._hash.toX32();

    			            // Return final computed hash
    			            return hash;
    			        },

    			        clone: function () {
    			            var clone = Hasher.clone.call(this);
    			            clone._hash = this._hash.clone();

    			            return clone;
    			        },

    			        blockSize: 1024/32
    			    });

    			    /**
    			     * Shortcut function to the hasher's object interface.
    			     *
    			     * @param {WordArray|string} message The message to hash.
    			     *
    			     * @return {WordArray} The hash.
    			     *
    			     * @static
    			     *
    			     * @example
    			     *
    			     *     var hash = CryptoJS.SHA512('message');
    			     *     var hash = CryptoJS.SHA512(wordArray);
    			     */
    			    C.SHA512 = Hasher._createHelper(SHA512);

    			    /**
    			     * Shortcut function to the HMAC's object interface.
    			     *
    			     * @param {WordArray|string} message The message to hash.
    			     * @param {WordArray|string} key The secret key.
    			     *
    			     * @return {WordArray} The HMAC.
    			     *
    			     * @static
    			     *
    			     * @example
    			     *
    			     *     var hmac = CryptoJS.HmacSHA512(message, key);
    			     */
    			    C.HmacSHA512 = Hasher._createHmacHelper(SHA512);
    			}());


    			return CryptoJS.SHA512;

    		})); 
    	} (sha512));
    	return sha512.exports;
    }

    var sha384 = {exports: {}};

    var hasRequiredSha384;

    function requireSha384 () {
    	if (hasRequiredSha384) return sha384.exports;
    	hasRequiredSha384 = 1;
    	(function (module, exports) {
    (function (root, factory, undef) {
    			{
    				// CommonJS
    				module.exports = factory(requireCore(), requireX64Core(), requireSha512());
    			}
    		}(commonjsGlobal, function (CryptoJS) {

    			(function () {
    			    // Shortcuts
    			    var C = CryptoJS;
    			    var C_x64 = C.x64;
    			    var X64Word = C_x64.Word;
    			    var X64WordArray = C_x64.WordArray;
    			    var C_algo = C.algo;
    			    var SHA512 = C_algo.SHA512;

    			    /**
    			     * SHA-384 hash algorithm.
    			     */
    			    var SHA384 = C_algo.SHA384 = SHA512.extend({
    			        _doReset: function () {
    			            this._hash = new X64WordArray.init([
    			                new X64Word.init(0xcbbb9d5d, 0xc1059ed8), new X64Word.init(0x629a292a, 0x367cd507),
    			                new X64Word.init(0x9159015a, 0x3070dd17), new X64Word.init(0x152fecd8, 0xf70e5939),
    			                new X64Word.init(0x67332667, 0xffc00b31), new X64Word.init(0x8eb44a87, 0x68581511),
    			                new X64Word.init(0xdb0c2e0d, 0x64f98fa7), new X64Word.init(0x47b5481d, 0xbefa4fa4)
    			            ]);
    			        },

    			        _doFinalize: function () {
    			            var hash = SHA512._doFinalize.call(this);

    			            hash.sigBytes -= 16;

    			            return hash;
    			        }
    			    });

    			    /**
    			     * Shortcut function to the hasher's object interface.
    			     *
    			     * @param {WordArray|string} message The message to hash.
    			     *
    			     * @return {WordArray} The hash.
    			     *
    			     * @static
    			     *
    			     * @example
    			     *
    			     *     var hash = CryptoJS.SHA384('message');
    			     *     var hash = CryptoJS.SHA384(wordArray);
    			     */
    			    C.SHA384 = SHA512._createHelper(SHA384);

    			    /**
    			     * Shortcut function to the HMAC's object interface.
    			     *
    			     * @param {WordArray|string} message The message to hash.
    			     * @param {WordArray|string} key The secret key.
    			     *
    			     * @return {WordArray} The HMAC.
    			     *
    			     * @static
    			     *
    			     * @example
    			     *
    			     *     var hmac = CryptoJS.HmacSHA384(message, key);
    			     */
    			    C.HmacSHA384 = SHA512._createHmacHelper(SHA384);
    			}());


    			return CryptoJS.SHA384;

    		})); 
    	} (sha384));
    	return sha384.exports;
    }

    var sha3 = {exports: {}};

    var hasRequiredSha3;

    function requireSha3 () {
    	if (hasRequiredSha3) return sha3.exports;
    	hasRequiredSha3 = 1;
    	(function (module, exports) {
    (function (root, factory, undef) {
    			{
    				// CommonJS
    				module.exports = factory(requireCore(), requireX64Core());
    			}
    		}(commonjsGlobal, function (CryptoJS) {

    			(function (Math) {
    			    // Shortcuts
    			    var C = CryptoJS;
    			    var C_lib = C.lib;
    			    var WordArray = C_lib.WordArray;
    			    var Hasher = C_lib.Hasher;
    			    var C_x64 = C.x64;
    			    var X64Word = C_x64.Word;
    			    var C_algo = C.algo;

    			    // Constants tables
    			    var RHO_OFFSETS = [];
    			    var PI_INDEXES  = [];
    			    var ROUND_CONSTANTS = [];

    			    // Compute Constants
    			    (function () {
    			        // Compute rho offset constants
    			        var x = 1, y = 0;
    			        for (var t = 0; t < 24; t++) {
    			            RHO_OFFSETS[x + 5 * y] = ((t + 1) * (t + 2) / 2) % 64;

    			            var newX = y % 5;
    			            var newY = (2 * x + 3 * y) % 5;
    			            x = newX;
    			            y = newY;
    			        }

    			        // Compute pi index constants
    			        for (var x = 0; x < 5; x++) {
    			            for (var y = 0; y < 5; y++) {
    			                PI_INDEXES[x + 5 * y] = y + ((2 * x + 3 * y) % 5) * 5;
    			            }
    			        }

    			        // Compute round constants
    			        var LFSR = 0x01;
    			        for (var i = 0; i < 24; i++) {
    			            var roundConstantMsw = 0;
    			            var roundConstantLsw = 0;

    			            for (var j = 0; j < 7; j++) {
    			                if (LFSR & 0x01) {
    			                    var bitPosition = (1 << j) - 1;
    			                    if (bitPosition < 32) {
    			                        roundConstantLsw ^= 1 << bitPosition;
    			                    } else /* if (bitPosition >= 32) */ {
    			                        roundConstantMsw ^= 1 << (bitPosition - 32);
    			                    }
    			                }

    			                // Compute next LFSR
    			                if (LFSR & 0x80) {
    			                    // Primitive polynomial over GF(2): x^8 + x^6 + x^5 + x^4 + 1
    			                    LFSR = (LFSR << 1) ^ 0x71;
    			                } else {
    			                    LFSR <<= 1;
    			                }
    			            }

    			            ROUND_CONSTANTS[i] = X64Word.create(roundConstantMsw, roundConstantLsw);
    			        }
    			    }());

    			    // Reusable objects for temporary values
    			    var T = [];
    			    (function () {
    			        for (var i = 0; i < 25; i++) {
    			            T[i] = X64Word.create();
    			        }
    			    }());

    			    /**
    			     * SHA-3 hash algorithm.
    			     */
    			    var SHA3 = C_algo.SHA3 = Hasher.extend({
    			        /**
    			         * Configuration options.
    			         *
    			         * @property {number} outputLength
    			         *   The desired number of bits in the output hash.
    			         *   Only values permitted are: 224, 256, 384, 512.
    			         *   Default: 512
    			         */
    			        cfg: Hasher.cfg.extend({
    			            outputLength: 512
    			        }),

    			        _doReset: function () {
    			            var state = this._state = [];
    			            for (var i = 0; i < 25; i++) {
    			                state[i] = new X64Word.init();
    			            }

    			            this.blockSize = (1600 - 2 * this.cfg.outputLength) / 32;
    			        },

    			        _doProcessBlock: function (M, offset) {
    			            // Shortcuts
    			            var state = this._state;
    			            var nBlockSizeLanes = this.blockSize / 2;

    			            // Absorb
    			            for (var i = 0; i < nBlockSizeLanes; i++) {
    			                // Shortcuts
    			                var M2i  = M[offset + 2 * i];
    			                var M2i1 = M[offset + 2 * i + 1];

    			                // Swap endian
    			                M2i = (
    			                    (((M2i << 8)  | (M2i >>> 24)) & 0x00ff00ff) |
    			                    (((M2i << 24) | (M2i >>> 8))  & 0xff00ff00)
    			                );
    			                M2i1 = (
    			                    (((M2i1 << 8)  | (M2i1 >>> 24)) & 0x00ff00ff) |
    			                    (((M2i1 << 24) | (M2i1 >>> 8))  & 0xff00ff00)
    			                );

    			                // Absorb message into state
    			                var lane = state[i];
    			                lane.high ^= M2i1;
    			                lane.low  ^= M2i;
    			            }

    			            // Rounds
    			            for (var round = 0; round < 24; round++) {
    			                // Theta
    			                for (var x = 0; x < 5; x++) {
    			                    // Mix column lanes
    			                    var tMsw = 0, tLsw = 0;
    			                    for (var y = 0; y < 5; y++) {
    			                        var lane = state[x + 5 * y];
    			                        tMsw ^= lane.high;
    			                        tLsw ^= lane.low;
    			                    }

    			                    // Temporary values
    			                    var Tx = T[x];
    			                    Tx.high = tMsw;
    			                    Tx.low  = tLsw;
    			                }
    			                for (var x = 0; x < 5; x++) {
    			                    // Shortcuts
    			                    var Tx4 = T[(x + 4) % 5];
    			                    var Tx1 = T[(x + 1) % 5];
    			                    var Tx1Msw = Tx1.high;
    			                    var Tx1Lsw = Tx1.low;

    			                    // Mix surrounding columns
    			                    var tMsw = Tx4.high ^ ((Tx1Msw << 1) | (Tx1Lsw >>> 31));
    			                    var tLsw = Tx4.low  ^ ((Tx1Lsw << 1) | (Tx1Msw >>> 31));
    			                    for (var y = 0; y < 5; y++) {
    			                        var lane = state[x + 5 * y];
    			                        lane.high ^= tMsw;
    			                        lane.low  ^= tLsw;
    			                    }
    			                }

    			                // Rho Pi
    			                for (var laneIndex = 1; laneIndex < 25; laneIndex++) {
    			                    var tMsw;
    			                    var tLsw;

    			                    // Shortcuts
    			                    var lane = state[laneIndex];
    			                    var laneMsw = lane.high;
    			                    var laneLsw = lane.low;
    			                    var rhoOffset = RHO_OFFSETS[laneIndex];

    			                    // Rotate lanes
    			                    if (rhoOffset < 32) {
    			                        tMsw = (laneMsw << rhoOffset) | (laneLsw >>> (32 - rhoOffset));
    			                        tLsw = (laneLsw << rhoOffset) | (laneMsw >>> (32 - rhoOffset));
    			                    } else /* if (rhoOffset >= 32) */ {
    			                        tMsw = (laneLsw << (rhoOffset - 32)) | (laneMsw >>> (64 - rhoOffset));
    			                        tLsw = (laneMsw << (rhoOffset - 32)) | (laneLsw >>> (64 - rhoOffset));
    			                    }

    			                    // Transpose lanes
    			                    var TPiLane = T[PI_INDEXES[laneIndex]];
    			                    TPiLane.high = tMsw;
    			                    TPiLane.low  = tLsw;
    			                }

    			                // Rho pi at x = y = 0
    			                var T0 = T[0];
    			                var state0 = state[0];
    			                T0.high = state0.high;
    			                T0.low  = state0.low;

    			                // Chi
    			                for (var x = 0; x < 5; x++) {
    			                    for (var y = 0; y < 5; y++) {
    			                        // Shortcuts
    			                        var laneIndex = x + 5 * y;
    			                        var lane = state[laneIndex];
    			                        var TLane = T[laneIndex];
    			                        var Tx1Lane = T[((x + 1) % 5) + 5 * y];
    			                        var Tx2Lane = T[((x + 2) % 5) + 5 * y];

    			                        // Mix rows
    			                        lane.high = TLane.high ^ (~Tx1Lane.high & Tx2Lane.high);
    			                        lane.low  = TLane.low  ^ (~Tx1Lane.low  & Tx2Lane.low);
    			                    }
    			                }

    			                // Iota
    			                var lane = state[0];
    			                var roundConstant = ROUND_CONSTANTS[round];
    			                lane.high ^= roundConstant.high;
    			                lane.low  ^= roundConstant.low;
    			            }
    			        },

    			        _doFinalize: function () {
    			            // Shortcuts
    			            var data = this._data;
    			            var dataWords = data.words;
    			            this._nDataBytes * 8;
    			            var nBitsLeft = data.sigBytes * 8;
    			            var blockSizeBits = this.blockSize * 32;

    			            // Add padding
    			            dataWords[nBitsLeft >>> 5] |= 0x1 << (24 - nBitsLeft % 32);
    			            dataWords[((Math.ceil((nBitsLeft + 1) / blockSizeBits) * blockSizeBits) >>> 5) - 1] |= 0x80;
    			            data.sigBytes = dataWords.length * 4;

    			            // Hash final blocks
    			            this._process();

    			            // Shortcuts
    			            var state = this._state;
    			            var outputLengthBytes = this.cfg.outputLength / 8;
    			            var outputLengthLanes = outputLengthBytes / 8;

    			            // Squeeze
    			            var hashWords = [];
    			            for (var i = 0; i < outputLengthLanes; i++) {
    			                // Shortcuts
    			                var lane = state[i];
    			                var laneMsw = lane.high;
    			                var laneLsw = lane.low;

    			                // Swap endian
    			                laneMsw = (
    			                    (((laneMsw << 8)  | (laneMsw >>> 24)) & 0x00ff00ff) |
    			                    (((laneMsw << 24) | (laneMsw >>> 8))  & 0xff00ff00)
    			                );
    			                laneLsw = (
    			                    (((laneLsw << 8)  | (laneLsw >>> 24)) & 0x00ff00ff) |
    			                    (((laneLsw << 24) | (laneLsw >>> 8))  & 0xff00ff00)
    			                );

    			                // Squeeze state to retrieve hash
    			                hashWords.push(laneLsw);
    			                hashWords.push(laneMsw);
    			            }

    			            // Return final computed hash
    			            return new WordArray.init(hashWords, outputLengthBytes);
    			        },

    			        clone: function () {
    			            var clone = Hasher.clone.call(this);

    			            var state = clone._state = this._state.slice(0);
    			            for (var i = 0; i < 25; i++) {
    			                state[i] = state[i].clone();
    			            }

    			            return clone;
    			        }
    			    });

    			    /**
    			     * Shortcut function to the hasher's object interface.
    			     *
    			     * @param {WordArray|string} message The message to hash.
    			     *
    			     * @return {WordArray} The hash.
    			     *
    			     * @static
    			     *
    			     * @example
    			     *
    			     *     var hash = CryptoJS.SHA3('message');
    			     *     var hash = CryptoJS.SHA3(wordArray);
    			     */
    			    C.SHA3 = Hasher._createHelper(SHA3);

    			    /**
    			     * Shortcut function to the HMAC's object interface.
    			     *
    			     * @param {WordArray|string} message The message to hash.
    			     * @param {WordArray|string} key The secret key.
    			     *
    			     * @return {WordArray} The HMAC.
    			     *
    			     * @static
    			     *
    			     * @example
    			     *
    			     *     var hmac = CryptoJS.HmacSHA3(message, key);
    			     */
    			    C.HmacSHA3 = Hasher._createHmacHelper(SHA3);
    			}(Math));


    			return CryptoJS.SHA3;

    		})); 
    	} (sha3));
    	return sha3.exports;
    }

    var ripemd160 = {exports: {}};

    var hasRequiredRipemd160;

    function requireRipemd160 () {
    	if (hasRequiredRipemd160) return ripemd160.exports;
    	hasRequiredRipemd160 = 1;
    	(function (module, exports) {
    (function (root, factory) {
    			{
    				// CommonJS
    				module.exports = factory(requireCore());
    			}
    		}(commonjsGlobal, function (CryptoJS) {

    			/** @preserve
    			(c) 2012 by Cédric Mesnil. All rights reserved.

    			Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

    			    - Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
    			    - Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

    			THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
    			*/

    			(function (Math) {
    			    // Shortcuts
    			    var C = CryptoJS;
    			    var C_lib = C.lib;
    			    var WordArray = C_lib.WordArray;
    			    var Hasher = C_lib.Hasher;
    			    var C_algo = C.algo;

    			    // Constants table
    			    var _zl = WordArray.create([
    			        0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14, 15,
    			        7,  4, 13,  1, 10,  6, 15,  3, 12,  0,  9,  5,  2, 14, 11,  8,
    			        3, 10, 14,  4,  9, 15,  8,  1,  2,  7,  0,  6, 13, 11,  5, 12,
    			        1,  9, 11, 10,  0,  8, 12,  4, 13,  3,  7, 15, 14,  5,  6,  2,
    			        4,  0,  5,  9,  7, 12,  2, 10, 14,  1,  3,  8, 11,  6, 15, 13]);
    			    var _zr = WordArray.create([
    			        5, 14,  7,  0,  9,  2, 11,  4, 13,  6, 15,  8,  1, 10,  3, 12,
    			        6, 11,  3,  7,  0, 13,  5, 10, 14, 15,  8, 12,  4,  9,  1,  2,
    			        15,  5,  1,  3,  7, 14,  6,  9, 11,  8, 12,  2, 10,  0,  4, 13,
    			        8,  6,  4,  1,  3, 11, 15,  0,  5, 12,  2, 13,  9,  7, 10, 14,
    			        12, 15, 10,  4,  1,  5,  8,  7,  6,  2, 13, 14,  0,  3,  9, 11]);
    			    var _sl = WordArray.create([
    			         11, 14, 15, 12,  5,  8,  7,  9, 11, 13, 14, 15,  6,  7,  9,  8,
    			        7, 6,   8, 13, 11,  9,  7, 15,  7, 12, 15,  9, 11,  7, 13, 12,
    			        11, 13,  6,  7, 14,  9, 13, 15, 14,  8, 13,  6,  5, 12,  7,  5,
    			          11, 12, 14, 15, 14, 15,  9,  8,  9, 14,  5,  6,  8,  6,  5, 12,
    			        9, 15,  5, 11,  6,  8, 13, 12,  5, 12, 13, 14, 11,  8,  5,  6 ]);
    			    var _sr = WordArray.create([
    			        8,  9,  9, 11, 13, 15, 15,  5,  7,  7,  8, 11, 14, 14, 12,  6,
    			        9, 13, 15,  7, 12,  8,  9, 11,  7,  7, 12,  7,  6, 15, 13, 11,
    			        9,  7, 15, 11,  8,  6,  6, 14, 12, 13,  5, 14, 13, 13,  7,  5,
    			        15,  5,  8, 11, 14, 14,  6, 14,  6,  9, 12,  9, 12,  5, 15,  8,
    			        8,  5, 12,  9, 12,  5, 14,  6,  8, 13,  6,  5, 15, 13, 11, 11 ]);

    			    var _hl =  WordArray.create([ 0x00000000, 0x5A827999, 0x6ED9EBA1, 0x8F1BBCDC, 0xA953FD4E]);
    			    var _hr =  WordArray.create([ 0x50A28BE6, 0x5C4DD124, 0x6D703EF3, 0x7A6D76E9, 0x00000000]);

    			    /**
    			     * RIPEMD160 hash algorithm.
    			     */
    			    var RIPEMD160 = C_algo.RIPEMD160 = Hasher.extend({
    			        _doReset: function () {
    			            this._hash  = WordArray.create([0x67452301, 0xEFCDAB89, 0x98BADCFE, 0x10325476, 0xC3D2E1F0]);
    			        },

    			        _doProcessBlock: function (M, offset) {

    			            // Swap endian
    			            for (var i = 0; i < 16; i++) {
    			                // Shortcuts
    			                var offset_i = offset + i;
    			                var M_offset_i = M[offset_i];

    			                // Swap
    			                M[offset_i] = (
    			                    (((M_offset_i << 8)  | (M_offset_i >>> 24)) & 0x00ff00ff) |
    			                    (((M_offset_i << 24) | (M_offset_i >>> 8))  & 0xff00ff00)
    			                );
    			            }
    			            // Shortcut
    			            var H  = this._hash.words;
    			            var hl = _hl.words;
    			            var hr = _hr.words;
    			            var zl = _zl.words;
    			            var zr = _zr.words;
    			            var sl = _sl.words;
    			            var sr = _sr.words;

    			            // Working variables
    			            var al, bl, cl, dl, el;
    			            var ar, br, cr, dr, er;

    			            ar = al = H[0];
    			            br = bl = H[1];
    			            cr = cl = H[2];
    			            dr = dl = H[3];
    			            er = el = H[4];
    			            // Computation
    			            var t;
    			            for (var i = 0; i < 80; i += 1) {
    			                t = (al +  M[offset+zl[i]])|0;
    			                if (i<16){
    				            t +=  f1(bl,cl,dl) + hl[0];
    			                } else if (i<32) {
    				            t +=  f2(bl,cl,dl) + hl[1];
    			                } else if (i<48) {
    				            t +=  f3(bl,cl,dl) + hl[2];
    			                } else if (i<64) {
    				            t +=  f4(bl,cl,dl) + hl[3];
    			                } else {// if (i<80) {
    				            t +=  f5(bl,cl,dl) + hl[4];
    			                }
    			                t = t|0;
    			                t =  rotl(t,sl[i]);
    			                t = (t+el)|0;
    			                al = el;
    			                el = dl;
    			                dl = rotl(cl, 10);
    			                cl = bl;
    			                bl = t;

    			                t = (ar + M[offset+zr[i]])|0;
    			                if (i<16){
    				            t +=  f5(br,cr,dr) + hr[0];
    			                } else if (i<32) {
    				            t +=  f4(br,cr,dr) + hr[1];
    			                } else if (i<48) {
    				            t +=  f3(br,cr,dr) + hr[2];
    			                } else if (i<64) {
    				            t +=  f2(br,cr,dr) + hr[3];
    			                } else {// if (i<80) {
    				            t +=  f1(br,cr,dr) + hr[4];
    			                }
    			                t = t|0;
    			                t =  rotl(t,sr[i]) ;
    			                t = (t+er)|0;
    			                ar = er;
    			                er = dr;
    			                dr = rotl(cr, 10);
    			                cr = br;
    			                br = t;
    			            }
    			            // Intermediate hash value
    			            t    = (H[1] + cl + dr)|0;
    			            H[1] = (H[2] + dl + er)|0;
    			            H[2] = (H[3] + el + ar)|0;
    			            H[3] = (H[4] + al + br)|0;
    			            H[4] = (H[0] + bl + cr)|0;
    			            H[0] =  t;
    			        },

    			        _doFinalize: function () {
    			            // Shortcuts
    			            var data = this._data;
    			            var dataWords = data.words;

    			            var nBitsTotal = this._nDataBytes * 8;
    			            var nBitsLeft = data.sigBytes * 8;

    			            // Add padding
    			            dataWords[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32);
    			            dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 14] = (
    			                (((nBitsTotal << 8)  | (nBitsTotal >>> 24)) & 0x00ff00ff) |
    			                (((nBitsTotal << 24) | (nBitsTotal >>> 8))  & 0xff00ff00)
    			            );
    			            data.sigBytes = (dataWords.length + 1) * 4;

    			            // Hash final blocks
    			            this._process();

    			            // Shortcuts
    			            var hash = this._hash;
    			            var H = hash.words;

    			            // Swap endian
    			            for (var i = 0; i < 5; i++) {
    			                // Shortcut
    			                var H_i = H[i];

    			                // Swap
    			                H[i] = (((H_i << 8)  | (H_i >>> 24)) & 0x00ff00ff) |
    			                       (((H_i << 24) | (H_i >>> 8))  & 0xff00ff00);
    			            }

    			            // Return final computed hash
    			            return hash;
    			        },

    			        clone: function () {
    			            var clone = Hasher.clone.call(this);
    			            clone._hash = this._hash.clone();

    			            return clone;
    			        }
    			    });


    			    function f1(x, y, z) {
    			        return ((x) ^ (y) ^ (z));

    			    }

    			    function f2(x, y, z) {
    			        return (((x)&(y)) | ((~x)&(z)));
    			    }

    			    function f3(x, y, z) {
    			        return (((x) | (~(y))) ^ (z));
    			    }

    			    function f4(x, y, z) {
    			        return (((x) & (z)) | ((y)&(~(z))));
    			    }

    			    function f5(x, y, z) {
    			        return ((x) ^ ((y) |(~(z))));

    			    }

    			    function rotl(x,n) {
    			        return (x<<n) | (x>>>(32-n));
    			    }


    			    /**
    			     * Shortcut function to the hasher's object interface.
    			     *
    			     * @param {WordArray|string} message The message to hash.
    			     *
    			     * @return {WordArray} The hash.
    			     *
    			     * @static
    			     *
    			     * @example
    			     *
    			     *     var hash = CryptoJS.RIPEMD160('message');
    			     *     var hash = CryptoJS.RIPEMD160(wordArray);
    			     */
    			    C.RIPEMD160 = Hasher._createHelper(RIPEMD160);

    			    /**
    			     * Shortcut function to the HMAC's object interface.
    			     *
    			     * @param {WordArray|string} message The message to hash.
    			     * @param {WordArray|string} key The secret key.
    			     *
    			     * @return {WordArray} The HMAC.
    			     *
    			     * @static
    			     *
    			     * @example
    			     *
    			     *     var hmac = CryptoJS.HmacRIPEMD160(message, key);
    			     */
    			    C.HmacRIPEMD160 = Hasher._createHmacHelper(RIPEMD160);
    			}());


    			return CryptoJS.RIPEMD160;

    		})); 
    	} (ripemd160));
    	return ripemd160.exports;
    }

    var hmac = {exports: {}};

    var hasRequiredHmac;

    function requireHmac () {
    	if (hasRequiredHmac) return hmac.exports;
    	hasRequiredHmac = 1;
    	(function (module, exports) {
    (function (root, factory) {
    			{
    				// CommonJS
    				module.exports = factory(requireCore());
    			}
    		}(commonjsGlobal, function (CryptoJS) {

    			(function () {
    			    // Shortcuts
    			    var C = CryptoJS;
    			    var C_lib = C.lib;
    			    var Base = C_lib.Base;
    			    var C_enc = C.enc;
    			    var Utf8 = C_enc.Utf8;
    			    var C_algo = C.algo;

    			    /**
    			     * HMAC algorithm.
    			     */
    			    C_algo.HMAC = Base.extend({
    			        /**
    			         * Initializes a newly created HMAC.
    			         *
    			         * @param {Hasher} hasher The hash algorithm to use.
    			         * @param {WordArray|string} key The secret key.
    			         *
    			         * @example
    			         *
    			         *     var hmacHasher = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, key);
    			         */
    			        init: function (hasher, key) {
    			            // Init hasher
    			            hasher = this._hasher = new hasher.init();

    			            // Convert string to WordArray, else assume WordArray already
    			            if (typeof key == 'string') {
    			                key = Utf8.parse(key);
    			            }

    			            // Shortcuts
    			            var hasherBlockSize = hasher.blockSize;
    			            var hasherBlockSizeBytes = hasherBlockSize * 4;

    			            // Allow arbitrary length keys
    			            if (key.sigBytes > hasherBlockSizeBytes) {
    			                key = hasher.finalize(key);
    			            }

    			            // Clamp excess bits
    			            key.clamp();

    			            // Clone key for inner and outer pads
    			            var oKey = this._oKey = key.clone();
    			            var iKey = this._iKey = key.clone();

    			            // Shortcuts
    			            var oKeyWords = oKey.words;
    			            var iKeyWords = iKey.words;

    			            // XOR keys with pad constants
    			            for (var i = 0; i < hasherBlockSize; i++) {
    			                oKeyWords[i] ^= 0x5c5c5c5c;
    			                iKeyWords[i] ^= 0x36363636;
    			            }
    			            oKey.sigBytes = iKey.sigBytes = hasherBlockSizeBytes;

    			            // Set initial values
    			            this.reset();
    			        },

    			        /**
    			         * Resets this HMAC to its initial state.
    			         *
    			         * @example
    			         *
    			         *     hmacHasher.reset();
    			         */
    			        reset: function () {
    			            // Shortcut
    			            var hasher = this._hasher;

    			            // Reset
    			            hasher.reset();
    			            hasher.update(this._iKey);
    			        },

    			        /**
    			         * Updates this HMAC with a message.
    			         *
    			         * @param {WordArray|string} messageUpdate The message to append.
    			         *
    			         * @return {HMAC} This HMAC instance.
    			         *
    			         * @example
    			         *
    			         *     hmacHasher.update('message');
    			         *     hmacHasher.update(wordArray);
    			         */
    			        update: function (messageUpdate) {
    			            this._hasher.update(messageUpdate);

    			            // Chainable
    			            return this;
    			        },

    			        /**
    			         * Finalizes the HMAC computation.
    			         * Note that the finalize operation is effectively a destructive, read-once operation.
    			         *
    			         * @param {WordArray|string} messageUpdate (Optional) A final message update.
    			         *
    			         * @return {WordArray} The HMAC.
    			         *
    			         * @example
    			         *
    			         *     var hmac = hmacHasher.finalize();
    			         *     var hmac = hmacHasher.finalize('message');
    			         *     var hmac = hmacHasher.finalize(wordArray);
    			         */
    			        finalize: function (messageUpdate) {
    			            // Shortcut
    			            var hasher = this._hasher;

    			            // Compute HMAC
    			            var innerHash = hasher.finalize(messageUpdate);
    			            hasher.reset();
    			            var hmac = hasher.finalize(this._oKey.clone().concat(innerHash));

    			            return hmac;
    			        }
    			    });
    			}());


    		})); 
    	} (hmac));
    	return hmac.exports;
    }

    var pbkdf2 = {exports: {}};

    var hasRequiredPbkdf2;

    function requirePbkdf2 () {
    	if (hasRequiredPbkdf2) return pbkdf2.exports;
    	hasRequiredPbkdf2 = 1;
    	(function (module, exports) {
    (function (root, factory, undef) {
    			{
    				// CommonJS
    				module.exports = factory(requireCore(), requireSha256(), requireHmac());
    			}
    		}(commonjsGlobal, function (CryptoJS) {

    			(function () {
    			    // Shortcuts
    			    var C = CryptoJS;
    			    var C_lib = C.lib;
    			    var Base = C_lib.Base;
    			    var WordArray = C_lib.WordArray;
    			    var C_algo = C.algo;
    			    var SHA256 = C_algo.SHA256;
    			    var HMAC = C_algo.HMAC;

    			    /**
    			     * Password-Based Key Derivation Function 2 algorithm.
    			     */
    			    var PBKDF2 = C_algo.PBKDF2 = Base.extend({
    			        /**
    			         * Configuration options.
    			         *
    			         * @property {number} keySize The key size in words to generate. Default: 4 (128 bits)
    			         * @property {Hasher} hasher The hasher to use. Default: SHA256
    			         * @property {number} iterations The number of iterations to perform. Default: 250000
    			         */
    			        cfg: Base.extend({
    			            keySize: 128/32,
    			            hasher: SHA256,
    			            iterations: 250000
    			        }),

    			        /**
    			         * Initializes a newly created key derivation function.
    			         *
    			         * @param {Object} cfg (Optional) The configuration options to use for the derivation.
    			         *
    			         * @example
    			         *
    			         *     var kdf = CryptoJS.algo.PBKDF2.create();
    			         *     var kdf = CryptoJS.algo.PBKDF2.create({ keySize: 8 });
    			         *     var kdf = CryptoJS.algo.PBKDF2.create({ keySize: 8, iterations: 1000 });
    			         */
    			        init: function (cfg) {
    			            this.cfg = this.cfg.extend(cfg);
    			        },

    			        /**
    			         * Computes the Password-Based Key Derivation Function 2.
    			         *
    			         * @param {WordArray|string} password The password.
    			         * @param {WordArray|string} salt A salt.
    			         *
    			         * @return {WordArray} The derived key.
    			         *
    			         * @example
    			         *
    			         *     var key = kdf.compute(password, salt);
    			         */
    			        compute: function (password, salt) {
    			            // Shortcut
    			            var cfg = this.cfg;

    			            // Init HMAC
    			            var hmac = HMAC.create(cfg.hasher, password);

    			            // Initial values
    			            var derivedKey = WordArray.create();
    			            var blockIndex = WordArray.create([0x00000001]);

    			            // Shortcuts
    			            var derivedKeyWords = derivedKey.words;
    			            var blockIndexWords = blockIndex.words;
    			            var keySize = cfg.keySize;
    			            var iterations = cfg.iterations;

    			            // Generate key
    			            while (derivedKeyWords.length < keySize) {
    			                var block = hmac.update(salt).finalize(blockIndex);
    			                hmac.reset();

    			                // Shortcuts
    			                var blockWords = block.words;
    			                var blockWordsLength = blockWords.length;

    			                // Iterations
    			                var intermediate = block;
    			                for (var i = 1; i < iterations; i++) {
    			                    intermediate = hmac.finalize(intermediate);
    			                    hmac.reset();

    			                    // Shortcut
    			                    var intermediateWords = intermediate.words;

    			                    // XOR intermediate with block
    			                    for (var j = 0; j < blockWordsLength; j++) {
    			                        blockWords[j] ^= intermediateWords[j];
    			                    }
    			                }

    			                derivedKey.concat(block);
    			                blockIndexWords[0]++;
    			            }
    			            derivedKey.sigBytes = keySize * 4;

    			            return derivedKey;
    			        }
    			    });

    			    /**
    			     * Computes the Password-Based Key Derivation Function 2.
    			     *
    			     * @param {WordArray|string} password The password.
    			     * @param {WordArray|string} salt A salt.
    			     * @param {Object} cfg (Optional) The configuration options to use for this computation.
    			     *
    			     * @return {WordArray} The derived key.
    			     *
    			     * @static
    			     *
    			     * @example
    			     *
    			     *     var key = CryptoJS.PBKDF2(password, salt);
    			     *     var key = CryptoJS.PBKDF2(password, salt, { keySize: 8 });
    			     *     var key = CryptoJS.PBKDF2(password, salt, { keySize: 8, iterations: 1000 });
    			     */
    			    C.PBKDF2 = function (password, salt, cfg) {
    			        return PBKDF2.create(cfg).compute(password, salt);
    			    };
    			}());


    			return CryptoJS.PBKDF2;

    		})); 
    	} (pbkdf2));
    	return pbkdf2.exports;
    }

    var evpkdf = {exports: {}};

    var hasRequiredEvpkdf;

    function requireEvpkdf () {
    	if (hasRequiredEvpkdf) return evpkdf.exports;
    	hasRequiredEvpkdf = 1;
    	(function (module, exports) {
    (function (root, factory, undef) {
    			{
    				// CommonJS
    				module.exports = factory(requireCore(), requireSha1(), requireHmac());
    			}
    		}(commonjsGlobal, function (CryptoJS) {

    			(function () {
    			    // Shortcuts
    			    var C = CryptoJS;
    			    var C_lib = C.lib;
    			    var Base = C_lib.Base;
    			    var WordArray = C_lib.WordArray;
    			    var C_algo = C.algo;
    			    var MD5 = C_algo.MD5;

    			    /**
    			     * This key derivation function is meant to conform with EVP_BytesToKey.
    			     * www.openssl.org/docs/crypto/EVP_BytesToKey.html
    			     */
    			    var EvpKDF = C_algo.EvpKDF = Base.extend({
    			        /**
    			         * Configuration options.
    			         *
    			         * @property {number} keySize The key size in words to generate. Default: 4 (128 bits)
    			         * @property {Hasher} hasher The hash algorithm to use. Default: MD5
    			         * @property {number} iterations The number of iterations to perform. Default: 1
    			         */
    			        cfg: Base.extend({
    			            keySize: 128/32,
    			            hasher: MD5,
    			            iterations: 1
    			        }),

    			        /**
    			         * Initializes a newly created key derivation function.
    			         *
    			         * @param {Object} cfg (Optional) The configuration options to use for the derivation.
    			         *
    			         * @example
    			         *
    			         *     var kdf = CryptoJS.algo.EvpKDF.create();
    			         *     var kdf = CryptoJS.algo.EvpKDF.create({ keySize: 8 });
    			         *     var kdf = CryptoJS.algo.EvpKDF.create({ keySize: 8, iterations: 1000 });
    			         */
    			        init: function (cfg) {
    			            this.cfg = this.cfg.extend(cfg);
    			        },

    			        /**
    			         * Derives a key from a password.
    			         *
    			         * @param {WordArray|string} password The password.
    			         * @param {WordArray|string} salt A salt.
    			         *
    			         * @return {WordArray} The derived key.
    			         *
    			         * @example
    			         *
    			         *     var key = kdf.compute(password, salt);
    			         */
    			        compute: function (password, salt) {
    			            var block;

    			            // Shortcut
    			            var cfg = this.cfg;

    			            // Init hasher
    			            var hasher = cfg.hasher.create();

    			            // Initial values
    			            var derivedKey = WordArray.create();

    			            // Shortcuts
    			            var derivedKeyWords = derivedKey.words;
    			            var keySize = cfg.keySize;
    			            var iterations = cfg.iterations;

    			            // Generate key
    			            while (derivedKeyWords.length < keySize) {
    			                if (block) {
    			                    hasher.update(block);
    			                }
    			                block = hasher.update(password).finalize(salt);
    			                hasher.reset();

    			                // Iterations
    			                for (var i = 1; i < iterations; i++) {
    			                    block = hasher.finalize(block);
    			                    hasher.reset();
    			                }

    			                derivedKey.concat(block);
    			            }
    			            derivedKey.sigBytes = keySize * 4;

    			            return derivedKey;
    			        }
    			    });

    			    /**
    			     * Derives a key from a password.
    			     *
    			     * @param {WordArray|string} password The password.
    			     * @param {WordArray|string} salt A salt.
    			     * @param {Object} cfg (Optional) The configuration options to use for this computation.
    			     *
    			     * @return {WordArray} The derived key.
    			     *
    			     * @static
    			     *
    			     * @example
    			     *
    			     *     var key = CryptoJS.EvpKDF(password, salt);
    			     *     var key = CryptoJS.EvpKDF(password, salt, { keySize: 8 });
    			     *     var key = CryptoJS.EvpKDF(password, salt, { keySize: 8, iterations: 1000 });
    			     */
    			    C.EvpKDF = function (password, salt, cfg) {
    			        return EvpKDF.create(cfg).compute(password, salt);
    			    };
    			}());


    			return CryptoJS.EvpKDF;

    		})); 
    	} (evpkdf));
    	return evpkdf.exports;
    }

    var cipherCore = {exports: {}};

    var hasRequiredCipherCore;

    function requireCipherCore () {
    	if (hasRequiredCipherCore) return cipherCore.exports;
    	hasRequiredCipherCore = 1;
    	(function (module, exports) {
    (function (root, factory, undef) {
    			{
    				// CommonJS
    				module.exports = factory(requireCore(), requireEvpkdf());
    			}
    		}(commonjsGlobal, function (CryptoJS) {

    			/**
    			 * Cipher core components.
    			 */
    			CryptoJS.lib.Cipher || (function (undefined$1) {
    			    // Shortcuts
    			    var C = CryptoJS;
    			    var C_lib = C.lib;
    			    var Base = C_lib.Base;
    			    var WordArray = C_lib.WordArray;
    			    var BufferedBlockAlgorithm = C_lib.BufferedBlockAlgorithm;
    			    var C_enc = C.enc;
    			    C_enc.Utf8;
    			    var Base64 = C_enc.Base64;
    			    var C_algo = C.algo;
    			    var EvpKDF = C_algo.EvpKDF;

    			    /**
    			     * Abstract base cipher template.
    			     *
    			     * @property {number} keySize This cipher's key size. Default: 4 (128 bits)
    			     * @property {number} ivSize This cipher's IV size. Default: 4 (128 bits)
    			     * @property {number} _ENC_XFORM_MODE A constant representing encryption mode.
    			     * @property {number} _DEC_XFORM_MODE A constant representing decryption mode.
    			     */
    			    var Cipher = C_lib.Cipher = BufferedBlockAlgorithm.extend({
    			        /**
    			         * Configuration options.
    			         *
    			         * @property {WordArray} iv The IV to use for this operation.
    			         */
    			        cfg: Base.extend(),

    			        /**
    			         * Creates this cipher in encryption mode.
    			         *
    			         * @param {WordArray} key The key.
    			         * @param {Object} cfg (Optional) The configuration options to use for this operation.
    			         *
    			         * @return {Cipher} A cipher instance.
    			         *
    			         * @static
    			         *
    			         * @example
    			         *
    			         *     var cipher = CryptoJS.algo.AES.createEncryptor(keyWordArray, { iv: ivWordArray });
    			         */
    			        createEncryptor: function (key, cfg) {
    			            return this.create(this._ENC_XFORM_MODE, key, cfg);
    			        },

    			        /**
    			         * Creates this cipher in decryption mode.
    			         *
    			         * @param {WordArray} key The key.
    			         * @param {Object} cfg (Optional) The configuration options to use for this operation.
    			         *
    			         * @return {Cipher} A cipher instance.
    			         *
    			         * @static
    			         *
    			         * @example
    			         *
    			         *     var cipher = CryptoJS.algo.AES.createDecryptor(keyWordArray, { iv: ivWordArray });
    			         */
    			        createDecryptor: function (key, cfg) {
    			            return this.create(this._DEC_XFORM_MODE, key, cfg);
    			        },

    			        /**
    			         * Initializes a newly created cipher.
    			         *
    			         * @param {number} xformMode Either the encryption or decryption transormation mode constant.
    			         * @param {WordArray} key The key.
    			         * @param {Object} cfg (Optional) The configuration options to use for this operation.
    			         *
    			         * @example
    			         *
    			         *     var cipher = CryptoJS.algo.AES.create(CryptoJS.algo.AES._ENC_XFORM_MODE, keyWordArray, { iv: ivWordArray });
    			         */
    			        init: function (xformMode, key, cfg) {
    			            // Apply config defaults
    			            this.cfg = this.cfg.extend(cfg);

    			            // Store transform mode and key
    			            this._xformMode = xformMode;
    			            this._key = key;

    			            // Set initial values
    			            this.reset();
    			        },

    			        /**
    			         * Resets this cipher to its initial state.
    			         *
    			         * @example
    			         *
    			         *     cipher.reset();
    			         */
    			        reset: function () {
    			            // Reset data buffer
    			            BufferedBlockAlgorithm.reset.call(this);

    			            // Perform concrete-cipher logic
    			            this._doReset();
    			        },

    			        /**
    			         * Adds data to be encrypted or decrypted.
    			         *
    			         * @param {WordArray|string} dataUpdate The data to encrypt or decrypt.
    			         *
    			         * @return {WordArray} The data after processing.
    			         *
    			         * @example
    			         *
    			         *     var encrypted = cipher.process('data');
    			         *     var encrypted = cipher.process(wordArray);
    			         */
    			        process: function (dataUpdate) {
    			            // Append
    			            this._append(dataUpdate);

    			            // Process available blocks
    			            return this._process();
    			        },

    			        /**
    			         * Finalizes the encryption or decryption process.
    			         * Note that the finalize operation is effectively a destructive, read-once operation.
    			         *
    			         * @param {WordArray|string} dataUpdate The final data to encrypt or decrypt.
    			         *
    			         * @return {WordArray} The data after final processing.
    			         *
    			         * @example
    			         *
    			         *     var encrypted = cipher.finalize();
    			         *     var encrypted = cipher.finalize('data');
    			         *     var encrypted = cipher.finalize(wordArray);
    			         */
    			        finalize: function (dataUpdate) {
    			            // Final data update
    			            if (dataUpdate) {
    			                this._append(dataUpdate);
    			            }

    			            // Perform concrete-cipher logic
    			            var finalProcessedData = this._doFinalize();

    			            return finalProcessedData;
    			        },

    			        keySize: 128/32,

    			        ivSize: 128/32,

    			        _ENC_XFORM_MODE: 1,

    			        _DEC_XFORM_MODE: 2,

    			        /**
    			         * Creates shortcut functions to a cipher's object interface.
    			         *
    			         * @param {Cipher} cipher The cipher to create a helper for.
    			         *
    			         * @return {Object} An object with encrypt and decrypt shortcut functions.
    			         *
    			         * @static
    			         *
    			         * @example
    			         *
    			         *     var AES = CryptoJS.lib.Cipher._createHelper(CryptoJS.algo.AES);
    			         */
    			        _createHelper: (function () {
    			            function selectCipherStrategy(key) {
    			                if (typeof key == 'string') {
    			                    return PasswordBasedCipher;
    			                } else {
    			                    return SerializableCipher;
    			                }
    			            }

    			            return function (cipher) {
    			                return {
    			                    encrypt: function (message, key, cfg) {
    			                        return selectCipherStrategy(key).encrypt(cipher, message, key, cfg);
    			                    },

    			                    decrypt: function (ciphertext, key, cfg) {
    			                        return selectCipherStrategy(key).decrypt(cipher, ciphertext, key, cfg);
    			                    }
    			                };
    			            };
    			        }())
    			    });

    			    /**
    			     * Abstract base stream cipher template.
    			     *
    			     * @property {number} blockSize The number of 32-bit words this cipher operates on. Default: 1 (32 bits)
    			     */
    			    C_lib.StreamCipher = Cipher.extend({
    			        _doFinalize: function () {
    			            // Process partial blocks
    			            var finalProcessedBlocks = this._process(!!'flush');

    			            return finalProcessedBlocks;
    			        },

    			        blockSize: 1
    			    });

    			    /**
    			     * Mode namespace.
    			     */
    			    var C_mode = C.mode = {};

    			    /**
    			     * Abstract base block cipher mode template.
    			     */
    			    var BlockCipherMode = C_lib.BlockCipherMode = Base.extend({
    			        /**
    			         * Creates this mode for encryption.
    			         *
    			         * @param {Cipher} cipher A block cipher instance.
    			         * @param {Array} iv The IV words.
    			         *
    			         * @static
    			         *
    			         * @example
    			         *
    			         *     var mode = CryptoJS.mode.CBC.createEncryptor(cipher, iv.words);
    			         */
    			        createEncryptor: function (cipher, iv) {
    			            return this.Encryptor.create(cipher, iv);
    			        },

    			        /**
    			         * Creates this mode for decryption.
    			         *
    			         * @param {Cipher} cipher A block cipher instance.
    			         * @param {Array} iv The IV words.
    			         *
    			         * @static
    			         *
    			         * @example
    			         *
    			         *     var mode = CryptoJS.mode.CBC.createDecryptor(cipher, iv.words);
    			         */
    			        createDecryptor: function (cipher, iv) {
    			            return this.Decryptor.create(cipher, iv);
    			        },

    			        /**
    			         * Initializes a newly created mode.
    			         *
    			         * @param {Cipher} cipher A block cipher instance.
    			         * @param {Array} iv The IV words.
    			         *
    			         * @example
    			         *
    			         *     var mode = CryptoJS.mode.CBC.Encryptor.create(cipher, iv.words);
    			         */
    			        init: function (cipher, iv) {
    			            this._cipher = cipher;
    			            this._iv = iv;
    			        }
    			    });

    			    /**
    			     * Cipher Block Chaining mode.
    			     */
    			    var CBC = C_mode.CBC = (function () {
    			        /**
    			         * Abstract base CBC mode.
    			         */
    			        var CBC = BlockCipherMode.extend();

    			        /**
    			         * CBC encryptor.
    			         */
    			        CBC.Encryptor = CBC.extend({
    			            /**
    			             * Processes the data block at offset.
    			             *
    			             * @param {Array} words The data words to operate on.
    			             * @param {number} offset The offset where the block starts.
    			             *
    			             * @example
    			             *
    			             *     mode.processBlock(data.words, offset);
    			             */
    			            processBlock: function (words, offset) {
    			                // Shortcuts
    			                var cipher = this._cipher;
    			                var blockSize = cipher.blockSize;

    			                // XOR and encrypt
    			                xorBlock.call(this, words, offset, blockSize);
    			                cipher.encryptBlock(words, offset);

    			                // Remember this block to use with next block
    			                this._prevBlock = words.slice(offset, offset + blockSize);
    			            }
    			        });

    			        /**
    			         * CBC decryptor.
    			         */
    			        CBC.Decryptor = CBC.extend({
    			            /**
    			             * Processes the data block at offset.
    			             *
    			             * @param {Array} words The data words to operate on.
    			             * @param {number} offset The offset where the block starts.
    			             *
    			             * @example
    			             *
    			             *     mode.processBlock(data.words, offset);
    			             */
    			            processBlock: function (words, offset) {
    			                // Shortcuts
    			                var cipher = this._cipher;
    			                var blockSize = cipher.blockSize;

    			                // Remember this block to use with next block
    			                var thisBlock = words.slice(offset, offset + blockSize);

    			                // Decrypt and XOR
    			                cipher.decryptBlock(words, offset);
    			                xorBlock.call(this, words, offset, blockSize);

    			                // This block becomes the previous block
    			                this._prevBlock = thisBlock;
    			            }
    			        });

    			        function xorBlock(words, offset, blockSize) {
    			            var block;

    			            // Shortcut
    			            var iv = this._iv;

    			            // Choose mixing block
    			            if (iv) {
    			                block = iv;

    			                // Remove IV for subsequent blocks
    			                this._iv = undefined$1;
    			            } else {
    			                block = this._prevBlock;
    			            }

    			            // XOR blocks
    			            for (var i = 0; i < blockSize; i++) {
    			                words[offset + i] ^= block[i];
    			            }
    			        }

    			        return CBC;
    			    }());

    			    /**
    			     * Padding namespace.
    			     */
    			    var C_pad = C.pad = {};

    			    /**
    			     * PKCS #5/7 padding strategy.
    			     */
    			    var Pkcs7 = C_pad.Pkcs7 = {
    			        /**
    			         * Pads data using the algorithm defined in PKCS #5/7.
    			         *
    			         * @param {WordArray} data The data to pad.
    			         * @param {number} blockSize The multiple that the data should be padded to.
    			         *
    			         * @static
    			         *
    			         * @example
    			         *
    			         *     CryptoJS.pad.Pkcs7.pad(wordArray, 4);
    			         */
    			        pad: function (data, blockSize) {
    			            // Shortcut
    			            var blockSizeBytes = blockSize * 4;

    			            // Count padding bytes
    			            var nPaddingBytes = blockSizeBytes - data.sigBytes % blockSizeBytes;

    			            // Create padding word
    			            var paddingWord = (nPaddingBytes << 24) | (nPaddingBytes << 16) | (nPaddingBytes << 8) | nPaddingBytes;

    			            // Create padding
    			            var paddingWords = [];
    			            for (var i = 0; i < nPaddingBytes; i += 4) {
    			                paddingWords.push(paddingWord);
    			            }
    			            var padding = WordArray.create(paddingWords, nPaddingBytes);

    			            // Add padding
    			            data.concat(padding);
    			        },

    			        /**
    			         * Unpads data that had been padded using the algorithm defined in PKCS #5/7.
    			         *
    			         * @param {WordArray} data The data to unpad.
    			         *
    			         * @static
    			         *
    			         * @example
    			         *
    			         *     CryptoJS.pad.Pkcs7.unpad(wordArray);
    			         */
    			        unpad: function (data) {
    			            // Get number of padding bytes from last byte
    			            var nPaddingBytes = data.words[(data.sigBytes - 1) >>> 2] & 0xff;

    			            // Remove padding
    			            data.sigBytes -= nPaddingBytes;
    			        }
    			    };

    			    /**
    			     * Abstract base block cipher template.
    			     *
    			     * @property {number} blockSize The number of 32-bit words this cipher operates on. Default: 4 (128 bits)
    			     */
    			    C_lib.BlockCipher = Cipher.extend({
    			        /**
    			         * Configuration options.
    			         *
    			         * @property {Mode} mode The block mode to use. Default: CBC
    			         * @property {Padding} padding The padding strategy to use. Default: Pkcs7
    			         */
    			        cfg: Cipher.cfg.extend({
    			            mode: CBC,
    			            padding: Pkcs7
    			        }),

    			        reset: function () {
    			            var modeCreator;

    			            // Reset cipher
    			            Cipher.reset.call(this);

    			            // Shortcuts
    			            var cfg = this.cfg;
    			            var iv = cfg.iv;
    			            var mode = cfg.mode;

    			            // Reset block mode
    			            if (this._xformMode == this._ENC_XFORM_MODE) {
    			                modeCreator = mode.createEncryptor;
    			            } else /* if (this._xformMode == this._DEC_XFORM_MODE) */ {
    			                modeCreator = mode.createDecryptor;
    			                // Keep at least one block in the buffer for unpadding
    			                this._minBufferSize = 1;
    			            }

    			            if (this._mode && this._mode.__creator == modeCreator) {
    			                this._mode.init(this, iv && iv.words);
    			            } else {
    			                this._mode = modeCreator.call(mode, this, iv && iv.words);
    			                this._mode.__creator = modeCreator;
    			            }
    			        },

    			        _doProcessBlock: function (words, offset) {
    			            this._mode.processBlock(words, offset);
    			        },

    			        _doFinalize: function () {
    			            var finalProcessedBlocks;

    			            // Shortcut
    			            var padding = this.cfg.padding;

    			            // Finalize
    			            if (this._xformMode == this._ENC_XFORM_MODE) {
    			                // Pad data
    			                padding.pad(this._data, this.blockSize);

    			                // Process final blocks
    			                finalProcessedBlocks = this._process(!!'flush');
    			            } else /* if (this._xformMode == this._DEC_XFORM_MODE) */ {
    			                // Process final blocks
    			                finalProcessedBlocks = this._process(!!'flush');

    			                // Unpad data
    			                padding.unpad(finalProcessedBlocks);
    			            }

    			            return finalProcessedBlocks;
    			        },

    			        blockSize: 128/32
    			    });

    			    /**
    			     * A collection of cipher parameters.
    			     *
    			     * @property {WordArray} ciphertext The raw ciphertext.
    			     * @property {WordArray} key The key to this ciphertext.
    			     * @property {WordArray} iv The IV used in the ciphering operation.
    			     * @property {WordArray} salt The salt used with a key derivation function.
    			     * @property {Cipher} algorithm The cipher algorithm.
    			     * @property {Mode} mode The block mode used in the ciphering operation.
    			     * @property {Padding} padding The padding scheme used in the ciphering operation.
    			     * @property {number} blockSize The block size of the cipher.
    			     * @property {Format} formatter The default formatting strategy to convert this cipher params object to a string.
    			     */
    			    var CipherParams = C_lib.CipherParams = Base.extend({
    			        /**
    			         * Initializes a newly created cipher params object.
    			         *
    			         * @param {Object} cipherParams An object with any of the possible cipher parameters.
    			         *
    			         * @example
    			         *
    			         *     var cipherParams = CryptoJS.lib.CipherParams.create({
    			         *         ciphertext: ciphertextWordArray,
    			         *         key: keyWordArray,
    			         *         iv: ivWordArray,
    			         *         salt: saltWordArray,
    			         *         algorithm: CryptoJS.algo.AES,
    			         *         mode: CryptoJS.mode.CBC,
    			         *         padding: CryptoJS.pad.PKCS7,
    			         *         blockSize: 4,
    			         *         formatter: CryptoJS.format.OpenSSL
    			         *     });
    			         */
    			        init: function (cipherParams) {
    			            this.mixIn(cipherParams);
    			        },

    			        /**
    			         * Converts this cipher params object to a string.
    			         *
    			         * @param {Format} formatter (Optional) The formatting strategy to use.
    			         *
    			         * @return {string} The stringified cipher params.
    			         *
    			         * @throws Error If neither the formatter nor the default formatter is set.
    			         *
    			         * @example
    			         *
    			         *     var string = cipherParams + '';
    			         *     var string = cipherParams.toString();
    			         *     var string = cipherParams.toString(CryptoJS.format.OpenSSL);
    			         */
    			        toString: function (formatter) {
    			            return (formatter || this.formatter).stringify(this);
    			        }
    			    });

    			    /**
    			     * Format namespace.
    			     */
    			    var C_format = C.format = {};

    			    /**
    			     * OpenSSL formatting strategy.
    			     */
    			    var OpenSSLFormatter = C_format.OpenSSL = {
    			        /**
    			         * Converts a cipher params object to an OpenSSL-compatible string.
    			         *
    			         * @param {CipherParams} cipherParams The cipher params object.
    			         *
    			         * @return {string} The OpenSSL-compatible string.
    			         *
    			         * @static
    			         *
    			         * @example
    			         *
    			         *     var openSSLString = CryptoJS.format.OpenSSL.stringify(cipherParams);
    			         */
    			        stringify: function (cipherParams) {
    			            var wordArray;

    			            // Shortcuts
    			            var ciphertext = cipherParams.ciphertext;
    			            var salt = cipherParams.salt;

    			            // Format
    			            if (salt) {
    			                wordArray = WordArray.create([0x53616c74, 0x65645f5f]).concat(salt).concat(ciphertext);
    			            } else {
    			                wordArray = ciphertext;
    			            }

    			            return wordArray.toString(Base64);
    			        },

    			        /**
    			         * Converts an OpenSSL-compatible string to a cipher params object.
    			         *
    			         * @param {string} openSSLStr The OpenSSL-compatible string.
    			         *
    			         * @return {CipherParams} The cipher params object.
    			         *
    			         * @static
    			         *
    			         * @example
    			         *
    			         *     var cipherParams = CryptoJS.format.OpenSSL.parse(openSSLString);
    			         */
    			        parse: function (openSSLStr) {
    			            var salt;

    			            // Parse base64
    			            var ciphertext = Base64.parse(openSSLStr);

    			            // Shortcut
    			            var ciphertextWords = ciphertext.words;

    			            // Test for salt
    			            if (ciphertextWords[0] == 0x53616c74 && ciphertextWords[1] == 0x65645f5f) {
    			                // Extract salt
    			                salt = WordArray.create(ciphertextWords.slice(2, 4));

    			                // Remove salt from ciphertext
    			                ciphertextWords.splice(0, 4);
    			                ciphertext.sigBytes -= 16;
    			            }

    			            return CipherParams.create({ ciphertext: ciphertext, salt: salt });
    			        }
    			    };

    			    /**
    			     * A cipher wrapper that returns ciphertext as a serializable cipher params object.
    			     */
    			    var SerializableCipher = C_lib.SerializableCipher = Base.extend({
    			        /**
    			         * Configuration options.
    			         *
    			         * @property {Formatter} format The formatting strategy to convert cipher param objects to and from a string. Default: OpenSSL
    			         */
    			        cfg: Base.extend({
    			            format: OpenSSLFormatter
    			        }),

    			        /**
    			         * Encrypts a message.
    			         *
    			         * @param {Cipher} cipher The cipher algorithm to use.
    			         * @param {WordArray|string} message The message to encrypt.
    			         * @param {WordArray} key The key.
    			         * @param {Object} cfg (Optional) The configuration options to use for this operation.
    			         *
    			         * @return {CipherParams} A cipher params object.
    			         *
    			         * @static
    			         *
    			         * @example
    			         *
    			         *     var ciphertextParams = CryptoJS.lib.SerializableCipher.encrypt(CryptoJS.algo.AES, message, key);
    			         *     var ciphertextParams = CryptoJS.lib.SerializableCipher.encrypt(CryptoJS.algo.AES, message, key, { iv: iv });
    			         *     var ciphertextParams = CryptoJS.lib.SerializableCipher.encrypt(CryptoJS.algo.AES, message, key, { iv: iv, format: CryptoJS.format.OpenSSL });
    			         */
    			        encrypt: function (cipher, message, key, cfg) {
    			            // Apply config defaults
    			            cfg = this.cfg.extend(cfg);

    			            // Encrypt
    			            var encryptor = cipher.createEncryptor(key, cfg);
    			            var ciphertext = encryptor.finalize(message);

    			            // Shortcut
    			            var cipherCfg = encryptor.cfg;

    			            // Create and return serializable cipher params
    			            return CipherParams.create({
    			                ciphertext: ciphertext,
    			                key: key,
    			                iv: cipherCfg.iv,
    			                algorithm: cipher,
    			                mode: cipherCfg.mode,
    			                padding: cipherCfg.padding,
    			                blockSize: cipher.blockSize,
    			                formatter: cfg.format
    			            });
    			        },

    			        /**
    			         * Decrypts serialized ciphertext.
    			         *
    			         * @param {Cipher} cipher The cipher algorithm to use.
    			         * @param {CipherParams|string} ciphertext The ciphertext to decrypt.
    			         * @param {WordArray} key The key.
    			         * @param {Object} cfg (Optional) The configuration options to use for this operation.
    			         *
    			         * @return {WordArray} The plaintext.
    			         *
    			         * @static
    			         *
    			         * @example
    			         *
    			         *     var plaintext = CryptoJS.lib.SerializableCipher.decrypt(CryptoJS.algo.AES, formattedCiphertext, key, { iv: iv, format: CryptoJS.format.OpenSSL });
    			         *     var plaintext = CryptoJS.lib.SerializableCipher.decrypt(CryptoJS.algo.AES, ciphertextParams, key, { iv: iv, format: CryptoJS.format.OpenSSL });
    			         */
    			        decrypt: function (cipher, ciphertext, key, cfg) {
    			            // Apply config defaults
    			            cfg = this.cfg.extend(cfg);

    			            // Convert string to CipherParams
    			            ciphertext = this._parse(ciphertext, cfg.format);

    			            // Decrypt
    			            var plaintext = cipher.createDecryptor(key, cfg).finalize(ciphertext.ciphertext);

    			            return plaintext;
    			        },

    			        /**
    			         * Converts serialized ciphertext to CipherParams,
    			         * else assumed CipherParams already and returns ciphertext unchanged.
    			         *
    			         * @param {CipherParams|string} ciphertext The ciphertext.
    			         * @param {Formatter} format The formatting strategy to use to parse serialized ciphertext.
    			         *
    			         * @return {CipherParams} The unserialized ciphertext.
    			         *
    			         * @static
    			         *
    			         * @example
    			         *
    			         *     var ciphertextParams = CryptoJS.lib.SerializableCipher._parse(ciphertextStringOrParams, format);
    			         */
    			        _parse: function (ciphertext, format) {
    			            if (typeof ciphertext == 'string') {
    			                return format.parse(ciphertext, this);
    			            } else {
    			                return ciphertext;
    			            }
    			        }
    			    });

    			    /**
    			     * Key derivation function namespace.
    			     */
    			    var C_kdf = C.kdf = {};

    			    /**
    			     * OpenSSL key derivation function.
    			     */
    			    var OpenSSLKdf = C_kdf.OpenSSL = {
    			        /**
    			         * Derives a key and IV from a password.
    			         *
    			         * @param {string} password The password to derive from.
    			         * @param {number} keySize The size in words of the key to generate.
    			         * @param {number} ivSize The size in words of the IV to generate.
    			         * @param {WordArray|string} salt (Optional) A 64-bit salt to use. If omitted, a salt will be generated randomly.
    			         *
    			         * @return {CipherParams} A cipher params object with the key, IV, and salt.
    			         *
    			         * @static
    			         *
    			         * @example
    			         *
    			         *     var derivedParams = CryptoJS.kdf.OpenSSL.execute('Password', 256/32, 128/32);
    			         *     var derivedParams = CryptoJS.kdf.OpenSSL.execute('Password', 256/32, 128/32, 'saltsalt');
    			         */
    			        execute: function (password, keySize, ivSize, salt, hasher) {
    			            // Generate random salt
    			            if (!salt) {
    			                salt = WordArray.random(64/8);
    			            }

    			            // Derive key and IV
    			            if (!hasher) {
    			                var key = EvpKDF.create({ keySize: keySize + ivSize }).compute(password, salt);
    			            } else {
    			                var key = EvpKDF.create({ keySize: keySize + ivSize, hasher: hasher }).compute(password, salt);
    			            }


    			            // Separate key and IV
    			            var iv = WordArray.create(key.words.slice(keySize), ivSize * 4);
    			            key.sigBytes = keySize * 4;

    			            // Return params
    			            return CipherParams.create({ key: key, iv: iv, salt: salt });
    			        }
    			    };

    			    /**
    			     * A serializable cipher wrapper that derives the key from a password,
    			     * and returns ciphertext as a serializable cipher params object.
    			     */
    			    var PasswordBasedCipher = C_lib.PasswordBasedCipher = SerializableCipher.extend({
    			        /**
    			         * Configuration options.
    			         *
    			         * @property {KDF} kdf The key derivation function to use to generate a key and IV from a password. Default: OpenSSL
    			         */
    			        cfg: SerializableCipher.cfg.extend({
    			            kdf: OpenSSLKdf
    			        }),

    			        /**
    			         * Encrypts a message using a password.
    			         *
    			         * @param {Cipher} cipher The cipher algorithm to use.
    			         * @param {WordArray|string} message The message to encrypt.
    			         * @param {string} password The password.
    			         * @param {Object} cfg (Optional) The configuration options to use for this operation.
    			         *
    			         * @return {CipherParams} A cipher params object.
    			         *
    			         * @static
    			         *
    			         * @example
    			         *
    			         *     var ciphertextParams = CryptoJS.lib.PasswordBasedCipher.encrypt(CryptoJS.algo.AES, message, 'password');
    			         *     var ciphertextParams = CryptoJS.lib.PasswordBasedCipher.encrypt(CryptoJS.algo.AES, message, 'password', { format: CryptoJS.format.OpenSSL });
    			         */
    			        encrypt: function (cipher, message, password, cfg) {
    			            // Apply config defaults
    			            cfg = this.cfg.extend(cfg);

    			            // Derive key and other params
    			            var derivedParams = cfg.kdf.execute(password, cipher.keySize, cipher.ivSize, cfg.salt, cfg.hasher);

    			            // Add IV to config
    			            cfg.iv = derivedParams.iv;

    			            // Encrypt
    			            var ciphertext = SerializableCipher.encrypt.call(this, cipher, message, derivedParams.key, cfg);

    			            // Mix in derived params
    			            ciphertext.mixIn(derivedParams);

    			            return ciphertext;
    			        },

    			        /**
    			         * Decrypts serialized ciphertext using a password.
    			         *
    			         * @param {Cipher} cipher The cipher algorithm to use.
    			         * @param {CipherParams|string} ciphertext The ciphertext to decrypt.
    			         * @param {string} password The password.
    			         * @param {Object} cfg (Optional) The configuration options to use for this operation.
    			         *
    			         * @return {WordArray} The plaintext.
    			         *
    			         * @static
    			         *
    			         * @example
    			         *
    			         *     var plaintext = CryptoJS.lib.PasswordBasedCipher.decrypt(CryptoJS.algo.AES, formattedCiphertext, 'password', { format: CryptoJS.format.OpenSSL });
    			         *     var plaintext = CryptoJS.lib.PasswordBasedCipher.decrypt(CryptoJS.algo.AES, ciphertextParams, 'password', { format: CryptoJS.format.OpenSSL });
    			         */
    			        decrypt: function (cipher, ciphertext, password, cfg) {
    			            // Apply config defaults
    			            cfg = this.cfg.extend(cfg);

    			            // Convert string to CipherParams
    			            ciphertext = this._parse(ciphertext, cfg.format);

    			            // Derive key and other params
    			            var derivedParams = cfg.kdf.execute(password, cipher.keySize, cipher.ivSize, ciphertext.salt, cfg.hasher);

    			            // Add IV to config
    			            cfg.iv = derivedParams.iv;

    			            // Decrypt
    			            var plaintext = SerializableCipher.decrypt.call(this, cipher, ciphertext, derivedParams.key, cfg);

    			            return plaintext;
    			        }
    			    });
    			}());


    		})); 
    	} (cipherCore));
    	return cipherCore.exports;
    }

    var modeCfb = {exports: {}};

    var hasRequiredModeCfb;

    function requireModeCfb () {
    	if (hasRequiredModeCfb) return modeCfb.exports;
    	hasRequiredModeCfb = 1;
    	(function (module, exports) {
    (function (root, factory, undef) {
    			{
    				// CommonJS
    				module.exports = factory(requireCore(), requireCipherCore());
    			}
    		}(commonjsGlobal, function (CryptoJS) {

    			/**
    			 * Cipher Feedback block mode.
    			 */
    			CryptoJS.mode.CFB = (function () {
    			    var CFB = CryptoJS.lib.BlockCipherMode.extend();

    			    CFB.Encryptor = CFB.extend({
    			        processBlock: function (words, offset) {
    			            // Shortcuts
    			            var cipher = this._cipher;
    			            var blockSize = cipher.blockSize;

    			            generateKeystreamAndEncrypt.call(this, words, offset, blockSize, cipher);

    			            // Remember this block to use with next block
    			            this._prevBlock = words.slice(offset, offset + blockSize);
    			        }
    			    });

    			    CFB.Decryptor = CFB.extend({
    			        processBlock: function (words, offset) {
    			            // Shortcuts
    			            var cipher = this._cipher;
    			            var blockSize = cipher.blockSize;

    			            // Remember this block to use with next block
    			            var thisBlock = words.slice(offset, offset + blockSize);

    			            generateKeystreamAndEncrypt.call(this, words, offset, blockSize, cipher);

    			            // This block becomes the previous block
    			            this._prevBlock = thisBlock;
    			        }
    			    });

    			    function generateKeystreamAndEncrypt(words, offset, blockSize, cipher) {
    			        var keystream;

    			        // Shortcut
    			        var iv = this._iv;

    			        // Generate keystream
    			        if (iv) {
    			            keystream = iv.slice(0);

    			            // Remove IV for subsequent blocks
    			            this._iv = undefined;
    			        } else {
    			            keystream = this._prevBlock;
    			        }
    			        cipher.encryptBlock(keystream, 0);

    			        // Encrypt
    			        for (var i = 0; i < blockSize; i++) {
    			            words[offset + i] ^= keystream[i];
    			        }
    			    }

    			    return CFB;
    			}());


    			return CryptoJS.mode.CFB;

    		})); 
    	} (modeCfb));
    	return modeCfb.exports;
    }

    var modeCtr = {exports: {}};

    var hasRequiredModeCtr;

    function requireModeCtr () {
    	if (hasRequiredModeCtr) return modeCtr.exports;
    	hasRequiredModeCtr = 1;
    	(function (module, exports) {
    (function (root, factory, undef) {
    			{
    				// CommonJS
    				module.exports = factory(requireCore(), requireCipherCore());
    			}
    		}(commonjsGlobal, function (CryptoJS) {

    			/**
    			 * Counter block mode.
    			 */
    			CryptoJS.mode.CTR = (function () {
    			    var CTR = CryptoJS.lib.BlockCipherMode.extend();

    			    var Encryptor = CTR.Encryptor = CTR.extend({
    			        processBlock: function (words, offset) {
    			            // Shortcuts
    			            var cipher = this._cipher;
    			            var blockSize = cipher.blockSize;
    			            var iv = this._iv;
    			            var counter = this._counter;

    			            // Generate keystream
    			            if (iv) {
    			                counter = this._counter = iv.slice(0);

    			                // Remove IV for subsequent blocks
    			                this._iv = undefined;
    			            }
    			            var keystream = counter.slice(0);
    			            cipher.encryptBlock(keystream, 0);

    			            // Increment counter
    			            counter[blockSize - 1] = (counter[blockSize - 1] + 1) | 0;

    			            // Encrypt
    			            for (var i = 0; i < blockSize; i++) {
    			                words[offset + i] ^= keystream[i];
    			            }
    			        }
    			    });

    			    CTR.Decryptor = Encryptor;

    			    return CTR;
    			}());


    			return CryptoJS.mode.CTR;

    		})); 
    	} (modeCtr));
    	return modeCtr.exports;
    }

    var modeCtrGladman = {exports: {}};

    var hasRequiredModeCtrGladman;

    function requireModeCtrGladman () {
    	if (hasRequiredModeCtrGladman) return modeCtrGladman.exports;
    	hasRequiredModeCtrGladman = 1;
    	(function (module, exports) {
    (function (root, factory, undef) {
    			{
    				// CommonJS
    				module.exports = factory(requireCore(), requireCipherCore());
    			}
    		}(commonjsGlobal, function (CryptoJS) {

    			/** @preserve
    			 * Counter block mode compatible with  Dr Brian Gladman fileenc.c
    			 * derived from CryptoJS.mode.CTR
    			 * Jan Hruby jhruby.web@gmail.com
    			 */
    			CryptoJS.mode.CTRGladman = (function () {
    			    var CTRGladman = CryptoJS.lib.BlockCipherMode.extend();

    				function incWord(word)
    				{
    					if (((word >> 24) & 0xff) === 0xff) { //overflow
    					var b1 = (word >> 16)&0xff;
    					var b2 = (word >> 8)&0xff;
    					var b3 = word & 0xff;

    					if (b1 === 0xff) // overflow b1
    					{
    					b1 = 0;
    					if (b2 === 0xff)
    					{
    						b2 = 0;
    						if (b3 === 0xff)
    						{
    							b3 = 0;
    						}
    						else
    						{
    							++b3;
    						}
    					}
    					else
    					{
    						++b2;
    					}
    					}
    					else
    					{
    					++b1;
    					}

    					word = 0;
    					word += (b1 << 16);
    					word += (b2 << 8);
    					word += b3;
    					}
    					else
    					{
    					word += (0x01 << 24);
    					}
    					return word;
    				}

    				function incCounter(counter)
    				{
    					if ((counter[0] = incWord(counter[0])) === 0)
    					{
    						// encr_data in fileenc.c from  Dr Brian Gladman's counts only with DWORD j < 8
    						counter[1] = incWord(counter[1]);
    					}
    					return counter;
    				}

    			    var Encryptor = CTRGladman.Encryptor = CTRGladman.extend({
    			        processBlock: function (words, offset) {
    			            // Shortcuts
    			            var cipher = this._cipher;
    			            var blockSize = cipher.blockSize;
    			            var iv = this._iv;
    			            var counter = this._counter;

    			            // Generate keystream
    			            if (iv) {
    			                counter = this._counter = iv.slice(0);

    			                // Remove IV for subsequent blocks
    			                this._iv = undefined;
    			            }

    						incCounter(counter);

    						var keystream = counter.slice(0);
    			            cipher.encryptBlock(keystream, 0);

    			            // Encrypt
    			            for (var i = 0; i < blockSize; i++) {
    			                words[offset + i] ^= keystream[i];
    			            }
    			        }
    			    });

    			    CTRGladman.Decryptor = Encryptor;

    			    return CTRGladman;
    			}());




    			return CryptoJS.mode.CTRGladman;

    		})); 
    	} (modeCtrGladman));
    	return modeCtrGladman.exports;
    }

    var modeOfb = {exports: {}};

    var hasRequiredModeOfb;

    function requireModeOfb () {
    	if (hasRequiredModeOfb) return modeOfb.exports;
    	hasRequiredModeOfb = 1;
    	(function (module, exports) {
    (function (root, factory, undef) {
    			{
    				// CommonJS
    				module.exports = factory(requireCore(), requireCipherCore());
    			}
    		}(commonjsGlobal, function (CryptoJS) {

    			/**
    			 * Output Feedback block mode.
    			 */
    			CryptoJS.mode.OFB = (function () {
    			    var OFB = CryptoJS.lib.BlockCipherMode.extend();

    			    var Encryptor = OFB.Encryptor = OFB.extend({
    			        processBlock: function (words, offset) {
    			            // Shortcuts
    			            var cipher = this._cipher;
    			            var blockSize = cipher.blockSize;
    			            var iv = this._iv;
    			            var keystream = this._keystream;

    			            // Generate keystream
    			            if (iv) {
    			                keystream = this._keystream = iv.slice(0);

    			                // Remove IV for subsequent blocks
    			                this._iv = undefined;
    			            }
    			            cipher.encryptBlock(keystream, 0);

    			            // Encrypt
    			            for (var i = 0; i < blockSize; i++) {
    			                words[offset + i] ^= keystream[i];
    			            }
    			        }
    			    });

    			    OFB.Decryptor = Encryptor;

    			    return OFB;
    			}());


    			return CryptoJS.mode.OFB;

    		})); 
    	} (modeOfb));
    	return modeOfb.exports;
    }

    var modeEcb = {exports: {}};

    var hasRequiredModeEcb;

    function requireModeEcb () {
    	if (hasRequiredModeEcb) return modeEcb.exports;
    	hasRequiredModeEcb = 1;
    	(function (module, exports) {
    (function (root, factory, undef) {
    			{
    				// CommonJS
    				module.exports = factory(requireCore(), requireCipherCore());
    			}
    		}(commonjsGlobal, function (CryptoJS) {

    			/**
    			 * Electronic Codebook block mode.
    			 */
    			CryptoJS.mode.ECB = (function () {
    			    var ECB = CryptoJS.lib.BlockCipherMode.extend();

    			    ECB.Encryptor = ECB.extend({
    			        processBlock: function (words, offset) {
    			            this._cipher.encryptBlock(words, offset);
    			        }
    			    });

    			    ECB.Decryptor = ECB.extend({
    			        processBlock: function (words, offset) {
    			            this._cipher.decryptBlock(words, offset);
    			        }
    			    });

    			    return ECB;
    			}());


    			return CryptoJS.mode.ECB;

    		})); 
    	} (modeEcb));
    	return modeEcb.exports;
    }

    var padAnsix923 = {exports: {}};

    var hasRequiredPadAnsix923;

    function requirePadAnsix923 () {
    	if (hasRequiredPadAnsix923) return padAnsix923.exports;
    	hasRequiredPadAnsix923 = 1;
    	(function (module, exports) {
    (function (root, factory, undef) {
    			{
    				// CommonJS
    				module.exports = factory(requireCore(), requireCipherCore());
    			}
    		}(commonjsGlobal, function (CryptoJS) {

    			/**
    			 * ANSI X.923 padding strategy.
    			 */
    			CryptoJS.pad.AnsiX923 = {
    			    pad: function (data, blockSize) {
    			        // Shortcuts
    			        var dataSigBytes = data.sigBytes;
    			        var blockSizeBytes = blockSize * 4;

    			        // Count padding bytes
    			        var nPaddingBytes = blockSizeBytes - dataSigBytes % blockSizeBytes;

    			        // Compute last byte position
    			        var lastBytePos = dataSigBytes + nPaddingBytes - 1;

    			        // Pad
    			        data.clamp();
    			        data.words[lastBytePos >>> 2] |= nPaddingBytes << (24 - (lastBytePos % 4) * 8);
    			        data.sigBytes += nPaddingBytes;
    			    },

    			    unpad: function (data) {
    			        // Get number of padding bytes from last byte
    			        var nPaddingBytes = data.words[(data.sigBytes - 1) >>> 2] & 0xff;

    			        // Remove padding
    			        data.sigBytes -= nPaddingBytes;
    			    }
    			};


    			return CryptoJS.pad.Ansix923;

    		})); 
    	} (padAnsix923));
    	return padAnsix923.exports;
    }

    var padIso10126 = {exports: {}};

    var hasRequiredPadIso10126;

    function requirePadIso10126 () {
    	if (hasRequiredPadIso10126) return padIso10126.exports;
    	hasRequiredPadIso10126 = 1;
    	(function (module, exports) {
    (function (root, factory, undef) {
    			{
    				// CommonJS
    				module.exports = factory(requireCore(), requireCipherCore());
    			}
    		}(commonjsGlobal, function (CryptoJS) {

    			/**
    			 * ISO 10126 padding strategy.
    			 */
    			CryptoJS.pad.Iso10126 = {
    			    pad: function (data, blockSize) {
    			        // Shortcut
    			        var blockSizeBytes = blockSize * 4;

    			        // Count padding bytes
    			        var nPaddingBytes = blockSizeBytes - data.sigBytes % blockSizeBytes;

    			        // Pad
    			        data.concat(CryptoJS.lib.WordArray.random(nPaddingBytes - 1)).
    			             concat(CryptoJS.lib.WordArray.create([nPaddingBytes << 24], 1));
    			    },

    			    unpad: function (data) {
    			        // Get number of padding bytes from last byte
    			        var nPaddingBytes = data.words[(data.sigBytes - 1) >>> 2] & 0xff;

    			        // Remove padding
    			        data.sigBytes -= nPaddingBytes;
    			    }
    			};


    			return CryptoJS.pad.Iso10126;

    		})); 
    	} (padIso10126));
    	return padIso10126.exports;
    }

    var padIso97971 = {exports: {}};

    var hasRequiredPadIso97971;

    function requirePadIso97971 () {
    	if (hasRequiredPadIso97971) return padIso97971.exports;
    	hasRequiredPadIso97971 = 1;
    	(function (module, exports) {
    (function (root, factory, undef) {
    			{
    				// CommonJS
    				module.exports = factory(requireCore(), requireCipherCore());
    			}
    		}(commonjsGlobal, function (CryptoJS) {

    			/**
    			 * ISO/IEC 9797-1 Padding Method 2.
    			 */
    			CryptoJS.pad.Iso97971 = {
    			    pad: function (data, blockSize) {
    			        // Add 0x80 byte
    			        data.concat(CryptoJS.lib.WordArray.create([0x80000000], 1));

    			        // Zero pad the rest
    			        CryptoJS.pad.ZeroPadding.pad(data, blockSize);
    			    },

    			    unpad: function (data) {
    			        // Remove zero padding
    			        CryptoJS.pad.ZeroPadding.unpad(data);

    			        // Remove one more byte -- the 0x80 byte
    			        data.sigBytes--;
    			    }
    			};


    			return CryptoJS.pad.Iso97971;

    		})); 
    	} (padIso97971));
    	return padIso97971.exports;
    }

    var padZeropadding = {exports: {}};

    var hasRequiredPadZeropadding;

    function requirePadZeropadding () {
    	if (hasRequiredPadZeropadding) return padZeropadding.exports;
    	hasRequiredPadZeropadding = 1;
    	(function (module, exports) {
    (function (root, factory, undef) {
    			{
    				// CommonJS
    				module.exports = factory(requireCore(), requireCipherCore());
    			}
    		}(commonjsGlobal, function (CryptoJS) {

    			/**
    			 * Zero padding strategy.
    			 */
    			CryptoJS.pad.ZeroPadding = {
    			    pad: function (data, blockSize) {
    			        // Shortcut
    			        var blockSizeBytes = blockSize * 4;

    			        // Pad
    			        data.clamp();
    			        data.sigBytes += blockSizeBytes - ((data.sigBytes % blockSizeBytes) || blockSizeBytes);
    			    },

    			    unpad: function (data) {
    			        // Shortcut
    			        var dataWords = data.words;

    			        // Unpad
    			        var i = data.sigBytes - 1;
    			        for (var i = data.sigBytes - 1; i >= 0; i--) {
    			            if (((dataWords[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff)) {
    			                data.sigBytes = i + 1;
    			                break;
    			            }
    			        }
    			    }
    			};


    			return CryptoJS.pad.ZeroPadding;

    		})); 
    	} (padZeropadding));
    	return padZeropadding.exports;
    }

    var padNopadding = {exports: {}};

    var hasRequiredPadNopadding;

    function requirePadNopadding () {
    	if (hasRequiredPadNopadding) return padNopadding.exports;
    	hasRequiredPadNopadding = 1;
    	(function (module, exports) {
    (function (root, factory, undef) {
    			{
    				// CommonJS
    				module.exports = factory(requireCore(), requireCipherCore());
    			}
    		}(commonjsGlobal, function (CryptoJS) {

    			/**
    			 * A noop padding strategy.
    			 */
    			CryptoJS.pad.NoPadding = {
    			    pad: function () {
    			    },

    			    unpad: function () {
    			    }
    			};


    			return CryptoJS.pad.NoPadding;

    		})); 
    	} (padNopadding));
    	return padNopadding.exports;
    }

    var formatHex = {exports: {}};

    var hasRequiredFormatHex;

    function requireFormatHex () {
    	if (hasRequiredFormatHex) return formatHex.exports;
    	hasRequiredFormatHex = 1;
    	(function (module, exports) {
    (function (root, factory, undef) {
    			{
    				// CommonJS
    				module.exports = factory(requireCore(), requireCipherCore());
    			}
    		}(commonjsGlobal, function (CryptoJS) {

    			(function (undefined$1) {
    			    // Shortcuts
    			    var C = CryptoJS;
    			    var C_lib = C.lib;
    			    var CipherParams = C_lib.CipherParams;
    			    var C_enc = C.enc;
    			    var Hex = C_enc.Hex;
    			    var C_format = C.format;

    			    C_format.Hex = {
    			        /**
    			         * Converts the ciphertext of a cipher params object to a hexadecimally encoded string.
    			         *
    			         * @param {CipherParams} cipherParams The cipher params object.
    			         *
    			         * @return {string} The hexadecimally encoded string.
    			         *
    			         * @static
    			         *
    			         * @example
    			         *
    			         *     var hexString = CryptoJS.format.Hex.stringify(cipherParams);
    			         */
    			        stringify: function (cipherParams) {
    			            return cipherParams.ciphertext.toString(Hex);
    			        },

    			        /**
    			         * Converts a hexadecimally encoded ciphertext string to a cipher params object.
    			         *
    			         * @param {string} input The hexadecimally encoded string.
    			         *
    			         * @return {CipherParams} The cipher params object.
    			         *
    			         * @static
    			         *
    			         * @example
    			         *
    			         *     var cipherParams = CryptoJS.format.Hex.parse(hexString);
    			         */
    			        parse: function (input) {
    			            var ciphertext = Hex.parse(input);
    			            return CipherParams.create({ ciphertext: ciphertext });
    			        }
    			    };
    			}());


    			return CryptoJS.format.Hex;

    		})); 
    	} (formatHex));
    	return formatHex.exports;
    }

    var aes = {exports: {}};

    var hasRequiredAes;

    function requireAes () {
    	if (hasRequiredAes) return aes.exports;
    	hasRequiredAes = 1;
    	(function (module, exports) {
    (function (root, factory, undef) {
    			{
    				// CommonJS
    				module.exports = factory(requireCore(), requireEncBase64(), requireMd5(), requireEvpkdf(), requireCipherCore());
    			}
    		}(commonjsGlobal, function (CryptoJS) {

    			(function () {
    			    // Shortcuts
    			    var C = CryptoJS;
    			    var C_lib = C.lib;
    			    var BlockCipher = C_lib.BlockCipher;
    			    var C_algo = C.algo;

    			    // Lookup tables
    			    var SBOX = [];
    			    var INV_SBOX = [];
    			    var SUB_MIX_0 = [];
    			    var SUB_MIX_1 = [];
    			    var SUB_MIX_2 = [];
    			    var SUB_MIX_3 = [];
    			    var INV_SUB_MIX_0 = [];
    			    var INV_SUB_MIX_1 = [];
    			    var INV_SUB_MIX_2 = [];
    			    var INV_SUB_MIX_3 = [];

    			    // Compute lookup tables
    			    (function () {
    			        // Compute double table
    			        var d = [];
    			        for (var i = 0; i < 256; i++) {
    			            if (i < 128) {
    			                d[i] = i << 1;
    			            } else {
    			                d[i] = (i << 1) ^ 0x11b;
    			            }
    			        }

    			        // Walk GF(2^8)
    			        var x = 0;
    			        var xi = 0;
    			        for (var i = 0; i < 256; i++) {
    			            // Compute sbox
    			            var sx = xi ^ (xi << 1) ^ (xi << 2) ^ (xi << 3) ^ (xi << 4);
    			            sx = (sx >>> 8) ^ (sx & 0xff) ^ 0x63;
    			            SBOX[x] = sx;
    			            INV_SBOX[sx] = x;

    			            // Compute multiplication
    			            var x2 = d[x];
    			            var x4 = d[x2];
    			            var x8 = d[x4];

    			            // Compute sub bytes, mix columns tables
    			            var t = (d[sx] * 0x101) ^ (sx * 0x1010100);
    			            SUB_MIX_0[x] = (t << 24) | (t >>> 8);
    			            SUB_MIX_1[x] = (t << 16) | (t >>> 16);
    			            SUB_MIX_2[x] = (t << 8)  | (t >>> 24);
    			            SUB_MIX_3[x] = t;

    			            // Compute inv sub bytes, inv mix columns tables
    			            var t = (x8 * 0x1010101) ^ (x4 * 0x10001) ^ (x2 * 0x101) ^ (x * 0x1010100);
    			            INV_SUB_MIX_0[sx] = (t << 24) | (t >>> 8);
    			            INV_SUB_MIX_1[sx] = (t << 16) | (t >>> 16);
    			            INV_SUB_MIX_2[sx] = (t << 8)  | (t >>> 24);
    			            INV_SUB_MIX_3[sx] = t;

    			            // Compute next counter
    			            if (!x) {
    			                x = xi = 1;
    			            } else {
    			                x = x2 ^ d[d[d[x8 ^ x2]]];
    			                xi ^= d[d[xi]];
    			            }
    			        }
    			    }());

    			    // Precomputed Rcon lookup
    			    var RCON = [0x00, 0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36];

    			    /**
    			     * AES block cipher algorithm.
    			     */
    			    var AES = C_algo.AES = BlockCipher.extend({
    			        _doReset: function () {
    			            var t;

    			            // Skip reset of nRounds has been set before and key did not change
    			            if (this._nRounds && this._keyPriorReset === this._key) {
    			                return;
    			            }

    			            // Shortcuts
    			            var key = this._keyPriorReset = this._key;
    			            var keyWords = key.words;
    			            var keySize = key.sigBytes / 4;

    			            // Compute number of rounds
    			            var nRounds = this._nRounds = keySize + 6;

    			            // Compute number of key schedule rows
    			            var ksRows = (nRounds + 1) * 4;

    			            // Compute key schedule
    			            var keySchedule = this._keySchedule = [];
    			            for (var ksRow = 0; ksRow < ksRows; ksRow++) {
    			                if (ksRow < keySize) {
    			                    keySchedule[ksRow] = keyWords[ksRow];
    			                } else {
    			                    t = keySchedule[ksRow - 1];

    			                    if (!(ksRow % keySize)) {
    			                        // Rot word
    			                        t = (t << 8) | (t >>> 24);

    			                        // Sub word
    			                        t = (SBOX[t >>> 24] << 24) | (SBOX[(t >>> 16) & 0xff] << 16) | (SBOX[(t >>> 8) & 0xff] << 8) | SBOX[t & 0xff];

    			                        // Mix Rcon
    			                        t ^= RCON[(ksRow / keySize) | 0] << 24;
    			                    } else if (keySize > 6 && ksRow % keySize == 4) {
    			                        // Sub word
    			                        t = (SBOX[t >>> 24] << 24) | (SBOX[(t >>> 16) & 0xff] << 16) | (SBOX[(t >>> 8) & 0xff] << 8) | SBOX[t & 0xff];
    			                    }

    			                    keySchedule[ksRow] = keySchedule[ksRow - keySize] ^ t;
    			                }
    			            }

    			            // Compute inv key schedule
    			            var invKeySchedule = this._invKeySchedule = [];
    			            for (var invKsRow = 0; invKsRow < ksRows; invKsRow++) {
    			                var ksRow = ksRows - invKsRow;

    			                if (invKsRow % 4) {
    			                    var t = keySchedule[ksRow];
    			                } else {
    			                    var t = keySchedule[ksRow - 4];
    			                }

    			                if (invKsRow < 4 || ksRow <= 4) {
    			                    invKeySchedule[invKsRow] = t;
    			                } else {
    			                    invKeySchedule[invKsRow] = INV_SUB_MIX_0[SBOX[t >>> 24]] ^ INV_SUB_MIX_1[SBOX[(t >>> 16) & 0xff]] ^
    			                                               INV_SUB_MIX_2[SBOX[(t >>> 8) & 0xff]] ^ INV_SUB_MIX_3[SBOX[t & 0xff]];
    			                }
    			            }
    			        },

    			        encryptBlock: function (M, offset) {
    			            this._doCryptBlock(M, offset, this._keySchedule, SUB_MIX_0, SUB_MIX_1, SUB_MIX_2, SUB_MIX_3, SBOX);
    			        },

    			        decryptBlock: function (M, offset) {
    			            // Swap 2nd and 4th rows
    			            var t = M[offset + 1];
    			            M[offset + 1] = M[offset + 3];
    			            M[offset + 3] = t;

    			            this._doCryptBlock(M, offset, this._invKeySchedule, INV_SUB_MIX_0, INV_SUB_MIX_1, INV_SUB_MIX_2, INV_SUB_MIX_3, INV_SBOX);

    			            // Inv swap 2nd and 4th rows
    			            var t = M[offset + 1];
    			            M[offset + 1] = M[offset + 3];
    			            M[offset + 3] = t;
    			        },

    			        _doCryptBlock: function (M, offset, keySchedule, SUB_MIX_0, SUB_MIX_1, SUB_MIX_2, SUB_MIX_3, SBOX) {
    			            // Shortcut
    			            var nRounds = this._nRounds;

    			            // Get input, add round key
    			            var s0 = M[offset]     ^ keySchedule[0];
    			            var s1 = M[offset + 1] ^ keySchedule[1];
    			            var s2 = M[offset + 2] ^ keySchedule[2];
    			            var s3 = M[offset + 3] ^ keySchedule[3];

    			            // Key schedule row counter
    			            var ksRow = 4;

    			            // Rounds
    			            for (var round = 1; round < nRounds; round++) {
    			                // Shift rows, sub bytes, mix columns, add round key
    			                var t0 = SUB_MIX_0[s0 >>> 24] ^ SUB_MIX_1[(s1 >>> 16) & 0xff] ^ SUB_MIX_2[(s2 >>> 8) & 0xff] ^ SUB_MIX_3[s3 & 0xff] ^ keySchedule[ksRow++];
    			                var t1 = SUB_MIX_0[s1 >>> 24] ^ SUB_MIX_1[(s2 >>> 16) & 0xff] ^ SUB_MIX_2[(s3 >>> 8) & 0xff] ^ SUB_MIX_3[s0 & 0xff] ^ keySchedule[ksRow++];
    			                var t2 = SUB_MIX_0[s2 >>> 24] ^ SUB_MIX_1[(s3 >>> 16) & 0xff] ^ SUB_MIX_2[(s0 >>> 8) & 0xff] ^ SUB_MIX_3[s1 & 0xff] ^ keySchedule[ksRow++];
    			                var t3 = SUB_MIX_0[s3 >>> 24] ^ SUB_MIX_1[(s0 >>> 16) & 0xff] ^ SUB_MIX_2[(s1 >>> 8) & 0xff] ^ SUB_MIX_3[s2 & 0xff] ^ keySchedule[ksRow++];

    			                // Update state
    			                s0 = t0;
    			                s1 = t1;
    			                s2 = t2;
    			                s3 = t3;
    			            }

    			            // Shift rows, sub bytes, add round key
    			            var t0 = ((SBOX[s0 >>> 24] << 24) | (SBOX[(s1 >>> 16) & 0xff] << 16) | (SBOX[(s2 >>> 8) & 0xff] << 8) | SBOX[s3 & 0xff]) ^ keySchedule[ksRow++];
    			            var t1 = ((SBOX[s1 >>> 24] << 24) | (SBOX[(s2 >>> 16) & 0xff] << 16) | (SBOX[(s3 >>> 8) & 0xff] << 8) | SBOX[s0 & 0xff]) ^ keySchedule[ksRow++];
    			            var t2 = ((SBOX[s2 >>> 24] << 24) | (SBOX[(s3 >>> 16) & 0xff] << 16) | (SBOX[(s0 >>> 8) & 0xff] << 8) | SBOX[s1 & 0xff]) ^ keySchedule[ksRow++];
    			            var t3 = ((SBOX[s3 >>> 24] << 24) | (SBOX[(s0 >>> 16) & 0xff] << 16) | (SBOX[(s1 >>> 8) & 0xff] << 8) | SBOX[s2 & 0xff]) ^ keySchedule[ksRow++];

    			            // Set output
    			            M[offset]     = t0;
    			            M[offset + 1] = t1;
    			            M[offset + 2] = t2;
    			            M[offset + 3] = t3;
    			        },

    			        keySize: 256/32
    			    });

    			    /**
    			     * Shortcut functions to the cipher's object interface.
    			     *
    			     * @example
    			     *
    			     *     var ciphertext = CryptoJS.AES.encrypt(message, key, cfg);
    			     *     var plaintext  = CryptoJS.AES.decrypt(ciphertext, key, cfg);
    			     */
    			    C.AES = BlockCipher._createHelper(AES);
    			}());


    			return CryptoJS.AES;

    		})); 
    	} (aes));
    	return aes.exports;
    }

    var tripledes = {exports: {}};

    var hasRequiredTripledes;

    function requireTripledes () {
    	if (hasRequiredTripledes) return tripledes.exports;
    	hasRequiredTripledes = 1;
    	(function (module, exports) {
    (function (root, factory, undef) {
    			{
    				// CommonJS
    				module.exports = factory(requireCore(), requireEncBase64(), requireMd5(), requireEvpkdf(), requireCipherCore());
    			}
    		}(commonjsGlobal, function (CryptoJS) {

    			(function () {
    			    // Shortcuts
    			    var C = CryptoJS;
    			    var C_lib = C.lib;
    			    var WordArray = C_lib.WordArray;
    			    var BlockCipher = C_lib.BlockCipher;
    			    var C_algo = C.algo;

    			    // Permuted Choice 1 constants
    			    var PC1 = [
    			        57, 49, 41, 33, 25, 17, 9,  1,
    			        58, 50, 42, 34, 26, 18, 10, 2,
    			        59, 51, 43, 35, 27, 19, 11, 3,
    			        60, 52, 44, 36, 63, 55, 47, 39,
    			        31, 23, 15, 7,  62, 54, 46, 38,
    			        30, 22, 14, 6,  61, 53, 45, 37,
    			        29, 21, 13, 5,  28, 20, 12, 4
    			    ];

    			    // Permuted Choice 2 constants
    			    var PC2 = [
    			        14, 17, 11, 24, 1,  5,
    			        3,  28, 15, 6,  21, 10,
    			        23, 19, 12, 4,  26, 8,
    			        16, 7,  27, 20, 13, 2,
    			        41, 52, 31, 37, 47, 55,
    			        30, 40, 51, 45, 33, 48,
    			        44, 49, 39, 56, 34, 53,
    			        46, 42, 50, 36, 29, 32
    			    ];

    			    // Cumulative bit shift constants
    			    var BIT_SHIFTS = [1,  2,  4,  6,  8,  10, 12, 14, 15, 17, 19, 21, 23, 25, 27, 28];

    			    // SBOXes and round permutation constants
    			    var SBOX_P = [
    			        {
    			            0x0: 0x808200,
    			            0x10000000: 0x8000,
    			            0x20000000: 0x808002,
    			            0x30000000: 0x2,
    			            0x40000000: 0x200,
    			            0x50000000: 0x808202,
    			            0x60000000: 0x800202,
    			            0x70000000: 0x800000,
    			            0x80000000: 0x202,
    			            0x90000000: 0x800200,
    			            0xa0000000: 0x8200,
    			            0xb0000000: 0x808000,
    			            0xc0000000: 0x8002,
    			            0xd0000000: 0x800002,
    			            0xe0000000: 0x0,
    			            0xf0000000: 0x8202,
    			            0x8000000: 0x0,
    			            0x18000000: 0x808202,
    			            0x28000000: 0x8202,
    			            0x38000000: 0x8000,
    			            0x48000000: 0x808200,
    			            0x58000000: 0x200,
    			            0x68000000: 0x808002,
    			            0x78000000: 0x2,
    			            0x88000000: 0x800200,
    			            0x98000000: 0x8200,
    			            0xa8000000: 0x808000,
    			            0xb8000000: 0x800202,
    			            0xc8000000: 0x800002,
    			            0xd8000000: 0x8002,
    			            0xe8000000: 0x202,
    			            0xf8000000: 0x800000,
    			            0x1: 0x8000,
    			            0x10000001: 0x2,
    			            0x20000001: 0x808200,
    			            0x30000001: 0x800000,
    			            0x40000001: 0x808002,
    			            0x50000001: 0x8200,
    			            0x60000001: 0x200,
    			            0x70000001: 0x800202,
    			            0x80000001: 0x808202,
    			            0x90000001: 0x808000,
    			            0xa0000001: 0x800002,
    			            0xb0000001: 0x8202,
    			            0xc0000001: 0x202,
    			            0xd0000001: 0x800200,
    			            0xe0000001: 0x8002,
    			            0xf0000001: 0x0,
    			            0x8000001: 0x808202,
    			            0x18000001: 0x808000,
    			            0x28000001: 0x800000,
    			            0x38000001: 0x200,
    			            0x48000001: 0x8000,
    			            0x58000001: 0x800002,
    			            0x68000001: 0x2,
    			            0x78000001: 0x8202,
    			            0x88000001: 0x8002,
    			            0x98000001: 0x800202,
    			            0xa8000001: 0x202,
    			            0xb8000001: 0x808200,
    			            0xc8000001: 0x800200,
    			            0xd8000001: 0x0,
    			            0xe8000001: 0x8200,
    			            0xf8000001: 0x808002
    			        },
    			        {
    			            0x0: 0x40084010,
    			            0x1000000: 0x4000,
    			            0x2000000: 0x80000,
    			            0x3000000: 0x40080010,
    			            0x4000000: 0x40000010,
    			            0x5000000: 0x40084000,
    			            0x6000000: 0x40004000,
    			            0x7000000: 0x10,
    			            0x8000000: 0x84000,
    			            0x9000000: 0x40004010,
    			            0xa000000: 0x40000000,
    			            0xb000000: 0x84010,
    			            0xc000000: 0x80010,
    			            0xd000000: 0x0,
    			            0xe000000: 0x4010,
    			            0xf000000: 0x40080000,
    			            0x800000: 0x40004000,
    			            0x1800000: 0x84010,
    			            0x2800000: 0x10,
    			            0x3800000: 0x40004010,
    			            0x4800000: 0x40084010,
    			            0x5800000: 0x40000000,
    			            0x6800000: 0x80000,
    			            0x7800000: 0x40080010,
    			            0x8800000: 0x80010,
    			            0x9800000: 0x0,
    			            0xa800000: 0x4000,
    			            0xb800000: 0x40080000,
    			            0xc800000: 0x40000010,
    			            0xd800000: 0x84000,
    			            0xe800000: 0x40084000,
    			            0xf800000: 0x4010,
    			            0x10000000: 0x0,
    			            0x11000000: 0x40080010,
    			            0x12000000: 0x40004010,
    			            0x13000000: 0x40084000,
    			            0x14000000: 0x40080000,
    			            0x15000000: 0x10,
    			            0x16000000: 0x84010,
    			            0x17000000: 0x4000,
    			            0x18000000: 0x4010,
    			            0x19000000: 0x80000,
    			            0x1a000000: 0x80010,
    			            0x1b000000: 0x40000010,
    			            0x1c000000: 0x84000,
    			            0x1d000000: 0x40004000,
    			            0x1e000000: 0x40000000,
    			            0x1f000000: 0x40084010,
    			            0x10800000: 0x84010,
    			            0x11800000: 0x80000,
    			            0x12800000: 0x40080000,
    			            0x13800000: 0x4000,
    			            0x14800000: 0x40004000,
    			            0x15800000: 0x40084010,
    			            0x16800000: 0x10,
    			            0x17800000: 0x40000000,
    			            0x18800000: 0x40084000,
    			            0x19800000: 0x40000010,
    			            0x1a800000: 0x40004010,
    			            0x1b800000: 0x80010,
    			            0x1c800000: 0x0,
    			            0x1d800000: 0x4010,
    			            0x1e800000: 0x40080010,
    			            0x1f800000: 0x84000
    			        },
    			        {
    			            0x0: 0x104,
    			            0x100000: 0x0,
    			            0x200000: 0x4000100,
    			            0x300000: 0x10104,
    			            0x400000: 0x10004,
    			            0x500000: 0x4000004,
    			            0x600000: 0x4010104,
    			            0x700000: 0x4010000,
    			            0x800000: 0x4000000,
    			            0x900000: 0x4010100,
    			            0xa00000: 0x10100,
    			            0xb00000: 0x4010004,
    			            0xc00000: 0x4000104,
    			            0xd00000: 0x10000,
    			            0xe00000: 0x4,
    			            0xf00000: 0x100,
    			            0x80000: 0x4010100,
    			            0x180000: 0x4010004,
    			            0x280000: 0x0,
    			            0x380000: 0x4000100,
    			            0x480000: 0x4000004,
    			            0x580000: 0x10000,
    			            0x680000: 0x10004,
    			            0x780000: 0x104,
    			            0x880000: 0x4,
    			            0x980000: 0x100,
    			            0xa80000: 0x4010000,
    			            0xb80000: 0x10104,
    			            0xc80000: 0x10100,
    			            0xd80000: 0x4000104,
    			            0xe80000: 0x4010104,
    			            0xf80000: 0x4000000,
    			            0x1000000: 0x4010100,
    			            0x1100000: 0x10004,
    			            0x1200000: 0x10000,
    			            0x1300000: 0x4000100,
    			            0x1400000: 0x100,
    			            0x1500000: 0x4010104,
    			            0x1600000: 0x4000004,
    			            0x1700000: 0x0,
    			            0x1800000: 0x4000104,
    			            0x1900000: 0x4000000,
    			            0x1a00000: 0x4,
    			            0x1b00000: 0x10100,
    			            0x1c00000: 0x4010000,
    			            0x1d00000: 0x104,
    			            0x1e00000: 0x10104,
    			            0x1f00000: 0x4010004,
    			            0x1080000: 0x4000000,
    			            0x1180000: 0x104,
    			            0x1280000: 0x4010100,
    			            0x1380000: 0x0,
    			            0x1480000: 0x10004,
    			            0x1580000: 0x4000100,
    			            0x1680000: 0x100,
    			            0x1780000: 0x4010004,
    			            0x1880000: 0x10000,
    			            0x1980000: 0x4010104,
    			            0x1a80000: 0x10104,
    			            0x1b80000: 0x4000004,
    			            0x1c80000: 0x4000104,
    			            0x1d80000: 0x4010000,
    			            0x1e80000: 0x4,
    			            0x1f80000: 0x10100
    			        },
    			        {
    			            0x0: 0x80401000,
    			            0x10000: 0x80001040,
    			            0x20000: 0x401040,
    			            0x30000: 0x80400000,
    			            0x40000: 0x0,
    			            0x50000: 0x401000,
    			            0x60000: 0x80000040,
    			            0x70000: 0x400040,
    			            0x80000: 0x80000000,
    			            0x90000: 0x400000,
    			            0xa0000: 0x40,
    			            0xb0000: 0x80001000,
    			            0xc0000: 0x80400040,
    			            0xd0000: 0x1040,
    			            0xe0000: 0x1000,
    			            0xf0000: 0x80401040,
    			            0x8000: 0x80001040,
    			            0x18000: 0x40,
    			            0x28000: 0x80400040,
    			            0x38000: 0x80001000,
    			            0x48000: 0x401000,
    			            0x58000: 0x80401040,
    			            0x68000: 0x0,
    			            0x78000: 0x80400000,
    			            0x88000: 0x1000,
    			            0x98000: 0x80401000,
    			            0xa8000: 0x400000,
    			            0xb8000: 0x1040,
    			            0xc8000: 0x80000000,
    			            0xd8000: 0x400040,
    			            0xe8000: 0x401040,
    			            0xf8000: 0x80000040,
    			            0x100000: 0x400040,
    			            0x110000: 0x401000,
    			            0x120000: 0x80000040,
    			            0x130000: 0x0,
    			            0x140000: 0x1040,
    			            0x150000: 0x80400040,
    			            0x160000: 0x80401000,
    			            0x170000: 0x80001040,
    			            0x180000: 0x80401040,
    			            0x190000: 0x80000000,
    			            0x1a0000: 0x80400000,
    			            0x1b0000: 0x401040,
    			            0x1c0000: 0x80001000,
    			            0x1d0000: 0x400000,
    			            0x1e0000: 0x40,
    			            0x1f0000: 0x1000,
    			            0x108000: 0x80400000,
    			            0x118000: 0x80401040,
    			            0x128000: 0x0,
    			            0x138000: 0x401000,
    			            0x148000: 0x400040,
    			            0x158000: 0x80000000,
    			            0x168000: 0x80001040,
    			            0x178000: 0x40,
    			            0x188000: 0x80000040,
    			            0x198000: 0x1000,
    			            0x1a8000: 0x80001000,
    			            0x1b8000: 0x80400040,
    			            0x1c8000: 0x1040,
    			            0x1d8000: 0x80401000,
    			            0x1e8000: 0x400000,
    			            0x1f8000: 0x401040
    			        },
    			        {
    			            0x0: 0x80,
    			            0x1000: 0x1040000,
    			            0x2000: 0x40000,
    			            0x3000: 0x20000000,
    			            0x4000: 0x20040080,
    			            0x5000: 0x1000080,
    			            0x6000: 0x21000080,
    			            0x7000: 0x40080,
    			            0x8000: 0x1000000,
    			            0x9000: 0x20040000,
    			            0xa000: 0x20000080,
    			            0xb000: 0x21040080,
    			            0xc000: 0x21040000,
    			            0xd000: 0x0,
    			            0xe000: 0x1040080,
    			            0xf000: 0x21000000,
    			            0x800: 0x1040080,
    			            0x1800: 0x21000080,
    			            0x2800: 0x80,
    			            0x3800: 0x1040000,
    			            0x4800: 0x40000,
    			            0x5800: 0x20040080,
    			            0x6800: 0x21040000,
    			            0x7800: 0x20000000,
    			            0x8800: 0x20040000,
    			            0x9800: 0x0,
    			            0xa800: 0x21040080,
    			            0xb800: 0x1000080,
    			            0xc800: 0x20000080,
    			            0xd800: 0x21000000,
    			            0xe800: 0x1000000,
    			            0xf800: 0x40080,
    			            0x10000: 0x40000,
    			            0x11000: 0x80,
    			            0x12000: 0x20000000,
    			            0x13000: 0x21000080,
    			            0x14000: 0x1000080,
    			            0x15000: 0x21040000,
    			            0x16000: 0x20040080,
    			            0x17000: 0x1000000,
    			            0x18000: 0x21040080,
    			            0x19000: 0x21000000,
    			            0x1a000: 0x1040000,
    			            0x1b000: 0x20040000,
    			            0x1c000: 0x40080,
    			            0x1d000: 0x20000080,
    			            0x1e000: 0x0,
    			            0x1f000: 0x1040080,
    			            0x10800: 0x21000080,
    			            0x11800: 0x1000000,
    			            0x12800: 0x1040000,
    			            0x13800: 0x20040080,
    			            0x14800: 0x20000000,
    			            0x15800: 0x1040080,
    			            0x16800: 0x80,
    			            0x17800: 0x21040000,
    			            0x18800: 0x40080,
    			            0x19800: 0x21040080,
    			            0x1a800: 0x0,
    			            0x1b800: 0x21000000,
    			            0x1c800: 0x1000080,
    			            0x1d800: 0x40000,
    			            0x1e800: 0x20040000,
    			            0x1f800: 0x20000080
    			        },
    			        {
    			            0x0: 0x10000008,
    			            0x100: 0x2000,
    			            0x200: 0x10200000,
    			            0x300: 0x10202008,
    			            0x400: 0x10002000,
    			            0x500: 0x200000,
    			            0x600: 0x200008,
    			            0x700: 0x10000000,
    			            0x800: 0x0,
    			            0x900: 0x10002008,
    			            0xa00: 0x202000,
    			            0xb00: 0x8,
    			            0xc00: 0x10200008,
    			            0xd00: 0x202008,
    			            0xe00: 0x2008,
    			            0xf00: 0x10202000,
    			            0x80: 0x10200000,
    			            0x180: 0x10202008,
    			            0x280: 0x8,
    			            0x380: 0x200000,
    			            0x480: 0x202008,
    			            0x580: 0x10000008,
    			            0x680: 0x10002000,
    			            0x780: 0x2008,
    			            0x880: 0x200008,
    			            0x980: 0x2000,
    			            0xa80: 0x10002008,
    			            0xb80: 0x10200008,
    			            0xc80: 0x0,
    			            0xd80: 0x10202000,
    			            0xe80: 0x202000,
    			            0xf80: 0x10000000,
    			            0x1000: 0x10002000,
    			            0x1100: 0x10200008,
    			            0x1200: 0x10202008,
    			            0x1300: 0x2008,
    			            0x1400: 0x200000,
    			            0x1500: 0x10000000,
    			            0x1600: 0x10000008,
    			            0x1700: 0x202000,
    			            0x1800: 0x202008,
    			            0x1900: 0x0,
    			            0x1a00: 0x8,
    			            0x1b00: 0x10200000,
    			            0x1c00: 0x2000,
    			            0x1d00: 0x10002008,
    			            0x1e00: 0x10202000,
    			            0x1f00: 0x200008,
    			            0x1080: 0x8,
    			            0x1180: 0x202000,
    			            0x1280: 0x200000,
    			            0x1380: 0x10000008,
    			            0x1480: 0x10002000,
    			            0x1580: 0x2008,
    			            0x1680: 0x10202008,
    			            0x1780: 0x10200000,
    			            0x1880: 0x10202000,
    			            0x1980: 0x10200008,
    			            0x1a80: 0x2000,
    			            0x1b80: 0x202008,
    			            0x1c80: 0x200008,
    			            0x1d80: 0x0,
    			            0x1e80: 0x10000000,
    			            0x1f80: 0x10002008
    			        },
    			        {
    			            0x0: 0x100000,
    			            0x10: 0x2000401,
    			            0x20: 0x400,
    			            0x30: 0x100401,
    			            0x40: 0x2100401,
    			            0x50: 0x0,
    			            0x60: 0x1,
    			            0x70: 0x2100001,
    			            0x80: 0x2000400,
    			            0x90: 0x100001,
    			            0xa0: 0x2000001,
    			            0xb0: 0x2100400,
    			            0xc0: 0x2100000,
    			            0xd0: 0x401,
    			            0xe0: 0x100400,
    			            0xf0: 0x2000000,
    			            0x8: 0x2100001,
    			            0x18: 0x0,
    			            0x28: 0x2000401,
    			            0x38: 0x2100400,
    			            0x48: 0x100000,
    			            0x58: 0x2000001,
    			            0x68: 0x2000000,
    			            0x78: 0x401,
    			            0x88: 0x100401,
    			            0x98: 0x2000400,
    			            0xa8: 0x2100000,
    			            0xb8: 0x100001,
    			            0xc8: 0x400,
    			            0xd8: 0x2100401,
    			            0xe8: 0x1,
    			            0xf8: 0x100400,
    			            0x100: 0x2000000,
    			            0x110: 0x100000,
    			            0x120: 0x2000401,
    			            0x130: 0x2100001,
    			            0x140: 0x100001,
    			            0x150: 0x2000400,
    			            0x160: 0x2100400,
    			            0x170: 0x100401,
    			            0x180: 0x401,
    			            0x190: 0x2100401,
    			            0x1a0: 0x100400,
    			            0x1b0: 0x1,
    			            0x1c0: 0x0,
    			            0x1d0: 0x2100000,
    			            0x1e0: 0x2000001,
    			            0x1f0: 0x400,
    			            0x108: 0x100400,
    			            0x118: 0x2000401,
    			            0x128: 0x2100001,
    			            0x138: 0x1,
    			            0x148: 0x2000000,
    			            0x158: 0x100000,
    			            0x168: 0x401,
    			            0x178: 0x2100400,
    			            0x188: 0x2000001,
    			            0x198: 0x2100000,
    			            0x1a8: 0x0,
    			            0x1b8: 0x2100401,
    			            0x1c8: 0x100401,
    			            0x1d8: 0x400,
    			            0x1e8: 0x2000400,
    			            0x1f8: 0x100001
    			        },
    			        {
    			            0x0: 0x8000820,
    			            0x1: 0x20000,
    			            0x2: 0x8000000,
    			            0x3: 0x20,
    			            0x4: 0x20020,
    			            0x5: 0x8020820,
    			            0x6: 0x8020800,
    			            0x7: 0x800,
    			            0x8: 0x8020000,
    			            0x9: 0x8000800,
    			            0xa: 0x20800,
    			            0xb: 0x8020020,
    			            0xc: 0x820,
    			            0xd: 0x0,
    			            0xe: 0x8000020,
    			            0xf: 0x20820,
    			            0x80000000: 0x800,
    			            0x80000001: 0x8020820,
    			            0x80000002: 0x8000820,
    			            0x80000003: 0x8000000,
    			            0x80000004: 0x8020000,
    			            0x80000005: 0x20800,
    			            0x80000006: 0x20820,
    			            0x80000007: 0x20,
    			            0x80000008: 0x8000020,
    			            0x80000009: 0x820,
    			            0x8000000a: 0x20020,
    			            0x8000000b: 0x8020800,
    			            0x8000000c: 0x0,
    			            0x8000000d: 0x8020020,
    			            0x8000000e: 0x8000800,
    			            0x8000000f: 0x20000,
    			            0x10: 0x20820,
    			            0x11: 0x8020800,
    			            0x12: 0x20,
    			            0x13: 0x800,
    			            0x14: 0x8000800,
    			            0x15: 0x8000020,
    			            0x16: 0x8020020,
    			            0x17: 0x20000,
    			            0x18: 0x0,
    			            0x19: 0x20020,
    			            0x1a: 0x8020000,
    			            0x1b: 0x8000820,
    			            0x1c: 0x8020820,
    			            0x1d: 0x20800,
    			            0x1e: 0x820,
    			            0x1f: 0x8000000,
    			            0x80000010: 0x20000,
    			            0x80000011: 0x800,
    			            0x80000012: 0x8020020,
    			            0x80000013: 0x20820,
    			            0x80000014: 0x20,
    			            0x80000015: 0x8020000,
    			            0x80000016: 0x8000000,
    			            0x80000017: 0x8000820,
    			            0x80000018: 0x8020820,
    			            0x80000019: 0x8000020,
    			            0x8000001a: 0x8000800,
    			            0x8000001b: 0x0,
    			            0x8000001c: 0x20800,
    			            0x8000001d: 0x820,
    			            0x8000001e: 0x20020,
    			            0x8000001f: 0x8020800
    			        }
    			    ];

    			    // Masks that select the SBOX input
    			    var SBOX_MASK = [
    			        0xf8000001, 0x1f800000, 0x01f80000, 0x001f8000,
    			        0x0001f800, 0x00001f80, 0x000001f8, 0x8000001f
    			    ];

    			    /**
    			     * DES block cipher algorithm.
    			     */
    			    var DES = C_algo.DES = BlockCipher.extend({
    			        _doReset: function () {
    			            // Shortcuts
    			            var key = this._key;
    			            var keyWords = key.words;

    			            // Select 56 bits according to PC1
    			            var keyBits = [];
    			            for (var i = 0; i < 56; i++) {
    			                var keyBitPos = PC1[i] - 1;
    			                keyBits[i] = (keyWords[keyBitPos >>> 5] >>> (31 - keyBitPos % 32)) & 1;
    			            }

    			            // Assemble 16 subkeys
    			            var subKeys = this._subKeys = [];
    			            for (var nSubKey = 0; nSubKey < 16; nSubKey++) {
    			                // Create subkey
    			                var subKey = subKeys[nSubKey] = [];

    			                // Shortcut
    			                var bitShift = BIT_SHIFTS[nSubKey];

    			                // Select 48 bits according to PC2
    			                for (var i = 0; i < 24; i++) {
    			                    // Select from the left 28 key bits
    			                    subKey[(i / 6) | 0] |= keyBits[((PC2[i] - 1) + bitShift) % 28] << (31 - i % 6);

    			                    // Select from the right 28 key bits
    			                    subKey[4 + ((i / 6) | 0)] |= keyBits[28 + (((PC2[i + 24] - 1) + bitShift) % 28)] << (31 - i % 6);
    			                }

    			                // Since each subkey is applied to an expanded 32-bit input,
    			                // the subkey can be broken into 8 values scaled to 32-bits,
    			                // which allows the key to be used without expansion
    			                subKey[0] = (subKey[0] << 1) | (subKey[0] >>> 31);
    			                for (var i = 1; i < 7; i++) {
    			                    subKey[i] = subKey[i] >>> ((i - 1) * 4 + 3);
    			                }
    			                subKey[7] = (subKey[7] << 5) | (subKey[7] >>> 27);
    			            }

    			            // Compute inverse subkeys
    			            var invSubKeys = this._invSubKeys = [];
    			            for (var i = 0; i < 16; i++) {
    			                invSubKeys[i] = subKeys[15 - i];
    			            }
    			        },

    			        encryptBlock: function (M, offset) {
    			            this._doCryptBlock(M, offset, this._subKeys);
    			        },

    			        decryptBlock: function (M, offset) {
    			            this._doCryptBlock(M, offset, this._invSubKeys);
    			        },

    			        _doCryptBlock: function (M, offset, subKeys) {
    			            // Get input
    			            this._lBlock = M[offset];
    			            this._rBlock = M[offset + 1];

    			            // Initial permutation
    			            exchangeLR.call(this, 4,  0x0f0f0f0f);
    			            exchangeLR.call(this, 16, 0x0000ffff);
    			            exchangeRL.call(this, 2,  0x33333333);
    			            exchangeRL.call(this, 8,  0x00ff00ff);
    			            exchangeLR.call(this, 1,  0x55555555);

    			            // Rounds
    			            for (var round = 0; round < 16; round++) {
    			                // Shortcuts
    			                var subKey = subKeys[round];
    			                var lBlock = this._lBlock;
    			                var rBlock = this._rBlock;

    			                // Feistel function
    			                var f = 0;
    			                for (var i = 0; i < 8; i++) {
    			                    f |= SBOX_P[i][((rBlock ^ subKey[i]) & SBOX_MASK[i]) >>> 0];
    			                }
    			                this._lBlock = rBlock;
    			                this._rBlock = lBlock ^ f;
    			            }

    			            // Undo swap from last round
    			            var t = this._lBlock;
    			            this._lBlock = this._rBlock;
    			            this._rBlock = t;

    			            // Final permutation
    			            exchangeLR.call(this, 1,  0x55555555);
    			            exchangeRL.call(this, 8,  0x00ff00ff);
    			            exchangeRL.call(this, 2,  0x33333333);
    			            exchangeLR.call(this, 16, 0x0000ffff);
    			            exchangeLR.call(this, 4,  0x0f0f0f0f);

    			            // Set output
    			            M[offset] = this._lBlock;
    			            M[offset + 1] = this._rBlock;
    			        },

    			        keySize: 64/32,

    			        ivSize: 64/32,

    			        blockSize: 64/32
    			    });

    			    // Swap bits across the left and right words
    			    function exchangeLR(offset, mask) {
    			        var t = ((this._lBlock >>> offset) ^ this._rBlock) & mask;
    			        this._rBlock ^= t;
    			        this._lBlock ^= t << offset;
    			    }

    			    function exchangeRL(offset, mask) {
    			        var t = ((this._rBlock >>> offset) ^ this._lBlock) & mask;
    			        this._lBlock ^= t;
    			        this._rBlock ^= t << offset;
    			    }

    			    /**
    			     * Shortcut functions to the cipher's object interface.
    			     *
    			     * @example
    			     *
    			     *     var ciphertext = CryptoJS.DES.encrypt(message, key, cfg);
    			     *     var plaintext  = CryptoJS.DES.decrypt(ciphertext, key, cfg);
    			     */
    			    C.DES = BlockCipher._createHelper(DES);

    			    /**
    			     * Triple-DES block cipher algorithm.
    			     */
    			    var TripleDES = C_algo.TripleDES = BlockCipher.extend({
    			        _doReset: function () {
    			            // Shortcuts
    			            var key = this._key;
    			            var keyWords = key.words;
    			            // Make sure the key length is valid (64, 128 or >= 192 bit)
    			            if (keyWords.length !== 2 && keyWords.length !== 4 && keyWords.length < 6) {
    			                throw new Error('Invalid key length - 3DES requires the key length to be 64, 128, 192 or >192.');
    			            }

    			            // Extend the key according to the keying options defined in 3DES standard
    			            var key1 = keyWords.slice(0, 2);
    			            var key2 = keyWords.length < 4 ? keyWords.slice(0, 2) : keyWords.slice(2, 4);
    			            var key3 = keyWords.length < 6 ? keyWords.slice(0, 2) : keyWords.slice(4, 6);

    			            // Create DES instances
    			            this._des1 = DES.createEncryptor(WordArray.create(key1));
    			            this._des2 = DES.createEncryptor(WordArray.create(key2));
    			            this._des3 = DES.createEncryptor(WordArray.create(key3));
    			        },

    			        encryptBlock: function (M, offset) {
    			            this._des1.encryptBlock(M, offset);
    			            this._des2.decryptBlock(M, offset);
    			            this._des3.encryptBlock(M, offset);
    			        },

    			        decryptBlock: function (M, offset) {
    			            this._des3.decryptBlock(M, offset);
    			            this._des2.encryptBlock(M, offset);
    			            this._des1.decryptBlock(M, offset);
    			        },

    			        keySize: 192/32,

    			        ivSize: 64/32,

    			        blockSize: 64/32
    			    });

    			    /**
    			     * Shortcut functions to the cipher's object interface.
    			     *
    			     * @example
    			     *
    			     *     var ciphertext = CryptoJS.TripleDES.encrypt(message, key, cfg);
    			     *     var plaintext  = CryptoJS.TripleDES.decrypt(ciphertext, key, cfg);
    			     */
    			    C.TripleDES = BlockCipher._createHelper(TripleDES);
    			}());


    			return CryptoJS.TripleDES;

    		})); 
    	} (tripledes));
    	return tripledes.exports;
    }

    var rc4 = {exports: {}};

    var hasRequiredRc4;

    function requireRc4 () {
    	if (hasRequiredRc4) return rc4.exports;
    	hasRequiredRc4 = 1;
    	(function (module, exports) {
    (function (root, factory, undef) {
    			{
    				// CommonJS
    				module.exports = factory(requireCore(), requireEncBase64(), requireMd5(), requireEvpkdf(), requireCipherCore());
    			}
    		}(commonjsGlobal, function (CryptoJS) {

    			(function () {
    			    // Shortcuts
    			    var C = CryptoJS;
    			    var C_lib = C.lib;
    			    var StreamCipher = C_lib.StreamCipher;
    			    var C_algo = C.algo;

    			    /**
    			     * RC4 stream cipher algorithm.
    			     */
    			    var RC4 = C_algo.RC4 = StreamCipher.extend({
    			        _doReset: function () {
    			            // Shortcuts
    			            var key = this._key;
    			            var keyWords = key.words;
    			            var keySigBytes = key.sigBytes;

    			            // Init sbox
    			            var S = this._S = [];
    			            for (var i = 0; i < 256; i++) {
    			                S[i] = i;
    			            }

    			            // Key setup
    			            for (var i = 0, j = 0; i < 256; i++) {
    			                var keyByteIndex = i % keySigBytes;
    			                var keyByte = (keyWords[keyByteIndex >>> 2] >>> (24 - (keyByteIndex % 4) * 8)) & 0xff;

    			                j = (j + S[i] + keyByte) % 256;

    			                // Swap
    			                var t = S[i];
    			                S[i] = S[j];
    			                S[j] = t;
    			            }

    			            // Counters
    			            this._i = this._j = 0;
    			        },

    			        _doProcessBlock: function (M, offset) {
    			            M[offset] ^= generateKeystreamWord.call(this);
    			        },

    			        keySize: 256/32,

    			        ivSize: 0
    			    });

    			    function generateKeystreamWord() {
    			        // Shortcuts
    			        var S = this._S;
    			        var i = this._i;
    			        var j = this._j;

    			        // Generate keystream word
    			        var keystreamWord = 0;
    			        for (var n = 0; n < 4; n++) {
    			            i = (i + 1) % 256;
    			            j = (j + S[i]) % 256;

    			            // Swap
    			            var t = S[i];
    			            S[i] = S[j];
    			            S[j] = t;

    			            keystreamWord |= S[(S[i] + S[j]) % 256] << (24 - n * 8);
    			        }

    			        // Update counters
    			        this._i = i;
    			        this._j = j;

    			        return keystreamWord;
    			    }

    			    /**
    			     * Shortcut functions to the cipher's object interface.
    			     *
    			     * @example
    			     *
    			     *     var ciphertext = CryptoJS.RC4.encrypt(message, key, cfg);
    			     *     var plaintext  = CryptoJS.RC4.decrypt(ciphertext, key, cfg);
    			     */
    			    C.RC4 = StreamCipher._createHelper(RC4);

    			    /**
    			     * Modified RC4 stream cipher algorithm.
    			     */
    			    var RC4Drop = C_algo.RC4Drop = RC4.extend({
    			        /**
    			         * Configuration options.
    			         *
    			         * @property {number} drop The number of keystream words to drop. Default 192
    			         */
    			        cfg: RC4.cfg.extend({
    			            drop: 192
    			        }),

    			        _doReset: function () {
    			            RC4._doReset.call(this);

    			            // Drop
    			            for (var i = this.cfg.drop; i > 0; i--) {
    			                generateKeystreamWord.call(this);
    			            }
    			        }
    			    });

    			    /**
    			     * Shortcut functions to the cipher's object interface.
    			     *
    			     * @example
    			     *
    			     *     var ciphertext = CryptoJS.RC4Drop.encrypt(message, key, cfg);
    			     *     var plaintext  = CryptoJS.RC4Drop.decrypt(ciphertext, key, cfg);
    			     */
    			    C.RC4Drop = StreamCipher._createHelper(RC4Drop);
    			}());


    			return CryptoJS.RC4;

    		})); 
    	} (rc4));
    	return rc4.exports;
    }

    var rabbit = {exports: {}};

    var hasRequiredRabbit;

    function requireRabbit () {
    	if (hasRequiredRabbit) return rabbit.exports;
    	hasRequiredRabbit = 1;
    	(function (module, exports) {
    (function (root, factory, undef) {
    			{
    				// CommonJS
    				module.exports = factory(requireCore(), requireEncBase64(), requireMd5(), requireEvpkdf(), requireCipherCore());
    			}
    		}(commonjsGlobal, function (CryptoJS) {

    			(function () {
    			    // Shortcuts
    			    var C = CryptoJS;
    			    var C_lib = C.lib;
    			    var StreamCipher = C_lib.StreamCipher;
    			    var C_algo = C.algo;

    			    // Reusable objects
    			    var S  = [];
    			    var C_ = [];
    			    var G  = [];

    			    /**
    			     * Rabbit stream cipher algorithm
    			     */
    			    var Rabbit = C_algo.Rabbit = StreamCipher.extend({
    			        _doReset: function () {
    			            // Shortcuts
    			            var K = this._key.words;
    			            var iv = this.cfg.iv;

    			            // Swap endian
    			            for (var i = 0; i < 4; i++) {
    			                K[i] = (((K[i] << 8)  | (K[i] >>> 24)) & 0x00ff00ff) |
    			                       (((K[i] << 24) | (K[i] >>> 8))  & 0xff00ff00);
    			            }

    			            // Generate initial state values
    			            var X = this._X = [
    			                K[0], (K[3] << 16) | (K[2] >>> 16),
    			                K[1], (K[0] << 16) | (K[3] >>> 16),
    			                K[2], (K[1] << 16) | (K[0] >>> 16),
    			                K[3], (K[2] << 16) | (K[1] >>> 16)
    			            ];

    			            // Generate initial counter values
    			            var C = this._C = [
    			                (K[2] << 16) | (K[2] >>> 16), (K[0] & 0xffff0000) | (K[1] & 0x0000ffff),
    			                (K[3] << 16) | (K[3] >>> 16), (K[1] & 0xffff0000) | (K[2] & 0x0000ffff),
    			                (K[0] << 16) | (K[0] >>> 16), (K[2] & 0xffff0000) | (K[3] & 0x0000ffff),
    			                (K[1] << 16) | (K[1] >>> 16), (K[3] & 0xffff0000) | (K[0] & 0x0000ffff)
    			            ];

    			            // Carry bit
    			            this._b = 0;

    			            // Iterate the system four times
    			            for (var i = 0; i < 4; i++) {
    			                nextState.call(this);
    			            }

    			            // Modify the counters
    			            for (var i = 0; i < 8; i++) {
    			                C[i] ^= X[(i + 4) & 7];
    			            }

    			            // IV setup
    			            if (iv) {
    			                // Shortcuts
    			                var IV = iv.words;
    			                var IV_0 = IV[0];
    			                var IV_1 = IV[1];

    			                // Generate four subvectors
    			                var i0 = (((IV_0 << 8) | (IV_0 >>> 24)) & 0x00ff00ff) | (((IV_0 << 24) | (IV_0 >>> 8)) & 0xff00ff00);
    			                var i2 = (((IV_1 << 8) | (IV_1 >>> 24)) & 0x00ff00ff) | (((IV_1 << 24) | (IV_1 >>> 8)) & 0xff00ff00);
    			                var i1 = (i0 >>> 16) | (i2 & 0xffff0000);
    			                var i3 = (i2 << 16)  | (i0 & 0x0000ffff);

    			                // Modify counter values
    			                C[0] ^= i0;
    			                C[1] ^= i1;
    			                C[2] ^= i2;
    			                C[3] ^= i3;
    			                C[4] ^= i0;
    			                C[5] ^= i1;
    			                C[6] ^= i2;
    			                C[7] ^= i3;

    			                // Iterate the system four times
    			                for (var i = 0; i < 4; i++) {
    			                    nextState.call(this);
    			                }
    			            }
    			        },

    			        _doProcessBlock: function (M, offset) {
    			            // Shortcut
    			            var X = this._X;

    			            // Iterate the system
    			            nextState.call(this);

    			            // Generate four keystream words
    			            S[0] = X[0] ^ (X[5] >>> 16) ^ (X[3] << 16);
    			            S[1] = X[2] ^ (X[7] >>> 16) ^ (X[5] << 16);
    			            S[2] = X[4] ^ (X[1] >>> 16) ^ (X[7] << 16);
    			            S[3] = X[6] ^ (X[3] >>> 16) ^ (X[1] << 16);

    			            for (var i = 0; i < 4; i++) {
    			                // Swap endian
    			                S[i] = (((S[i] << 8)  | (S[i] >>> 24)) & 0x00ff00ff) |
    			                       (((S[i] << 24) | (S[i] >>> 8))  & 0xff00ff00);

    			                // Encrypt
    			                M[offset + i] ^= S[i];
    			            }
    			        },

    			        blockSize: 128/32,

    			        ivSize: 64/32
    			    });

    			    function nextState() {
    			        // Shortcuts
    			        var X = this._X;
    			        var C = this._C;

    			        // Save old counter values
    			        for (var i = 0; i < 8; i++) {
    			            C_[i] = C[i];
    			        }

    			        // Calculate new counter values
    			        C[0] = (C[0] + 0x4d34d34d + this._b) | 0;
    			        C[1] = (C[1] + 0xd34d34d3 + ((C[0] >>> 0) < (C_[0] >>> 0) ? 1 : 0)) | 0;
    			        C[2] = (C[2] + 0x34d34d34 + ((C[1] >>> 0) < (C_[1] >>> 0) ? 1 : 0)) | 0;
    			        C[3] = (C[3] + 0x4d34d34d + ((C[2] >>> 0) < (C_[2] >>> 0) ? 1 : 0)) | 0;
    			        C[4] = (C[4] + 0xd34d34d3 + ((C[3] >>> 0) < (C_[3] >>> 0) ? 1 : 0)) | 0;
    			        C[5] = (C[5] + 0x34d34d34 + ((C[4] >>> 0) < (C_[4] >>> 0) ? 1 : 0)) | 0;
    			        C[6] = (C[6] + 0x4d34d34d + ((C[5] >>> 0) < (C_[5] >>> 0) ? 1 : 0)) | 0;
    			        C[7] = (C[7] + 0xd34d34d3 + ((C[6] >>> 0) < (C_[6] >>> 0) ? 1 : 0)) | 0;
    			        this._b = (C[7] >>> 0) < (C_[7] >>> 0) ? 1 : 0;

    			        // Calculate the g-values
    			        for (var i = 0; i < 8; i++) {
    			            var gx = X[i] + C[i];

    			            // Construct high and low argument for squaring
    			            var ga = gx & 0xffff;
    			            var gb = gx >>> 16;

    			            // Calculate high and low result of squaring
    			            var gh = ((((ga * ga) >>> 17) + ga * gb) >>> 15) + gb * gb;
    			            var gl = (((gx & 0xffff0000) * gx) | 0) + (((gx & 0x0000ffff) * gx) | 0);

    			            // High XOR low
    			            G[i] = gh ^ gl;
    			        }

    			        // Calculate new state values
    			        X[0] = (G[0] + ((G[7] << 16) | (G[7] >>> 16)) + ((G[6] << 16) | (G[6] >>> 16))) | 0;
    			        X[1] = (G[1] + ((G[0] << 8)  | (G[0] >>> 24)) + G[7]) | 0;
    			        X[2] = (G[2] + ((G[1] << 16) | (G[1] >>> 16)) + ((G[0] << 16) | (G[0] >>> 16))) | 0;
    			        X[3] = (G[3] + ((G[2] << 8)  | (G[2] >>> 24)) + G[1]) | 0;
    			        X[4] = (G[4] + ((G[3] << 16) | (G[3] >>> 16)) + ((G[2] << 16) | (G[2] >>> 16))) | 0;
    			        X[5] = (G[5] + ((G[4] << 8)  | (G[4] >>> 24)) + G[3]) | 0;
    			        X[6] = (G[6] + ((G[5] << 16) | (G[5] >>> 16)) + ((G[4] << 16) | (G[4] >>> 16))) | 0;
    			        X[7] = (G[7] + ((G[6] << 8)  | (G[6] >>> 24)) + G[5]) | 0;
    			    }

    			    /**
    			     * Shortcut functions to the cipher's object interface.
    			     *
    			     * @example
    			     *
    			     *     var ciphertext = CryptoJS.Rabbit.encrypt(message, key, cfg);
    			     *     var plaintext  = CryptoJS.Rabbit.decrypt(ciphertext, key, cfg);
    			     */
    			    C.Rabbit = StreamCipher._createHelper(Rabbit);
    			}());


    			return CryptoJS.Rabbit;

    		})); 
    	} (rabbit));
    	return rabbit.exports;
    }

    var rabbitLegacy = {exports: {}};

    var hasRequiredRabbitLegacy;

    function requireRabbitLegacy () {
    	if (hasRequiredRabbitLegacy) return rabbitLegacy.exports;
    	hasRequiredRabbitLegacy = 1;
    	(function (module, exports) {
    (function (root, factory, undef) {
    			{
    				// CommonJS
    				module.exports = factory(requireCore(), requireEncBase64(), requireMd5(), requireEvpkdf(), requireCipherCore());
    			}
    		}(commonjsGlobal, function (CryptoJS) {

    			(function () {
    			    // Shortcuts
    			    var C = CryptoJS;
    			    var C_lib = C.lib;
    			    var StreamCipher = C_lib.StreamCipher;
    			    var C_algo = C.algo;

    			    // Reusable objects
    			    var S  = [];
    			    var C_ = [];
    			    var G  = [];

    			    /**
    			     * Rabbit stream cipher algorithm.
    			     *
    			     * This is a legacy version that neglected to convert the key to little-endian.
    			     * This error doesn't affect the cipher's security,
    			     * but it does affect its compatibility with other implementations.
    			     */
    			    var RabbitLegacy = C_algo.RabbitLegacy = StreamCipher.extend({
    			        _doReset: function () {
    			            // Shortcuts
    			            var K = this._key.words;
    			            var iv = this.cfg.iv;

    			            // Generate initial state values
    			            var X = this._X = [
    			                K[0], (K[3] << 16) | (K[2] >>> 16),
    			                K[1], (K[0] << 16) | (K[3] >>> 16),
    			                K[2], (K[1] << 16) | (K[0] >>> 16),
    			                K[3], (K[2] << 16) | (K[1] >>> 16)
    			            ];

    			            // Generate initial counter values
    			            var C = this._C = [
    			                (K[2] << 16) | (K[2] >>> 16), (K[0] & 0xffff0000) | (K[1] & 0x0000ffff),
    			                (K[3] << 16) | (K[3] >>> 16), (K[1] & 0xffff0000) | (K[2] & 0x0000ffff),
    			                (K[0] << 16) | (K[0] >>> 16), (K[2] & 0xffff0000) | (K[3] & 0x0000ffff),
    			                (K[1] << 16) | (K[1] >>> 16), (K[3] & 0xffff0000) | (K[0] & 0x0000ffff)
    			            ];

    			            // Carry bit
    			            this._b = 0;

    			            // Iterate the system four times
    			            for (var i = 0; i < 4; i++) {
    			                nextState.call(this);
    			            }

    			            // Modify the counters
    			            for (var i = 0; i < 8; i++) {
    			                C[i] ^= X[(i + 4) & 7];
    			            }

    			            // IV setup
    			            if (iv) {
    			                // Shortcuts
    			                var IV = iv.words;
    			                var IV_0 = IV[0];
    			                var IV_1 = IV[1];

    			                // Generate four subvectors
    			                var i0 = (((IV_0 << 8) | (IV_0 >>> 24)) & 0x00ff00ff) | (((IV_0 << 24) | (IV_0 >>> 8)) & 0xff00ff00);
    			                var i2 = (((IV_1 << 8) | (IV_1 >>> 24)) & 0x00ff00ff) | (((IV_1 << 24) | (IV_1 >>> 8)) & 0xff00ff00);
    			                var i1 = (i0 >>> 16) | (i2 & 0xffff0000);
    			                var i3 = (i2 << 16)  | (i0 & 0x0000ffff);

    			                // Modify counter values
    			                C[0] ^= i0;
    			                C[1] ^= i1;
    			                C[2] ^= i2;
    			                C[3] ^= i3;
    			                C[4] ^= i0;
    			                C[5] ^= i1;
    			                C[6] ^= i2;
    			                C[7] ^= i3;

    			                // Iterate the system four times
    			                for (var i = 0; i < 4; i++) {
    			                    nextState.call(this);
    			                }
    			            }
    			        },

    			        _doProcessBlock: function (M, offset) {
    			            // Shortcut
    			            var X = this._X;

    			            // Iterate the system
    			            nextState.call(this);

    			            // Generate four keystream words
    			            S[0] = X[0] ^ (X[5] >>> 16) ^ (X[3] << 16);
    			            S[1] = X[2] ^ (X[7] >>> 16) ^ (X[5] << 16);
    			            S[2] = X[4] ^ (X[1] >>> 16) ^ (X[7] << 16);
    			            S[3] = X[6] ^ (X[3] >>> 16) ^ (X[1] << 16);

    			            for (var i = 0; i < 4; i++) {
    			                // Swap endian
    			                S[i] = (((S[i] << 8)  | (S[i] >>> 24)) & 0x00ff00ff) |
    			                       (((S[i] << 24) | (S[i] >>> 8))  & 0xff00ff00);

    			                // Encrypt
    			                M[offset + i] ^= S[i];
    			            }
    			        },

    			        blockSize: 128/32,

    			        ivSize: 64/32
    			    });

    			    function nextState() {
    			        // Shortcuts
    			        var X = this._X;
    			        var C = this._C;

    			        // Save old counter values
    			        for (var i = 0; i < 8; i++) {
    			            C_[i] = C[i];
    			        }

    			        // Calculate new counter values
    			        C[0] = (C[0] + 0x4d34d34d + this._b) | 0;
    			        C[1] = (C[1] + 0xd34d34d3 + ((C[0] >>> 0) < (C_[0] >>> 0) ? 1 : 0)) | 0;
    			        C[2] = (C[2] + 0x34d34d34 + ((C[1] >>> 0) < (C_[1] >>> 0) ? 1 : 0)) | 0;
    			        C[3] = (C[3] + 0x4d34d34d + ((C[2] >>> 0) < (C_[2] >>> 0) ? 1 : 0)) | 0;
    			        C[4] = (C[4] + 0xd34d34d3 + ((C[3] >>> 0) < (C_[3] >>> 0) ? 1 : 0)) | 0;
    			        C[5] = (C[5] + 0x34d34d34 + ((C[4] >>> 0) < (C_[4] >>> 0) ? 1 : 0)) | 0;
    			        C[6] = (C[6] + 0x4d34d34d + ((C[5] >>> 0) < (C_[5] >>> 0) ? 1 : 0)) | 0;
    			        C[7] = (C[7] + 0xd34d34d3 + ((C[6] >>> 0) < (C_[6] >>> 0) ? 1 : 0)) | 0;
    			        this._b = (C[7] >>> 0) < (C_[7] >>> 0) ? 1 : 0;

    			        // Calculate the g-values
    			        for (var i = 0; i < 8; i++) {
    			            var gx = X[i] + C[i];

    			            // Construct high and low argument for squaring
    			            var ga = gx & 0xffff;
    			            var gb = gx >>> 16;

    			            // Calculate high and low result of squaring
    			            var gh = ((((ga * ga) >>> 17) + ga * gb) >>> 15) + gb * gb;
    			            var gl = (((gx & 0xffff0000) * gx) | 0) + (((gx & 0x0000ffff) * gx) | 0);

    			            // High XOR low
    			            G[i] = gh ^ gl;
    			        }

    			        // Calculate new state values
    			        X[0] = (G[0] + ((G[7] << 16) | (G[7] >>> 16)) + ((G[6] << 16) | (G[6] >>> 16))) | 0;
    			        X[1] = (G[1] + ((G[0] << 8)  | (G[0] >>> 24)) + G[7]) | 0;
    			        X[2] = (G[2] + ((G[1] << 16) | (G[1] >>> 16)) + ((G[0] << 16) | (G[0] >>> 16))) | 0;
    			        X[3] = (G[3] + ((G[2] << 8)  | (G[2] >>> 24)) + G[1]) | 0;
    			        X[4] = (G[4] + ((G[3] << 16) | (G[3] >>> 16)) + ((G[2] << 16) | (G[2] >>> 16))) | 0;
    			        X[5] = (G[5] + ((G[4] << 8)  | (G[4] >>> 24)) + G[3]) | 0;
    			        X[6] = (G[6] + ((G[5] << 16) | (G[5] >>> 16)) + ((G[4] << 16) | (G[4] >>> 16))) | 0;
    			        X[7] = (G[7] + ((G[6] << 8)  | (G[6] >>> 24)) + G[5]) | 0;
    			    }

    			    /**
    			     * Shortcut functions to the cipher's object interface.
    			     *
    			     * @example
    			     *
    			     *     var ciphertext = CryptoJS.RabbitLegacy.encrypt(message, key, cfg);
    			     *     var plaintext  = CryptoJS.RabbitLegacy.decrypt(ciphertext, key, cfg);
    			     */
    			    C.RabbitLegacy = StreamCipher._createHelper(RabbitLegacy);
    			}());


    			return CryptoJS.RabbitLegacy;

    		})); 
    	} (rabbitLegacy));
    	return rabbitLegacy.exports;
    }

    var blowfish = {exports: {}};

    var hasRequiredBlowfish;

    function requireBlowfish () {
    	if (hasRequiredBlowfish) return blowfish.exports;
    	hasRequiredBlowfish = 1;
    	(function (module, exports) {
    (function (root, factory, undef) {
    			{
    				// CommonJS
    				module.exports = factory(requireCore(), requireEncBase64(), requireMd5(), requireEvpkdf(), requireCipherCore());
    			}
    		}(commonjsGlobal, function (CryptoJS) {

    			(function () {
    			    // Shortcuts
    			    var C = CryptoJS;
    			    var C_lib = C.lib;
    			    var BlockCipher = C_lib.BlockCipher;
    			    var C_algo = C.algo;

    			    const N = 16;

    			    //Origin pbox and sbox, derived from PI
    			    const ORIG_P = [
    			        0x243F6A88, 0x85A308D3, 0x13198A2E, 0x03707344,
    			        0xA4093822, 0x299F31D0, 0x082EFA98, 0xEC4E6C89,
    			        0x452821E6, 0x38D01377, 0xBE5466CF, 0x34E90C6C,
    			        0xC0AC29B7, 0xC97C50DD, 0x3F84D5B5, 0xB5470917,
    			        0x9216D5D9, 0x8979FB1B
    			    ];

    			    const ORIG_S = [
    			        [   0xD1310BA6, 0x98DFB5AC, 0x2FFD72DB, 0xD01ADFB7,
    			            0xB8E1AFED, 0x6A267E96, 0xBA7C9045, 0xF12C7F99,
    			            0x24A19947, 0xB3916CF7, 0x0801F2E2, 0x858EFC16,
    			            0x636920D8, 0x71574E69, 0xA458FEA3, 0xF4933D7E,
    			            0x0D95748F, 0x728EB658, 0x718BCD58, 0x82154AEE,
    			            0x7B54A41D, 0xC25A59B5, 0x9C30D539, 0x2AF26013,
    			            0xC5D1B023, 0x286085F0, 0xCA417918, 0xB8DB38EF,
    			            0x8E79DCB0, 0x603A180E, 0x6C9E0E8B, 0xB01E8A3E,
    			            0xD71577C1, 0xBD314B27, 0x78AF2FDA, 0x55605C60,
    			            0xE65525F3, 0xAA55AB94, 0x57489862, 0x63E81440,
    			            0x55CA396A, 0x2AAB10B6, 0xB4CC5C34, 0x1141E8CE,
    			            0xA15486AF, 0x7C72E993, 0xB3EE1411, 0x636FBC2A,
    			            0x2BA9C55D, 0x741831F6, 0xCE5C3E16, 0x9B87931E,
    			            0xAFD6BA33, 0x6C24CF5C, 0x7A325381, 0x28958677,
    			            0x3B8F4898, 0x6B4BB9AF, 0xC4BFE81B, 0x66282193,
    			            0x61D809CC, 0xFB21A991, 0x487CAC60, 0x5DEC8032,
    			            0xEF845D5D, 0xE98575B1, 0xDC262302, 0xEB651B88,
    			            0x23893E81, 0xD396ACC5, 0x0F6D6FF3, 0x83F44239,
    			            0x2E0B4482, 0xA4842004, 0x69C8F04A, 0x9E1F9B5E,
    			            0x21C66842, 0xF6E96C9A, 0x670C9C61, 0xABD388F0,
    			            0x6A51A0D2, 0xD8542F68, 0x960FA728, 0xAB5133A3,
    			            0x6EEF0B6C, 0x137A3BE4, 0xBA3BF050, 0x7EFB2A98,
    			            0xA1F1651D, 0x39AF0176, 0x66CA593E, 0x82430E88,
    			            0x8CEE8619, 0x456F9FB4, 0x7D84A5C3, 0x3B8B5EBE,
    			            0xE06F75D8, 0x85C12073, 0x401A449F, 0x56C16AA6,
    			            0x4ED3AA62, 0x363F7706, 0x1BFEDF72, 0x429B023D,
    			            0x37D0D724, 0xD00A1248, 0xDB0FEAD3, 0x49F1C09B,
    			            0x075372C9, 0x80991B7B, 0x25D479D8, 0xF6E8DEF7,
    			            0xE3FE501A, 0xB6794C3B, 0x976CE0BD, 0x04C006BA,
    			            0xC1A94FB6, 0x409F60C4, 0x5E5C9EC2, 0x196A2463,
    			            0x68FB6FAF, 0x3E6C53B5, 0x1339B2EB, 0x3B52EC6F,
    			            0x6DFC511F, 0x9B30952C, 0xCC814544, 0xAF5EBD09,
    			            0xBEE3D004, 0xDE334AFD, 0x660F2807, 0x192E4BB3,
    			            0xC0CBA857, 0x45C8740F, 0xD20B5F39, 0xB9D3FBDB,
    			            0x5579C0BD, 0x1A60320A, 0xD6A100C6, 0x402C7279,
    			            0x679F25FE, 0xFB1FA3CC, 0x8EA5E9F8, 0xDB3222F8,
    			            0x3C7516DF, 0xFD616B15, 0x2F501EC8, 0xAD0552AB,
    			            0x323DB5FA, 0xFD238760, 0x53317B48, 0x3E00DF82,
    			            0x9E5C57BB, 0xCA6F8CA0, 0x1A87562E, 0xDF1769DB,
    			            0xD542A8F6, 0x287EFFC3, 0xAC6732C6, 0x8C4F5573,
    			            0x695B27B0, 0xBBCA58C8, 0xE1FFA35D, 0xB8F011A0,
    			            0x10FA3D98, 0xFD2183B8, 0x4AFCB56C, 0x2DD1D35B,
    			            0x9A53E479, 0xB6F84565, 0xD28E49BC, 0x4BFB9790,
    			            0xE1DDF2DA, 0xA4CB7E33, 0x62FB1341, 0xCEE4C6E8,
    			            0xEF20CADA, 0x36774C01, 0xD07E9EFE, 0x2BF11FB4,
    			            0x95DBDA4D, 0xAE909198, 0xEAAD8E71, 0x6B93D5A0,
    			            0xD08ED1D0, 0xAFC725E0, 0x8E3C5B2F, 0x8E7594B7,
    			            0x8FF6E2FB, 0xF2122B64, 0x8888B812, 0x900DF01C,
    			            0x4FAD5EA0, 0x688FC31C, 0xD1CFF191, 0xB3A8C1AD,
    			            0x2F2F2218, 0xBE0E1777, 0xEA752DFE, 0x8B021FA1,
    			            0xE5A0CC0F, 0xB56F74E8, 0x18ACF3D6, 0xCE89E299,
    			            0xB4A84FE0, 0xFD13E0B7, 0x7CC43B81, 0xD2ADA8D9,
    			            0x165FA266, 0x80957705, 0x93CC7314, 0x211A1477,
    			            0xE6AD2065, 0x77B5FA86, 0xC75442F5, 0xFB9D35CF,
    			            0xEBCDAF0C, 0x7B3E89A0, 0xD6411BD3, 0xAE1E7E49,
    			            0x00250E2D, 0x2071B35E, 0x226800BB, 0x57B8E0AF,
    			            0x2464369B, 0xF009B91E, 0x5563911D, 0x59DFA6AA,
    			            0x78C14389, 0xD95A537F, 0x207D5BA2, 0x02E5B9C5,
    			            0x83260376, 0x6295CFA9, 0x11C81968, 0x4E734A41,
    			            0xB3472DCA, 0x7B14A94A, 0x1B510052, 0x9A532915,
    			            0xD60F573F, 0xBC9BC6E4, 0x2B60A476, 0x81E67400,
    			            0x08BA6FB5, 0x571BE91F, 0xF296EC6B, 0x2A0DD915,
    			            0xB6636521, 0xE7B9F9B6, 0xFF34052E, 0xC5855664,
    			            0x53B02D5D, 0xA99F8FA1, 0x08BA4799, 0x6E85076A   ],
    			        [   0x4B7A70E9, 0xB5B32944, 0xDB75092E, 0xC4192623,
    			            0xAD6EA6B0, 0x49A7DF7D, 0x9CEE60B8, 0x8FEDB266,
    			            0xECAA8C71, 0x699A17FF, 0x5664526C, 0xC2B19EE1,
    			            0x193602A5, 0x75094C29, 0xA0591340, 0xE4183A3E,
    			            0x3F54989A, 0x5B429D65, 0x6B8FE4D6, 0x99F73FD6,
    			            0xA1D29C07, 0xEFE830F5, 0x4D2D38E6, 0xF0255DC1,
    			            0x4CDD2086, 0x8470EB26, 0x6382E9C6, 0x021ECC5E,
    			            0x09686B3F, 0x3EBAEFC9, 0x3C971814, 0x6B6A70A1,
    			            0x687F3584, 0x52A0E286, 0xB79C5305, 0xAA500737,
    			            0x3E07841C, 0x7FDEAE5C, 0x8E7D44EC, 0x5716F2B8,
    			            0xB03ADA37, 0xF0500C0D, 0xF01C1F04, 0x0200B3FF,
    			            0xAE0CF51A, 0x3CB574B2, 0x25837A58, 0xDC0921BD,
    			            0xD19113F9, 0x7CA92FF6, 0x94324773, 0x22F54701,
    			            0x3AE5E581, 0x37C2DADC, 0xC8B57634, 0x9AF3DDA7,
    			            0xA9446146, 0x0FD0030E, 0xECC8C73E, 0xA4751E41,
    			            0xE238CD99, 0x3BEA0E2F, 0x3280BBA1, 0x183EB331,
    			            0x4E548B38, 0x4F6DB908, 0x6F420D03, 0xF60A04BF,
    			            0x2CB81290, 0x24977C79, 0x5679B072, 0xBCAF89AF,
    			            0xDE9A771F, 0xD9930810, 0xB38BAE12, 0xDCCF3F2E,
    			            0x5512721F, 0x2E6B7124, 0x501ADDE6, 0x9F84CD87,
    			            0x7A584718, 0x7408DA17, 0xBC9F9ABC, 0xE94B7D8C,
    			            0xEC7AEC3A, 0xDB851DFA, 0x63094366, 0xC464C3D2,
    			            0xEF1C1847, 0x3215D908, 0xDD433B37, 0x24C2BA16,
    			            0x12A14D43, 0x2A65C451, 0x50940002, 0x133AE4DD,
    			            0x71DFF89E, 0x10314E55, 0x81AC77D6, 0x5F11199B,
    			            0x043556F1, 0xD7A3C76B, 0x3C11183B, 0x5924A509,
    			            0xF28FE6ED, 0x97F1FBFA, 0x9EBABF2C, 0x1E153C6E,
    			            0x86E34570, 0xEAE96FB1, 0x860E5E0A, 0x5A3E2AB3,
    			            0x771FE71C, 0x4E3D06FA, 0x2965DCB9, 0x99E71D0F,
    			            0x803E89D6, 0x5266C825, 0x2E4CC978, 0x9C10B36A,
    			            0xC6150EBA, 0x94E2EA78, 0xA5FC3C53, 0x1E0A2DF4,
    			            0xF2F74EA7, 0x361D2B3D, 0x1939260F, 0x19C27960,
    			            0x5223A708, 0xF71312B6, 0xEBADFE6E, 0xEAC31F66,
    			            0xE3BC4595, 0xA67BC883, 0xB17F37D1, 0x018CFF28,
    			            0xC332DDEF, 0xBE6C5AA5, 0x65582185, 0x68AB9802,
    			            0xEECEA50F, 0xDB2F953B, 0x2AEF7DAD, 0x5B6E2F84,
    			            0x1521B628, 0x29076170, 0xECDD4775, 0x619F1510,
    			            0x13CCA830, 0xEB61BD96, 0x0334FE1E, 0xAA0363CF,
    			            0xB5735C90, 0x4C70A239, 0xD59E9E0B, 0xCBAADE14,
    			            0xEECC86BC, 0x60622CA7, 0x9CAB5CAB, 0xB2F3846E,
    			            0x648B1EAF, 0x19BDF0CA, 0xA02369B9, 0x655ABB50,
    			            0x40685A32, 0x3C2AB4B3, 0x319EE9D5, 0xC021B8F7,
    			            0x9B540B19, 0x875FA099, 0x95F7997E, 0x623D7DA8,
    			            0xF837889A, 0x97E32D77, 0x11ED935F, 0x16681281,
    			            0x0E358829, 0xC7E61FD6, 0x96DEDFA1, 0x7858BA99,
    			            0x57F584A5, 0x1B227263, 0x9B83C3FF, 0x1AC24696,
    			            0xCDB30AEB, 0x532E3054, 0x8FD948E4, 0x6DBC3128,
    			            0x58EBF2EF, 0x34C6FFEA, 0xFE28ED61, 0xEE7C3C73,
    			            0x5D4A14D9, 0xE864B7E3, 0x42105D14, 0x203E13E0,
    			            0x45EEE2B6, 0xA3AAABEA, 0xDB6C4F15, 0xFACB4FD0,
    			            0xC742F442, 0xEF6ABBB5, 0x654F3B1D, 0x41CD2105,
    			            0xD81E799E, 0x86854DC7, 0xE44B476A, 0x3D816250,
    			            0xCF62A1F2, 0x5B8D2646, 0xFC8883A0, 0xC1C7B6A3,
    			            0x7F1524C3, 0x69CB7492, 0x47848A0B, 0x5692B285,
    			            0x095BBF00, 0xAD19489D, 0x1462B174, 0x23820E00,
    			            0x58428D2A, 0x0C55F5EA, 0x1DADF43E, 0x233F7061,
    			            0x3372F092, 0x8D937E41, 0xD65FECF1, 0x6C223BDB,
    			            0x7CDE3759, 0xCBEE7460, 0x4085F2A7, 0xCE77326E,
    			            0xA6078084, 0x19F8509E, 0xE8EFD855, 0x61D99735,
    			            0xA969A7AA, 0xC50C06C2, 0x5A04ABFC, 0x800BCADC,
    			            0x9E447A2E, 0xC3453484, 0xFDD56705, 0x0E1E9EC9,
    			            0xDB73DBD3, 0x105588CD, 0x675FDA79, 0xE3674340,
    			            0xC5C43465, 0x713E38D8, 0x3D28F89E, 0xF16DFF20,
    			            0x153E21E7, 0x8FB03D4A, 0xE6E39F2B, 0xDB83ADF7   ],
    			        [   0xE93D5A68, 0x948140F7, 0xF64C261C, 0x94692934,
    			            0x411520F7, 0x7602D4F7, 0xBCF46B2E, 0xD4A20068,
    			            0xD4082471, 0x3320F46A, 0x43B7D4B7, 0x500061AF,
    			            0x1E39F62E, 0x97244546, 0x14214F74, 0xBF8B8840,
    			            0x4D95FC1D, 0x96B591AF, 0x70F4DDD3, 0x66A02F45,
    			            0xBFBC09EC, 0x03BD9785, 0x7FAC6DD0, 0x31CB8504,
    			            0x96EB27B3, 0x55FD3941, 0xDA2547E6, 0xABCA0A9A,
    			            0x28507825, 0x530429F4, 0x0A2C86DA, 0xE9B66DFB,
    			            0x68DC1462, 0xD7486900, 0x680EC0A4, 0x27A18DEE,
    			            0x4F3FFEA2, 0xE887AD8C, 0xB58CE006, 0x7AF4D6B6,
    			            0xAACE1E7C, 0xD3375FEC, 0xCE78A399, 0x406B2A42,
    			            0x20FE9E35, 0xD9F385B9, 0xEE39D7AB, 0x3B124E8B,
    			            0x1DC9FAF7, 0x4B6D1856, 0x26A36631, 0xEAE397B2,
    			            0x3A6EFA74, 0xDD5B4332, 0x6841E7F7, 0xCA7820FB,
    			            0xFB0AF54E, 0xD8FEB397, 0x454056AC, 0xBA489527,
    			            0x55533A3A, 0x20838D87, 0xFE6BA9B7, 0xD096954B,
    			            0x55A867BC, 0xA1159A58, 0xCCA92963, 0x99E1DB33,
    			            0xA62A4A56, 0x3F3125F9, 0x5EF47E1C, 0x9029317C,
    			            0xFDF8E802, 0x04272F70, 0x80BB155C, 0x05282CE3,
    			            0x95C11548, 0xE4C66D22, 0x48C1133F, 0xC70F86DC,
    			            0x07F9C9EE, 0x41041F0F, 0x404779A4, 0x5D886E17,
    			            0x325F51EB, 0xD59BC0D1, 0xF2BCC18F, 0x41113564,
    			            0x257B7834, 0x602A9C60, 0xDFF8E8A3, 0x1F636C1B,
    			            0x0E12B4C2, 0x02E1329E, 0xAF664FD1, 0xCAD18115,
    			            0x6B2395E0, 0x333E92E1, 0x3B240B62, 0xEEBEB922,
    			            0x85B2A20E, 0xE6BA0D99, 0xDE720C8C, 0x2DA2F728,
    			            0xD0127845, 0x95B794FD, 0x647D0862, 0xE7CCF5F0,
    			            0x5449A36F, 0x877D48FA, 0xC39DFD27, 0xF33E8D1E,
    			            0x0A476341, 0x992EFF74, 0x3A6F6EAB, 0xF4F8FD37,
    			            0xA812DC60, 0xA1EBDDF8, 0x991BE14C, 0xDB6E6B0D,
    			            0xC67B5510, 0x6D672C37, 0x2765D43B, 0xDCD0E804,
    			            0xF1290DC7, 0xCC00FFA3, 0xB5390F92, 0x690FED0B,
    			            0x667B9FFB, 0xCEDB7D9C, 0xA091CF0B, 0xD9155EA3,
    			            0xBB132F88, 0x515BAD24, 0x7B9479BF, 0x763BD6EB,
    			            0x37392EB3, 0xCC115979, 0x8026E297, 0xF42E312D,
    			            0x6842ADA7, 0xC66A2B3B, 0x12754CCC, 0x782EF11C,
    			            0x6A124237, 0xB79251E7, 0x06A1BBE6, 0x4BFB6350,
    			            0x1A6B1018, 0x11CAEDFA, 0x3D25BDD8, 0xE2E1C3C9,
    			            0x44421659, 0x0A121386, 0xD90CEC6E, 0xD5ABEA2A,
    			            0x64AF674E, 0xDA86A85F, 0xBEBFE988, 0x64E4C3FE,
    			            0x9DBC8057, 0xF0F7C086, 0x60787BF8, 0x6003604D,
    			            0xD1FD8346, 0xF6381FB0, 0x7745AE04, 0xD736FCCC,
    			            0x83426B33, 0xF01EAB71, 0xB0804187, 0x3C005E5F,
    			            0x77A057BE, 0xBDE8AE24, 0x55464299, 0xBF582E61,
    			            0x4E58F48F, 0xF2DDFDA2, 0xF474EF38, 0x8789BDC2,
    			            0x5366F9C3, 0xC8B38E74, 0xB475F255, 0x46FCD9B9,
    			            0x7AEB2661, 0x8B1DDF84, 0x846A0E79, 0x915F95E2,
    			            0x466E598E, 0x20B45770, 0x8CD55591, 0xC902DE4C,
    			            0xB90BACE1, 0xBB8205D0, 0x11A86248, 0x7574A99E,
    			            0xB77F19B6, 0xE0A9DC09, 0x662D09A1, 0xC4324633,
    			            0xE85A1F02, 0x09F0BE8C, 0x4A99A025, 0x1D6EFE10,
    			            0x1AB93D1D, 0x0BA5A4DF, 0xA186F20F, 0x2868F169,
    			            0xDCB7DA83, 0x573906FE, 0xA1E2CE9B, 0x4FCD7F52,
    			            0x50115E01, 0xA70683FA, 0xA002B5C4, 0x0DE6D027,
    			            0x9AF88C27, 0x773F8641, 0xC3604C06, 0x61A806B5,
    			            0xF0177A28, 0xC0F586E0, 0x006058AA, 0x30DC7D62,
    			            0x11E69ED7, 0x2338EA63, 0x53C2DD94, 0xC2C21634,
    			            0xBBCBEE56, 0x90BCB6DE, 0xEBFC7DA1, 0xCE591D76,
    			            0x6F05E409, 0x4B7C0188, 0x39720A3D, 0x7C927C24,
    			            0x86E3725F, 0x724D9DB9, 0x1AC15BB4, 0xD39EB8FC,
    			            0xED545578, 0x08FCA5B5, 0xD83D7CD3, 0x4DAD0FC4,
    			            0x1E50EF5E, 0xB161E6F8, 0xA28514D9, 0x6C51133C,
    			            0x6FD5C7E7, 0x56E14EC4, 0x362ABFCE, 0xDDC6C837,
    			            0xD79A3234, 0x92638212, 0x670EFA8E, 0x406000E0  ],
    			        [   0x3A39CE37, 0xD3FAF5CF, 0xABC27737, 0x5AC52D1B,
    			            0x5CB0679E, 0x4FA33742, 0xD3822740, 0x99BC9BBE,
    			            0xD5118E9D, 0xBF0F7315, 0xD62D1C7E, 0xC700C47B,
    			            0xB78C1B6B, 0x21A19045, 0xB26EB1BE, 0x6A366EB4,
    			            0x5748AB2F, 0xBC946E79, 0xC6A376D2, 0x6549C2C8,
    			            0x530FF8EE, 0x468DDE7D, 0xD5730A1D, 0x4CD04DC6,
    			            0x2939BBDB, 0xA9BA4650, 0xAC9526E8, 0xBE5EE304,
    			            0xA1FAD5F0, 0x6A2D519A, 0x63EF8CE2, 0x9A86EE22,
    			            0xC089C2B8, 0x43242EF6, 0xA51E03AA, 0x9CF2D0A4,
    			            0x83C061BA, 0x9BE96A4D, 0x8FE51550, 0xBA645BD6,
    			            0x2826A2F9, 0xA73A3AE1, 0x4BA99586, 0xEF5562E9,
    			            0xC72FEFD3, 0xF752F7DA, 0x3F046F69, 0x77FA0A59,
    			            0x80E4A915, 0x87B08601, 0x9B09E6AD, 0x3B3EE593,
    			            0xE990FD5A, 0x9E34D797, 0x2CF0B7D9, 0x022B8B51,
    			            0x96D5AC3A, 0x017DA67D, 0xD1CF3ED6, 0x7C7D2D28,
    			            0x1F9F25CF, 0xADF2B89B, 0x5AD6B472, 0x5A88F54C,
    			            0xE029AC71, 0xE019A5E6, 0x47B0ACFD, 0xED93FA9B,
    			            0xE8D3C48D, 0x283B57CC, 0xF8D56629, 0x79132E28,
    			            0x785F0191, 0xED756055, 0xF7960E44, 0xE3D35E8C,
    			            0x15056DD4, 0x88F46DBA, 0x03A16125, 0x0564F0BD,
    			            0xC3EB9E15, 0x3C9057A2, 0x97271AEC, 0xA93A072A,
    			            0x1B3F6D9B, 0x1E6321F5, 0xF59C66FB, 0x26DCF319,
    			            0x7533D928, 0xB155FDF5, 0x03563482, 0x8ABA3CBB,
    			            0x28517711, 0xC20AD9F8, 0xABCC5167, 0xCCAD925F,
    			            0x4DE81751, 0x3830DC8E, 0x379D5862, 0x9320F991,
    			            0xEA7A90C2, 0xFB3E7BCE, 0x5121CE64, 0x774FBE32,
    			            0xA8B6E37E, 0xC3293D46, 0x48DE5369, 0x6413E680,
    			            0xA2AE0810, 0xDD6DB224, 0x69852DFD, 0x09072166,
    			            0xB39A460A, 0x6445C0DD, 0x586CDECF, 0x1C20C8AE,
    			            0x5BBEF7DD, 0x1B588D40, 0xCCD2017F, 0x6BB4E3BB,
    			            0xDDA26A7E, 0x3A59FF45, 0x3E350A44, 0xBCB4CDD5,
    			            0x72EACEA8, 0xFA6484BB, 0x8D6612AE, 0xBF3C6F47,
    			            0xD29BE463, 0x542F5D9E, 0xAEC2771B, 0xF64E6370,
    			            0x740E0D8D, 0xE75B1357, 0xF8721671, 0xAF537D5D,
    			            0x4040CB08, 0x4EB4E2CC, 0x34D2466A, 0x0115AF84,
    			            0xE1B00428, 0x95983A1D, 0x06B89FB4, 0xCE6EA048,
    			            0x6F3F3B82, 0x3520AB82, 0x011A1D4B, 0x277227F8,
    			            0x611560B1, 0xE7933FDC, 0xBB3A792B, 0x344525BD,
    			            0xA08839E1, 0x51CE794B, 0x2F32C9B7, 0xA01FBAC9,
    			            0xE01CC87E, 0xBCC7D1F6, 0xCF0111C3, 0xA1E8AAC7,
    			            0x1A908749, 0xD44FBD9A, 0xD0DADECB, 0xD50ADA38,
    			            0x0339C32A, 0xC6913667, 0x8DF9317C, 0xE0B12B4F,
    			            0xF79E59B7, 0x43F5BB3A, 0xF2D519FF, 0x27D9459C,
    			            0xBF97222C, 0x15E6FC2A, 0x0F91FC71, 0x9B941525,
    			            0xFAE59361, 0xCEB69CEB, 0xC2A86459, 0x12BAA8D1,
    			            0xB6C1075E, 0xE3056A0C, 0x10D25065, 0xCB03A442,
    			            0xE0EC6E0E, 0x1698DB3B, 0x4C98A0BE, 0x3278E964,
    			            0x9F1F9532, 0xE0D392DF, 0xD3A0342B, 0x8971F21E,
    			            0x1B0A7441, 0x4BA3348C, 0xC5BE7120, 0xC37632D8,
    			            0xDF359F8D, 0x9B992F2E, 0xE60B6F47, 0x0FE3F11D,
    			            0xE54CDA54, 0x1EDAD891, 0xCE6279CF, 0xCD3E7E6F,
    			            0x1618B166, 0xFD2C1D05, 0x848FD2C5, 0xF6FB2299,
    			            0xF523F357, 0xA6327623, 0x93A83531, 0x56CCCD02,
    			            0xACF08162, 0x5A75EBB5, 0x6E163697, 0x88D273CC,
    			            0xDE966292, 0x81B949D0, 0x4C50901B, 0x71C65614,
    			            0xE6C6C7BD, 0x327A140A, 0x45E1D006, 0xC3F27B9A,
    			            0xC9AA53FD, 0x62A80F00, 0xBB25BFE2, 0x35BDD2F6,
    			            0x71126905, 0xB2040222, 0xB6CBCF7C, 0xCD769C2B,
    			            0x53113EC0, 0x1640E3D3, 0x38ABBD60, 0x2547ADF0,
    			            0xBA38209C, 0xF746CE76, 0x77AFA1C5, 0x20756060,
    			            0x85CBFE4E, 0x8AE88DD8, 0x7AAAF9B0, 0x4CF9AA7E,
    			            0x1948C25C, 0x02FB8A8C, 0x01C36AE4, 0xD6EBE1F9,
    			            0x90D4F869, 0xA65CDEA0, 0x3F09252D, 0xC208E69F,
    			            0xB74E6132, 0xCE77E25B, 0x578FDFE3, 0x3AC372E6  ]
    			    ];

    			    var BLOWFISH_CTX = {
    			        pbox: [],
    			        sbox: []
    			    };

    			    function F(ctx, x){
    			        let a = (x >> 24) & 0xFF;
    			        let b = (x >> 16) & 0xFF;
    			        let c = (x >> 8) & 0xFF;
    			        let d = x & 0xFF;

    			        let y = ctx.sbox[0][a] + ctx.sbox[1][b];
    			        y = y ^ ctx.sbox[2][c];
    			        y = y + ctx.sbox[3][d];

    			        return y;
    			    }

    			    function BlowFish_Encrypt(ctx, left, right){
    			        let Xl = left;
    			        let Xr = right;
    			        let temp;

    			        for(let i = 0; i < N; ++i){
    			            Xl = Xl ^ ctx.pbox[i];
    			            Xr = F(ctx, Xl) ^ Xr;

    			            temp = Xl;
    			            Xl = Xr;
    			            Xr = temp;
    			        }

    			        temp = Xl;
    			        Xl = Xr;
    			        Xr = temp;

    			        Xr = Xr ^ ctx.pbox[N];
    			        Xl = Xl ^ ctx.pbox[N + 1];

    			        return {left: Xl, right: Xr};
    			    }

    			    function BlowFish_Decrypt(ctx, left, right){
    			        let Xl = left;
    			        let Xr = right;
    			        let temp;

    			        for(let i = N + 1; i > 1; --i){
    			            Xl = Xl ^ ctx.pbox[i];
    			            Xr = F(ctx, Xl) ^ Xr;

    			            temp = Xl;
    			            Xl = Xr;
    			            Xr = temp;
    			        }

    			        temp = Xl;
    			        Xl = Xr;
    			        Xr = temp;

    			        Xr = Xr ^ ctx.pbox[1];
    			        Xl = Xl ^ ctx.pbox[0];

    			        return {left: Xl, right: Xr};
    			    }

    			    /**
    			     * Initialization ctx's pbox and sbox.
    			     *
    			     * @param {Object} ctx The object has pbox and sbox.
    			     * @param {Array} key An array of 32-bit words.
    			     * @param {int} keysize The length of the key.
    			     *
    			     * @example
    			     *
    			     *     BlowFishInit(BLOWFISH_CTX, key, 128/32);
    			     */
    			    function BlowFishInit(ctx, key, keysize)
    			    {
    			        for(let Row = 0; Row < 4; Row++)
    			        {
    			            ctx.sbox[Row] = [];
    			            for(let Col = 0; Col < 256; Col++)
    			            {
    			                ctx.sbox[Row][Col] = ORIG_S[Row][Col];
    			            }
    			        }

    			        let keyIndex = 0;
    			        for(let index = 0; index < N + 2; index++)
    			        {
    			            ctx.pbox[index] = ORIG_P[index] ^ key[keyIndex];
    			            keyIndex++;
    			            if(keyIndex >= keysize)
    			            {
    			                keyIndex = 0;
    			            }
    			        }

    			        let Data1 = 0;
    			        let Data2 = 0;
    			        let res = 0;
    			        for(let i = 0; i < N + 2; i += 2)
    			        {
    			            res = BlowFish_Encrypt(ctx, Data1, Data2);
    			            Data1 = res.left;
    			            Data2 = res.right;
    			            ctx.pbox[i] = Data1;
    			            ctx.pbox[i + 1] = Data2;
    			        }

    			        for(let i = 0; i < 4; i++)
    			        {
    			            for(let j = 0; j < 256; j += 2)
    			            {
    			                res = BlowFish_Encrypt(ctx, Data1, Data2);
    			                Data1 = res.left;
    			                Data2 = res.right;
    			                ctx.sbox[i][j] = Data1;
    			                ctx.sbox[i][j + 1] = Data2;
    			            }
    			        }

    			        return true;
    			    }

    			    /**
    			     * Blowfish block cipher algorithm.
    			     */
    			    var Blowfish = C_algo.Blowfish = BlockCipher.extend({
    			        _doReset: function () {
    			            // Skip reset of nRounds has been set before and key did not change
    			            if (this._keyPriorReset === this._key) {
    			                return;
    			            }

    			            // Shortcuts
    			            var key = this._keyPriorReset = this._key;
    			            var keyWords = key.words;
    			            var keySize = key.sigBytes / 4;

    			            //Initialization pbox and sbox
    			            BlowFishInit(BLOWFISH_CTX, keyWords, keySize);
    			        },

    			        encryptBlock: function (M, offset) {
    			            var res = BlowFish_Encrypt(BLOWFISH_CTX, M[offset], M[offset + 1]);
    			            M[offset] = res.left;
    			            M[offset + 1] = res.right;
    			        },

    			        decryptBlock: function (M, offset) {
    			            var res = BlowFish_Decrypt(BLOWFISH_CTX, M[offset], M[offset + 1]);
    			            M[offset] = res.left;
    			            M[offset + 1] = res.right;
    			        },

    			        blockSize: 64/32,

    			        keySize: 128/32,

    			        ivSize: 64/32
    			    });

    			    /**
    			     * Shortcut functions to the cipher's object interface.
    			     *
    			     * @example
    			     *
    			     *     var ciphertext = CryptoJS.Blowfish.encrypt(message, key, cfg);
    			     *     var plaintext  = CryptoJS.Blowfish.decrypt(ciphertext, key, cfg);
    			     */
    			    C.Blowfish = BlockCipher._createHelper(Blowfish);
    			}());


    			return CryptoJS.Blowfish;

    		})); 
    	} (blowfish));
    	return blowfish.exports;
    }

    (function (module, exports) {
    (function (root, factory, undef) {
    		{
    			// CommonJS
    			module.exports = factory(requireCore(), requireX64Core(), requireLibTypedarrays(), requireEncUtf16(), requireEncBase64(), requireEncBase64url(), requireMd5(), requireSha1(), requireSha256(), requireSha224(), requireSha512(), requireSha384(), requireSha3(), requireRipemd160(), requireHmac(), requirePbkdf2(), requireEvpkdf(), requireCipherCore(), requireModeCfb(), requireModeCtr(), requireModeCtrGladman(), requireModeOfb(), requireModeEcb(), requirePadAnsix923(), requirePadIso10126(), requirePadIso97971(), requirePadZeropadding(), requirePadNopadding(), requireFormatHex(), requireAes(), requireTripledes(), requireRc4(), requireRabbit(), requireRabbitLegacy(), requireBlowfish());
    		}
    	}(commonjsGlobal, function (CryptoJS) {

    		return CryptoJS;

    	})); 
    } (cryptoJs));

    var cryptoJsExports = cryptoJs.exports;
    var crypto = /*@__PURE__*/getDefaultExportFromCjs(cryptoJsExports);

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
        cancelRequestSource = axios$1.CancelToken.source();
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
            const axiosIns = axios$1.create(axiosConfig);
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
                if (axios$1.isCancel(error)) {
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
            this.cancelRequestSource = axios$1.CancelToken.source();
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

    return ClsClient;

}));
