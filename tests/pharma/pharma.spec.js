// Suite: Compositions + medicine units
const { test } = require('../../src/fixtures/api.fixture');
const { PharmaService } = require('../../src/services/pharma.service');
const { expectOk, expectError } = require('../../src/utils/assertions');
const { faker } = require('@faker-js/faker');

test.describe('Compositions + medicine units', () => {
  // Test ID: T0453
  // Test Title: Verify that creating a composition returns HTTP 200 with an id
  test('T0453 | Positive | Verify that creating a composition returns HTTP 200 with an id', async ({ api, cleanup }) => {
    const svc = new PharmaService(api);
    // Step 1: Create composition.
    const res = await svc.createComposition({ name: `Comp-${faker.number.int({ min: 1000, max: 9999 })}` });
    // Step 2: Verify 200 + cleanup.
    expectOk(res, { status: 200 });
    cleanup.add(`delete comp ${res.body.data.id}`, async () => svc.removeComposition(res.body.data.id));
  });

  // Test ID: T0454
  // Test Title: Verify that listing compositions returns HTTP 200
  test('T0454 | Positive | Verify that listing compositions returns HTTP 200', async ({ api }) => {
    // Step 1: List compositions.
    expectOk(await new PharmaService(api).listCompositions(), { status: 200 });
  });

  // Test ID: T0455
  // Test Title: Verify that a newly created composition can be fetched by id with HTTP 200
  test('T0455 | Positive | Verify that a newly created composition can be fetched by id with HTTP 200', async ({ api, cleanup }) => {
    const svc = new PharmaService(api);
    // Step 1: Create composition.
    const created = await svc.createComposition({ name: `Comp-${faker.number.int({ min: 1000, max: 9999 })}` });
    expectOk(created, { status: 200 });
    const id = created.body.data.id;
    cleanup.add(`delete comp ${id}`, async () => svc.removeComposition(id));
    // Step 2: Show returns 200.
    expectOk(await svc.showComposition(id), { status: 200 });
  });

  // Test ID: T0456
  // Test Title: Verify that fetching a non-existent composition returns HTTP 404
  test('T0456 | Edge | Verify that fetching a non-existent composition returns HTTP 404', async ({ api }) => {
    // Step 1: Show non-existent id.
    expectError(await new PharmaService(api).showComposition(999999999), 404);
  });

  // Test ID: T0457
  // Test Title: Verify that updating a composition with PUT returns HTTP 200
  test('T0457 | Positive | Verify that updating a composition with PUT returns HTTP 200', async ({ api, cleanup }) => {
    const svc = new PharmaService(api);
    // Step 1: Create composition.
    const created = await svc.createComposition({ name: `Comp-${faker.number.int({ min: 1000, max: 9999 })}` });
    expectOk(created, { status: 200 });
    const id = created.body.data.id;
    cleanup.add(`delete comp ${id}`, async () => svc.removeComposition(id));
    // Step 2: PUT update (PUT works here).
    expectOk(await svc.updateCompositionPut(id, { name: `CompU-${faker.number.int({ min: 1000, max: 9999 })}` }), { status: 200 });
  });

  // Test ID: T0458
  // Test Title: Verify that updating a composition with POST returns HTTP 200
  test('T0458 | Positive | Verify that updating a composition with POST returns HTTP 200', async ({ api, cleanup }) => {
    const svc = new PharmaService(api);
    // Step 1: Create composition.
    const created = await svc.createComposition({ name: `Comp-${faker.number.int({ min: 1000, max: 9999 })}` });
    expectOk(created, { status: 200 });
    const id = created.body.data.id;
    cleanup.add(`delete comp ${id}`, async () => svc.removeComposition(id));
    // Step 2: POST update (POST works too).
    expectOk(await svc.updateComposition(id, { name: `CompU-${faker.number.int({ min: 1000, max: 9999 })}` }), { status: 200 });
  });

  // Test ID: T0459
  // Test Title: Verify that a duplicate composition name is accepted with HTTP 200
  test('T0459 | Edge | Verify that a duplicate composition name is accepted with HTTP 200', async ({ api, cleanup }) => {
    const svc = new PharmaService(api);
    // Step 1: Create composition twice (quirk — no visible second row, upsert-like).
    const name = `Comp-${faker.number.int({ min: 1000, max: 9999 })}`;
    const first = await svc.createComposition({ name });
    expectOk(first, { status: 200 });
    cleanup.add('delete first', async () => svc.removeComposition(first.body.data.id));
    const second = await svc.createComposition({ name });
    expectOk(second, { status: 200 });
    cleanup.add('delete second', async () => svc.removeComposition(second.body.data.id));
  });

  // Test ID: T0460
  // Test Title: Verify that creating a composition without a name is rejected with HTTP 422
  test('T0460 | Negative | Verify that creating a composition without a name is rejected with HTTP 422', async ({ api }) => {
    // Step 1: Create without name.
    expectError(await new PharmaService(api).createComposition({}), 422);
  });

  // Test ID: T0461
  // Test Title: Verify that a composition can be created and deleted with HTTP 200
  test('T0461 | Positive | Verify that a composition can be created and deleted with HTTP 200', async ({ api }) => {
    const svc = new PharmaService(api);
    // Step 1: Create composition.
    const created = await svc.createComposition({ name: `Comp-${faker.number.int({ min: 1000, max: 9999 })}` });
    expectOk(created, { status: 200 });
    // Step 2: Delete returns 200.
    expectOk(await svc.removeComposition(created.body.data.id), { status: 200 });
  });

  // Test ID: T0462
  // Test Title: Verify that compositions without a token are rejected with HTTP 401
  test('T0462 | Negative | Verify that compositions without a token are rejected with HTTP 401', async ({ unauthApi }) => {
    // Step 1: List without token.
    expectError(await new PharmaService(unauthApi).listCompositions(), 401);
  });

  // Test ID: T0463
  // Test Title: Verify that resolved units for a medicine return HTTP 200
  test('T0463 | Positive | Verify that resolved units for a medicine return HTTP 200', async ({ api }) => {
    // Step 1: Fetch resolved units (usage_type required).
    expectOk(await new PharmaService(api).resolvedUnits(1, 'sale'), { status: 200 });
  });

  // Test ID: T0464
  // Test Title: Verify that resolved units without usage type are rejected with HTTP 422
  test('T0464 | Negative | Verify that resolved units without usage type are rejected with HTTP 422', async ({ api }) => {
    // Step 1: Fetch without usage_type.
    expectError(await new PharmaService(api).resolvedUnits(1), 422);
  });

  // Test ID: T0465
  // Test Title: Verify that medicine unit defaults return HTTP 200
  test('T0465 | Positive | Verify that medicine unit defaults return HTTP 200', async ({ api }) => {
    // Step 1: Fetch unit defaults.
    expectOk(await new PharmaService(api).unitDefaults(), { status: 200 });
  });

  // Test ID: T0466
  // Test Title: Verify that unit endpoints without a token are rejected with HTTP 401
  test('T0466 | Negative | Verify that unit endpoints without a token are rejected with HTTP 401', async ({ unauthApi }) => {
    // Step 1: Fetch without token.
    expectError(await new PharmaService(unauthApi).unitDefaults(), 401);
  });
});
