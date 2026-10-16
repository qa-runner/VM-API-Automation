/**
 * Centralised environment config with validation.
 * Fails fast with a clear message instead of cryptic 401s later.
 */
require('dotenv').config();

function required(name, fallback) {
  const value = process.env[name] ?? fallback;
  if (value === undefined || value === '') {
    throw new Error(`[config] Missing required env var: ${name}. Copy .env.example to .env and fill it.`);
  }
  return value;
}

const env = {
  baseURL: required('BASE_URL', 'https://apidev.ayushmanager.com/api').replace(/\/$/, ''),
  authIdentifier: required('AUTH_IDENTIFIER'),
  authPassword: required('AUTH_PASSWORD'),
  slaMs: parseInt(process.env.SLA_MS || '5000', 10),
  logLevel: parseInt(process.env.LOG_LEVEL || '1', 10),
  retryCount: parseInt(process.env.RETRY_COUNT || '2', 10),
  retryBaseDelayMs: parseInt(process.env.RETRY_BASE_DELAY_MS || '500', 10),
};

module.exports = { env };
