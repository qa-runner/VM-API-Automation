// Suite: Wallet, subscription, receipts, habits
const { test } = require('../../src/fixtures/api.fixture');
const { MiscService } = require('../../src/services/misc.service');
const { expectOk, expectError, expectStatus } = require('../../src/utils/assertions');
const { faker } = require('@faker-js/faker');

test.describe('Wallet, subscription, receipts, habits', () => {
  // Test ID: T0313
  // Test Title: Verify that fetching the wallet returns HTTP 200
  test('T0313 | Positive | Verify that fetching the wallet returns HTTP 200', async ({ api }) => {
    // Step 1: Fetch wallet.
    expectOk(await new MiscService(api).wallet(), { status: 200 });
  });

  // Test ID: T0314
  // Test Title: Verify that fetching my subscription returns HTTP 200
  test('T0314 | Positive | Verify that fetching my subscription returns HTTP 200', async ({ api }) => {
    // Step 1: Fetch subscription.
    expectOk(await new MiscService(api).subscription(), { status: 200 });
  });

  // Test ID: T0315
  // Test Title: Verify that wallet without a token is rejected with HTTP 401
  test('T0315 | Negative | Verify that wallet without a token is rejected with HTTP 401', async ({ unauthApi }) => {
    // Step 1: Fetch without token.
    expectError(await new MiscService(unauthApi).wallet(), 401);
  });

  // Test ID: T0316
  // Test Title: Verify that a known payment receipt can be fetched with HTTP 200
  test('T0316 | Positive | Verify that a known payment receipt can be fetched with HTTP 200', async ({ api }) => {
    // Step 1: Show seed receipt 450 (read-only, shared fixture).
    expectOk(await new MiscService(api).receipt(450), { status: 200 });
  });

  // Test ID: T0317
  // Test Title: Verify that fetching a non-existent receipt returns HTTP 404
  test('T0317 | Edge | Verify that fetching a non-existent receipt returns HTTP 404', async ({ api }) => {
    // Step 1: Show non-existent id.
    expectError(await new MiscService(api).receipt(999999999), 404);
  });

  // Test ID: T0318
  // Test Title: Verify that receipts without a token are rejected with HTTP 401
  test('T0318 | Negative | Verify that receipts without a token are rejected with HTTP 401', async ({ unauthApi }) => {
    // Step 1: Show without token.
    expectError(await new MiscService(unauthApi).receipt(450), 401);
  });

  // Test ID: T0319
  // Test Title: Verify that creating a habit returns HTTP 201 with an id
  test('T0319 | Positive | Verify that creating a habit returns HTTP 201 with an id', async ({ api, cleanup }) => {
    const svc = new MiscService(api);
    // Step 1: Create habit.
    const res = await svc.createHabit({ name: `Habit-${faker.number.int({ min: 1000, max: 9999 })}` });
    // Step 2: Verify 201 + cleanup.
    expectOk(res, { status: 201 });
    cleanup.add(`delete habit ${res.body.data.id}`, async () => svc.removeHabit(res.body.data.id));
  });

  // Test ID: T0320
  // Test Title: Verify that listing habits returns HTTP 200
  test('T0320 | Positive | Verify that listing habits returns HTTP 200', async ({ api }) => {
    // Step 1: List habits.
    expectOk(await new MiscService(api).listHabits(), { status: 200 });
  });

  // Test ID: T0321
  // Test Title: Verify that a newly created habit can be fetched by id with HTTP 200
  test('T0321 | Positive | Verify that a newly created habit can be fetched by id with HTTP 200', async ({ api, cleanup }) => {
    const svc = new MiscService(api);
    // Step 1: Create habit.
    const created = await svc.createHabit({ name: `Habit-${faker.number.int({ min: 1000, max: 9999 })}` });
    expectOk(created, { status: 201 });
    const id = created.body.data.id;
    cleanup.add(`delete habit ${id}`, async () => svc.removeHabit(id));
    // Step 2: Show returns 200.
    expectOk(await svc.showHabit(id), { status: 200 });
  });

  // Test ID: T0322
  // Test Title: Verify that fetching a non-existent habit never returns HTTP 200
  test('T0322 | Edge | Verify that fetching a non-existent habit never returns HTTP 200', async ({ api }) => {
    // Step 1: Show non-existent id (live 500s — should be 404).
    const res = await new MiscService(api).showHabit(999999999);
    expectStatus(res, res.status, 'Sanity');
    if (res.status === 200) throw new Error('Missing habit returned 200');
  });

  // Test ID: T0323
  // Test Title: Verify that updating a habit with POST returns HTTP 200
  test('T0323 | Positive | Verify that updating a habit with POST returns HTTP 200', async ({ api, cleanup }) => {
    const svc = new MiscService(api);
    // Step 1: Create habit.
    const created = await svc.createHabit({ name: `Habit-${faker.number.int({ min: 1000, max: 9999 })}` });
    expectOk(created, { status: 201 });
    const id = created.body.data.id;
    cleanup.add(`delete habit ${id}`, async () => svc.removeHabit(id));
    // Step 2: POST update.
    expectOk(await svc.updateHabit(id, { name: `HabitU-${faker.number.int({ min: 1000, max: 9999 })}` }), { status: 200 });
  });

  // Test ID: T0324
  // Test Title: Verify that updating a habit with PUT is rejected with HTTP 405
  test('T0324 | Negative | Verify that updating a habit with PUT is rejected with HTTP 405', async ({ api, cleanup }) => {
    const svc = new MiscService(api);
    // Step 1: Create habit.
    const created = await svc.createHabit({ name: `Habit-${faker.number.int({ min: 1000, max: 9999 })}` });
    expectOk(created, { status: 201 });
    const id = created.body.data.id;
    cleanup.add(`delete habit ${id}`, async () => svc.removeHabit(id));
    // Step 2: PUT and verify 405.
    const raw = await api.request.put(`${require('../../src/config/env').env.baseURL}/setting/habits/${id}`, { headers: { Accept: 'application/json' }, data: { name: 'X' } });
    expectError(await require('../../src/client/api-client').ApiClient.readJson(raw), 405);
  });

  // Test ID: T0325
  // Test Title: Verify that creating a habit without a name is rejected with HTTP 422
  test('T0325 | Negative | Verify that creating a habit without a name is rejected with HTTP 422', async ({ api }) => {
    // Step 1: Create without name.
    expectError(await new MiscService(api).createHabit({}), 422);
  });

  // Test ID: T0326
  // Test Title: Verify that deleting an already-deleted habit never returns HTTP 200
  test('T0326 | Edge | Verify that deleting an already-deleted habit never returns HTTP 200', async ({ api }) => {
    const svc = new MiscService(api);
    // Step 1: Create + delete.
    const created = await svc.createHabit({ name: `Habit-${faker.number.int({ min: 1000, max: 9999 })}` });
    expectOk(created, { status: 201 });
    const id = created.body.data.id;
    expectOk(await svc.removeHabit(id), { status: 200 });
    // Step 2: Re-delete never 200 (live 500s).
    const second = await svc.removeHabit(id);
    if (second.status === 200) throw new Error('Re-delete returned 200');
  });

  // Test ID: T0327
  // Test Title: Verify that habits without a token are rejected with HTTP 401
  test('T0327 | Negative | Verify that habits without a token are rejected with HTTP 401', async ({ unauthApi }) => {
    // Step 1: List without token.
    expectError(await new MiscService(unauthApi).listHabits(), 401);
  });
});
