/**
 * Minimal structured logger.
 * LOG_LEVEL: 0 = silent, 1 = info (method/url/status/ms), 2 = debug (+bodies).
 */
const { env } = require('../config/env');

function timestamp() {
  return new Date().toISOString();
}

function info(...args) {
  if (env.logLevel >= 1) console.log(`[${timestamp()}]`, ...args);
}

function debug(...args) {
  if (env.logLevel >= 2) console.log(`[${timestamp()}][debug]`, ...args);
}

function warn(...args) {
  console.warn(`[${timestamp()}][warn]`, ...args);
}

function error(...args) {
  console.error(`[${timestamp()}][error]`, ...args);
}

module.exports = { info, debug, warn, error };
