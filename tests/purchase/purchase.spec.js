// Suite: Purchase bills + suppliers
const { test } = require('../../src/fixtures/api.fixture');
const { PurchaseService } = require('../../src/services/purchase.service');
const { buildPurchaseBill, buildSupplier } = require('../../src/data/factories/purchase.factory');
const { expectOk, expectError, expectStatus } = require('../../src/utils/assertions');

test.describe('Purchase bills + suppliers', () => {
  // Test ID: T0157
  // Test Title: Verify that creating a purchase bill returns HTTP 201 with a bill id
  test('T0157 | Positive | Verify that creating a purchase bill returns HTTP 201 with a bill id', async ({ api, cleanup }) => {
    const svc = new PurchaseService(api);
    // Step 1: Create bill.
    const res = await svc.createBill(buildPurchaseBill());
    // Step 2: Verify 201 + id.
    expectOk(res, { status: 201 });
    cleanup.add(`delete bill ${res.body.data.id}`, async () => svc.removeBill(res.body.data.id));
  });

  // Test ID: T0158
  // Test Title: Verify that listing purchase bills returns HTTP 200
  test('T0158 | Positive | Verify that listing purchase bills returns HTTP 200', async ({ api }) => {
    // Step 1: List bills.
    expectOk(await new PurchaseService(api).listBills(), { status: 200 });
  });

  // Test ID: T0159
  // Test Title: Verify that a newly created purchase bill can be fetched by id with HTTP 200
  test('T0159 | Positive | Verify that a newly created purchase bill can be fetched by id with HTTP 200', async ({ api, cleanup }) => {
    const svc = new PurchaseService(api);
    // Step 1: Create bill.
    const created = await svc.createBill(buildPurchaseBill());
    expectOk(created, { status: 201 });
    const id = created.body.data.id;
    cleanup.add(`delete bill ${id}`, async () => svc.removeBill(id));
    // Step 2: Show returns 200.
    expectOk(await svc.showBill(id), { status: 200 });
  });

  // Test ID: T0160
  // Test Title: Verify that fetching a non-existent purchase bill returns HTTP 404
  test('T0160 | Edge | Verify that fetching a non-existent purchase bill returns HTTP 404', async ({ api }) => {
    // Step 1: Show non-existent id.
    expectError(await new PurchaseService(api).showBill(999999999), 404);
  });

  // Test ID: T0161
  // Test Title: Verify that updating a purchase bill with POST returns HTTP 200
  test('T0161 | Positive | Verify that updating a purchase bill with POST returns HTTP 200', async ({ api, cleanup }) => {
    const svc = new PurchaseService(api);
    // Step 1: Create bill.
    const created = await svc.createBill(buildPurchaseBill());
    expectOk(created, { status: 201 });
    const id = created.body.data.id;
    cleanup.add(`delete bill ${id}`, async () => svc.removeBill(id));
    // Step 2: POST full update.
    expectOk(await svc.updateBill(id, buildPurchaseBill()), { status: 200 });
  });

  // Test ID: T0162
  // Test Title: Verify that updating a purchase bill with PUT is rejected with HTTP 405
  test('T0162 | Negative | Verify that updating a purchase bill with PUT is rejected with HTTP 405', async ({ api, cleanup }) => {
    const svc = new PurchaseService(api);
    // Step 1: Create bill.
    const created = await svc.createBill(buildPurchaseBill());
    expectOk(created, { status: 201 });
    const id = created.body.data.id;
    cleanup.add(`delete bill ${id}`, async () => svc.removeBill(id));
    // Step 2: PUT and verify 405.
    const raw = await api.request.put(`${require('../../src/config/env').env.baseURL}/purchases/${id}`, { headers: { Accept: 'application/json' }, data: buildPurchaseBill() });
    expectError(await require('../../src/client/api-client').ApiClient.readJson(raw), 405);
  });

  // Test ID: T0163
  // Test Title: Verify that recording a partial payment on a purchase bill returns HTTP 200
  test('T0163 | Positive | Verify that recording a partial payment on a purchase bill returns HTTP 200', async ({ api, cleanup }) => {
    const svc = new PurchaseService(api);
    // Step 1: Create bill.
    const created = await svc.createBill(buildPurchaseBill());
    expectOk(created, { status: 201 });
    const id = created.body.data.id;
    cleanup.add(`delete bill ${id}`, async () => svc.removeBill(id));
    // Step 2: Pay partial amount.
    expectOk(await svc.payBill(id, { paid_amount: 100, payment_date: '2026-10-16', payment_mode: 1 }), { status: 200 });
  });

  // Test ID: T0164
  // Test Title: Verify that paying a purchase bill without the paid amount field is rejected with HTTP 422
  test('T0164 | Negative | Verify that paying a purchase bill without the paid amount field is rejected with HTTP 422', async ({ api, cleanup }) => {
    const svc = new PurchaseService(api);
    // Step 1: Create bill.
    const created = await svc.createBill(buildPurchaseBill());
    expectOk(created, { status: 201 });
    const id = created.body.data.id;
    cleanup.add(`delete bill ${id}`, async () => svc.removeBill(id));
    // Step 2: Pay without amount field.
    expectError(await svc.payBill(id, { amount: 100, payment_date: '2026-10-16', payment_mode: 1 }), 422);
  });

  // Test ID: T0165
  // Test Title: Verify that deleting an already-deleted purchase bill returns HTTP 404
  test('T0165 | Edge | Verify that deleting an already-deleted purchase bill returns HTTP 404', async ({ api }) => {
    const svc = new PurchaseService(api);
    // Step 1: Create + delete.
    const created = await svc.createBill(buildPurchaseBill());
    expectOk(created, { status: 201 });
    const id = created.body.data.id;
    expectOk(await svc.removeBill(id), { status: 200 });
    // Step 2: Re-delete returns 404.
    expectError(await svc.removeBill(id), 404);
  });

  // Test ID: T0166
  // Test Title: Verify that creating a purchase bill without items is accepted with HTTP 201 (quirk)
  test('T0166 | Edge | Verify that creating a purchase bill without items is accepted with HTTP 201 (quirk)', async ({ api, cleanup }) => {
    const svc = new PurchaseService(api);
    // Step 1: Create without items (accepted — quirk).
    const { items, ...noItems } = buildPurchaseBill();
    const res = await svc.createBill(noItems);
    expectStatus(res, 201, 'Item-less bill accepted (quirk)');
    cleanup.add('delete item-less bill', async () => svc.removeBill(res.body.data.id));
  });

  // Test ID: T0167
  // Test Title: Verify that creating a purchase bill without a token is rejected with HTTP 401
  test('T0167 | Negative | Verify that creating a purchase bill without a token is rejected with HTTP 401', async ({ unauthApi }) => {
    // Step 1: Create without token.
    expectError(await new PurchaseService(unauthApi).createBill(buildPurchaseBill()), 401);
  });

  // Test ID: T0168
  // Test Title: Verify that creating a supplier returns HTTP 201 with a supplier id
  test('T0168 | Positive | Verify that creating a supplier returns HTTP 201 with a supplier id', async ({ api }) => {
    // Step 1: Create supplier (no delete endpoint — row stays).
    expectOk(await new PurchaseService(api).createSupplier(buildSupplier()), { status: 201 });
  });

  // Test ID: T0169
  // Test Title: Verify that listing suppliers returns HTTP 200
  test('T0169 | Positive | Verify that listing suppliers returns HTTP 200', async ({ api }) => {
    // Step 1: List suppliers.
    expectOk(await new PurchaseService(api).listSuppliers(), { status: 200 });
  });

  // Test ID: T0170
  // Test Title: Verify that a newly created supplier can be fetched by id with HTTP 200
  test('T0170 | Positive | Verify that a newly created supplier can be fetched by id with HTTP 200', async ({ api }) => {
    const svc = new PurchaseService(api);
    // Step 1: Create supplier.
    const created = await svc.createSupplier(buildSupplier());
    expectOk(created, { status: 201 });
    // Step 2: Show returns 200.
    expectOk(await svc.showSupplier(created.body.data.id), { status: 200 });
  });

  // Test ID: T0171
  // Test Title: Verify that creating a supplier without a name is rejected with HTTP 422
  test('T0171 | Negative | Verify that creating a supplier without a name is rejected with HTTP 422', async ({ api }) => {
    // Step 1: Create without name.
    const { name, ...noName } = buildSupplier();
    expectError(await new PurchaseService(api).createSupplier(noName), 422);
  });

  // Test ID: T0172
  // Test Title: Verify that fetching a non-existent supplier returns HTTP 404
  test('T0172 | Edge | Verify that fetching a non-existent supplier returns HTTP 404', async ({ api }) => {
    // Step 1: Show non-existent id.
    expectError(await new PurchaseService(api).showSupplier(999999999), 404);
  });
});
