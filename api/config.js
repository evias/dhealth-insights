/**
 * Configuration module
 * Loads environment variables from .env file with sensible defaults
 */

require('dotenv').config();

module.exports = {
  server: {
    buildType: process.env.APP_BUILD || 'development',
    bindHost: process.env.APP_BIND_HOST || 'localhost',
    bindPort: parseInt(process.env.APP_BIND_PORT || '3000', 10),
  },

  web: {
    baseUrl: process.env.WEB_BASE_URL || 'http://localhost:3000',
    domainName: process.env.WEB_BASE_URL.replace(/https?\:\/\/(?:www\.)?([^\/?#]*).*$/, '$1'),
  },

  api: {
    baseUrl: process.env.API_BASE_URL || 'localhost:3000/api/v1',
    /* DO NOT add keys here. */
  },

  logging: {
    logFile: process.env.APP_LOGS_FILE || 'application.log',
  }
};
