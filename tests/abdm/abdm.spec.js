// Suite: ABDM (read-only — external health-ID ecosystem, no writes)
const { test } = require('../../src/fixtures/api.fixture');
const { AbdmService } = require('../../src/services/abdm.service');
const { expectOk, expectError } = require('../../src/utils/assertions');

test.describe('ABDM | read-only', () => {
  // Test ID: T0239
  // Test Title: Verify that the ABDM connector status check returns HTTP 200
  test('T0239 | Positive | Verify that the ABDM connector status check returns HTTP 200', async ({ api }) => {
    // Step 1: Check Argus credential status.
    expectOk(await new AbdmService(api).status(), { status: 200 });
  });

  // Test ID: T0240
  // Test Title: Verify that listing ABDM-linked patients returns HTTP 200
  test('T0240 | Positive | Verify that listing ABDM-linked patients returns HTTP 200', async ({ api }) => {
    // Step 1: List ABDM patients.
    expectOk(await new AbdmService(api).patients(), { status: 200 });
  });

  // Test ID: T0241
  // Test Title: Verify that fetching ABDM connector settings returns HTTP 200
  test('T0241 | Positive | Verify that fetching ABDM connector settings returns HTTP 200', async ({ api }) => {
    // Step 1: Get connector settings.
    expectOk(await new AbdmService(api).settings(), { status: 200 });
  });

  // Test ID: T0242
  // Test Title: Verify that ABDM endpoints without a token are rejected with HTTP 401
  test('T0242 | Negative | Verify that ABDM endpoints without a token are rejected with HTTP 401', async ({ unauthApi }) => {
    // Step 1: Status without token.
    expectError(await new AbdmService(unauthApi).status(), 401);
  });
});
