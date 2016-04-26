// Redis Client
import redis from 'promise-redis';

const redisOptions = {
  host: '127.0.0.1',
  port: 6379,
  db: 0,
  ttl: 3600
};

let _client = redis().createClient(redisOptions);
_client.select(redisOptions.db);
_client.on('error', () => {
  _client = null;
});

const _methods = {};
const methods = ['get', 'set', 'expire'];

methods.forEach((method) => {
  _methods[method] = exports[method] = async(...args) => {
    if (_client === null) {
      // 异步,不然请求会阻塞
      (() => {
        _client = redis().createClient(redisOptions);
        _client.select(redisOptions.db);
        _client.on('error', () => {
          _client = null;
        });
      })();
      return null;
    }
    return await _client[method](args);
  };
});

module.exports = _methods;
