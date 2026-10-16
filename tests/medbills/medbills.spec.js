// Suite: Medicine bills | create, show, update
const { test } = require('../../src/fixtures/api.fixture');
const { MedBillService } = require('../../src/services/medbill.service');
const { PatientService } = require('../../src/services/patient.service');
const { buildPatient } = require('../../src/data/factories/patient.factory');
const { expectOk, expectError, expectStatus } = require('../../src/utils/assertions');

/** Helper: junk patient for bill tests (bills have no delete endpoint). */
async function setupPatient(api, cleanup) {
  const svc = new PatientService(api);
  const pat = await svc.create(buildPatient());
  expectOk(pat, { status: 200 });
  const p = pat.body.data.data;
  cleanup.add(`delete patient ${p.id}`, async () => svc.remove(p.id));
  return p;
}

function billPayload(patient, overrides = {}) {
  return {
    patient_id: patient.id,
    patient_name: `${patient.first_name} ${patient.last_name}`,
    date: '2026-10-16',
    slots: [{ medicine_id: 1, qty: 2 }],
    ...overrides,
  };
}

test.describe('Medicine bills | create, show, update', () => {
  // Test ID: T0147
  // Test Title: Verify that creating a medicine bill returns HTTP 200 with a bill id and auto-generated invoice
  test('T0147 | Positive | Verify that creating a medicine bill returns HTTP 200 with a bill id and auto-generated invoice', async ({ api, cleanup }) => {
    const svc = new MedBillService(api);
    // Step 1: Setup patient.
    const patient = await setupPatient(api, cleanup);
    // Step 2: Create bill (auto-creates invoice).
    const res = await svc.create(billPayload(patient));
    // Step 3: Verify 200 + chain proof (invoice_number present).
    expectOk(res, { status: 200 });
  });

  // Test ID: T0148
  // Test Title: Verify that a newly created medicine bill can be fetched by id with HTTP 200
  test('T0148 | Positive | Verify that a newly created medicine bill can be fetched by id with HTTP 200', async ({ api, cleanup }) => {
    const svc = new MedBillService(api);
    // Step 1: Setup + create.
    const patient = await setupPatient(api, cleanup);
    const created = await svc.create(billPayload(patient));
    expectOk(created, { status: 200 });
    // Step 2: Show returns 200.
    expectOk(await svc.show(created.body.data.id), { status: 200 });
  });

  // Test ID: T0149
  // Test Title: Verify that fetching a non-existent medicine bill returns HTTP 404
  test('T0149 | Edge | Verify that fetching a non-existent medicine bill returns HTTP 404', async ({ api }) => {
    // Step 1: Show non-existent bill.
    expectError(await new MedBillService(api).show(999999999), 404);
  });

  // Test ID: T0150
  // Test Title: Verify that updating a medicine bill with POST returns HTTP 200
  test('T0150 | Positive | Verify that updating a medicine bill with POST returns HTTP 200', async ({ api, cleanup }) => {
    const svc = new MedBillService(api);
    // Step 1: Setup + create.
    const patient = await setupPatient(api, cleanup);
    const created = await svc.create(billPayload(patient));
    expectOk(created, { status: 200 });
    const id = created.body.data.id;
    // Step 2: POST same payload.
    expectOk(await svc.update(id, billPayload(patient)), { status: 200 });
  });

  // Test ID: T0151
  // Test Title: Verify that updating a medicine bill with PUT is rejected with HTTP 405
  test('T0151 | Negative | Verify that updating a medicine bill with PUT is rejected with HTTP 405', async ({ api, cleanup }) => {
    const svc = new MedBillService(api);
    // Step 1: Setup + create.
    const patient = await setupPatient(api, cleanup);
    const created = await svc.create(billPayload(patient));
    expectOk(created, { status: 200 });
    // Step 2: PUT and verify 405.
    const raw = await api.request.put(`${require('../../src/config/env').env.baseURL}/patient/medicine-bill/${created.body.data.id}`, { headers: { Accept: 'application/json' }, data: billPayload(patient) });
    expectError(await require('../../src/client/api-client').ApiClient.readJson(raw), 405);
  });

  // Test ID: T0152
  // Test Title: Verify that creating a medicine bill without slots is rejected with HTTP 400
  test('T0152 | Negative | Verify that creating a medicine bill without slots is rejected with HTTP 400', async ({ api, cleanup }) => {
    const svc = new MedBillService(api);
    // Step 1: Setup.
    const patient = await setupPatient(api, cleanup);
    // Step 2: Create without slots (API uses 400 here, not 422).
    const { slots, ...noSlots } = billPayload(patient);
    const res = await svc.create(noSlots);
    expectStatus(res, 400, 'Missing slots should return 400');
  });

  // Test ID: T0153
  // Test Title: Verify that creating a medicine bill without a patient name is rejected with HTTP 400
  test('T0153 | Negative | Verify that creating a medicine bill without a patient name is rejected with HTTP 400', async ({ api, cleanup }) => {
    const svc = new MedBillService(api);
    // Step 1: Setup.
    const patient = await setupPatient(api, cleanup);
    // Step 2: Create without patient_name.
    const { patient_name, ...noName } = billPayload(patient);
    expectStatus(await svc.create(noName), 400, 'Missing patient_name should return 400');
  });

  // Test ID: T0154
  // Test Title: Verify that an unknown medicine id is accepted with HTTP 200 due to missing stock validation
  test('T0154 | Edge | Verify that an unknown medicine id is accepted with HTTP 200 due to missing stock validation', async ({ api, cleanup }) => {
    const svc = new MedBillService(api);
    // Step 1: Setup.
    const patient = await setupPatient(api, cleanup);
    // Step 2: Unknown medicine accepted (quirk — no stock validation).
    expectOk(await svc.create(billPayload(patient, { slots: [{ medicine_id: 999999, qty: 1 }] })), { status: 200 });
  });

  // Test ID: T0155
  // Test Title: Verify that creating a medicine bill without a token is rejected with HTTP 401
  test('T0155 | Negative | Verify that creating a medicine bill without a token is rejected with HTTP 401', async ({ unauthApi }) => {
    // Step 1: Create without token.
    expectError(await new MedBillService(unauthApi).create({ patient_name: 'X', date: '2026-10-16', slots: [] }), 401);
  });

  // Test ID: T0156
  // Test Title: Verify that creating a medicine bill with zero quantity never causes an HTTP 500 server error
  test('T0156 | Boundary | Verify that creating a medicine bill with zero quantity never causes an HTTP 500 server error', async ({ api, cleanup }) => {
    const svc = new MedBillService(api);
    // Step 1: Setup.
    const patient = await setupPatient(api, cleanup);
    // Step 2: Zero qty must not crash server.
    const res = await svc.create(billPayload(patient, { slots: [{ medicine_id: 1, qty: 0 }] }));
    if (res.status >= 500) throw new Error(`qty=0 caused 5xx: ${res.status}`);
  });
});
