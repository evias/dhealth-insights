const express = require('express');
const path = require('path');
const config = require('./api/config');
const { createLogger } = require('./api/logger');
const { apiKeyAuth } = require('./api/middleware/auth');

const app = express();
const bindHost = config.server.bindHost;
const bindPort = config.server.bindPort;
const buildType = config.server.buildType || 'development';
const log = createLogger('http');

// Middleware to parse JSON with sanity cap of 1Mb
app.use(express.json({ limit: '1mb' }));

// Serve bulletin board
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve SEO/Crawler files
app.get('/robots.txt', (req, res) => {
  res.set('Cache-Control', 'public, max-age=86400'); // 1 day
  res.sendFile(path.join(__dirname, 'robots.txt'));
});
app.get('/sitemap.xml', (req, res) => {
  res.set('Cache-Control', 'public, max-age=86400'); // 1 day
  res.sendFile(path.join(__dirname, 'sitemap.xml'));
});

// Logs API routes
const logsApi = require('./api/routes/logs');
app.use('/api/v1/logs', logsApi);

// System API routes
const systemApi = require('./api/routes/system');
app.use('/api/v1/system', systemApi);

// Bulletin API routes
const bulletinsApi = require('./api/routes/bulletins');
app.use('/api/v1/bulletins', bulletinsApi);

// Ads API routes
const adsApi = require('./api/routes/ads');
app.use('/api/v1/ads', adsApi);

// Mailer API routes
const mailsApi = require('./api/routes/mails');
app.use('/api/v1/mails', mailsApi);

// Serve assets
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// GROUP: protected write operations
const protected = express.Router();
protected.use(apiKeyAuth);

const writerApi = require('./api/routes/writer');
protected.use('/', writerApi);
// END GROUP: protected write operations

app.use('/api/v1/writer', protected);

// catch-all, kthxbye.
//
// NOTE: currently using express@v4.x which allows bare wildcards. When
// upgrading to express@v5.x, the wilcard must be named: e.g.:
// app.get('*wildcard', (req,res) => {})
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(bindPort, bindHost, async () => {
  log.info(`Server started in ${buildType} mode`);
  log.info(`Server listening at http://${bindHost}:${bindPort}`);
});
