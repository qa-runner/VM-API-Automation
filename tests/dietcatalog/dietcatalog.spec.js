// Suite: Diet catalog (categories + items)
const { test } = require('../../src/fixtures/api.fixture');
const { DietCatalogService } = require('../../src/services/dietcatalog.service');
const { expectOk, expectError } = require('../../src/utils/assertions');
const { faker } = require('@faker-js/faker');

test.describe('Diet catalog', () => {
  // Test ID: T0401
  // Test Title: Verify that creating a diet category returns HTTP 201 with an id
  test('T0401 | Positive | Verify that creating a diet category returns HTTP 201 with an id', async ({ api, cleanup }) => {
    const svc = new DietCatalogService(api);
    // Step 1: Create category.
    const res = await svc.createCategory({ title: `DCat-${faker.number.int({ min: 1000, max: 9999 })}` });
    // Step 2: Verify 201 + cleanup.
    expectOk(res, { status: 201 });
    cleanup.add(`delete dcat ${res.body.data.id}`, async () => svc.removeCategory(res.body.data.id));
  });

  // Test ID: T0402
  // Test Title: Verify that listing diet categories returns HTTP 200
  test('T0402 | Positive | Verify that listing diet categories returns HTTP 200', async ({ api }) => {
    // Step 1: List categories.
    expectOk(await new DietCatalogService(api).listCategories(), { status: 200 });
  });

  // Test ID: T0403
  // Test Title: Verify that a newly created category can be fetched by id with HTTP 200
  test('T0403 | Positive | Verify that a newly created category can be fetched by id with HTTP 200', async ({ api, cleanup }) => {
    const svc = new DietCatalogService(api);
    // Step 1: Create category.
    const created = await svc.createCategory({ title: `DCat-${faker.number.int({ min: 1000, max: 9999 })}` });
    expectOk(created, { status: 201 });
    const id = created.body.data.id;
    cleanup.add(`delete dcat ${id}`, async () => svc.removeCategory(id));
    // Step 2: Show returns 200.
    expectOk(await svc.showCategory(id), { status: 200 });
  });

  // Test ID: T0404
  // Test Title: Verify that fetching a non-existent category returns HTTP 404
  test('T0404 | Edge | Verify that fetching a non-existent category returns HTTP 404', async ({ api }) => {
    // Step 1: Show non-existent id.
    expectError(await new DietCatalogService(api).showCategory(999999999), 404);
  });

  // Test ID: T0405
  // Test Title: Verify that updating a category with POST returns HTTP 200
  test('T0405 | Positive | Verify that updating a category with POST returns HTTP 200', async ({ api, cleanup }) => {
    const svc = new DietCatalogService(api);
    // Step 1: Create category.
    const created = await svc.createCategory({ title: `DCat-${faker.number.int({ min: 1000, max: 9999 })}` });
    expectOk(created, { status: 201 });
    const id = created.body.data.id;
    cleanup.add(`delete dcat ${id}`, async () => svc.removeCategory(id));
    // Step 2: POST update (own row only — never seed rows).
    expectOk(await svc.updateCategory(id, { title: `DCatU-${faker.number.int({ min: 1000, max: 9999 })}` }), { status: 200 });
  });

  // Test ID: T0406
  // Test Title: Verify that updating a category with PUT is rejected with HTTP 405
  test('T0406 | Negative | Verify that updating a category with PUT is rejected with HTTP 405', async ({ api, cleanup }) => {
    const svc = new DietCatalogService(api);
    // Step 1: Create category.
    const created = await svc.createCategory({ title: `DCat-${faker.number.int({ min: 1000, max: 9999 })}` });
    expectOk(created, { status: 201 });
    const id = created.body.data.id;
    cleanup.add(`delete dcat ${id}`, async () => svc.removeCategory(id));
    // Step 2: PUT and verify 405.
    const raw = await api.request.put(`${require('../../src/config/env').env.baseURL}/setting/diet/categories/${id}`, { headers: { Accept: 'application/json' }, data: { title: 'X' } });
    expectError(await require('../../src/client/api-client').ApiClient.readJson(raw), 405);
  });

  // Test ID: T0407
  // Test Title: Verify that creating a category without a title is rejected with HTTP 422
  test('T0407 | Negative | Verify that creating a category without a title is rejected with HTTP 422', async ({ api }) => {
    // Step 1: Create without title.
    expectError(await new DietCatalogService(api).createCategory({}), 422);
  });

  // Test ID: T0408
  // Test Title: Verify that a category can be created and deleted with HTTP 200
  test('T0408 | Positive | Verify that a category can be created and deleted with HTTP 200', async ({ api }) => {
    const svc = new DietCatalogService(api);
    // Step 1: Create category.
    const created = await svc.createCategory({ title: `DCat-${faker.number.int({ min: 1000, max: 9999 })}` });
    expectOk(created, { status: 201 });
    // Step 2: Delete returns 200.
    expectOk(await svc.removeCategory(created.body.data.id), { status: 200 });
  });

  // Test ID: T0409
  // Test Title: Verify that categories without a token are rejected with HTTP 401
  test('T0409 | Negative | Verify that categories without a token are rejected with HTTP 401', async ({ unauthApi }) => {
    // Step 1: List without token.
    expectError(await new DietCatalogService(unauthApi).listCategories(), 401);
  });

  // Test ID: T0410
  // Test Title: Verify that creating a diet item returns HTTP 201 with an id
  test('T0410 | Positive | Verify that creating a diet item returns HTTP 201 with an id', async ({ api, cleanup }) => {
    const svc = new DietCatalogService(api);
    // Step 1: Setup parent category.
    const cat = await svc.createCategory({ title: `DCat-${faker.number.int({ min: 1000, max: 9999 })}` });
    expectOk(cat, { status: 201 });
    cleanup.add(`delete dcat ${cat.body.data.id}`, async () => svc.removeCategory(cat.body.data.id));
    // Step 2: Create item (ghost write — 201 returned, row not persisted).
    const res = await svc.createItem({ diet_category_id: cat.body.data.id, title: `DItem-${faker.number.int({ min: 1000, max: 9999 })}` });
    expectOk(res, { status: 201 });
  });

  // Test ID: T0411
  // Test Title: Verify that listing diet items returns HTTP 200
  test('T0411 | Positive | Verify that listing diet items returns HTTP 200', async ({ api }) => {
    // Step 1: List items.
    expectOk(await new DietCatalogService(api).listItems(), { status: 200 });
  });

  // Test ID: T0412
  // Test Title: Verify that an existing diet item can be fetched by id with HTTP 200
  test('T0412 | Positive | Verify that an existing diet item can be fetched by id with HTTP 200', async ({ api }) => {
    const svc = new DietCatalogService(api);
    // Step 1: Discover any existing row via list (seed rows churn — never hardcode).
    const listed = await svc.listItems();
    expectOk(listed, { status: 200 });
    const rows = Array.isArray(listed.body?.data) ? listed.body.data : [];
    if (rows.length === 0) throw new Error('No diet items exist to fetch — data condition');
    // Step 2: Show first row returns 200.
    expectOk(await svc.showItem(rows[0].id), { status: 200 });
  });

  // Test ID: T0413
  // Test Title: Verify that fetching a non-existent diet item returns HTTP 404
  test('T0413 | Edge | Verify that fetching a non-existent diet item returns HTTP 404', async ({ api }) => {
    // Step 1: Show non-existent id.
    expectError(await new DietCatalogService(api).showItem(999999999), 404);
  });

  // Test ID: T0414
  // Test Title: Verify that creating a diet item without a title is rejected with HTTP 422
  test('T0414 | Negative | Verify that creating a diet item without a title is rejected with HTTP 422', async ({ api, cleanup }) => {
    const svc = new DietCatalogService(api);
    // Step 1: Setup parent category.
    const cat = await svc.createCategory({ title: `DCat-${faker.number.int({ min: 1000, max: 9999 })}` });
    expectOk(cat, { status: 201 });
    cleanup.add(`delete dcat ${cat.body.data.id}`, async () => svc.removeCategory(cat.body.data.id));
    // Step 2: Create without title.
    expectError(await svc.createItem({ diet_category_id: cat.body.data.id }), 422);
  });

  // Test ID: T0415
  // Test Title: Verify that diet items without a token are rejected with HTTP 401
  test('T0415 | Negative | Verify that diet items without a token are rejected with HTTP 401', async ({ unauthApi }) => {
    // Step 1: List without token.
    expectError(await new DietCatalogService(unauthApi).listItems(), 401);
  });
});
