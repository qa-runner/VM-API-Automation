// Suite: Finance (income, expenditure, summary) + stock
const { test } = require('../../src/fixtures/api.fixture');
const { FinanceService } = require('../../src/services/finance.service');
const { expectOk, expectError } = require('../../src/utils/assertions');

function incomePayload(overrides = {}) {
  return { date: '2026-10-16', subject: 'Test income', amount: 500, ...overrides };
}

function expenditurePayload(overrides = {}) {
  return { date: '2026-10-16', category_id: 10, subject: 'Test expense', amount: 300, ...overrides };
}

test.describe('Finance + stock', () => {
  // Test ID: T0192
  // Test Title: Verify that creating a manual income entry returns HTTP 200 with an entry id
  test('T0192 | Positive | Verify that creating a manual income entry returns HTTP 200 with an entry id', async ({ api, cleanup }) => {
    const svc = new FinanceService(api);
    // Step 1: Create income.
    const res = await svc.createIncome(incomePayload());
    // Step 2: Verify 200 + cleanup.
    expectOk(res, { status: 200 });
    cleanup.add(`delete income ${res.body.data.id}`, async () => svc.removeIncome(res.body.data.id));
  });

  // Test ID: T0193
  // Test Title: Verify that listing manual income entries returns HTTP 200
  test('T0193 | Positive | Verify that listing manual income entries returns HTTP 200', async ({ api }) => {
    // Step 1: List income.
    expectOk(await new FinanceService(api).listIncome(), { status: 200 });
  });

  // Test ID: T0194
  // Test Title: Verify that a newly created income entry can be fetched by id with HTTP 200
  test('T0194 | Positive | Verify that a newly created income entry can be fetched by id with HTTP 200', async ({ api, cleanup }) => {
    const svc = new FinanceService(api);
    // Step 1: Create income.
    const created = await svc.createIncome(incomePayload());
    expectOk(created, { status: 200 });
    const id = created.body.data.id;
    cleanup.add(`delete income ${id}`, async () => svc.removeIncome(id));
    // Step 2: Show returns 200 (poll briefly — read-after-write lag flakes here).
    let fetched = null;
    for (let attempt = 0; attempt < 4; attempt++) {
      fetched = await svc.showIncome(id);
      if (fetched.status === 200) break;
      await new Promise((r) => setTimeout(r, 1000));
    }
    expectOk(fetched, { status: 200 });
  });

  // Test ID: T0195
  // Test Title: Verify that fetching a non-existent income entry returns HTTP 404
  test('T0195 | Edge | Verify that fetching a non-existent income entry returns HTTP 404', async ({ api }) => {
    // Step 1: Show non-existent id.
    expectError(await new FinanceService(api).showIncome(999999999), 404);
  });

  // Test ID: T0196
  // Test Title: Verify that updating an income entry with POST returns HTTP 200
  test('T0196 | Positive | Verify that updating an income entry with POST returns HTTP 200', async ({ api, cleanup }) => {
    const svc = new FinanceService(api);
    // Step 1: Create income.
    const created = await svc.createIncome(incomePayload());
    expectOk(created, { status: 200 });
    const id = created.body.data.id;
    cleanup.add(`delete income ${id}`, async () => svc.removeIncome(id));
    // Step 2: POST update.
    expectOk(await svc.updateIncome(id, incomePayload({ subject: 'Updated' })), { status: 200 });
  });

  // Test ID: T0197
  // Test Title: Verify that updating an income entry with PUT is rejected with HTTP 405
  test('T0197 | Negative | Verify that updating an income entry with PUT is rejected with HTTP 405', async ({ api, cleanup }) => {
    const svc = new FinanceService(api);
    // Step 1: Create income.
    const created = await svc.createIncome(incomePayload());
    expectOk(created, { status: 200 });
    const id = created.body.data.id;
    cleanup.add(`delete income ${id}`, async () => svc.removeIncome(id));
    // Step 2: PUT and verify 405.
    const raw = await api.request.put(`${require('../../src/config/env').env.baseURL}/finance/income/${id}`, { headers: { Accept: 'application/json' }, data: incomePayload() });
    expectError(await require('../../src/client/api-client').ApiClient.readJson(raw), 405);
  });

  // Test ID: T0198
  // Test Title: Verify that creating an income entry with a negative amount is rejected with HTTP 422
  test('T0198 | Boundary | Verify that creating an income entry with a negative amount is rejected with HTTP 422', async ({ api }) => {
    // Step 1: Create with negative amount.
    expectError(await new FinanceService(api).createIncome(incomePayload({ amount: -50 })), 422);
  });

  // Test ID: T0199
  // Test Title: Verify that creating an income entry without a subject is rejected with HTTP 422
  test('T0199 | Negative | Verify that creating an income entry without a subject is rejected with HTTP 422', async ({ api }) => {
    // Step 1: Create without subject.
    const { subject, ...noSubject } = incomePayload();
    expectError(await new FinanceService(api).createIncome(noSubject), 422);
  });

  // Test ID: T0200
  // Test Title: Verify that deleting an already-deleted income entry returns HTTP 404
  test('T0200 | Edge | Verify that deleting an already-deleted income entry returns HTTP 404', async ({ api }) => {
    const svc = new FinanceService(api);
    // Step 1: Create + delete.
    const created = await svc.createIncome(incomePayload());
    expectOk(created, { status: 200 });
    const id = created.body.data.id;
    expectOk(await svc.removeIncome(id), { status: 200 });
    // Step 2: Re-delete returns 404.
    expectError(await svc.removeIncome(id), 404);
  });

  // Test ID: T0201
  // Test Title: Verify that creating an income entry without a token is rejected with HTTP 401
  test('T0201 | Negative | Verify that creating an income entry without a token is rejected with HTTP 401', async ({ unauthApi }) => {
    // Step 1: Create without token.
    expectError(await new FinanceService(unauthApi).createIncome(incomePayload()), 401);
  });

  // Test ID: T0202
  // Test Title: Verify that creating an expenditure entry returns HTTP 200 with an entry id
  test('T0202 | Positive | Verify that creating an expenditure entry returns HTTP 200 with an entry id', async ({ api, cleanup }) => {
    const svc = new FinanceService(api);
    // Step 1: Create expenditure (category 10 exists).
    const res = await svc.createExpenditure(expenditurePayload());
    // Step 2: Verify 200 + cleanup.
    expectOk(res, { status: 200 });
    cleanup.add(`delete exp ${res.body.data.id}`, async () => svc.removeExpenditure(res.body.data.id));
  });

  // Test ID: T0203
  // Test Title: Verify that listing expenditure entries returns HTTP 200
  test('T0203 | Positive | Verify that listing expenditure entries returns HTTP 200', async ({ api }) => {
    // Step 1: List expenditure.
    expectOk(await new FinanceService(api).listExpenditure(), { status: 200 });
  });

  // Test ID: T0204
  // Test Title: Verify that creating an expenditure entry without a category is rejected with HTTP 422
  test('T0204 | Negative | Verify that creating an expenditure entry without a category is rejected with HTTP 422', async ({ api }) => {
    // Step 1: Create without category_id.
    const { category_id, ...noCat } = expenditurePayload();
    expectError(await new FinanceService(api).createExpenditure(noCat), 422);
  });

  // Test ID: T0205
  // Test Title: Verify that fetching a non-existent expenditure entry returns HTTP 404
  test('T0205 | Edge | Verify that fetching a non-existent expenditure entry returns HTTP 404', async ({ api }) => {
    // Step 1: Show non-existent id.
    expectError(await new FinanceService(api).showExpenditure(999999999), 404);
  });

  // Test ID: T0206
  // Test Title: Verify that fetching the finance summary for a date range returns HTTP 200
  test('T0206 | Positive | Verify that fetching the finance summary for a date range returns HTTP 200', async ({ api }) => {
    // Step 1: Fetch summary for date range.
    expectOk(await new FinanceService(api).summary({ start_date: '2026-10-01', end_date: '2026-10-16' }), { status: 200 });
  });

  // Test ID: T0207
  // Test Title: Verify that listing medicine stock returns HTTP 200
  test('T0207 | Positive | Verify that listing medicine stock returns HTTP 200', async ({ api }) => {
    // Step 1: List medicine stock.
    expectOk(await new FinanceService(api).stockList({ per_page: 5, page: 1 }), { status: 200 });
  });

  // Test ID: T0208
  // Test Title: Verify that searching medicine stock by name returns HTTP 200
  test('T0208 | Positive | Verify that searching medicine stock by name returns HTTP 200', async ({ api }) => {
    // Step 1: Search stock.
    expectOk(await new FinanceService(api).stockList({ search: 'rumalaya', per_page: 5, page: 1 }), { status: 200 });
  });

  // Test ID: T0209
  // Test Title: Verify that fetching the finance summary without a token is rejected with HTTP 401
  test('T0209 | Negative | Verify that fetching the finance summary without a token is rejected with HTTP 401', async ({ unauthApi }) => {
    // Step 1: Fetch summary without token.
    expectError(await new FinanceService(unauthApi).summary(), 401);
  });
});
