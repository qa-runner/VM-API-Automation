/**
 * Global setup: verifies API reachability before the suite runs.
 * Auth itself is lazy (TokenManager logs in once per worker on first use),
 * so this file stays fast and never fails the run on a cold start —
 * it only warns if the base URL is unreachable.
 */
require('dotenv').config();

async function globalSetup() {
  const baseURL = process.env.BASE_URL || 'https://apidev.ayushmanager.com/api';
  const url = `${baseURL.replace(/\/$/, '')}/user`;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    // Unauthenticated /user should return 401 — that proves the API is up.
    const res = await fetch(url, { headers: { Accept: 'application/json' }, signal: controller.signal });
    clearTimeout(timer);
    console.log(`[global-setup] API reachable: ${url} -> HTTP ${res.status} (401 expected without token)`);
  } catch (err) {
    console.warn(`[global-setup] WARNING: could not reach ${url}: ${err.message}. Tests will still attempt with retries.`);
  }
}

module.exports = globalSetup;
