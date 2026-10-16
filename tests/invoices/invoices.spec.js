// Suite: Invoices | create, list, show, delete
const { test } = require('../../src/fixtures/api.fixture');
const { InvoiceService } = require('../../src/services/invoice.service');
const { buildInvoice } = require('../../src/data/factories/invoice.factory');
const { expectOk, expectError, expectSchema, expectStatus } = require('../../src/utils/assertions');
const { invoiceCreateSuccessSchema, invoiceListSuccessSchema } = require('../../src/schemas/billing.schema');

test.describe('Invoices | create, list, show, delete', () => {
  // Test ID: T0033
  // Test Title: Verify that creating an invoice with a valid payload returns HTTP 200 with an invoice id
  test('T0033 | Positive | Verify that creating an invoice with a valid payload returns HTTP 200 with an invoice id', async ({ api, cleanup }) => {
    const svc = new InvoiceService(api);
    // Step 1: Build valid fields.
    const fields = buildInvoice();
    // Step 2: Create invoice.
    const res = await svc.create(fields);
    // Step 3: Verify 200 + schema.
    expectOk(res, { status: 200 });
    expectSchema(invoiceCreateSuccessSchema, res.body, 'Invoice create schema');
    // Step 4: Register cleanup.
    const id = res.body.data.id;
    cleanup.add(`delete invoice ${id}`, async () => svc.remove(id));
  });

  // Test ID: T0034
  // Test Title: Verify that listing invoices returns HTTP 200 with a paginated envelope
  test('T0034 | Positive | Verify that listing invoices returns HTTP 200 with a paginated envelope', async ({ api }) => {
    // Step 1: List first page.
    const res = await new InvoiceService(api).list({ page: 1, per_page: 5 });
    // Step 2: Verify 200 + schema (no SLA — heavy join, flakes under load).
    expectStatus(res, 200, 'Invoice list');
    expectSchema(invoiceListSuccessSchema, res.body, 'Invoice list schema');
  });

  // Test ID: T0035
  // Test Title: Verify that a newly created invoice can be fetched by id with HTTP 200
  test('T0035 | Positive | Verify that a newly created invoice can be fetched by id with HTTP 200', async ({ api, cleanup }) => {
    const svc = new InvoiceService(api);
    // Step 1: Create invoice.
    const created = await svc.create(buildInvoice());
    expectOk(created, { status: 200 });
    const id = created.body.data.id;
    cleanup.add(`delete invoice ${id}`, async () => svc.remove(id));
    // Step 2: Fetch it back.
    const fetched = await svc.show(id);
    // Step 3: Verify 200.
    expectOk(fetched, { status: 200 });
  });

  // Test ID: T0036
  // Test Title: Verify that creating an invoice without an invoice number is rejected with HTTP 422
  test('T0036 | Negative | Verify that creating an invoice without an invoice number is rejected with HTTP 422', async ({ api }) => {
    // Step 1: Build fields without invoice_number.
    const fields = buildInvoice();
    delete fields.invoice_number;
    // Step 2: Create and verify 422.
    const res = await new InvoiceService(api).create(fields);
    expectError(res, 422);
  });

  // Test ID: T0037
  // Test Title: Verify that creating an invoice without items is rejected with HTTP 422
  test('T0037 | Negative | Verify that creating an invoice without items is rejected with HTTP 422', async ({ api }) => {
    // Step 1: Build fields without items keys.
    const fields = buildInvoice();
    Object.keys(fields).filter((k) => k.startsWith('items')).forEach((k) => delete fields[k]);
    // Step 2: Create and verify 422.
    const res = await new InvoiceService(api).create(fields);
    expectError(res, 422);
  });

  // Test ID: T0038
  // Test Title: Verify that creating an invoice without a token is rejected with HTTP 401
  test('T0038 | Negative | Verify that creating an invoice without a token is rejected with HTTP 401', async ({ unauthApi }) => {
    // Step 1: Create without token.
    const res = await new InvoiceService(unauthApi).create(buildInvoice());
    // Step 2: Verify 401.
    expectError(res, 401);
  });

  // Test ID: T0039
  // Test Title: Verify that fetching a non-existent invoice returns HTTP 200 with empty data and never 500
  test('T0039 | Edge | Verify that fetching a non-existent invoice returns HTTP 200 with empty data and never 500', async ({ api }) => {
    // Step 1: Fetch non-existent id.
    const res = await new InvoiceService(api).show(999999999);
    // Step 2: Verify 200, never 500.
    expectStatus(res, 200, 'Missing invoice should return 200 (API quirk)');
    if (res.status >= 500) throw new Error(`Caused 5xx: ${res.status}`);
  });

  // Test ID: T0040
  // Test Title: Verify that creating an invoice with zero quantity never causes an HTTP 500 server error
  test('T0040 | Boundary | Verify that creating an invoice with zero quantity never causes an HTTP 500 server error', async ({ api, cleanup }) => {
    // Step 1: Build invoice with quantity 0.
    const fields = buildInvoice({ 'items[0][quantity]': 0, 'items[0][net_amount]': 0 });
    // Step 2: Create and verify no 5xx.
    const res = await new InvoiceService(api).create(fields);
    if (res.status >= 500) throw new Error(`quantity=0 caused 5xx: ${JSON.stringify(res.body)?.slice(0, 300)}`);
    const id = res.body?.data?.id;
    if (id) cleanup.add(`delete invoice ${id}`, async () => new InvoiceService(api).remove(id));
  });

  // Test ID: T0094
  // Test Title: Verify that updating an invoice with POST changes the remarks and returns HTTP 200
  test('T0094 | Positive | Verify that updating an invoice with POST changes the remarks and returns HTTP 200', async ({ api, cleanup }) => {
    const svc = new InvoiceService(api);
    // Step 1: Create invoice.
    const fields = buildInvoice();
    const created = await svc.create(fields);
    expectOk(created, { status: 200 });
    const id = created.body.data.id;
    cleanup.add(`delete invoice ${id}`, async () => svc.remove(id));
    // Step 2: POST full update with remarks.
    expectOk(await svc.update(id, { ...fields, remarks: 'Updated remarks' }), { status: 200 });
    // Step 3: Fetch and verify 200.
    expectOk(await svc.show(id), { status: 200 });
  });

  // Test ID: T0095
  // Test Title: Verify that updating an invoice without items is rejected with HTTP 422
  test('T0095 | Negative | Verify that updating an invoice without items is rejected with HTTP 422', async ({ api, cleanup }) => {
    const svc = new InvoiceService(api);
    // Step 1: Create invoice.
    const created = await svc.create(buildInvoice());
    expectOk(created, { status: 200 });
    const id = created.body.data.id;
    cleanup.add(`delete invoice ${id}`, async () => svc.remove(id));
    // Step 2: Update without items, verify 422.
    const fields = buildInvoice();
    Object.keys(fields).filter((k) => k.startsWith('items')).forEach((k) => delete fields[k]);
    expectError(await svc.update(id, fields), 422);
  });

  // Test ID: T0096
  // Test Title: Verify that updating an invoice with PUT is rejected with HTTP 405
  test('T0096 | Negative | Verify that updating an invoice with PUT is rejected with HTTP 405', async ({ api, cleanup }) => {
    const svc = new InvoiceService(api);
    // Step 1: Create invoice.
    const created = await svc.create(buildInvoice());
    expectOk(created, { status: 200 });
    const id = created.body.data.id;
    cleanup.add(`delete invoice ${id}`, async () => svc.remove(id));
    // Step 2: PUT update and verify 405.
    const raw = await api.request.put(`${require('../../src/config/env').env.baseURL}/invoice/${id}`, { headers: { Accept: 'application/json' }, multipart: buildInvoice() });
    expectError(await require('../../src/client/api-client').ApiClient.readJson(raw), 405);
  });

  // Test ID: T0097
  // Test Title: Verify that paying an already-paid invoice is rejected with HTTP 422
  test('T0097 | Negative | Verify that paying an already-paid invoice is rejected with HTTP 422', async ({ api, cleanup }) => {
    const svc = new InvoiceService(api);
    // Step 1: Create invoice (auto-paid, balance 0).
    const created = await svc.create(buildInvoice());
    expectOk(created, { status: 200 });
    const id = created.body.data.id;
    cleanup.add(`delete invoice ${id}`, async () => svc.remove(id));
    // Step 2: Pay returns 422 (nothing outstanding).
    expectError(await svc.pay(id, { amount: 200, payment_date: '2026-10-16', payment_mode: 1 }), 422);
  });

  // Test ID: T0098
  // Test Title: Verify that paying an invoice with a zero amount is rejected with HTTP 422
  test('T0098 | Boundary | Verify that paying an invoice with a zero amount is rejected with HTTP 422', async ({ api, cleanup }) => {
    const svc = new InvoiceService(api);
    // Step 1: Create invoice.
    const created = await svc.create(buildInvoice());
    expectOk(created, { status: 200 });
    const id = created.body.data.id;
    cleanup.add(`delete invoice ${id}`, async () => svc.remove(id));
    // Step 2: Pay 0 violates minimum 0.01.
    expectError(await svc.pay(id, { amount: 0, payment_date: '2026-10-16', payment_mode: 1 }), 422);
  });

  // Test ID: T0099
  // Test Title: Verify that paying an invoice without a payment mode is rejected with HTTP 422
  test('T0099 | Negative | Verify that paying an invoice without a payment mode is rejected with HTTP 422', async ({ api, cleanup }) => {
    const svc = new InvoiceService(api);
    // Step 1: Create invoice.
    const created = await svc.create(buildInvoice());
    expectOk(created, { status: 200 });
    const id = created.body.data.id;
    cleanup.add(`delete invoice ${id}`, async () => svc.remove(id));
    // Step 2: Pay without mode.
    expectError(await svc.pay(id, { amount: 100, payment_date: '2026-10-16' }), 422);
  });

  // Test ID: T0100
  // Test Title: Verify that paying a non-existent invoice is never accepted with HTTP 200
  test('T0100 | Edge | Verify that paying a non-existent invoice is never accepted with HTTP 200', async ({ api }) => {
    // Step 1: Pay non-existent invoice.
    const res = await new InvoiceService(api).pay(999999999, { amount: 100, payment_date: '2026-10-16', payment_mode: 1 });
    // Step 2: Verify never 200 (live API 500s — server bug, should be 404).
    if (res.status === 200) throw new Error('Pay on missing invoice was accepted');
  });

  // Test ID: T0101
  // Test Title: Verify that cancelling a fresh invoice returns HTTP 200
  test('T0101 | Positive | Verify that cancelling a fresh invoice returns HTTP 200', async ({ api }) => {
    const svc = new InvoiceService(api);
    // Step 1: Create invoice.
    const created = await svc.create(buildInvoice());
    expectOk(created, { status: 200 });
    const id = created.body.data.id;
    // Step 2: Cancel returns 200.
    expectOk(await svc.cancel(id), { status: 200 });
    // Step 3: Delete cancelled row for cleanup.
    expectOk(await svc.remove(id), { status: 200 });
  });

  // Test ID: T0102
  // Test Title: Verify that cancelling a non-existent invoice returns HTTP 422 instead of the documented 404
  test('T0102 | Edge | Verify that cancelling a non-existent invoice returns HTTP 422 instead of the documented 404', async ({ api }) => {
    // Step 1: Cancel non-existent id.
    const res = await new InvoiceService(api).cancel(999999999);
    // Step 2: Verify 422 quirk (docs claim 404).
    expectError(res, 422);
  });

  // Test ID: T0103
  // Test Title: Verify that paying a cancelled invoice is rejected with HTTP 422
  test('T0103 | Negative | Verify that paying a cancelled invoice is rejected with HTTP 422', async ({ api }) => {
    const svc = new InvoiceService(api);
    // Step 1: Create and cancel.
    const created = await svc.create(buildInvoice());
    expectOk(created, { status: 200 });
    const id = created.body.data.id;
    expectOk(await svc.cancel(id), { status: 200 });
    // Step 2: Pay cancelled returns 422.
    expectError(await svc.pay(id, { amount: 100, payment_date: '2026-10-16', payment_mode: 1 }), 422);
    // Step 3: Cleanup.
    await svc.remove(id);
  });

  // Test ID: T0104
  // Test Title: Verify that creating an invoice with a negative unit price is rejected with HTTP 422
  test('T0104 | Boundary | Verify that creating an invoice with a negative unit price is rejected with HTTP 422', async ({ api }) => {
    // Step 1: Create with negative prices.
    const res = await new InvoiceService(api).create(buildInvoice({ 'items[0][unit_price]': -100, 'items[0][net_amount]': -100 }));
    // Step 2: Verify 422.
    expectError(res, 422);
  });

  // Test ID: T0105
  // Test Title: Verify that creating an invoice with a 200-character invoice number is rejected with HTTP 422
  test('T0105 | Boundary | Verify that creating an invoice with a 200-character invoice number is rejected with HTTP 422', async ({ api }) => {
    // Step 1: Create with 200-char number (max 150).
    const res = await new InvoiceService(api).create(buildInvoice({ invoice_number: 'I'.repeat(200) }));
    // Step 2: Verify 422.
    expectError(res, 422);
  });

  // Test ID: T0106
  // Test Title: Verify that creating an invoice with a non-date string is rejected with HTTP 422
  test('T0106 | Negative | Verify that creating an invoice with a non-date string is rejected with HTTP 422', async ({ api }) => {
    // Step 1: Create with non-date string.
    const res = await new InvoiceService(api).create(buildInvoice({ invoice_date: 'not-a-date' }));
    // Step 2: Verify 422.
    expectError(res, 422);
  });

  // Test ID: T0244
  // Test Title: Verify that refunding part of an invoice returns HTTP 200
  test('T0244 | Positive | Verify that refunding part of an invoice returns HTTP 200', async ({ api, cleanup }) => {
    const svc = new InvoiceService(api);
    // Step 1: Create invoice.
    const created = await svc.create(buildInvoice());
    expectOk(created, { status: 200 });
    const id = created.body.data.id;
    cleanup.add(`delete invoice ${id}`, async () => svc.remove(id));
    // Step 2: Refund 100 of 500.
    expectOk(await svc.refund({ invoice_id: id, amount: 100, date: '2026-10-16', payment_mode: 1 }), { status: 200 });
  });

  // Test ID: T0245
  // Test Title: Verify that refunding more than the invoice total is accepted with HTTP 200 (missing over-refund check)
  test('T0245 | Edge | Verify that refunding more than the invoice total is accepted with HTTP 200 (missing over-refund check)', async ({ api, cleanup }) => {
    const svc = new InvoiceService(api);
    // Step 1: Create 500 invoice.
    const created = await svc.create(buildInvoice());
    expectOk(created, { status: 200 });
    const id = created.body.data.id;
    cleanup.add(`delete invoice ${id}`, async () => svc.remove(id));
    // Step 2: Refund 99999 — lethal money gap, no balance check.
    expectOk(await svc.refund({ invoice_id: id, amount: 99999, date: '2026-10-16', payment_mode: 1 }), { status: 200 });
  });

  // Test ID: T0246
  // Test Title: Verify that refunding a non-existent invoice is rejected with HTTP 422
  test('T0246 | Negative | Verify that refunding a non-existent invoice is rejected with HTTP 422', async ({ api }) => {
    // Step 1: Refund unknown invoice.
    expectError(await new InvoiceService(api).refund({ invoice_id: 999999999, amount: 100, date: '2026-10-16', payment_mode: 1 }), 422);
  });

  // Test ID: T0247
  // Test Title: Verify that refunding without an amount is rejected with HTTP 422
  test('T0247 | Negative | Verify that refunding without an amount is rejected with HTTP 422', async ({ api, cleanup }) => {
    const svc = new InvoiceService(api);
    // Step 1: Create invoice.
    const created = await svc.create(buildInvoice());
    expectOk(created, { status: 200 });
    const id = created.body.data.id;
    cleanup.add(`delete invoice ${id}`, async () => svc.remove(id));
    // Step 2: Refund without amount.
    expectError(await svc.refund({ invoice_id: id, date: '2026-10-16', payment_mode: 1 }), 422);
  });

  // Test ID: T0248
  // Test Title: Verify that refunding without a token is rejected with HTTP 401
  test('T0248 | Negative | Verify that refunding without a token is rejected with HTTP 401', async ({ unauthApi }) => {
    // Step 1: Refund without token.
    expectError(await new InvoiceService(unauthApi).refund({ invoice_id: 1, amount: 100, date: '2026-10-16', payment_mode: 1 }), 401);
  });
});
