/**
 * Shared Playwright fixtures.
 *
 *   test('...', async ({ api }) => { ... })          // authenticated client
 *   test('...', async ({ unauthApi }) => { ... })    // no token (401/validation tests)
 *   test('...', async ({ api, cleanup }) => { ... }) // register ids for auto-cleanup
 *
 * Keeps specs thin: no dotenv, no login boilerplate, no manual teardown.
 */
const { test: base, request } = require('@playwright/test');
const { env } = require('../config/env');
const { ApiClient } = require('../client/api-client');
const { TokenManager } = require('../auth/token-manager');
const { TestDataRegistry } = require('../utils/cleanup');
const { annotateCurrentTest } = require('../utils/allure-meta');

const tokenManager = new TokenManager();

const test = base.extend({
  /** Authenticated API client (Bearer token injected). */
  api: async ({}, use, testInfo) => {
    await annotateCurrentTest(testInfo);
    const ctx = await request.newContext({ baseURL: env.baseURL });
    const token = await tokenManager.getToken(ctx);
    const client = new ApiClient(ctx, { baseURL: env.baseURL, testInfo });
    client.setToken(token);
    await use(client);
    await ctx.dispose();
  },

  /** Unauthenticated client for negative auth tests. */
  unauthApi: async ({}, use, testInfo) => {
    await annotateCurrentTest(testInfo);
    const ctx = await request.newContext({ baseURL: env.baseURL });
    const client = new ApiClient(ctx, { baseURL: env.baseURL, testInfo });
    await use(client);
    await ctx.dispose();
  },

  /** Registry to track created entities; best-effort cleanup in afterEach by the spec. */
  cleanup: async ({}, use) => {
    const registry = new TestDataRegistry();
    await use(registry);
    await registry.clear();
  },
});

module.exports = { test, expect: base.expect, tokenManager };
