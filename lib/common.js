import crypto from 'crypto';
import moment from 'moment-timezone';
import { isObject, isString, isNumber, isBoolean } from 'util';
exports.ignoreErrors = [400, 401, 403, 404, 409, 451, 410, 416];
/**
 * isEmpty
 * @param  {any} obj [any]
 * @return {boolean} true for empty
 */
exports.isEmpty = (obj) => {
  if (isObject(obj)) {
    return Object.keys(obj).length === 0 && (obj.length === undefined || obj.length === 0);
  } else if (isString(obj)) {
    return obj.length === 0;
  } else if (isNumber(obj)) {
    return obj === 0;
  } else if (obj === null || obj === undefined) {
    return true;
  } else if (isBoolean(obj)) {
    return !obj;
  }
  return false;
};

/**
 * Get Timestamp
 * @return {int}
 */
exports.getTimestamp = () => parseInt(new Date().getTime() / 1000, 10);

/**
 * MD5
 * @param  {string} str
 * @return {string}
 */
exports.md5 = (str) => {
  const instance = crypto.createHash('md5');
  instance.update(`${str}`);
  return instance.digest('hex');
};

/**
 * Random String
 * @param  {integer} len
 * @return {string}
 */
exports.randStr = (len) => {
  const x = 'abcdefhijkmnprstwxyz2345678';
  const maxPos = x.length;
  let pwd = '';
  for (let i = 0; i < len; i++) {
    pwd += x.charAt(Math.floor(Math.random() * maxPos));
  }
  return pwd;
};

/**
 * getDefer
 * @return {Promise.defer} defer
 */
exports.getDefer = () => {
  const deferred = {};
  deferred.promise = new Promise((resolve, reject) => {
    deferred.resolve = resolve;
    deferred.reject = reject;
  });
  return deferred;
};

/**
 * IP2INT
 * @param {str} ip
 * @returns {number}
 */
exports.ip2int = (ips) => {
  let num;
  const ip = ips.split('.');
  num = Number(ip[0]) * 256 * 256 * 256 + Number(ip[1]) * 256 * 256 + Number(ip[2]) * 256 + Number(ip[3]);
  num = num >>> 0;
  return num;
};

/**
 * logger
 * @param  {string|object} place [where err occur]
 * @param  {string|object} err
 * @return none
 */
exports.logger = (place, err) => {
  if (typeof err === 'object' && err.output && ignoreErrors.indexOf(err.output.statusCode) !== -1) {
    return;
  }
  console.log('------------------');
  console.log(moment().tz('Asia/Shanghai').format('YYYY-MM-DD HH:mm:ss'));
  if (typeof place === 'object') {
    console.log(`${err.output.statusCode} ${place.method.toUpperCase()} ${place.path}`);
  } else {
    console.log(place);
  }
  if (typeof err === 'object') {
    const keys = ['message', 'path', 'errno', 'code', 'stack'];
    for (const key of keys) {
      if (err[key]) { console.log(`${key}:`, err[key]); }
    }
  } else {
    console.log(err);
  }
};
