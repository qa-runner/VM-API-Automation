/**
 * ApiClient — single place for ALL HTTP traffic.
 * - Injects `Authorization: Bearer <token>` automatically.
 * - Measures duration, logs method/url/status/ms.
 * - Retries transient failures (429/5xx/network) via withRetry.
 * - Parses JSON safely; never throws on non-JSON bodies.
 */
const { withRetry } = require('../utils/retry');
const logger = require('../utils/logger');
const { attachHttpExchange } = require('../utils/allure-meta');

class ApiClient {
  /**
   * @param {import('@playwright/test').APIRequestContext} request
   * @param {{ baseURL: string, tokenProvider?: () => Promise<string|null>, testInfo?: import('@playwright/test').TestInfo }} options
   */
  constructor(request, options) {
    this.request = request;
    this.baseURL = options.baseURL.replace(/\/$/, '');
    this.tokenProvider = options.tokenProvider || (async () => null);
    this._tokenCache = null;
    this.testInfo = options.testInfo || null;
  }

  setToken(token) {
    this._tokenCache = token;
  }

  async _headers(extra = {}) {
    let token = this._tokenCache;
    if (!token && this.tokenProvider) token = await this.tokenProvider();
    return {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...extra,
    };
  }

  /**
   * @private
   * @param {'get'|'post'|'put'|'patch'|'delete'} method
   * @param {string} path e.g. '/patient?page=1'
   * @param {{ query?: object, body?: any, form?: any, multipart?: any, headers?: object }} [options]
   */
  async _send(method, path, options = {}) {
    const url = path.startsWith('http') ? path : `${this.baseURL}${path.startsWith('/') ? '' : '/'}${path}`;
    const label = `${method.toUpperCase()} ${path}`;

    return withRetry(
      async () => {
        const headers = await this._headers(options.headers);
        const reqOptions = { headers };
        if (options.query) reqOptions.params = options.query;
        // JSON body (default)
        if (options.body !== undefined) {
          reqOptions.data = options.body;
          reqOptions.headers = { 'Content-Type': 'application/json', ...headers };
        }
        // Raw form / multipart (patient.create uses multipart/form-data)
        if (options.form !== undefined) reqOptions.form = options.form;
        if (options.multipart !== undefined) reqOptions.multipart = options.multipart;

        const started = Date.now();
        const response = await this.request[method](url, reqOptions);
        const ms = Date.now() - started;

        logger.info(`[api] ${method.toUpperCase()} ${path} -> ${response.status()} (${ms}ms)`);
        response._durationMs = ms;
        // Data-rich Allure: attach redacted request/response JSON (best effort).
        try {
          let responseBody = null;
          try {
            responseBody = await response.json();
          } catch {
            responseBody = null;
          }
          await attachHttpExchange(this.testInfo, {
            method,
            url,
            requestBody: reqOptions.data !== undefined ? reqOptions.data : reqOptions.form !== undefined ? reqOptions.form : reqOptions.multipart,
            status: response.status(),
            responseBody,
            durationMs: ms,
          });
        } catch {
          // reporting must never break the request flow
        }
        return response;
      },
      { label }
    );
  }

  get(path, options) {
    return this._send('get', path, options);
  }
  post(path, options) {
    return this._send('post', path, options);
  }
  put(path, options) {
    return this._send('put', path, options);
  }
  patch(path, options) {
    return this._send('patch', path, options);
  }
  delete(path, options) {
    return this._send('delete', path, options);
  }

  /**
   * Parse response as JSON without throwing. Returns { status, body, ms }.
   * @param {import('@playwright/test').APIResponse} response
   */
  static async readJson(response) {
    const ms = response._durationMs ?? -1;
    const status = response.status();
    let body = null;
    try {
      body = await response.json();
    } catch {
      try {
        const text = await response.text();
        body = text ? { _raw: text.slice(0, 2000) } : null;
      } catch {
        body = null;
      }
    }
    return { status, body, ms };
  }
}

module.exports = { ApiClient };
