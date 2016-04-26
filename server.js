// Static File Server
import inert from 'inert';
import SocketIO from 'socket.io';
// Reder Views
import vision from 'vision';
import hapi from 'hapi';
import handlebars from 'handlebars';
import path from 'path';
import { signinHandler, signupHandler } from './routes/signin';
import { indexHandler } from './routes/index';

const server = new hapi.Server({
  connections: {
    routes: {
      files: {
        relativeTo: path.join(__dirname, 'public')
      }
    }
  }});

server.connection({
  host: '0.0.0.0',
  port: 5000
},
  {
    timeout: {
      server: 5000, socket: 5000
    }
  });
server.register([inert, vision], () => {
  if (!process.env.DEBUG) {
    server.start(() => {
      console.log(`Server started at:  ${server.info.uri}`);
    });
  }
});

server.state('session', {
  // ttl: 24 * 60 * 60 * 1000,     // One day
  ttl: 60 * 60 * 1000,
  // ttl: 0,
  isSecure: false,
  path: '/'
});
// Add Templates Support with handlebars
server.views({
  path: `${__dirname}/views`,
  engines: { html: handlebars },
  isCached: false
});

server.route([{
  method: 'GET',
  path: '/{param*}',
  handler: {
    directory: {
      path: '.',
      redirectToSlash: true,
      index: true
    }
  }
}, {
  method: 'get',
  path: '/',
  handler: indexHandler
}, {
  method: 'get',
  path: '/signin',
  handler: (request, reply) => {
    reply.view('signin.html', {
      title: 'Login'
    });
  }
}, {
  method: 'post',
  path: '/signup',
  handler: signupHandler
}, {
  method: 'get',
  path: '/signup',
  handler: (request, reply) => {
    reply.view('signup.html', {
      title: 'Signup'
    });
  }
}, {
  method: 'post',
  path: '/signin',
  handler: signinHandler
}]);
const clients = {};
const _users = [];
const io = SocketIO.listen(server.listener);
io.sockets.on('connection', (socket) => {
  socket.on('online', (data) => {
    // data: {user: 'willin'}
    const _data = JSON.parse(data);
    // 检查是否是已经登录绑定
    if (!clients[_data.user]) {
      // 新上线用户，需要发送用户上线提醒,需要向客户端发送新的用户列表
      _users.unshift(_data.user);
      const keys = Object.keys(clients);
      for (let i = 0; i < keys.length; i++) {
        clients[keys[i]].emit('system', JSON.stringify({type: 'online', msg: _data.user, time: (new Date()).getTime()}));
        clients[keys[i]].emit('userflush', JSON.stringify({users: _users}));
      }
      socket.emit('system', JSON.stringify({type: 'in', msg: '', time: (new Date()).getTime()}));
      socket.emit('userflush', JSON.stringify({users: _users}));
    }
    clients[_data.user] = socket;
    socket.emit('userflush', JSON.stringify({users: _users}));
  });
  socket.on('say', (data) => {
    // dataformat:{to:'all',from:'Nick',msg:'msg'}
    const _data = JSON.parse(data);
    const msgData = {
      time: (new Date()).getTime(),
      data: _data
    };
    if (_data.to === 'all') {
      // 对所有人说
      const keys = Object.keys(clients);
      for (let i = 0; i < keys.length; i++) {
        clients[keys[i]].emit('say', msgData);
      }
    } else {
      // 对某人说
      clients[_data.to].emit('say', msgData);
      clients[_data.from].emit('say', msgData);
    }
  });
  // socket.on('offline', () => {
  //   socket.disconnect();
  // });
  socket.on('disconnect', () => {
    // 有人下线
    const userOffline = () => {
      for (const index in clients) {
        if (clients[index] === socket) {
          _users.splice(_users.indexOf(index), 1);
          delete clients[index];
          const keys = Object.keys(clients);
          for (let i = 0; i < keys.length; i++) {
            clients[keys[i]].emit('system', JSON.stringify({type: 'offline', msg: index, time: (new Date()).getTime()}));
            clients[keys[i]].emit('userflush', JSON.stringify({users: _users}));
          }
          break;
        }
      }
    };
    setTimeout(userOffline, 5000);
  });
});


module.exports = server;
