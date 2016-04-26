import { signinHandler, signupHandler, indexHandler } from './handler';
module.exports = ([{
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
