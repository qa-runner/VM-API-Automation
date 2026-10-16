/**
 * TokenManager — logs in once and caches the Bearer token per worker.
 * POST /login { identifier, password } -> { token, user }.
 */
const { env } = require('../config/env');
const logger = require('../utils/logger');

class TokenManager {
  constructor() {
    this._token = null;
    this._promise = null;
  }

  /**
   * Raw login call (no auth header). Used by tests AND by the fixture.
   * @param {import('@playwright/test').APIRequestContext} request
   * @param {{ identifier?: string, password?: string }} [creds]
   */
  async login(request, creds = {}) {
    const identifier = creds.identifier ?? env.authIdentifier;
    const password = creds.password ?? env.authPassword;
    const res = await request.post(`${env.baseURL}/login`, {
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      data: { identifier, password },
    });
    let body = null;
    try {
      body = await res.json();
    } catch {
      body = null;
    }
    return { status: res.status(), body, raw: res };
  }

  /** Cached token for the happy-path fixture. */
  async getToken(request) {
    if (this._token) return this._token;
    if (!this._promise) {
      this._promise = (async () => {
        const { status, body } = await this.login(request);
        if (status !== 200 || !body?.token) {
          throw new Error(
            `[auth] Login failed: HTTP ${status} body=${JSON.stringify(body)?.slice(0, 500)}. ` +
              `Check AUTH_IDENTIFIER/AUTH_PASSWORD in .env. ` +
              `Note: repeated wrong-password negatives can lock the account — use a dedicated automation user.`
          );
        }
        this._token = body.token;
        logger.info('[auth] Token acquired (cached for worker lifetime)');
        return this._token;
      })();
    }
    return this._promise;
  }

  clear() {
    this._token = null;
    this._promise = null;
  }
}

module.exports = { TokenManager };
