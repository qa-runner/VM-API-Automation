/**
 * Retry helper with exponential backoff + jitter.
 * Retries ONLY transient failures: network errors, 429, 5xx.
 * Never retries 4xx (client errors) — retrying those hides real bugs.
 */

const { env } = require('../config/env');
const logger = require('./logger');

const TRANSIENT_STATUSES = new Set([408, 425, 429, 500, 502, 503, 504]);

function isTransient(error, response) {
  if (error) return true; // network / timeout / abort
  if (response && TRANSIENT_STATUSES.has(response.status())) return true;
  return false;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * @param {() => Promise<import('@playwright/test').APIResponse>} fn
 * @param {{retries?: number, baseDelayMs?: number, label?: string}} [options]
 */
async function withRetry(fn, options = {}) {
  const retries = options.retries ?? env.retryCount;
  const baseDelayMs = options.baseDelayMs ?? env.retryBaseDelayMs;
  let lastError;
  let lastResponse;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fn();
      if (!isTransient(null, response) || attempt === retries) return response;
      lastResponse = response;
      logger.warn(`[retry] ${options.label || 'request'} attempt ${attempt + 1} got HTTP ${response.status()}, retrying...`);
    } catch (err) {
      lastError = err;
      if (attempt === retries) throw err;
      logger.warn(`[retry] ${options.label || 'request'} attempt ${attempt + 1} threw: ${err.message}, retrying...`);
    }
    const delay = baseDelayMs * 2 ** attempt + Math.floor(Math.random() * 200);
    await sleep(delay);
  }

  if (lastError) throw lastError;
  return lastResponse;
}

module.exports = { withRetry, isTransient };
