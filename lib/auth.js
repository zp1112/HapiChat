// Http Error
import boom from 'boom';
// Redis Client
import client from './redis';
import {isEmpty} from './common';
const internals = {};

internals.implementation = (server) => {
  server.ext('onPreAuth', (request, reply) => {
    request.auth.redis = {
      get: async() => {
        let token = '';
        if (request.payload && request.payload.auth) {
          token = request.payload.auth;
        } else if (request.query && request.query.auth) {
          token = request.query.auth;
        }
        let result = {};
        result = await client.get(`auth:${token}`);
        try {
          result = JSON.parse(result);
          return result;
        } catch (err) {
          return {};
        }
      },
      set: async(key, session, ttl = 3600) => {
        if (session && typeof session === 'object') {
          if (session.password) {
            delete(session.password);
          }
          await client.set(`auth:${key}`, JSON.stringify(session));
          await client.expire(`auth:${key}`, ttl);
          request.auth.artifacts = session;
        }
      },
      expire: async(key) => {
        const session = request.auth.artifacts;
        if (key && session) {
          await client.expire(`auth:${key}`, 0);
        }
        request.auth.artifacts = null;
      }
    };
    return reply.continue();
  });
  const scheme = {
    options: { payload: true },
    authenticate: async(request, reply) => {
      // If POST Reqeust, use Payload Validtation Function Instead
      if (request.method === 'post') {
        return reply.continue({ credentials: {} });
      }
      let token = '';
      if (request.query && request.query.auth) {
        token = request.query.auth;
      }
      if (isEmpty(token)) {
        return reply(boom.forbidden('Invalid Auth Token.'));
      }
      let session = {};
      session = await client.get(`auth:${token}`);
      session = JSON.parse(session || '{}');
      if (isEmpty(session)) {
        return reply(boom.unauthorized('Forbidden.'));
      }
      const roles = request.route.settings.plugins.roles || [];
      if (!isEmpty(roles) && session.role.findIndex((role) => roles.indexOf(role) !== -1) === -1) {
        return reply(boom.forbidden('Forbidden.'));
      }
      return reply.continue({ credentials: session, artifacts: session });
    },
    payload: async(request, reply) => {
      let token = '';
      if (request.payload && request.payload.auth) {
        token = request.payload.auth;
      } else if (request.query && request.query.auth) {
        token = request.query.auth;
      }
      if (isEmpty(token)) {
        return reply(boom.forbidden('Invalid Auth Token.'));
      }
      let session = {};
      session = await client.get(`auth:${token}`);
      session = JSON.parse(session || '{}');
      if (isEmpty(session)) {
        return reply(boom.unauthorized('Invalid Auth Token.'));
      }
      const roles = request.route.settings.plugins.roles || [];
      if (!isEmpty(roles) && session.role.findIndex((role) => roles.indexOf(role) !== -1) === -1) {
        return reply(boom.forbidden('Forbidden.'));
      }
      return reply.continue({ credentials: session, artifacts: session });
    }
  };
  return scheme;
};

exports.register = (server, options, next) => {
  server.auth.scheme('redis', internals.implementation);
  next();
};

exports.register.attributes = {
  name: 'hapi-auth-redis'
};
