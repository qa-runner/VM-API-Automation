// Suite: Accounting groups, ledgers, voucher types
const { test } = require('../../src/fixtures/api.fixture');
const { AccountingService } = require('../../src/services/accounting.service');
const { expectOk, expectError, expectStatus } = require('../../src/utils/assertions');
const { faker } = require('@faker-js/faker');

test.describe('Accounting groups, ledgers, vouchers', () => {
  // Test ID: T0467
  // Test Title: Verify that creating an account group returns HTTP 201 with an id
  test('T0467 | Positive | Verify that creating an account group returns HTTP 201 with an id', async ({ api, cleanup }) => {
    const svc = new AccountingService(api);
    // Step 1: Create group (bare {data} body, no envelope — quirk).
    const res = await svc.createGroup({ name: `Grp-${faker.number.int({ min: 1000, max: 9999 })}`, nature: 'asset' });
    // Step 2: Verify 201 + id + cleanup.
    expectStatus(res, 201, 'Group create');
    if (!res.body?.data?.id) throw new Error('Create response has no data.id');
    cleanup.add(`delete group ${res.body.data.id}`, async () => svc.removeGroup(res.body.data.id));
  });

  // Test ID: T0468
  // Test Title: Verify that listing account groups returns HTTP 200
  test('T0468 | Positive | Verify that listing account groups returns HTTP 200', async ({ api }) => {
    // Step 1: List groups.
    expectOk(await new AccountingService(api).listGroups(), { status: 200 });
  });

  // Test ID: T0469
  // Test Title: Verify that a newly created group can be fetched by id with HTTP 200
  test('T0469 | Positive | Verify that a newly created group can be fetched by id with HTTP 200', async ({ api, cleanup }) => {
    const svc = new AccountingService(api);
    // Step 1: Create group.
    const created = await svc.createGroup({ name: `Grp-${faker.number.int({ min: 1000, max: 9999 })}`, nature: 'asset' });
    expectStatus(created, 201, 'Group create');
    const id = created.body.data.id;
    cleanup.add(`delete group ${id}`, async () => svc.removeGroup(id));
    // Step 2: Show returns 200.
    expectOk(await svc.showGroup(id), { status: 200 });
  });

  // Test ID: T0470
  // Test Title: Verify that fetching a non-existent group returns HTTP 404
  test('T0470 | Edge | Verify that fetching a non-existent group returns HTTP 404', async ({ api }) => {
    // Step 1: Show non-existent id.
    expectError(await new AccountingService(api).showGroup(999999999), 404);
  });

  // Test ID: T0471
  // Test Title: Verify that updating a group with PUT returns HTTP 200
  test('T0471 | Positive | Verify that updating a group with PUT returns HTTP 200', async ({ api, cleanup }) => {
    const svc = new AccountingService(api);
    // Step 1: Create group.
    const created = await svc.createGroup({ name: `Grp-${faker.number.int({ min: 1000, max: 9999 })}`, nature: 'asset' });
    expectStatus(created, 201, 'Group create');
    const id = created.body.data.id;
    cleanup.add(`delete group ${id}`, async () => svc.removeGroup(id));
    // Step 2: PUT update (PUT is correct here — inverse of most modules).
    expectOk(await svc.updateGroup(id, { name: `GrpU-${faker.number.int({ min: 1000, max: 9999 })}`, nature: 'asset' }), { status: 200 });
  });

  // Test ID: T0472
  // Test Title: Verify that updating a group with POST is rejected with HTTP 405
  test('T0472 | Negative | Verify that updating a group with POST is rejected with HTTP 405', async ({ api, cleanup }) => {
    const svc = new AccountingService(api);
    // Step 1: Create group.
    const created = await svc.createGroup({ name: `Grp-${faker.number.int({ min: 1000, max: 9999 })}`, nature: 'asset' });
    expectStatus(created, 201, 'Group create');
    const id = created.body.data.id;
    cleanup.add(`delete group ${id}`, async () => svc.removeGroup(id));
    // Step 2: POST and verify 405.
    const raw = await api.request.post(`${require('../../src/config/env').env.baseURL}/accounting/groups/${id}`, { headers: { Accept: 'application/json', 'Content-Type': 'application/json' }, data: { name: 'X', nature: 'asset' } });
    expectError(await require('../../src/client/api-client').ApiClient.readJson(raw), 405);
  });

  // Test ID: T0473
  // Test Title: Verify that creating a group without nature is rejected with HTTP 422
  test('T0473 | Negative | Verify that creating a group without nature is rejected with HTTP 422', async ({ api }) => {
    // Step 1: Create without nature.
    expectError(await new AccountingService(api).createGroup({ name: 'NoNature' }), 422);
  });

  // Test ID: T0474
  // Test Title: Verify that creating a group with an invalid nature is rejected with HTTP 422
  test('T0474 | Negative | Verify that creating a group with an invalid nature is rejected with HTTP 422', async ({ api }) => {
    // Step 1: Create with bad nature.
    expectError(await new AccountingService(api).createGroup({ name: 'BadNat', nature: 'debit' }), 422);
  });

  // Test ID: T0475
  // Test Title: Verify that deleting an already-deleted group returns HTTP 404
  test('T0475 | Edge | Verify that deleting an already-deleted group returns HTTP 404', async ({ api }) => {
    const svc = new AccountingService(api);
    // Step 1: Create + delete.
    const created = await svc.createGroup({ name: `Grp-${faker.number.int({ min: 1000, max: 9999 })}`, nature: 'asset' });
    expectStatus(created, 201, 'Group create');
    const id = created.body.data.id;
    expectOk(await svc.removeGroup(id), { status: 200 });
    // Step 2: Re-delete returns 404.
    expectError(await svc.removeGroup(id), 404);
  });

  // Test ID: T0476
  // Test Title: Verify that listing ledgers returns HTTP 200
  test('T0476 | Positive | Verify that listing ledgers returns HTTP 200', async ({ api }) => {
    // Step 1: List ledgers.
    expectOk(await new AccountingService(api).listLedgers({ per_page: 5, page: 1 }), { status: 200 });
  });

  // Test ID: T0477
  // Test Title: Verify that a seed ledger can be fetched by id with HTTP 200
  test('T0477 | Positive | Verify that a seed ledger can be fetched by id with HTTP 200', async ({ api }) => {
    // Step 1: Show seed ledger 1 (Cash — read-only, shared fixture).
    expectOk(await new AccountingService(api).showLedger(1), { status: 200 });
  });

  // Test ID: T0478
  // Test Title: Verify that fetching a non-existent ledger returns HTTP 404
  test('T0478 | Edge | Verify that fetching a non-existent ledger returns HTTP 404', async ({ api }) => {
    // Step 1: Show non-existent id.
    expectError(await new AccountingService(api).showLedger(999999999), 404);
  });

  // Test ID: T0479
  // Test Title: Verify that ledgers without a token are rejected with HTTP 401
  test('T0479 | Negative | Verify that ledgers without a token are rejected with HTTP 401', async ({ unauthApi }) => {
    // Step 1: List without token.
    expectError(await new AccountingService(unauthApi).listLedgers(), 401);
  });

  // Test ID: T0480
  // Test Title: Verify that listing voucher types returns HTTP 200
  test('T0480 | Positive | Verify that listing voucher types returns HTTP 200', async ({ api }) => {
    // Step 1: List voucher types.
    expectOk(await new AccountingService(api).listVoucherTypes(), { status: 200 });
  });

  // Test ID: T0481
  // Test Title: Verify that voucher types without a token are rejected with HTTP 401
  test('T0481 | Negative | Verify that voucher types without a token are rejected with HTTP 401', async ({ unauthApi }) => {
    // Step 1: List without token.
    expectError(await new AccountingService(unauthApi).listVoucherTypes(), 401);
  });
});
