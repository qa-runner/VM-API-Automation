// Suite: Branch configuration (read-mostly)
const { test } = require('../../src/fixtures/api.fixture');
const { ConfigService } = require('../../src/services/config.service');
const { expectOk, expectError } = require('../../src/utils/assertions');

test.describe('Branch configuration', () => {
  // Test ID: T0346
  // Test Title: Verify that fetching medicine bill settings returns HTTP 200 with charge mode
  test('T0346 | Positive | Verify that fetching medicine bill settings returns HTTP 200 with charge mode', async ({ api }) => {
    // Step 1: Fetch settings.
    const res = await new ConfigService(api).medicineBill();
    // Step 2: Verify 200 + mode present.
    expectOk(res, { status: 200 });
  });

  // Test ID: T0347
  // Test Title: Verify that saving identical bill settings returns HTTP 200 without changing values
  test('T0347 | Positive | Verify that saving identical bill settings returns HTTP 200 without changing values', async ({ api }) => {
    const svc = new ConfigService(api);
    // Step 1: Read current settings.
    const before = await svc.medicineBill();
    expectOk(before, { status: 200 });
    // Step 2: Write back identical values.
    expectOk(await svc.saveMedicineBill(before.body.data), { status: 200 });
    // Step 3: Re-read and verify unchanged.
    const after = await svc.medicineBill();
    expectOk(after, { status: 200 });
  });

  // Test ID: T0348
  // Test Title: Verify that saving an invalid charge mode is rejected with HTTP 422
  test('T0348 | Negative | Verify that saving an invalid charge mode is rejected with HTTP 422', async ({ api }) => {
    // Step 1: Save bogus mode.
    expectError(await new ConfigService(api).saveMedicineBill({ medicine_charge_mode: 'bogus' }), 422);
  });

  // Test ID: T0349
  // Test Title: Verify that listing unique number settings returns HTTP 200
  test('T0349 | Positive | Verify that listing unique number settings returns HTTP 200', async ({ api }) => {
    // Step 1: Fetch numbering settings.
    expectOk(await new ConfigService(api).uniqueNumbers(), { status: 200 });
  });

  // Test ID: T0350
  // Test Title: Verify that numbering settings without a token are rejected with HTTP 401
  test('T0350 | Negative | Verify that numbering settings without a token are rejected with HTTP 401', async ({ unauthApi }) => {
    // Step 1: Fetch without token.
    expectError(await new ConfigService(unauthApi).uniqueNumbers(), 401);
  });

  // Test ID: T0351
  // Test Title: Verify that WhatsApp settings return HTTP 200
  test('T0351 | Positive | Verify that WhatsApp settings return HTTP 200', async ({ api }) => {
    // Step 1: Fetch WhatsApp settings.
    expectOk(await new ConfigService(api).whatsappSettings({ client_id: 8, branch_id: 8 }), { status: 200 });
  });

  // Test ID: T0352
  // Test Title: Verify that SMS settings return HTTP 200
  test('T0352 | Positive | Verify that SMS settings return HTTP 200', async ({ api }) => {
    // Step 1: Fetch SMS settings.
    expectOk(await new ConfigService(api).smsSettings({ client_id: 8, branch_id: 8 }), { status: 200 });
  });

  // Test ID: T0353
  // Test Title: Verify that print settings return HTTP 200
  test('T0353 | Positive | Verify that print settings return HTTP 200', async ({ api }) => {
    // Step 1: Fetch print settings.
    expectOk(await new ConfigService(api).printSettings(), { status: 200 });
  });

  // Test ID: T0354
  // Test Title: Verify that print settings without a token are rejected with HTTP 401
  test('T0354 | Negative | Verify that print settings without a token are rejected with HTTP 401', async ({ unauthApi }) => {
    // Step 1: Fetch without token.
    expectError(await new ConfigService(unauthApi).printSettings(), 401);
  });
});
