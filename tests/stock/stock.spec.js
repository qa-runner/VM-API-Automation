// Suite: Inventory stock (read-only — parallel directional asserts would flake)
const { test } = require('../../src/fixtures/api.fixture');
const { FinanceService } = require('../../src/services/finance.service');
const { expectOk, expectError } = require('../../src/utils/assertions');
const { expect: pwExpect } = require('@playwright/test');

test.describe('Inventory stock | read-only', () => {
  // Test ID: T0257
  // Test Title: Verify that the stock valuation list returns HTTP 200 with rows and totals
  test('T0257 | Positive | Verify that the stock valuation list returns HTTP 200 with rows and totals', async ({ api }) => {
    // Step 1: Fetch stock values.
    const res = await new FinanceService(api).stockList({ per_page: 5, page: 1 });
    // Step 2: Verify 200 + envelope (list + totals).
    expectOk(res, { status: 200 });
    pwExpect(Array.isArray(res.body?.data?.list), 'Stock list must be an array').toBe(true);
    pwExpect(typeof res.body?.data?.totals, 'Totals must be present').toBe('object');
  });

  // Test ID: T0258
  // Test Title: Verify that stock rows carry non-negative quantities
  test('T0258 | Positive | Verify that stock rows carry non-negative quantities', async ({ api }) => {
    // Step 1: Fetch stock values.
    const res = await new FinanceService(api).stockList({ per_page: 20, page: 1 });
    expectOk(res, { status: 200 });
    // Step 2: No row may show negative stock (integrity invariant).
    for (const row of res.body.data.list || []) {
      pwExpect(row.stock, `Negative stock for ${row.medicine_name}`).toBeGreaterThanOrEqual(0);
    }
  });

  // Test ID: T0259
  // Test Title: Verify that stock values without a token are rejected with HTTP 401
  test('T0259 | Negative | Verify that stock values without a token are rejected with HTTP 401', async ({ unauthApi }) => {
    // Step 1: List without token.
    expectError(await new FinanceService(unauthApi).stockList(), 401);
  });
});
