// Suite: Health | API reachability
const { test, expect } = require('../../src/fixtures/api.fixture');
const { AuthService } = require('../../src/services/auth.service');
const { expectOk } = require('../../src/utils/assertions');

test.describe('Health | API reachability @smoke', () => {
  // Test ID: T0001
  // Test Title: Verify that requesting the current user without a token is rejected with HTTP 401
  test('T0001 | Verify that requesting the current user without a token is rejected with HTTP 401', async ({ unauthApi }) => {
    // Step 1: Send unauthenticated request.
    const res = await new AuthService(unauthApi).me();
    // Step 2: Verify 401.
    expect(res.status).toBe(401);
  });

  // Test ID: T0002
  // Test Title: Verify that login with valid .env credentials returns HTTP 200 with a Bearer token @smoke
  test('T0002 | Verify that login with valid .env credentials returns HTTP 200 with a Bearer token @smoke', async ({ unauthApi }) => {
    // Step 1: Login with valid credentials.
    const res = await new AuthService(unauthApi).login({
      identifier: process.env.AUTH_IDENTIFIER,
      password: process.env.AUTH_PASSWORD,
    });
    // Step 2: Verify 200 + token.
    expectOk(res, { status: 200 });
    expect(res.body.token, 'Login must return a Bearer token').toBeTruthy();
  });
});
