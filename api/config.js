/**
 * Configuration module
 * Loads environment variables from .env file with sensible defaults
 */

require('dotenv').config();

module.exports = {
  server: {
    buildType: process.env.APP_BUILD || 'development',
    bindHost: process.env.APP_BIND_HOST || 'localhost',
    bindPort: parseInt(process.env.APP_BIND_PORT || '3000', 10)
  },

  api: {
    baseUrl: process.env.API_BASE_URL || 'localhost:3000/api/v1',
  },

  logging: {
    logFile: process.env.APP_LOGS_FILE || 'application.log'
  }
};
