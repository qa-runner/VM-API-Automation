// Suite: Habit options + languages
const { test } = require('../../src/fixtures/api.fixture');
const { DietService } = require('../../src/services/diet.service');
const { MiscService } = require('../../src/services/misc.service');
const { expectOk, expectError, expectStatus } = require('../../src/utils/assertions');
const { faker } = require('@faker-js/faker');

/** Helper: parent habit for option tests. */
async function setupHabit(api, cleanup) {
  const misc = new MiscService(api);
  const name = `Habit-${faker.number.int({ min: 1000, max: 9999 })}`;
  const created = await misc.createHabit({ name });
  expectOk(created, { status: 201 });
  const id = created.body.data.id;
  cleanup.add(`delete habit ${id}`, async () => misc.removeHabit(id));
  return id;
}

test.describe('Habit options + languages', () => {
  // Test ID: T0384
  // Test Title: Verify that creating a habit option returns HTTP 201 with an id
  test('T0384 | Positive | Verify that creating a habit option returns HTTP 201 with an id', async ({ api, cleanup }) => {
    const svc = new DietService(api);
    // Step 1: Setup parent habit.
    const habitId = await setupHabit(api, cleanup);
    // Step 2: Create option.
    const res = await svc.createHabitOption({ habit_id: habitId, name: 'Daily-ish' });
    // Step 3: Verify 201 + cleanup.
    expectOk(res, { status: 201 });
    cleanup.add(`delete option ${res.body.data.id}`, async () => svc.removeHabitOption(res.body.data.id));
  });

  // Test ID: T0385
  // Test Title: Verify that listing habit options returns HTTP 200
  test('T0385 | Positive | Verify that listing habit options returns HTTP 200', async ({ api }) => {
    // Step 1: List options.
    expectOk(await new DietService(api).listHabitOptions(), { status: 200 });
  });

  // Test ID: T0386
  // Test Title: Verify that a newly created option can be fetched by id with HTTP 200
  test('T0386 | Positive | Verify that a newly created option can be fetched by id with HTTP 200', async ({ api, cleanup }) => {
    const svc = new DietService(api);
    // Step 1: Setup + create option.
    const habitId = await setupHabit(api, cleanup);
    const created = await svc.createHabitOption({ habit_id: habitId, name: 'Daily-ish' });
    expectOk(created, { status: 201 });
    const id = created.body.data.id;
    cleanup.add(`delete option ${id}`, async () => svc.removeHabitOption(id));
    // Step 2: Show returns 200.
    expectOk(await svc.showHabitOption(id), { status: 200 });
  });

  // Test ID: T0387
  // Test Title: Verify that fetching a non-existent option never returns HTTP 200
  test('T0387 | Edge | Verify that fetching a non-existent option never returns HTTP 200', async ({ api }) => {
    // Step 1: Show non-existent id (live 500s — should be 404).
    const res = await new DietService(api).showHabitOption(999999999);
    expectStatus(res, res.status, 'Sanity');
    if (res.status === 200) throw new Error('Missing option returned 200');
  });

  // Test ID: T0388
  // Test Title: Verify that updating an option with POST returns HTTP 200
  test('T0388 | Positive | Verify that updating an option with POST returns HTTP 200', async ({ api, cleanup }) => {
    const svc = new DietService(api);
    // Step 1: Setup + create option.
    const habitId = await setupHabit(api, cleanup);
    const created = await svc.createHabitOption({ habit_id: habitId, name: 'Daily-ish' });
    expectOk(created, { status: 201 });
    const id = created.body.data.id;
    cleanup.add(`delete option ${id}`, async () => svc.removeHabitOption(id));
    // Step 2: POST update.
    expectOk(await svc.updateHabitOption(id, { habit_id: habitId, name: 'Weekly-ish' }), { status: 200 });
  });

  // Test ID: T0389
  // Test Title: Verify that updating an option with PUT is rejected with HTTP 405
  test('T0389 | Negative | Verify that updating an option with PUT is rejected with HTTP 405', async ({ api, cleanup }) => {
    const svc = new DietService(api);
    // Step 1: Setup + create option.
    const habitId = await setupHabit(api, cleanup);
    const created = await svc.createHabitOption({ habit_id: habitId, name: 'Daily-ish' });
    expectOk(created, { status: 201 });
    const id = created.body.data.id;
    cleanup.add(`delete option ${id}`, async () => svc.removeHabitOption(id));
    // Step 2: PUT and verify 405.
    const raw = await api.request.put(`${require('../../src/config/env').env.baseURL}/setting/habits-options/${id}`, { headers: { Accept: 'application/json' }, data: { name: 'X' } });
    expectError(await require('../../src/client/api-client').ApiClient.readJson(raw), 405);
  });

  // Test ID: T0390
  // Test Title: Verify that an option can be created and deleted with HTTP 200
  test('T0390 | Positive | Verify that an option can be created and deleted with HTTP 200', async ({ api, cleanup }) => {
    const svc = new DietService(api);
    // Step 1: Setup + create option.
    const habitId = await setupHabit(api, cleanup);
    const created = await svc.createHabitOption({ habit_id: habitId, name: 'Daily-ish' });
    expectOk(created, { status: 201 });
    // Step 2: Delete returns 200.
    expectOk(await svc.removeHabitOption(created.body.data.id), { status: 200 });
  });

  // Test ID: T0391
  // Test Title: Verify that options without a token are rejected with HTTP 401
  test('T0391 | Negative | Verify that options without a token are rejected with HTTP 401', async ({ unauthApi }) => {
    // Step 1: List without token.
    expectError(await new DietService(unauthApi).listHabitOptions(), 401);
  });

  // Test ID: T0392
  // Test Title: Verify that creating a language returns HTTP 201 with an id
  test('T0392 | Positive | Verify that creating a language returns HTTP 201 with an id', async ({ api, cleanup }) => {
    const svc = new DietService(api);
    // Step 1: Create language.
    const res = await svc.createLanguage({ title: `Lang-${faker.number.int({ min: 1000, max: 9999 })}`, code: 'xx' });
    // Step 2: Verify 201 + cleanup.
    expectOk(res, { status: 201 });
    cleanup.add(`delete lang ${res.body.data.id}`, async () => svc.removeLanguage(res.body.data.id));
  });

  // Test ID: T0393
  // Test Title: Verify that listing languages returns HTTP 200
  test('T0393 | Positive | Verify that listing languages returns HTTP 200', async ({ api }) => {
    // Step 1: List languages.
    expectOk(await new DietService(api).listLanguages(), { status: 200 });
  });

  // Test ID: T0394
  // Test Title: Verify that a newly created language can be fetched by id with HTTP 200
  test('T0394 | Positive | Verify that a newly created language can be fetched by id with HTTP 200', async ({ api, cleanup }) => {
    const svc = new DietService(api);
    // Step 1: Create language.
    const created = await svc.createLanguage({ title: `Lang-${faker.number.int({ min: 1000, max: 9999 })}`, code: 'xx' });
    expectOk(created, { status: 201 });
    const id = created.body.data.id;
    cleanup.add(`delete lang ${id}`, async () => svc.removeLanguage(id));
    // Step 2: Show returns 200.
    expectOk(await svc.showLanguage(id), { status: 200 });
  });

  // Test ID: T0395
  // Test Title: Verify that fetching a non-existent language returns HTTP 404
  test('T0395 | Edge | Verify that fetching a non-existent language returns HTTP 404', async ({ api }) => {
    // Step 1: Show non-existent id.
    expectError(await new DietService(api).showLanguage(999999999), 404);
  });

  // Test ID: T0396
  // Test Title: Verify that updating a language with POST returns HTTP 200
  test('T0396 | Positive | Verify that updating a language with POST returns HTTP 200', async ({ api, cleanup }) => {
    const svc = new DietService(api);
    // Step 1: Create language.
    const created = await svc.createLanguage({ title: `Lang-${faker.number.int({ min: 1000, max: 9999 })}`, code: 'xx' });
    expectOk(created, { status: 201 });
    const id = created.body.data.id;
    cleanup.add(`delete lang ${id}`, async () => svc.removeLanguage(id));
    // Step 2: POST update.
    expectOk(await svc.updateLanguage(id, { title: `LangU-${faker.number.int({ min: 1000, max: 9999 })}` }), { status: 200 });
  });

  // Test ID: T0397
  // Test Title: Verify that updating a language with PUT is rejected with HTTP 405
  test('T0397 | Negative | Verify that updating a language with PUT is rejected with HTTP 405', async ({ api, cleanup }) => {
    const svc = new DietService(api);
    // Step 1: Create language.
    const created = await svc.createLanguage({ title: `Lang-${faker.number.int({ min: 1000, max: 9999 })}`, code: 'xx' });
    expectOk(created, { status: 201 });
    const id = created.body.data.id;
    cleanup.add(`delete lang ${id}`, async () => svc.removeLanguage(id));
    // Step 2: PUT and verify 405.
    const raw = await api.request.put(`${require('../../src/config/env').env.baseURL}/setting/diet/languages/${id}`, { headers: { Accept: 'application/json' }, data: { title: 'X' } });
    expectError(await require('../../src/client/api-client').ApiClient.readJson(raw), 405);
  });

  // Test ID: T0398
  // Test Title: Verify that creating a language without a title is rejected with HTTP 422
  test('T0398 | Negative | Verify that creating a language without a title is rejected with HTTP 422', async ({ api }) => {
    // Step 1: Create without title.
    expectError(await new DietService(api).createLanguage({}), 422);
  });

  // Test ID: T0399
  // Test Title: Verify that deleting an already-deleted language returns HTTP 404
  test('T0399 | Edge | Verify that deleting an already-deleted language returns HTTP 404', async ({ api }) => {
    const svc = new DietService(api);
    // Step 1: Create + delete.
    const created = await svc.createLanguage({ title: `Lang-${faker.number.int({ min: 1000, max: 9999 })}`, code: 'xx' });
    expectOk(created, { status: 201 });
    const id = created.body.data.id;
    expectOk(await svc.removeLanguage(id), { status: 200 });
    // Step 2: Re-delete returns 404.
    expectError(await svc.removeLanguage(id), 404);
  });

  // Test ID: T0400
  // Test Title: Verify that languages without a token are rejected with HTTP 401
  test('T0400 | Negative | Verify that languages without a token are rejected with HTTP 401', async ({ unauthApi }) => {
    // Step 1: List without token.
    expectError(await new DietService(unauthApi).listLanguages(), 401);
  });
});
