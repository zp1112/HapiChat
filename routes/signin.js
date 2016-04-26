import { getUser, registerUser } from './model/user';
exports.signinHandler = async(request, reply) => {
  const payload = request.payload.username;
  const username = payload[0];
  const thePassword = parseInt(payload[1], 10);
  let session = request.state.session;
  const pass = await getUser(username);
  if (pass === -1) {
    return reply.redirect('/signin');
  }
  if (pass !== thePassword) {
    return reply.redirect('/signin');
  }
  if (session !== username) {
    session = username;
  }
  return reply.redirect('/').state('session', session);
};

exports.signupHandler = async(request, reply) => {
  const payload = request.payload.username;
  const username = payload[0];
  const thePassword = payload[1];
  const result = await registerUser(username, thePassword);
  if (result === -1) {
    return reply.redirect('/signup');
  }
  return reply.redirect('/').state('session', username);
};
