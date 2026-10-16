// Suite: Purchase orders + returns
const { test } = require('../../src/fixtures/api.fixture');
const { ProcService } = require('../../src/services/proc.service');
const { PurchaseService } = require('../../src/services/purchase.service');
const { buildPurchaseBill } = require('../../src/data/factories/purchase.factory');
const { expectOk, expectError } = require('../../src/utils/assertions');
const { faker } = require('@faker-js/faker');

function orderPayload(overrides = {}) {
  return {
    supplier_id: 3,
    po_date: '2026-10-16',
    status: 0,
    generated_by: 9,
    ship_to_branch_id: 8,
    items: [{ medicine_id: 1, company_id: 1, qty: 50, unit_cost: 40 }],
    ...overrides,
  };
}

test.describe('Purchase orders + returns', () => {
  // Test ID: T0260
  // Test Title: Verify that creating a purchase order returns HTTP 201 with an order id
  test('T0260 | Positive | Verify that creating a purchase order returns HTTP 201 with an order id', async ({ api, cleanup }) => {
    const svc = new ProcService(api);
    // Step 1: Create order.
    const res = await svc.createOrder(orderPayload());
    // Step 2: Verify 201 + cleanup.
    expectOk(res, { status: 201 });
    cleanup.add(`delete order ${res.body.data.id}`, async () => svc.removeOrder(res.body.data.id));
  });

  // Test ID: T0261
  // Test Title: Verify that listing purchase orders returns HTTP 200
  test('T0261 | Positive | Verify that listing purchase orders returns HTTP 200', async ({ api }) => {
    // Step 1: List orders.
    expectOk(await new ProcService(api).listOrders(), { status: 200 });
  });

  // Test ID: T0262
  // Test Title: Verify that a newly created order can be fetched by id with HTTP 200
  test('T0262 | Positive | Verify that a newly created order can be fetched by id with HTTP 200', async ({ api, cleanup }) => {
    const svc = new ProcService(api);
    // Step 1: Create order.
    const created = await svc.createOrder(orderPayload());
    expectOk(created, { status: 201 });
    const id = created.body.data.id;
    cleanup.add(`delete order ${id}`, async () => svc.removeOrder(id));
    // Step 2: Show returns 200.
    expectOk(await svc.showOrder(id), { status: 200 });
  });

  // Test ID: T0263
  // Test Title: Verify that fetching a non-existent order returns HTTP 404
  test('T0263 | Edge | Verify that fetching a non-existent order returns HTTP 404', async ({ api }) => {
    // Step 1: Show non-existent id.
    expectError(await new ProcService(api).showOrder(999999999), 404);
  });

  // Test ID: T0264
  // Test Title: Verify that updating an order with POST returns HTTP 200
  test('T0264 | Positive | Verify that updating an order with POST returns HTTP 200', async ({ api, cleanup }) => {
    const svc = new ProcService(api);
    // Step 1: Create order.
    const created = await svc.createOrder(orderPayload());
    expectOk(created, { status: 201 });
    const id = created.body.data.id;
    cleanup.add(`delete order ${id}`, async () => svc.removeOrder(id));
    // Step 2: POST update.
    expectOk(await svc.updateOrder(id, orderPayload()), { status: 200 });
  });

  // Test ID: T0265
  // Test Title: Verify that updating an order with PUT is rejected with HTTP 405
  test('T0265 | Negative | Verify that updating an order with PUT is rejected with HTTP 405', async ({ api, cleanup }) => {
    const svc = new ProcService(api);
    // Step 1: Create order.
    const created = await svc.createOrder(orderPayload());
    expectOk(created, { status: 201 });
    const id = created.body.data.id;
    cleanup.add(`delete order ${id}`, async () => svc.removeOrder(id));
    // Step 2: PUT and verify 405.
    const raw = await api.request.put(`${require('../../src/config/env').env.baseURL}/purchase-order/${id}`, { headers: { Accept: 'application/json' }, data: orderPayload() });
    expectError(await require('../../src/client/api-client').ApiClient.readJson(raw), 405);
  });

  // Test ID: T0266
  // Test Title: Verify that creating an order without ship-to branch is rejected with HTTP 422
  test('T0266 | Negative | Verify that creating an order without ship-to branch is rejected with HTTP 422', async ({ api }) => {
    // Step 1: Create without ship_to_branch_id.
    const { ship_to_branch_id, ...noShip } = orderPayload();
    expectError(await new ProcService(api).createOrder(noShip), 422);
  });

  // Test ID: T0267
  // Test Title: Verify that deleting an already-deleted order returns HTTP 404
  test('T0267 | Edge | Verify that deleting an already-deleted order returns HTTP 404', async ({ api }) => {
    const svc = new ProcService(api);
    // Step 1: Create + delete.
    const created = await svc.createOrder(orderPayload());
    expectOk(created, { status: 201 });
    const id = created.body.data.id;
    expectOk(await svc.removeOrder(id), { status: 200 });
    // Step 2: Re-delete returns 404.
    expectError(await svc.removeOrder(id), 404);
  });

  // Test ID: T0268
  // Test Title: Verify that prefill data for an order returns HTTP 200
  test('T0268 | Positive | Verify that prefill data for an order returns HTTP 200', async ({ api, cleanup }) => {
    const svc = new ProcService(api);
    // Step 1: Create order.
    const created = await svc.createOrder(orderPayload());
    expectOk(created, { status: 201 });
    const id = created.body.data.id;
    cleanup.add(`delete order ${id}`, async () => svc.removeOrder(id));
    // Step 2: Prefill returns 200.
    expectOk(await svc.prefillOrder(id), { status: 200 });
  });

  // Test ID: T0269
  // Test Title: Verify that converting an order creates a linked bill with HTTP 201
  test('T0269 | Positive | Verify that converting an order creates a linked bill with HTTP 201', async ({ api, cleanup }) => {
    const svc = new ProcService(api);
    const bills = new PurchaseService(api);
    // Step 1: Create order.
    const created = await svc.createOrder(orderPayload());
    expectOk(created, { status: 201 });
    const oid = created.body.data.id;
    // Step 2: Convert to bill.
    const conv = await svc.orderToBill(oid);
    expectOk(conv, { status: 201 });
    // Step 3: Cleanup converted bill (id in response, fallback to order delete).
    const bid = conv.body?.data?.id;
    if (bid) cleanup.add(`delete converted bill ${bid}`, async () => bills.removeBill(bid));
    cleanup.add(`delete order ${oid}`, async () => svc.removeOrder(oid));
  });

  // Test ID: T0270
  // Test Title: Verify that orders without a token are rejected with HTTP 401
  test('T0270 | Negative | Verify that orders without a token are rejected with HTTP 401', async ({ unauthApi }) => {
    // Step 1: List without token.
    expectError(await new ProcService(unauthApi).listOrders(), 401);
  });

  // Test ID: T0271
  // Test Title: Verify that returning part of a bill item returns HTTP 201
  test('T0271 | Positive | Verify that returning part of a bill item returns HTTP 201', async ({ api, cleanup }) => {
    const bills = new PurchaseService(api);
    const svc = new ProcService(api);
    // Step 1: Create bill with 10 qty.
    const created = await bills.createBill(buildPurchaseBill());
    expectOk(created, { status: 201 });
    const bid = created.body.data.id;
    cleanup.add(`delete bill ${bid}`, async () => bills.removeBill(bid));
    // Step 2: Find item id via show.
    const shown = await bills.showBill(bid);
    expectOk(shown, { status: 200 });
    const itemId = shown.body.data.items?.[0]?.id || shown.body.data.data?.items?.[0]?.id;
    // Step 3: Return 2 of 10 (new_qty 8).
    expectOk(await svc.returnItem({ purchase_bill_id: bid, purchase_bill_item_id: itemId, reason: 'supplier_return', qty: 2, new_qty: 8 }), { status: 201 });
  });

  // Test ID: T0272
  // Test Title: Verify that listing purchase returns returns HTTP 200
  test('T0272 | Positive | Verify that listing purchase returns returns HTTP 200', async ({ api }) => {
    // Step 1: List returns.
    expectOk(await new ProcService(api).listReturns(), { status: 200 });
  });

  // Test ID: T0273
  // Test Title: Verify that returns for a bill return HTTP 200
  test('T0273 | Positive | Verify that returns for a bill return HTTP 200', async ({ api, cleanup }) => {
    const bills = new PurchaseService(api);
    const svc = new ProcService(api);
    // Step 1: Create bill.
    const created = await bills.createBill(buildPurchaseBill());
    expectOk(created, { status: 201 });
    const bid = created.body.data.id;
    cleanup.add(`delete bill ${bid}`, async () => bills.removeBill(bid));
    // Step 2: Returns by bill (empty list is fine).
    expectOk(await svc.returnsByBill(bid), { status: 200 });
  });

  // Test ID: T0274
  // Test Title: Verify that return without bill ids is rejected with HTTP 422
  test('T0274 | Negative | Verify that return without bill ids is rejected with HTTP 422', async ({ api }) => {
    // Step 1: Item action without ids.
    const res = await new ProcService(api).returnItem({ reason: 'supplier_return', qty: 1, new_qty: 1 });
    expectError(res, 422);
  });
});
