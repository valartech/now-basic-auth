const readAuth = require('basic-auth');
const serveStatic = require('serve-static');

/*
 *
 */

const auth = (req, res) => new Promise(resolve => {
  const credentials = readAuth(req);
  const authorized = credentials && credentials.name === 'admin' && credentials.pass === 'admin';
  resolve(authorized);
});

const serveHandler = serveStatic(__dirname + '/_static');
const serve = (req, res, handle404) => new Promise(() => serveHandler(req, res, handle404));

/*
 *
 */

const app = async (req, res) => {
  // If requests admin area, auth user before serving files
  if (req.url.startsWith('/admin')) {
    const authorized = await auth(req, res);
    if (!authorized) {
      res.writeHead(401, { 'WWW-Authenticate': 'Basic realm="now-basic-auth.node"' });
      return res.end('Restricted area, please login (admin:admin).');
    }
  }

  // Serve files
  return serve(req, res, () => {
    res.statusCode = 404;
    res.end('404 Not Found');
  });
};

module.exports = app;

/*
 *
 */

// Serve on localhost if asked to.
// NOTE: This is only used for local testing, this is NOT needed nor used by Now once deployed.
if (process.env.SERVE === 'true') {
  const http = require('http');
  const server = http.createServer(app);
  server.listen(4444, () => console.log('Listening on port 4444...'));
}
