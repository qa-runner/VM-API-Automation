// Suite: Auth | Login & session
const { test } = require('../../src/fixtures/api.fixture');
const { AuthService } = require('../../src/services/auth.service');
const { ApiClient } = require('../../src/client/api-client');
const { env } = require('../../src/config/env');
const {
  expectStatus,
  expectOk,
  expectError,
  expectSchema,
  expectResponseTime,
} = require('../../src/utils/assertions');
const {
  loginSuccessSchema,
  loginValidationErrorSchema,
  loginInvalidCredsSchema,
} = require('../../src/schemas/auth.schema');

test.describe('Auth | Login & session', () => {
  // Test ID: T0003
  // Test Title: Verify that login with a valid mobile number and password returns HTTP 200 with user object and Bearer token
  test('T0003 | Positive | Verify that login with a valid mobile number and password returns HTTP 200 with user object and Bearer token', async ({ unauthApi }) => {
    // Step 1: Login with valid credentials.
    const auth = new AuthService(unauthApi);
    const res = await auth.login({ identifier: env.authIdentifier, password: env.authPassword });
    // Step 2: Verify 200 + schema + SLA.
    expectOk(res, { status: 200 });
    expectSchema(loginSuccessSchema, res.body, 'Login success schema');
    expectResponseTime(res);
  });

  // Test ID: T0004
  // Test Title: Verify that login with an incorrect password is rejected with HTTP 403 Invalid credentials
  test('T0004 | Negative | Verify that login with an incorrect password is rejected with HTTP 403 Invalid credentials', async ({ unauthApi }) => {
    // Step 1: Login with wrong password.
    const res = await new AuthService(unauthApi).login({ identifier: env.authIdentifier, password: 'WrongPass123!' });
    // Step 2: Verify 403 + error schema.
    expectError(res, 403);
    expectSchema(loginInvalidCredsSchema, res.body, 'Invalid-credentials schema');
  });

  // Test ID: T0005
  // Test Title: Verify that login with an unknown identifier is rejected and never returns HTTP 200
  test('T0005 | Negative | Verify that login with an unknown identifier is rejected and never returns HTTP 200', async ({ unauthApi }) => {
    // Step 1: Login with unknown identifier.
    const res = await new AuthService(unauthApi).login({ identifier: '9999999999', password: 'whatever1' });
    // Step 2: Verify rejection (403 or 422).
    if (res.status === 403) {
      expectSchema(loginInvalidCredsSchema, res.body, 'Invalid-credentials schema');
    } else {
      expectError(res, 422);
    }
  });

  // Test ID: T0006
  // Test Title: Verify that login without an identifier is rejected with HTTP 422 validation error
  test('T0006 | Negative | Verify that login without an identifier is rejected with HTTP 422 validation error', async ({ unauthApi }) => {
    // Step 1: Login without identifier.
    const res = await new AuthService(unauthApi).login({ password: env.authPassword });
    // Step 2: Verify 422 + validation schema.
    expectError(res, 422);
    expectSchema(loginValidationErrorSchema, res.body, 'Validation error schema');
  });

  // Test ID: T0007
  // Test Title: Verify that login without a password is rejected with HTTP 422 validation error
  test('T0007 | Negative | Verify that login without a password is rejected with HTTP 422 validation error', async ({ unauthApi }) => {
    // Step 1: Login without password.
    const res = await new AuthService(unauthApi).login({ identifier: env.authIdentifier });
    // Step 2: Verify 422 + validation schema.
    expectError(res, 422);
    expectSchema(loginValidationErrorSchema, res.body, 'Validation error schema');
  });

  // Test ID: T0008
  // Test Title: Verify that login with empty-string credentials is rejected and never returns HTTP 200
  test('T0008 | Edge | Verify that login with empty-string credentials is rejected and never returns HTTP 200', async ({ unauthApi }) => {
    // Step 1: Login with empty strings.
    const res = await new AuthService(unauthApi).login({ identifier: '', password: '' });
    // Step 2: Verify never 200.
    expectStatus(res, res.status, 'Sanity — response received');
    if (res.status === 200) throw new Error(`Empty credentials must not authenticate. Body: ${JSON.stringify(res.body)}`);
  });

  // Test ID: T0009
  // Test Title: Verify that login with a 10000-character identifier is rejected gracefully and never returns HTTP 500
  test('T0009 | Boundary | Verify that login with a 10000-character identifier is rejected gracefully and never returns HTTP 500', async ({ unauthApi }) => {
    // Step 1: Build oversized identifier.
    const longId = '9'.repeat(10000);
    // Step 2: Login and verify no 5xx.
    const res = await new AuthService(unauthApi).login({ identifier: longId, password: env.authPassword });
    if (res.status >= 500) throw new Error(`Oversized input caused 5xx: ${res.status}`);
  });

  // Test ID: T0010
  // Test Title: Verify that a SQL-injection style identifier is treated as plain text and never authenticates
  test("T0010 | Edge | Verify that a SQL-injection style identifier is treated as plain text and never authenticates", async ({ unauthApi }) => {
    // Step 1: Login with injection payload.
    const res = await new AuthService(unauthApi).login({
      identifier: "' OR '1'='1",
      password: "' OR '1'='1",
    });
    // Step 2: Verify no token issued.
    if (res.status === 200 && res.body?.token) throw new Error('SQL injection payload authenticated — critical finding!');
  });

  // Test ID: T0011
  // Test Title: Verify that fetching the current user with a valid token returns HTTP 200
  test('T0011 | Positive | Verify that fetching the current user with a valid token returns HTTP 200', async ({ api }) => {
    // Step 1: Get current user with token.
    const res = await new AuthService(api).me();
    // Step 2: Verify 200.
    expectOk(res, { status: 200 });
  });

  // Test ID: T0012
  // Test Title: Verify that fetching the current user without a token is rejected with HTTP 401
  test('T0012 | Negative | Verify that fetching the current user without a token is rejected with HTTP 401', async ({ unauthApi }) => {
    // Step 1: Get current user without token.
    const res = await new AuthService(unauthApi).me();
    // Step 2: Verify 401.
    expectError(res, 401);
  });

  // Test ID: T0013
  // Test Title: Verify that fetching the current user with a forged token is rejected with HTTP 401
  test('T0013 | Negative | Verify that fetching the current user with a forged token is rejected with HTTP 401', async ({ unauthApi }) => {
    // Step 1: Attach forged token.
    unauthApi.setToken('invalid.token.value');
    // Step 2: Get user and verify 401.
    const res = await new AuthService(unauthApi).me();
    expectError(res, 401);
  });

  // Test ID: T0014
  // Test Title: Verify that the GET /auth/me alias with a valid token returns HTTP 200 just like /user
  test('T0014 | Positive | Verify that the GET /auth/me alias with a valid token returns HTTP 200 just like /user', async ({ api }) => {
    // Step 1: Get alias endpoint with token.
    const res = await new AuthService(api).meAlias();
    // Step 2: Verify 200.
    expectOk(res, { status: 200 });
  });

  // Test ID: T0051
  // Test Title: Verify that login with an email identifier returns HTTP 200 with a token
  test('T0051 | Positive | Verify that login with an email identifier returns HTTP 200 with a token', async ({ unauthApi }) => {
    // Step 1: Login with email instead of mobile.
    const res = await new AuthService(unauthApi).login({ identifier: 'sattva.amit@gmail.com', password: env.authPassword });
    // Step 2: Verify 200 + token.
    expectOk(res, { status: 200 });
    expectSchema(loginSuccessSchema, res.body, 'Login success schema');
  });

  // Test ID: T0052
  // Test Title: Verify that email identifiers are case-insensitive so uppercase email login returns HTTP 200
  test('T0052 | Positive | Verify that email identifiers are case-insensitive so uppercase email login returns HTTP 200', async ({ unauthApi }) => {
    // Step 1: Login with uppercased email.
    const res = await new AuthService(unauthApi).login({ identifier: 'SATTVA.AMIT@GMAIL.COM', password: env.authPassword });
    // Step 2: Verify 200.
    expectOk(res, { status: 200 });
  });

  // Test ID: T0053
  // Test Title: Verify that passwords are case-sensitive so an uppercase password returns HTTP 403
  test('T0053 | Negative | Verify that passwords are case-sensitive so an uppercase password returns HTTP 403', async ({ unauthApi }) => {
    // Step 1: Login with uppercased password.
    const res = await new AuthService(unauthApi).login({ identifier: env.authIdentifier, password: env.authPassword.toUpperCase() });
    // Step 2: Verify 403.
    expectError(res, 403);
  });

  // Test ID: T0054
  // Test Title: Verify that an identifier padded with whitespace is trimmed and login returns HTTP 200
  test('T0054 | Positive | Verify that an identifier padded with whitespace is trimmed and login returns HTTP 200', async ({ unauthApi }) => {
    // Step 1: Login with spaces around identifier.
    const res = await new AuthService(unauthApi).login({ identifier: `  ${env.authIdentifier}  `, password: env.authPassword });
    // Step 2: Verify 200.
    expectOk(res, { status: 200 });
  });

  // Test ID: T0055
  // Test Title: Verify that unknown extra fields in the login payload are ignored and login returns HTTP 200
  test('T0055 | Positive | Verify that unknown extra fields in the login payload are ignored and login returns HTTP 200', async ({ unauthApi }) => {
    // Step 1: Login with an extra unknown field.
    const res = await new AuthService(unauthApi).login({ identifier: env.authIdentifier, password: env.authPassword, foo: 'bar' });
    // Step 2: Verify 200.
    expectOk(res, { status: 200 });
  });

  // Test ID: T0056
  // Test Title: Verify that a GET request on the login route is rejected with HTTP 405 Method Not Allowed
  test('T0056 | Negative | Verify that a GET request on the login route is rejected with HTTP 405 Method Not Allowed', async ({ unauthApi }) => {
    // Step 1: Send GET to login route.
    const res = await unauthApi.get('/login').then((r) => require('../../src/client/api-client').ApiClient.readJson(r));
    // Step 2: Verify 405.
    expectError(res, 405);
  });

  // Test ID: T0057
  // Test Title: Verify that login with an empty JSON object returns HTTP 422 for both fields
  test('T0057 | Negative | Verify that login with an empty JSON object returns HTTP 422 for both fields', async ({ unauthApi }) => {
    // Step 1: Login with empty object.
    const res = await new AuthService(unauthApi).login({});
    // Step 2: Verify 422 + field errors.
    expectError(res, 422);
    expectSchema(loginValidationErrorSchema, res.body, 'Validation error schema');
  });

  // Test ID: T0058
  // Test Title: Verify that two consecutive logins issue two independently usable Bearer tokens
  test('T0058 | Positive | Verify that two consecutive logins issue two independently usable Bearer tokens', async ({ unauthApi }) => {
    const svc = new AuthService(unauthApi);
    // Step 1: Login twice.
    const first = await svc.login({ identifier: env.authIdentifier, password: env.authPassword });
    const second = await svc.login({ identifier: env.authIdentifier, password: env.authPassword });
    expectOk(first, { status: 200 });
    expectOk(second, { status: 200 });
    // Step 2: Both tokens access /user.
    unauthApi.setToken(first.body.token);
    expectOk(await svc.me(), { status: 200 });
    unauthApi.setToken(second.body.token);
    expectOk(await svc.me(), { status: 200 });
  });

  // Test ID: T0059
  // Test Title: Verify that logout succeeds and the same token is afterwards rejected with HTTP 401
  test('T0059 | Positive | Verify that logout succeeds and the same token is afterwards rejected with HTTP 401', async ({ unauthApi }) => {
    const svc = new AuthService(unauthApi);
    // Step 1: Login to get a fresh token.
    const login = await svc.login({ identifier: env.authIdentifier, password: env.authPassword });
    expectOk(login, { status: 200 });
    unauthApi.setToken(login.body.token);
    // Step 2: Logout.
    expectOk(await svc.logout(), { status: 200 });
    // Step 3: Same token is now rejected.
    expectError(await svc.me(), 401);
  });

  // Test ID: T0060
  // Test Title: Verify that a numeric non-string identifier never causes an HTTP 500 server error
  test('T0060 | Edge | Verify that a numeric non-string identifier never causes an HTTP 500 server error', async ({ unauthApi }) => {
    // Step 1: Login with identifier as JSON number.
    const res = await new AuthService(unauthApi).login({ identifier: 9427082251, password: env.authPassword });
    // Step 2: Verify no server crash.
    if (res.status >= 500) throw new Error(`Numeric identifier caused 5xx: ${res.status}`);
  });

  // Test ID: T0061
  // Test Title: Verify that a POST request on the current-user route is rejected with HTTP 405
  test('T0061 | Negative | Verify that a POST request on the current-user route is rejected with HTTP 405', async ({ api }) => {
    // Step 1: Send wrong method with valid token.
    const raw = await api.request.post(`${env.baseURL}/user`, { headers: { Accept: 'application/json', Authorization: `Bearer ${api._tokenCache}` } });
    // Step 2: Verify 405.
    expectError(await ApiClient.readJson(raw), 405);
  });

  // Test ID: T0062
  // Test Title: Verify that logout without a token is rejected with HTTP 401
  test('T0062 | Negative | Verify that logout without a token is rejected with HTTP 401', async ({ unauthApi }) => {
    // Step 1: Logout anonymously.
    const res = await new AuthService(unauthApi).logout();
    // Step 2: Verify 401.
    expectError(res, 401);
  });

  // Test ID: T0063
  // Test Title: Verify that a bare Bearer header with no token value is rejected with HTTP 401
  test('T0063 | Negative | Verify that a bare Bearer header with no token value is rejected with HTTP 401', async ({ unauthApi }) => {
    // Step 1: Send Authorization: Bearer with no token.
    const raw = await unauthApi.request.get(`${env.baseURL}/user`, { headers: { Accept: 'application/json', Authorization: 'Bearer' } });
    // Step 2: Verify 401.
    expectError(await ApiClient.readJson(raw), 401);
  });

  // Test ID: T0064
  // Test Title: Verify that a wrong authentication scheme instead of Bearer is rejected with HTTP 401
  test('T0064 | Negative | Verify that a wrong authentication scheme instead of Bearer is rejected with HTTP 401', async ({ unauthApi }) => {
    // Step 1: Send Token scheme instead of Bearer.
    const raw = await unauthApi.request.get(`${env.baseURL}/user`, { headers: { Accept: 'application/json', Authorization: 'Token abc123' } });
    // Step 2: Verify 401.
    expectError(await ApiClient.readJson(raw), 401);
  });

  // Test ID: T0065
  // Test Title: Verify that the /auth/me alias without a token is rejected with HTTP 401
  test('T0065 | Negative | Verify that the /auth/me alias without a token is rejected with HTTP 401', async ({ unauthApi }) => {
    // Step 1: Request alias anonymously.
    const res = await new AuthService(unauthApi).meAlias();
    // Step 2: Verify 401.
    expectError(res, 401);
  });

  // Test ID: T0066
  // Test Title: Verify that logging out twice rejects the second call with HTTP 401 on the dead token
  test('T0066 | Edge | Verify that logging out twice rejects the second call with HTTP 401 on the dead token', async ({ unauthApi }) => {
    const svc = new AuthService(unauthApi);
    // Step 1: Login and logout once.
    const login = await svc.login({ identifier: env.authIdentifier, password: env.authPassword });
    expectOk(login, { status: 200 });
    unauthApi.setToken(login.body.token);
    expectOk(await svc.logout(), { status: 200 });
    // Step 2: Logout again with dead token.
    expectError(await svc.logout(), 401);
  });
});
