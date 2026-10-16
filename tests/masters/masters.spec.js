// Suite: Settings masters (lead source, expense category)
const { test } = require('../../src/fixtures/api.fixture');
const { MastersService } = require('../../src/services/masters.service');
const { expectOk, expectError } = require('../../src/utils/assertions');
const { faker } = require('@faker-js/faker');

function leadName() {
  return `Lead-${faker.number.int({ min: 1000, max: 9999 })}-${Date.now() % 100000}`;
}

function expName() {
  return `ExpCat-${faker.number.int({ min: 1000, max: 9999 })}-${Date.now() % 100000}`;
}

test.describe('Settings masters', () => {
  // Test ID: T0223
  // Test Title: Verify that creating a lead source returns HTTP 200 with an id
  test('T0223 | Positive | Verify that creating a lead source returns HTTP 200 with an id', async ({ api, cleanup }) => {
    const svc = new MastersService(api);
    // Step 1: Create lead source.
    const res = await svc.createLeadSource({ name: leadName() });
    // Step 2: Verify 200 + cleanup.
    expectOk(res, { status: 200 });
    cleanup.add(`delete lead ${res.body.data.id}`, async () => svc.removeLeadSource(res.body.data.id));
  });

  // Test ID: T0224
  // Test Title: Verify that listing lead sources returns HTTP 200
  test('T0224 | Positive | Verify that listing lead sources returns HTTP 200', async ({ api }) => {
    // Step 1: List lead sources.
    expectOk(await new MastersService(api).listLeadSources(), { status: 200 });
  });

  // Test ID: T0225
  // Test Title: Verify that a newly created lead source can be fetched by id with HTTP 200
  test('T0225 | Positive | Verify that a newly created lead source can be fetched by id with HTTP 200', async ({ api, cleanup }) => {
    const svc = new MastersService(api);
    // Step 1: Create lead source.
    const created = await svc.createLeadSource({ name: leadName() });
    expectOk(created, { status: 200 });
    const id = created.body.data.id;
    cleanup.add(`delete lead ${id}`, async () => svc.removeLeadSource(id));
    // Step 2: Show returns 200.
    expectOk(await svc.showLeadSource(id), { status: 200 });
  });

  // Test ID: T0226
  // Test Title: Verify that fetching a non-existent lead source returns HTTP 404
  test('T0226 | Edge | Verify that fetching a non-existent lead source returns HTTP 404', async ({ api }) => {
    // Step 1: Show non-existent id.
    expectError(await new MastersService(api).showLeadSource(999999999), 404);
  });

  // Test ID: T0227
  // Test Title: Verify that updating a lead source with PUT returns HTTP 200
  test('T0227 | Positive | Verify that updating a lead source with PUT returns HTTP 200', async ({ api, cleanup }) => {
    const svc = new MastersService(api);
    // Step 1: Create lead source.
    const created = await svc.createLeadSource({ name: leadName() });
    expectOk(created, { status: 200 });
    const id = created.body.data.id;
    cleanup.add(`delete lead ${id}`, async () => svc.removeLeadSource(id));
    // Step 2: PUT update (PUT works here — unlike patient/appointment APIs).
    expectOk(await svc.updateLeadSource(id, { name: leadName() }), { status: 200 });
  });

  // Test ID: T0228
  // Test Title: Verify that creating a lead source with a duplicate name is rejected with HTTP 422
  test('T0228 | Edge | Verify that creating a lead source with a duplicate name is rejected with HTTP 422', async ({ api, cleanup }) => {
    const svc = new MastersService(api);
    // Step 1: Create lead source.
    const name = leadName();
    const created = await svc.createLeadSource({ name });
    expectOk(created, { status: 200 });
    cleanup.add(`delete lead ${created.body.data.id}`, async () => svc.removeLeadSource(created.body.data.id));
    // Step 2: Duplicate name rejected.
    expectError(await svc.createLeadSource({ name }), 422);
  });

  // Test ID: T0229
  // Test Title: Verify that creating a lead source without a name is rejected with HTTP 422
  test('T0229 | Negative | Verify that creating a lead source without a name is rejected with HTTP 422', async ({ api }) => {
    // Step 1: Create without name.
    expectError(await new MastersService(api).createLeadSource({}), 422);
  });

  // Test ID: T0230
  // Test Title: Verify that deleting an already-deleted lead source returns HTTP 404
  test('T0230 | Edge | Verify that deleting an already-deleted lead source returns HTTP 404', async ({ api }) => {
    const svc = new MastersService(api);
    // Step 1: Create + delete.
    const created = await svc.createLeadSource({ name: leadName() });
    expectOk(created, { status: 200 });
    const id = created.body.data.id;
    expectOk(await svc.removeLeadSource(id), { status: 200 });
    // Step 2: Re-delete returns 404.
    expectError(await svc.removeLeadSource(id), 404);
  });

  // Test ID: T0231
  // Test Title: Verify that creating an expense category returns HTTP 200 with an id
  test('T0231 | Positive | Verify that creating an expense category returns HTTP 200 with an id', async ({ api, cleanup }) => {
    const svc = new MastersService(api);
    // Step 1: Create category.
    const res = await svc.createExpenseCategory({ name: expName() });
    // Step 2: Verify 200 + cleanup.
    expectOk(res, { status: 200 });
    cleanup.add(`delete cat ${res.body.data.id}`, async () => svc.removeExpenseCategory(res.body.data.id));
  });

  // Test ID: T0232
  // Test Title: Verify that listing expense categories returns HTTP 200
  test('T0232 | Positive | Verify that listing expense categories returns HTTP 200', async ({ api }) => {
    // Step 1: List categories.
    expectOk(await new MastersService(api).listExpenseCategories(), { status: 200 });
  });

  // Test ID: T0233
  // Test Title: Verify that a newly created expense category can be fetched by id with HTTP 200
  test('T0233 | Positive | Verify that a newly created expense category can be fetched by id with HTTP 200', async ({ api, cleanup }) => {
    const svc = new MastersService(api);
    // Step 1: Create category.
    const created = await svc.createExpenseCategory({ name: expName() });
    expectOk(created, { status: 200 });
    const id = created.body.data.id;
    cleanup.add(`delete cat ${id}`, async () => svc.removeExpenseCategory(id));
    // Step 2: Show returns 200.
    expectOk(await svc.showExpenseCategory(id), { status: 200 });
  });

  // Test ID: T0234
  // Test Title: Verify that fetching a non-existent expense category returns HTTP 404
  test('T0234 | Edge | Verify that fetching a non-existent expense category returns HTTP 404', async ({ api }) => {
    // Step 1: Show non-existent id.
    expectError(await new MastersService(api).showExpenseCategory(999999999), 404);
  });

  // Test ID: T0235
  // Test Title: Verify that creating an expense category with a duplicate name is rejected with HTTP 422
  test('T0235 | Edge | Verify that creating an expense category with a duplicate name is rejected with HTTP 422', async ({ api, cleanup }) => {
    const svc = new MastersService(api);
    // Step 1: Create category.
    const name = expName();
    const created = await svc.createExpenseCategory({ name });
    expectOk(created, { status: 200 });
    cleanup.add(`delete cat ${created.body.data.id}`, async () => svc.removeExpenseCategory(created.body.data.id));
    // Step 2: Duplicate rejected.
    expectError(await svc.createExpenseCategory({ name }), 422);
  });

  // Test ID: T0236
  // Test Title: Verify that creating an expense category without a name is rejected with HTTP 422
  test('T0236 | Negative | Verify that creating an expense category without a name is rejected with HTTP 422', async ({ api }) => {
    // Step 1: Create without name.
    expectError(await new MastersService(api).createExpenseCategory({}), 422);
  });

  // Test ID: T0237
  // Test Title: Verify that deleting an already-deleted expense category returns HTTP 404
  test('T0237 | Edge | Verify that deleting an already-deleted expense category returns HTTP 404', async ({ api }) => {
    const svc = new MastersService(api);
    // Step 1: Create + delete.
    const created = await svc.createExpenseCategory({ name: expName() });
    expectOk(created, { status: 200 });
    const id = created.body.data.id;
    expectOk(await svc.removeExpenseCategory(id), { status: 200 });
    // Step 2: Re-delete returns 404.
    expectError(await svc.removeExpenseCategory(id), 404);
  });

  // Test ID: T0238
  // Test Title: Verify that listing masters without a token is rejected with HTTP 401
  test('T0238 | Negative | Verify that listing masters without a token is rejected with HTTP 401', async ({ unauthApi }) => {
    // Step 1: List without token.
    expectError(await new MastersService(unauthApi).listLeadSources(), 401);
  });

  // Test ID: T0275
  // Test Title: Verify that creating a therapy category returns HTTP 200 with an id
  test('T0275 | Positive | Verify that creating a therapy category returns HTTP 200 with an id', async ({ api, cleanup }) => {
    const svc = new MastersService(api);
    // Step 1: Create category.
    const res = await svc.createTherapyCategory({ name: `Cat-${Date.now() % 100000}` });
    // Step 2: Verify 200 + cleanup.
    expectOk(res, { status: 200 });
    cleanup.add(`delete cat ${res.body.data.id}`, async () => svc.removeTherapyCategory(res.body.data.id));
  });

  // Test ID: T0276
  // Test Title: Verify that listing therapy categories returns HTTP 200
  test('T0276 | Positive | Verify that listing therapy categories returns HTTP 200', async ({ api }) => {
    // Step 1: List categories.
    expectOk(await new MastersService(api).listTherapyCategories(), { status: 200 });
  });

  // Test ID: T0277
  // Test Title: Verify that a newly created category can be fetched by id with HTTP 200
  test('T0277 | Positive | Verify that a newly created category can be fetched by id with HTTP 200', async ({ api, cleanup }) => {
    const svc = new MastersService(api);
    // Step 1: Create category.
    const created = await svc.createTherapyCategory({ name: `Cat-${Date.now() % 100000}` });
    expectOk(created, { status: 200 });
    const id = created.body.data.id;
    cleanup.add(`delete cat ${id}`, async () => svc.removeTherapyCategory(id));
    // Step 2: Show returns 200.
    expectOk(await svc.showTherapyCategory(id), { status: 200 });
  });

  // Test ID: T0278
  // Test Title: Verify that fetching a non-existent category returns HTTP 404
  test('T0278 | Edge | Verify that fetching a non-existent category returns HTTP 404', async ({ api }) => {
    // Step 1: Show non-existent id.
    expectError(await new MastersService(api).showTherapyCategory(999999999), 404);
  });

  // Test ID: T0279
  // Test Title: Verify that updating a category with POST returns HTTP 200
  test('T0279 | Positive | Verify that updating a category with POST returns HTTP 200', async ({ api, cleanup }) => {
    const svc = new MastersService(api);
    // Step 1: Create category.
    const created = await svc.createTherapyCategory({ name: `Cat-${Date.now() % 100000}` });
    expectOk(created, { status: 200 });
    const id = created.body.data.id;
    cleanup.add(`delete cat ${id}`, async () => svc.removeTherapyCategory(id));
    // Step 2: POST update.
    expectOk(await svc.updateTherapyCategory(id, { name: `CatU-${Date.now() % 100000}` }), { status: 200 });
  });

  // Test ID: T0280
  // Test Title: Verify that updating a category with PUT is rejected with HTTP 405
  test('T0280 | Negative | Verify that updating a category with PUT is rejected with HTTP 405', async ({ api, cleanup }) => {
    const svc = new MastersService(api);
    // Step 1: Create category.
    const created = await svc.createTherapyCategory({ name: `Cat-${Date.now() % 100000}` });
    expectOk(created, { status: 200 });
    const id = created.body.data.id;
    cleanup.add(`delete cat ${id}`, async () => svc.removeTherapyCategory(id));
    // Step 2: PUT and verify 405.
    const raw = await api.request.put(`${require('../../src/config/env').env.baseURL}/setting/therapy-category/${id}`, { headers: { Accept: 'application/json' }, data: { name: 'X' } });
    expectError(await require('../../src/client/api-client').ApiClient.readJson(raw), 405);
  });

  // Test ID: T0281
  // Test Title: Verify that creating a category without a name is rejected with HTTP 422
  test('T0281 | Negative | Verify that creating a category without a name is rejected with HTTP 422', async ({ api }) => {
    // Step 1: Create without name.
    expectError(await new MastersService(api).createTherapyCategory({}), 422);
  });

  // Test ID: T0282
  // Test Title: Verify that duplicate category names are accepted with HTTP 200 (no uniqueness check)
  test('T0282 | Edge | Verify that duplicate category names are accepted with HTTP 200 (no uniqueness check)', async ({ api, cleanup }) => {
    const svc = new MastersService(api);
    // Step 1: Create category twice with same name (allowed — quirk).
    const name = `DupCat-${Date.now() % 100000}`;
    const first = await svc.createTherapyCategory({ name });
    expectOk(first, { status: 200 });
    cleanup.add('delete first', async () => svc.removeTherapyCategory(first.body.data.id));
    const second = await svc.createTherapyCategory({ name });
    expectOk(second, { status: 200 });
    cleanup.add('delete second', async () => svc.removeTherapyCategory(second.body.data.id));
  });

  // Test ID: T0283
  // Test Title: Verify that deleting an already-deleted category returns HTTP 404
  test('T0283 | Edge | Verify that deleting an already-deleted category returns HTTP 404', async ({ api }) => {
    const svc = new MastersService(api);
    // Step 1: Create + delete.
    const created = await svc.createTherapyCategory({ name: `Cat-${Date.now() % 100000}` });
    expectOk(created, { status: 200 });
    const id = created.body.data.id;
    expectOk(await svc.removeTherapyCategory(id), { status: 200 });
    // Step 2: Re-delete returns 404.
    expectError(await svc.removeTherapyCategory(id), 404);
  });

  // Test ID: T0284
  // Test Title: Verify that creating a therapy room returns HTTP 200 with an id
  test('T0284 | Positive | Verify that creating a therapy room returns HTTP 200 with an id', async ({ api, cleanup }) => {
    const svc = new MastersService(api);
    // Step 1: Create room.
    const res = await svc.createTherapyRoom({ name: `Room-${Date.now() % 100000}` });
    // Step 2: Verify 200 + cleanup.
    expectOk(res, { status: 200 });
    cleanup.add(`delete room ${res.body.data.id}`, async () => svc.removeTherapyRoom(res.body.data.id));
  });

  // Test ID: T0285
  // Test Title: Verify that listing therapy rooms returns HTTP 200
  test('T0285 | Positive | Verify that listing therapy rooms returns HTTP 200', async ({ api }) => {
    // Step 1: List rooms.
    expectOk(await new MastersService(api).listTherapyRooms(), { status: 200 });
  });

  // Test ID: T0286
  // Test Title: Verify that a newly created room can be fetched by id with HTTP 200
  test('T0286 | Positive | Verify that a newly created room can be fetched by id with HTTP 200', async ({ api, cleanup }) => {
    const svc = new MastersService(api);
    // Step 1: Create room.
    const created = await svc.createTherapyRoom({ name: `Room-${Date.now() % 100000}` });
    expectOk(created, { status: 200 });
    const id = created.body.data.id;
    cleanup.add(`delete room ${id}`, async () => svc.removeTherapyRoom(id));
    // Step 2: Show returns 200.
    expectOk(await svc.showTherapyRoom(id), { status: 200 });
  });

  // Test ID: T0287
  // Test Title: Verify that fetching a non-existent room returns HTTP 404
  test('T0287 | Edge | Verify that fetching a non-existent room returns HTTP 404', async ({ api }) => {
    // Step 1: Show non-existent id.
    expectError(await new MastersService(api).showTherapyRoom(999999999), 404);
  });

  // Test ID: T0288
  // Test Title: Verify that pincode suggestions for a partial code return HTTP 200
  test('T0288 | Positive | Verify that pincode suggestions for a partial code return HTTP 200', async ({ api }) => {
    // Step 1: Suggest with 4-char prefix.
    expectOk(await new MastersService(api).pincodeSuggest('3800'), { status: 200 });
  });

  // Test ID: T0289
  // Test Title: Verify that a too-short pincode query is rejected with HTTP 422
  test('T0289 | Boundary | Verify that a too-short pincode query is rejected with HTTP 422', async ({ api }) => {
    // Step 1: Suggest with 1 char (min 2).
    expectError(await new MastersService(api).pincodeSuggest('3'), 422);
  });

  // Test ID: T0290
  // Test Title: Verify that pincode suggestions without a token are rejected with HTTP 401
  test('T0290 | Negative | Verify that pincode suggestions without a token are rejected with HTTP 401', async ({ unauthApi }) => {
    // Step 1: Suggest without token.
    expectError(await new MastersService(unauthApi).pincodeSuggest('3800'), 401);
  });

  // Test ID: T0355
  // Test Title: Verify that calendar settings return HTTP 200
  test('T0355 | Positive | Verify that calendar settings return HTTP 200', async ({ api }) => {
    // Step 1: Fetch calendar settings.
    expectOk(await new MastersService(api).calendarSettings(), { status: 200 });
  });

  // Test ID: T0356
  // Test Title: Verify that calendar settings without a token are rejected with HTTP 401
  test('T0356 | Negative | Verify that calendar settings without a token are rejected with HTTP 401', async ({ unauthApi }) => {
    // Step 1: Fetch without token.
    expectError(await new MastersService(unauthApi).calendarSettings(), 401);
  });

  // Test ID: T0357
  // Test Title: Verify that consultation settings return HTTP 200
  test('T0357 | Positive | Verify that consultation settings return HTTP 200', async ({ api }) => {
    // Step 1: Fetch consultation settings.
    expectOk(await new MastersService(api).consultationSettings(), { status: 200 });
  });

  // Test ID: T0358
  // Test Title: Verify that consultation settings without a token are rejected with HTTP 401
  test('T0358 | Negative | Verify that consultation settings without a token are rejected with HTTP 401', async ({ unauthApi }) => {
    // Step 1: Fetch without token.
    expectError(await new MastersService(unauthApi).consultationSettings(), 401);
  });

  // Test ID: T0359
  // Test Title: Verify that creating a special case returns HTTP 200 with an id
  test('T0359 | Positive | Verify that creating a special case returns HTTP 200 with an id', async ({ api, cleanup }) => {
    const svc = new MastersService(api);
    // Step 1: Create special case.
    const res = await svc.createSpecialCase({ name: `Spl-${faker.number.int({ min: 1000, max: 9999 })}` });
    // Step 2: Verify 200 + cleanup.
    expectOk(res, { status: 200 });
    cleanup.add(`delete special ${res.body.data.id}`, async () => svc.removeSpecialCase(res.body.data.id));
  });

  // Test ID: T0360
  // Test Title: Verify that listing special cases returns HTTP 200
  test('T0360 | Positive | Verify that listing special cases returns HTTP 200', async ({ api }) => {
    // Step 1: List special cases.
    expectOk(await new MastersService(api).listSpecialCases(), { status: 200 });
  });

  // Test ID: T0361
  // Test Title: Verify that a newly created special case can be fetched by id with HTTP 200
  test('T0361 | Positive | Verify that a newly created special case can be fetched by id with HTTP 200', async ({ api, cleanup }) => {
    const svc = new MastersService(api);
    // Step 1: Create special case.
    const created = await svc.createSpecialCase({ name: `Spl-${faker.number.int({ min: 1000, max: 9999 })}` });
    expectOk(created, { status: 200 });
    const id = created.body.data.id;
    cleanup.add(`delete special ${id}`, async () => svc.removeSpecialCase(id));
    // Step 2: Show returns 200.
    expectOk(await svc.showSpecialCase(id), { status: 200 });
  });

  // Test ID: T0362
  // Test Title: Verify that fetching a non-existent special case returns HTTP 404
  test('T0362 | Edge | Verify that fetching a non-existent special case returns HTTP 404', async ({ api }) => {
    // Step 1: Show non-existent id.
    expectError(await new MastersService(api).showSpecialCase(999999999), 404);
  });

  // Test ID: T0363
  // Test Title: Verify that updating a special case with PUT returns HTTP 200
  test('T0363 | Positive | Verify that updating a special case with PUT returns HTTP 200', async ({ api, cleanup }) => {
    const svc = new MastersService(api);
    // Step 1: Create special case.
    const created = await svc.createSpecialCase({ name: `Spl-${faker.number.int({ min: 1000, max: 9999 })}` });
    expectOk(created, { status: 200 });
    const id = created.body.data.id;
    cleanup.add(`delete special ${id}`, async () => svc.removeSpecialCase(id));
    // Step 2: PUT update (PUT works here).
    expectOk(await svc.updateSpecialCasePut(id, { name: `SplU-${faker.number.int({ min: 1000, max: 9999 })}` }), { status: 200 });
  });

  // Test ID: T0364
  // Test Title: Verify that updating a special case with POST returns HTTP 200
  test('T0364 | Positive | Verify that updating a special case with POST returns HTTP 200', async ({ api, cleanup }) => {
    const svc = new MastersService(api);
    // Step 1: Create special case.
    const created = await svc.createSpecialCase({ name: `Spl-${faker.number.int({ min: 1000, max: 9999 })}` });
    expectOk(created, { status: 200 });
    const id = created.body.data.id;
    cleanup.add(`delete special ${id}`, async () => svc.removeSpecialCase(id));
    // Step 2: POST update (POST works too).
    expectOk(await svc.updateSpecialCase(id, { name: `SplU-${faker.number.int({ min: 1000, max: 9999 })}` }), { status: 200 });
  });

  // Test ID: T0365
  // Test Title: Verify that creating a special case with a duplicate name is rejected with HTTP 422
  test('T0365 | Edge | Verify that creating a special case with a duplicate name is rejected with HTTP 422', async ({ api, cleanup }) => {
    const svc = new MastersService(api);
    // Step 1: Create special case.
    const name = `Spl-${faker.number.int({ min: 1000, max: 9999 })}`;
    const created = await svc.createSpecialCase({ name });
    expectOk(created, { status: 200 });
    cleanup.add(`delete special ${created.body.data.id}`, async () => svc.removeSpecialCase(created.body.data.id));
    // Step 2: Duplicate rejected.
    expectError(await svc.createSpecialCase({ name }), 422);
  });

  // Test ID: T0366
  // Test Title: Verify that creating a special case without a name is rejected with HTTP 422
  test('T0366 | Negative | Verify that creating a special case without a name is rejected with HTTP 422', async ({ api }) => {
    // Step 1: Create without name.
    expectError(await new MastersService(api).createSpecialCase({}), 422);
  });

  // Test ID: T0367
  // Test Title: Verify that deleting an already-deleted special case returns HTTP 404
  test('T0367 | Edge | Verify that deleting an already-deleted special case returns HTTP 404', async ({ api }) => {
    const svc = new MastersService(api);
    // Step 1: Create + delete.
    const created = await svc.createSpecialCase({ name: `Spl-${faker.number.int({ min: 1000, max: 9999 })}` });
    expectOk(created, { status: 200 });
    const id = created.body.data.id;
    expectOk(await svc.removeSpecialCase(id), { status: 200 });
    // Step 2: Re-delete returns 404.
    expectError(await svc.removeSpecialCase(id), 404);
  });

  // Test ID: T0368
  // Test Title: Verify that creating a medicine type returns HTTP 200 with an id
  test('T0368 | Positive | Verify that creating a medicine type returns HTTP 200 with an id', async ({ api, cleanup }) => {
    const svc = new MastersService(api);
    // Step 1: Create medicine type.
    const res = await svc.createMedicineType({ name: `MType-${faker.number.int({ min: 1000, max: 9999 })}` });
    // Step 2: Verify 200 + cleanup.
    expectOk(res, { status: 200 });
    cleanup.add(`delete mtype ${res.body.data.id}`, async () => svc.removeMedicineType(res.body.data.id));
  });

  // Test ID: T0369
  // Test Title: Verify that listing medicine types returns HTTP 200
  test('T0369 | Positive | Verify that listing medicine types returns HTTP 200', async ({ api }) => {
    // Step 1: List medicine types.
    expectOk(await new MastersService(api).listMedicineTypes(), { status: 200 });
  });

  // Test ID: T0370
  // Test Title: Verify that a newly created medicine type can be fetched by id with HTTP 200
  test('T0370 | Positive | Verify that a newly created medicine type can be fetched by id with HTTP 200', async ({ api, cleanup }) => {
    const svc = new MastersService(api);
    // Step 1: Create medicine type.
    const created = await svc.createMedicineType({ name: `MType-${faker.number.int({ min: 1000, max: 9999 })}` });
    expectOk(created, { status: 200 });
    const id = created.body.data.id;
    cleanup.add(`delete mtype ${id}`, async () => svc.removeMedicineType(id));
    // Step 2: Show returns 200.
    expectOk(await svc.showMedicineType(id), { status: 200 });
  });

  // Test ID: T0371
  // Test Title: Verify that fetching a non-existent medicine type returns HTTP 404
  test('T0371 | Edge | Verify that fetching a non-existent medicine type returns HTTP 404', async ({ api }) => {
    // Step 1: Show non-existent id.
    expectError(await new MastersService(api).showMedicineType(999999999), 404);
  });

  // Test ID: T0372
  // Test Title: Verify that updating a medicine type with PUT returns HTTP 200
  test('T0372 | Positive | Verify that updating a medicine type with PUT returns HTTP 200', async ({ api, cleanup }) => {
    const svc = new MastersService(api);
    // Step 1: Create medicine type.
    const created = await svc.createMedicineType({ name: `MType-${faker.number.int({ min: 1000, max: 9999 })}` });
    expectOk(created, { status: 200 });
    const id = created.body.data.id;
    cleanup.add(`delete mtype ${id}`, async () => svc.removeMedicineType(id));
    // Step 2: PUT update (PUT works here).
    expectOk(await svc.updateMedicineTypePut(id, { name: `MTU-${faker.number.int({ min: 1000, max: 9999 })}` }), { status: 200 });
  });

  // Test ID: T0373
  // Test Title: Verify that updating a medicine type with POST returns HTTP 200
  test('T0373 | Positive | Verify that updating a medicine type with POST returns HTTP 200', async ({ api, cleanup }) => {
    const svc = new MastersService(api);
    // Step 1: Create medicine type.
    const created = await svc.createMedicineType({ name: `MType-${faker.number.int({ min: 1000, max: 9999 })}` });
    expectOk(created, { status: 200 });
    const id = created.body.data.id;
    cleanup.add(`delete mtype ${id}`, async () => svc.removeMedicineType(id));
    // Step 2: POST update (POST works too).
    expectOk(await svc.updateMedicineType(id, { name: `MTU-${faker.number.int({ min: 1000, max: 9999 })}` }), { status: 200 });
  });

  // Test ID: T0374
  // Test Title: Verify that a duplicate medicine type name is handled without server error
  test('T0374 | Edge | Verify that a duplicate medicine type name is handled without server error', async ({ api, cleanup }) => {
    const svc = new MastersService(api);
    // Step 1: Create medicine type.
    // NOTE: live behavior is racy — sometimes 200 (row replaced), sometimes
    // 422 (unique check wins). Both acceptable; only 5xx fails.
    const name = `MType-${faker.number.int({ min: 1000, max: 9999 })}`;
    const first = await svc.createMedicineType({ name });
    expectOk(first, { status: 200 });
    cleanup.add('delete original', async () => svc.removeMedicineType(first.body.data.id));
    // Step 2: Duplicate must never 500.
    const second = await svc.createMedicineType({ name });
    if (second.status >= 500) throw new Error(`Duplicate caused 5xx: ${second.status}`);
    if (second.status === 200 && second.body?.data?.id) {
      cleanup.add('delete duplicate', async () => svc.removeMedicineType(second.body.data.id));
    }
  });

  // Test ID: T0375
  // Test Title: Verify that creating a medicine type without a name is rejected with HTTP 422
  test('T0375 | Negative | Verify that creating a medicine type without a name is rejected with HTTP 422', async ({ api }) => {
    // Step 1: Create without name.
    expectError(await new MastersService(api).createMedicineType({}), 422);
  });

  // Test ID: T0376
  // Test Title: Verify that deleting an already-deleted medicine type returns HTTP 404
  test('T0376 | Edge | Verify that deleting an already-deleted medicine type returns HTTP 404', async ({ api }) => {
    const svc = new MastersService(api);
    // Step 1: Create + delete.
    const created = await svc.createMedicineType({ name: `MType-${faker.number.int({ min: 1000, max: 9999 })}` });
    expectOk(created, { status: 200 });
    const id = created.body.data.id;
    expectOk(await svc.removeMedicineType(id), { status: 200 });
    // Step 2: Re-delete returns 404.
    expectError(await svc.removeMedicineType(id), 404);
  });

  // Test ID: T0377
  // Test Title: Verify that creating a medicine company returns HTTP 200 with an id
  test('T0377 | Positive | Verify that creating a medicine company returns HTTP 200 with an id', async ({ api, cleanup }) => {
    const svc = new MastersService(api);
    // Step 1: Create company.
    const res = await svc.createCompany({ name: `MCo-${faker.number.int({ min: 1000, max: 9999 })}` });
    // Step 2: Verify 200 + cleanup.
    expectOk(res, { status: 200 });
    cleanup.add(`delete company ${res.body.data.id}`, async () => svc.removeCompany(res.body.data.id));
  });

  // Test ID: T0378
  // Test Title: Verify that listing medicine companies returns HTTP 200
  test('T0378 | Positive | Verify that listing medicine companies returns HTTP 200', async ({ api }) => {
    // Step 1: List companies.
    expectOk(await new MastersService(api).listCompanies(), { status: 200 });
  });

  // Test ID: T0379
  // Test Title: Verify that a newly created company can be fetched by id with HTTP 200
  test('T0379 | Positive | Verify that a newly created company can be fetched by id with HTTP 200', async ({ api, cleanup }) => {
    const svc = new MastersService(api);
    // Step 1: Create company.
    const created = await svc.createCompany({ name: `MCo-${faker.number.int({ min: 1000, max: 9999 })}` });
    expectOk(created, { status: 200 });
    const id = created.body.data.id;
    cleanup.add(`delete company ${id}`, async () => svc.removeCompany(id));
    // Step 2: Show returns 200.
    expectOk(await svc.showCompany(id), { status: 200 });
  });

  // Test ID: T0380
  // Test Title: Verify that fetching a non-existent company returns HTTP 404
  test('T0380 | Edge | Verify that fetching a non-existent company returns HTTP 404', async ({ api }) => {
    // Step 1: Show non-existent id.
    expectError(await new MastersService(api).showCompany(999999999), 404);
  });

  // Test ID: T0381
  // Test Title: Verify that updating a company with PUT returns HTTP 200
  test('T0381 | Positive | Verify that updating a company with PUT returns HTTP 200', async ({ api, cleanup }) => {
    const svc = new MastersService(api);
    // Step 1: Create company.
    const created = await svc.createCompany({ name: `MCo-${faker.number.int({ min: 1000, max: 9999 })}` });
    expectOk(created, { status: 200 });
    const id = created.body.data.id;
    cleanup.add(`delete company ${id}`, async () => svc.removeCompany(id));
    // Step 2: PUT update (PUT works here).
    expectOk(await svc.updateCompanyPut(id, { name: `MCoU-${faker.number.int({ min: 1000, max: 9999 })}` }), { status: 200 });
  });

  // Test ID: T0382
  // Test Title: Verify that creating a company without a name is rejected with HTTP 422
  test('T0382 | Negative | Verify that creating a company without a name is rejected with HTTP 422', async ({ api }) => {
    // Step 1: Create without name.
    expectError(await new MastersService(api).createCompany({}), 422);
  });

  // Test ID: T0383
  // Test Title: Verify that a company can be created and deleted with HTTP 200
  test('T0383 | Positive | Verify that a company can be created and deleted with HTTP 200', async ({ api }) => {
    const svc = new MastersService(api);
    // Step 1: Create company.
    const created = await svc.createCompany({ name: `MCo-${faker.number.int({ min: 1000, max: 9999 })}` });
    expectOk(created, { status: 200 });
    // Step 2: Delete returns 200.
    expectOk(await svc.removeCompany(created.body.data.id), { status: 200 });
  });

  // Test ID: T0416
  // Test Title: Verify that creating a certificate type returns HTTP 201 with an id
  test('T0416 | Positive | Verify that creating a certificate type returns HTTP 201 with an id', async ({ api, cleanup }) => {
    const svc = new MastersService(api);
    // Step 1: Create certificate type (title+code+body_template required).
    const n = `Cert-${faker.number.int({ min: 1000, max: 9999 })}`;
    const res = await svc.createCertificateType({ title: n, code: `C${n}`, body_template: '<p>Test body</p>' });
    // Step 2: Verify 201 + cleanup.
    expectOk(res, { status: 201 });
    cleanup.add(`delete cert ${res.body.data.id}`, async () => svc.removeCertificateType(res.body.data.id));
  });

  // Test ID: T0417
  // Test Title: Verify that listing certificate types returns HTTP 200
  test('T0417 | Positive | Verify that listing certificate types returns HTTP 200', async ({ api }) => {
    // Step 1: List certificate types.
    expectOk(await new MastersService(api).listCertificateTypes(), { status: 200 });
  });

  // Test ID: T0418
  // Test Title: Verify that a newly created certificate type can be fetched by id with HTTP 200
  test('T0418 | Positive | Verify that a newly created certificate type can be fetched by id with HTTP 200', async ({ api, cleanup }) => {
    const svc = new MastersService(api);
    // Step 1: Create certificate type.
    const n = `Cert-${faker.number.int({ min: 1000, max: 9999 })}`;
    const created = await svc.createCertificateType({ title: n, code: `C${n}`, body_template: '<p>Test body</p>' });
    expectOk(created, { status: 201 });
    const id = created.body.data.id;
    cleanup.add(`delete cert ${id}`, async () => svc.removeCertificateType(id));
    // Step 2: Show returns 200.
    expectOk(await svc.showCertificateType(id), { status: 200 });
  });

  // Test ID: T0419
  // Test Title: Verify that fetching a non-existent certificate type returns HTTP 404
  test('T0419 | Edge | Verify that fetching a non-existent certificate type returns HTTP 404', async ({ api }) => {
    // Step 1: Show non-existent id.
    expectError(await new MastersService(api).showCertificateType(999999999), 404);
  });

  // Test ID: T0420
  // Test Title: Verify that updating a certificate type with POST returns HTTP 200
  test('T0420 | Positive | Verify that updating a certificate type with POST returns HTTP 200', async ({ api, cleanup }) => {
    const svc = new MastersService(api);
    // Step 1: Create certificate type.
    const n = `Cert-${faker.number.int({ min: 1000, max: 9999 })}`;
    const created = await svc.createCertificateType({ title: n, code: `C${n}`, body_template: '<p>Test body</p>' });
    expectOk(created, { status: 201 });
    const id = created.body.data.id;
    cleanup.add(`delete cert ${id}`, async () => svc.removeCertificateType(id));
    // Step 2: POST update.
    expectOk(await svc.updateCertificateType(id, { title: `${n}U`, code: `C${n}`, body_template: '<p>Upd</p>' }), { status: 200 });
  });

  // Test ID: T0421
  // Test Title: Verify that updating a certificate type with PUT is rejected with HTTP 405
  test('T0421 | Negative | Verify that updating a certificate type with PUT is rejected with HTTP 405', async ({ api, cleanup }) => {
    const svc = new MastersService(api);
    // Step 1: Create certificate type.
    const n = `Cert-${faker.number.int({ min: 1000, max: 9999 })}`;
    const created = await svc.createCertificateType({ title: n, code: `C${n}`, body_template: '<p>Test body</p>' });
    expectOk(created, { status: 201 });
    const id = created.body.data.id;
    cleanup.add(`delete cert ${id}`, async () => svc.removeCertificateType(id));
    // Step 2: PUT and verify 405.
    const raw = await api.request.put(`${require('../../src/config/env').env.baseURL}/setting/certificate-type/${id}`, { headers: { Accept: 'application/json' }, data: { title: 'X' } });
    expectError(await require('../../src/client/api-client').ApiClient.readJson(raw), 405);
  });

  // Test ID: T0422
  // Test Title: Verify that creating a certificate type without a body template is rejected with HTTP 422
  test('T0422 | Negative | Verify that creating a certificate type without a body template is rejected with HTTP 422', async ({ api }) => {
    // Step 1: Create without body_template.
    expectError(await new MastersService(api).createCertificateType({ title: 'NoTpl', code: 'NT1' }), 422);
  });

  // Test ID: T0423
  // Test Title: Verify that a certificate type can be created and deleted with HTTP 200
  test('T0423 | Positive | Verify that a certificate type can be created and deleted with HTTP 200', async ({ api }) => {
    const svc = new MastersService(api);
    // Step 1: Create certificate type.
    const n = `Cert-${faker.number.int({ min: 1000, max: 9999 })}`;
    const created = await svc.createCertificateType({ title: n, code: `C${n}`, body_template: '<p>Test body</p>' });
    expectOk(created, { status: 201 });
    // Step 2: Delete returns 200.
    expectOk(await svc.removeCertificateType(created.body.data.id), { status: 200 });
  });

  // Test ID: T0424
  // Test Title: Verify that creating a source panel returns HTTP 200 with an id
  test('T0424 | Positive | Verify that creating a source panel returns HTTP 200 with an id', async ({ api, cleanup }) => {
    const svc = new MastersService(api);
    // Step 1: Create source panel.
    const res = await svc.createSourcePanel({ name: `Panel-${faker.number.int({ min: 1000, max: 9999 })}` });
    // Step 2: Verify 200 + cleanup.
    expectOk(res, { status: 200 });
    cleanup.add(`delete panel ${res.body.data.id}`, async () => svc.removeSourcePanel(res.body.data.id));
  });

  // Test ID: T0425
  // Test Title: Verify that listing source panels returns HTTP 200
  test('T0425 | Positive | Verify that listing source panels returns HTTP 200', async ({ api }) => {
    // Step 1: List source panels.
    expectOk(await new MastersService(api).listSourcePanels(), { status: 200 });
  });

  // Test ID: T0426
  // Test Title: Verify that a newly created source panel can be fetched by id with HTTP 200
  test('T0426 | Positive | Verify that a newly created source panel can be fetched by id with HTTP 200', async ({ api, cleanup }) => {
    const svc = new MastersService(api);
    // Step 1: Create source panel.
    const created = await svc.createSourcePanel({ name: `Panel-${faker.number.int({ min: 1000, max: 9999 })}` });
    expectOk(created, { status: 200 });
    const id = created.body.data.id;
    cleanup.add(`delete panel ${id}`, async () => svc.removeSourcePanel(id));
    // Step 2: Show returns 200.
    expectOk(await svc.showSourcePanel(id), { status: 200 });
  });

  // Test ID: T0427
  // Test Title: Verify that fetching a non-existent source panel returns HTTP 404
  test('T0427 | Edge | Verify that fetching a non-existent source panel returns HTTP 404', async ({ api }) => {
    // Step 1: Show non-existent id.
    expectError(await new MastersService(api).showSourcePanel(999999999), 404);
  });

  // Test ID: T0428
  // Test Title: Verify that updating a source panel with PUT returns HTTP 200
  test('T0428 | Positive | Verify that updating a source panel with PUT returns HTTP 200', async ({ api, cleanup }) => {
    const svc = new MastersService(api);
    // Step 1: Create source panel.
    const created = await svc.createSourcePanel({ name: `Panel-${faker.number.int({ min: 1000, max: 9999 })}` });
    expectOk(created, { status: 200 });
    const id = created.body.data.id;
    cleanup.add(`delete panel ${id}`, async () => svc.removeSourcePanel(id));
    // Step 2: PUT update (PUT works here).
    expectOk(await svc.updateSourcePanelPut(id, { name: `PanelU-${faker.number.int({ min: 1000, max: 9999 })}` }), { status: 200 });
  });

  // Test ID: T0429
  // Test Title: Verify that updating a source panel with POST returns HTTP 200
  test('T0429 | Positive | Verify that updating a source panel with POST returns HTTP 200', async ({ api, cleanup }) => {
    const svc = new MastersService(api);
    // Step 1: Create source panel.
    const created = await svc.createSourcePanel({ name: `Panel-${faker.number.int({ min: 1000, max: 9999 })}` });
    expectOk(created, { status: 200 });
    const id = created.body.data.id;
    cleanup.add(`delete panel ${id}`, async () => svc.removeSourcePanel(id));
    // Step 2: POST update (POST works too).
    expectOk(await svc.updateSourcePanel(id, { name: `PanelU-${faker.number.int({ min: 1000, max: 9999 })}` }), { status: 200 });
  });

  // Test ID: T0430
  // Test Title: Verify that creating a source panel with a duplicate name is rejected with HTTP 422
  test('T0430 | Edge | Verify that creating a source panel with a duplicate name is rejected with HTTP 422', async ({ api, cleanup }) => {
    const svc = new MastersService(api);
    // Step 1: Create source panel.
    const name = `Panel-${faker.number.int({ min: 1000, max: 9999 })}`;
    const created = await svc.createSourcePanel({ name });
    expectOk(created, { status: 200 });
    cleanup.add(`delete panel ${created.body.data.id}`, async () => svc.removeSourcePanel(created.body.data.id));
    // Step 2: Duplicate rejected.
    expectError(await svc.createSourcePanel({ name }), 422);
  });

  // Test ID: T0431
  // Test Title: Verify that creating a source panel without a name is rejected with HTTP 422
  test('T0431 | Negative | Verify that creating a source panel without a name is rejected with HTTP 422', async ({ api }) => {
    // Step 1: Create without name.
    expectError(await new MastersService(api).createSourcePanel({}), 422);
  });

  // Test ID: T0432
  // Test Title: Verify that deleting an already-deleted source panel returns HTTP 404
  test('T0432 | Edge | Verify that deleting an already-deleted source panel returns HTTP 404', async ({ api }) => {
    const svc = new MastersService(api);
    // Step 1: Create + delete.
    const created = await svc.createSourcePanel({ name: `Panel-${faker.number.int({ min: 1000, max: 9999 })}` });
    expectOk(created, { status: 200 });
    const id = created.body.data.id;
    expectOk(await svc.removeSourcePanel(id), { status: 200 });
    // Step 2: Re-delete returns 404.
    expectError(await svc.removeSourcePanel(id), 404);
  });

  // Test ID: T0433
  // Test Title: Verify that source panels without a token are rejected with HTTP 401
  test('T0433 | Negative | Verify that source panels without a token are rejected with HTTP 401', async ({ unauthApi }) => {
    // Step 1: List without token.
    expectError(await new MastersService(unauthApi).listSourcePanels(), 401);
  });
});
