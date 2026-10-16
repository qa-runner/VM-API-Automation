// Suite: Diet plans + financial years
const { test } = require('../../src/fixtures/api.fixture');
const { DietPlanService } = require('../../src/services/dietplan.service');
const { expectOk, expectError } = require('../../src/utils/assertions');
const { faker } = require('@faker-js/faker');

function catPayload(overrides = {}) {
  return { type: 1, title: `DPCat-${faker.number.int({ min: 1000, max: 9999 })}`, ...overrides };
}

function itemPayload(catId, overrides = {}) {
  return { diet_plan_category_id: catId, title: `DPItem-${faker.number.int({ min: 1000, max: 9999 })}`, required_qty: 1, qty: '2 bowls', ...overrides };
}

/** Helper: parent plan category. */
async function setupCategory(api, cleanup) {
  const svc = new DietPlanService(api);
  const created = await svc.createPlanCategory(catPayload());
  expectOk(created, { status: 201 });
  const id = created.body.data.id;
  cleanup.add(`delete pcat ${id}`, async () => svc.removePlanCategory(id));
  return id;
}

test.describe('Diet plans + financial years', () => {
  // Test ID: T0434
  // Test Title: Verify that creating a diet plan category returns HTTP 201 with an id
  test('T0434 | Positive | Verify that creating a diet plan category returns HTTP 201 with an id', async ({ api, cleanup }) => {
    const svc = new DietPlanService(api);
    // Step 1: Create category.
    const res = await svc.createPlanCategory(catPayload());
    // Step 2: Verify 201 + cleanup.
    expectOk(res, { status: 201 });
    cleanup.add(`delete pcat ${res.body.data.id}`, async () => svc.removePlanCategory(res.body.data.id));
  });

  // Test ID: T0435
  // Test Title: Verify that listing diet plan categories returns HTTP 200
  test('T0435 | Positive | Verify that listing diet plan categories returns HTTP 200', async ({ api }) => {
    // Step 1: List categories.
    expectOk(await new DietPlanService(api).listPlanCategories(), { status: 200 });
  });

  // Test ID: T0436
  // Test Title: Verify that a newly created category can be fetched by id with HTTP 200
  test('T0436 | Positive | Verify that a newly created category can be fetched by id with HTTP 200', async ({ api, cleanup }) => {
    const svc = new DietPlanService(api);
    // Step 1: Create category.
    const created = await svc.createPlanCategory(catPayload());
    expectOk(created, { status: 201 });
    const id = created.body.data.id;
    cleanup.add(`delete pcat ${id}`, async () => svc.removePlanCategory(id));
    // Step 2: Show returns 200.
    expectOk(await svc.showPlanCategory(id), { status: 200 });
  });

  // Test ID: T0437
  // Test Title: Verify that fetching a non-existent category returns HTTP 404
  test('T0437 | Edge | Verify that fetching a non-existent category returns HTTP 404', async ({ api }) => {
    // Step 1: Show non-existent id.
    expectError(await new DietPlanService(api).showPlanCategory(999999999), 404);
  });

  // Test ID: T0438
  // Test Title: Verify that updating a category with POST returns HTTP 200
  test('T0438 | Positive | Verify that updating a category with POST returns HTTP 200', async ({ api, cleanup }) => {
    const svc = new DietPlanService(api);
    // Step 1: Create category.
    const id = await setupCategory(api, cleanup);
    // Step 2: POST update.
    expectOk(await svc.updatePlanCategory(id, catPayload()), { status: 200 });
  });

  // Test ID: T0439
  // Test Title: Verify that updating a category with PUT is rejected with HTTP 405
  test('T0439 | Negative | Verify that updating a category with PUT is rejected with HTTP 405', async ({ api, cleanup }) => {
    const svc = new DietPlanService(api);
    // Step 1: Create category.
    const id = await setupCategory(api, cleanup);
    // Step 2: PUT and verify 405.
    const raw = await api.request.put(`${require('../../src/config/env').env.baseURL}/setting/diet/plan-categories/${id}`, { headers: { Accept: 'application/json' }, data: catPayload() });
    expectError(await require('../../src/client/api-client').ApiClient.readJson(raw), 405);
  });

  // Test ID: T0440
  // Test Title: Verify that a category can be created and deleted with HTTP 200
  test('T0440 | Positive | Verify that a category can be created and deleted with HTTP 200', async ({ api }) => {
    const svc = new DietPlanService(api);
    // Step 1: Create category.
    const created = await svc.createPlanCategory(catPayload());
    expectOk(created, { status: 201 });
    // Step 2: Delete returns 200.
    expectOk(await svc.removePlanCategory(created.body.data.id), { status: 200 });
  });

  // Test ID: T0441
  // Test Title: Verify that categories without a token are rejected with HTTP 401
  test('T0441 | Negative | Verify that categories without a token are rejected with HTTP 401', async ({ unauthApi }) => {
    // Step 1: List without token.
    expectError(await new DietPlanService(unauthApi).listPlanCategories(), 401);
  });

  // Test ID: T0442
  // Test Title: Verify that creating a diet plan item returns HTTP 201 with an id
  test('T0442 | Positive | Verify that creating a diet plan item returns HTTP 201 with an id', async ({ api, cleanup }) => {
    const svc = new DietPlanService(api);
    // Step 1: Setup parent category.
    const catId = await setupCategory(api, cleanup);
    // Step 2: Create item.
    const res = await svc.createPlanItem(itemPayload(catId));
    // Step 3: Verify 201 + cleanup.
    expectOk(res, { status: 201 });
    cleanup.add(`delete pitem ${res.body.data.id}`, async () => svc.removePlanItem(res.body.data.id));
  });

  // Test ID: T0443
  // Test Title: Verify that listing diet plan items returns HTTP 200
  test('T0443 | Positive | Verify that listing diet plan items returns HTTP 200', async ({ api }) => {
    // Step 1: List items.
    expectOk(await new DietPlanService(api).listPlanItems(), { status: 200 });
  });

  // Test ID: T0444
  // Test Title: Verify that a newly created item can be fetched by id with HTTP 200
  test('T0444 | Positive | Verify that a newly created item can be fetched by id with HTTP 200', async ({ api, cleanup }) => {
    const svc = new DietPlanService(api);
    // Step 1: Setup + create item.
    const catId = await setupCategory(api, cleanup);
    const created = await svc.createPlanItem(itemPayload(catId));
    expectOk(created, { status: 201 });
    const id = created.body.data.id;
    cleanup.add(`delete pitem ${id}`, async () => svc.removePlanItem(id));
    // Step 2: Show returns 200.
    expectOk(await svc.showPlanItem(id), { status: 200 });
  });

  // Test ID: T0445
  // Test Title: Verify that fetching a non-existent plan item returns HTTP 404
  test('T0445 | Edge | Verify that fetching a non-existent plan item returns HTTP 404', async ({ api }) => {
    // Step 1: Show non-existent id.
    expectError(await new DietPlanService(api).showPlanItem(999999999), 404);
  });

  // Test ID: T0446
  // Test Title: Verify that updating a plan item with POST returns HTTP 200
  test('T0446 | Positive | Verify that updating a plan item with POST returns HTTP 200', async ({ api, cleanup }) => {
    const svc = new DietPlanService(api);
    // Step 1: Setup + create item.
    const catId = await setupCategory(api, cleanup);
    const created = await svc.createPlanItem(itemPayload(catId));
    expectOk(created, { status: 201 });
    const id = created.body.data.id;
    cleanup.add(`delete pitem ${id}`, async () => svc.removePlanItem(id));
    // Step 2: POST update.
    expectOk(await svc.updatePlanItem(id, itemPayload(catId)), { status: 200 });
  });

  // Test ID: T0447
  // Test Title: Verify that creating a plan item without quantity fields is rejected with HTTP 422
  test('T0447 | Negative | Verify that creating a plan item without quantity fields is rejected with HTTP 422', async ({ api, cleanup }) => {
    const svc = new DietPlanService(api);
    // Step 1: Setup parent category.
    const catId = await setupCategory(api, cleanup);
    // Step 2: Create without required_qty.
    const { required_qty, qty, ...noQty } = itemPayload(catId);
    expectError(await svc.createPlanItem(noQty), 422);
  });

  // Test ID: T0448
  // Test Title: Verify that a plan item can be created and deleted with HTTP 200
  test('T0448 | Positive | Verify that a plan item can be created and deleted with HTTP 200', async ({ api, cleanup }) => {
    const svc = new DietPlanService(api);
    // Step 1: Setup + create item.
    const catId = await setupCategory(api, cleanup);
    const created = await svc.createPlanItem(itemPayload(catId));
    expectOk(created, { status: 201 });
    // Step 2: Delete returns 200.
    expectOk(await svc.removePlanItem(created.body.data.id), { status: 200 });
  });

  // Test ID: T0449
  // Test Title: Verify that listing financial years returns HTTP 200
  test('T0449 | Positive | Verify that listing financial years returns HTTP 200', async ({ api }) => {
    // Step 1: List financial years (read-only — year writes pollute accounting).
    expectOk(await new DietPlanService(api).listFinancialYears(), { status: 200 });
  });

  // Test ID: T0450
  // Test Title: Verify that an existing financial year can be fetched by id with HTTP 200
  test('T0450 | Positive | Verify that an existing financial year can be fetched by id with HTTP 200', async ({ api }) => {
    const svc = new DietPlanService(api);
    // Step 1: Discover any existing year via list (never hardcode seed ids).
    const listed = await svc.listFinancialYears();
    expectOk(listed, { status: 200 });
    const rows = Array.isArray(listed.body?.data) ? listed.body.data : [];
    if (rows.length === 0) throw new Error('No financial years exist — data condition');
    // Step 2: Show first row returns 200.
    expectOk(await svc.showFinancialYear(rows[0].id), { status: 200 });
  });

  // Test ID: T0451
  // Test Title: Verify that fetching a non-existent financial year returns HTTP 404
  test('T0451 | Edge | Verify that fetching a non-existent financial year returns HTTP 404', async ({ api }) => {
    // Step 1: Show non-existent id.
    expectError(await new DietPlanService(api).showFinancialYear(999999999), 404);
  });

  // Test ID: T0452
  // Test Title: Verify that financial years without a token are rejected with HTTP 401
  test('T0452 | Negative | Verify that financial years without a token are rejected with HTTP 401', async ({ unauthApi }) => {
    // Step 1: List without token.
    expectError(await new DietPlanService(unauthApi).listFinancialYears(), 401);
  });
});
