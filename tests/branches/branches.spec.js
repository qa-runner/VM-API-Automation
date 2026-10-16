// Suite: Branches + dashboard + waiting
const { test } = require('../../src/fixtures/api.fixture');
const { BranchDashService } = require('../../src/services/branchdash.service');
const { expectOk, expectError, expectStatus } = require('../../src/utils/assertions');
const { faker } = require('@faker-js/faker');

function branchPayload(overrides = {}) {
  const n = `TestBr-${faker.number.int({ min: 1000, max: 9999 })}`;
  const m = `9${faker.number.int({ min: 100000000, max: 999999999 })}`;
  return { name: n, trade_name: `${n} Clinic`, mobile_no: m, email: `br${m}@test.com`, ...overrides };
}

test.describe('Branches + dashboard + waiting', () => {
  // Test ID: T0210
  // Test Title: Verify that creating a branch returns HTTP 200 with a branch id
  test('T0210 | Positive | Verify that creating a branch returns HTTP 200 with a branch id', async ({ api, cleanup }) => {
    const svc = new BranchDashService(api);
    // Step 1: Create branch (slow endpoint ~6-9s, no SLA assert).
    const res = await svc.createBranch(branchPayload());
    // Step 2: Verify 200 + cleanup.
    expectStatus(res, 200, 'Branch create');
    cleanup.add(`delete branch ${res.body.data.id}`, async () => svc.removeBranch(res.body.data.id));
  });

  // Test ID: T0211
  // Test Title: Verify that listing branches returns HTTP 200
  test('T0211 | Positive | Verify that listing branches returns HTTP 200', async ({ api }) => {
    // Step 1: List branches.
    expectOk(await new BranchDashService(api).listBranches(), { status: 200 });
  });

  // Test ID: T0212
  // Test Title: Verify that a newly created branch can be fetched by id with HTTP 200
  test('T0212 | Positive | Verify that a newly created branch can be fetched by id with HTTP 200', async ({ api, cleanup }) => {
    const svc = new BranchDashService(api);
    // Step 1: Create branch (slow endpoint, no SLA assert).
    const created = await svc.createBranch(branchPayload());
    expectStatus(created, 200, 'Branch create');
    const id = created.body.data.id;
    cleanup.add(`delete branch ${id}`, async () => svc.removeBranch(id));
    // Step 2: Show returns 200.
    expectOk(await svc.showBranch(id), { status: 200 });
  });

  // Test ID: T0213
  // Test Title: Verify that fetching a non-existent branch returns HTTP 404
  test('T0213 | Edge | Verify that fetching a non-existent branch returns HTTP 404', async ({ api }) => {
    // Step 1: Show non-existent id.
    expectError(await new BranchDashService(api).showBranch(999999999), 404);
  });

  // Test ID: T0214
  // Test Title: Verify that updating a branch with POST returns HTTP 200
  test('T0214 | Positive | Verify that updating a branch with POST returns HTTP 200', async ({ api, cleanup }) => {
    const svc = new BranchDashService(api);
    // Step 1: Create branch (slow endpoint, no SLA assert).
    const created = await svc.createBranch(branchPayload());
    expectStatus(created, 200, 'Branch create');
    const id = created.body.data.id;
    cleanup.add(`delete branch ${id}`, async () => svc.removeBranch(id));
    // Step 2: POST update.
    const p = branchPayload();
    expectOk(await svc.updateBranch(id, { ...p, trade_name: 'Upd Clinic' }), { status: 200 });
  });

  // Test ID: T0215
  // Test Title: Verify that updating a branch with PUT is rejected with HTTP 405
  test('T0215 | Negative | Verify that updating a branch with PUT is rejected with HTTP 405', async ({ api, cleanup }) => {
    const svc = new BranchDashService(api);
    // Step 1: Create branch (slow endpoint, no SLA assert).
    const created = await svc.createBranch(branchPayload());
    expectStatus(created, 200, 'Branch create');
    const id = created.body.data.id;
    cleanup.add(`delete branch ${id}`, async () => svc.removeBranch(id));
    // Step 2: PUT and verify 405.
    const raw = await api.request.put(`${require('../../src/config/env').env.baseURL}/branch/${id}`, { headers: { Accept: 'application/json' }, multipart: branchPayload() });
    expectError(await require('../../src/client/api-client').ApiClient.readJson(raw), 405);
  });

  // Test ID: T0216
  // Test Title: Verify that creating a branch without a trade name is rejected with HTTP 422
  test('T0216 | Negative | Verify that creating a branch without a trade name is rejected with HTTP 422', async ({ api }) => {
    // Step 1: Create without trade_name.
    const { trade_name, ...noTrade } = branchPayload();
    expectError(await new BranchDashService(api).createBranch(noTrade), 422);
  });

  // Test ID: T0217
  // Test Title: Verify that deleting an already-deleted branch returns HTTP 404
  test('T0217 | Edge | Verify that deleting an already-deleted branch returns HTTP 404', async ({ api }) => {
    const svc = new BranchDashService(api);
    // Step 1: Create + delete (create is slow, no SLA assert).
    const created = await svc.createBranch(branchPayload());
    expectStatus(created, 200, 'Branch create');
    const id = created.body.data.id;
    expectOk(await svc.removeBranch(id), { status: 200 });
    // Step 2: Re-delete returns 404.
    expectError(await svc.removeBranch(id), 404);
  });

  // Test ID: T0218
  // Test Title: Verify that listing branches without a token is rejected with HTTP 401
  test('T0218 | Negative | Verify that listing branches without a token is rejected with HTTP 401', async ({ unauthApi }) => {
    // Step 1: List without token.
    expectError(await new BranchDashService(unauthApi).listBranches(), 401);
  });

  // Test ID: T0219
  // Test Title: Verify that fetching today consultation stats returns HTTP 200
  test('T0219 | Positive | Verify that fetching today consultation stats returns HTTP 200', async ({ api }) => {
    // Step 1: Fetch today stats.
    expectOk(await new BranchDashService(api).todayStats(), { status: 200 });
  });

  // Test ID: T0220
  // Test Title: Verify that fetching the day-end report for a date range returns HTTP 200
  test('T0220 | Positive | Verify that fetching the day-end report for a date range returns HTTP 200', async ({ api }) => {
    // Step 1: Fetch report for date range.
    expectOk(await new BranchDashService(api).dayEndReport({ start_date: '2026-10-01', end_date: '2026-10-16' }), { status: 200 });
  });

  // Test ID: T0221
  // Test Title: Verify that fetching the patient journey funnel returns HTTP 200
  test('T0221 | Positive | Verify that fetching the patient journey funnel returns HTTP 200', async ({ api }) => {
    // Step 1: Fetch funnel.
    expectOk(await new BranchDashService(api).journeyFunnel(), { status: 200 });
  });

  // Test ID: T0222
  // Test Title: Verify that fetching the patient waiting list for today returns HTTP 200
  test('T0222 | Positive | Verify that fetching the patient waiting list for today returns HTTP 200', async ({ api }) => {
    // Step 1: Fetch waiting list for today.
    expectOk(await new BranchDashService(api).waitingList({ date: '2026-10-16' }), { status: 200 });
  });
});
