exports.indexHandler = async(request, reply) => {
  if (request.state.session) {
    reply.view('index.html', {
      title: 'Index'
    });
  } else {
    reply.redirect('/signin');
  }
};
